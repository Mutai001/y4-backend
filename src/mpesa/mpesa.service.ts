// Code for M-Pesa service class
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db'; // Adjust path as needed
import { mpesaTransactions, NewMpesaTransaction, MpesaTransaction } from '../drizzle/schema';
import axios from 'axios';

// Environment configuration for M-Pesa API
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_SHORT_CODE = process.env.MPESA_SHORT_CODE || '';
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';
const MPESA_API_URL = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';

export class MpesaService {
  // Generate auth token for M-Pesa API
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
      const response = await axios.get(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error generating M-Pesa access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  // Generate password for STK Push
  private generatePassword(): string {
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${MPESA_SHORT_CODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
    return password;
  }

  // Get current timestamp in YYYYMMDDHHmmss format
  private getTimestamp(): string {
    return new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  }

  // Initiate STK Push request
  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    referenceCode: string,
    description: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();
      
      // Format phone number (remove leading 0 or +254)
      const formattedPhone = phoneNumber.startsWith('+254')
        ? phoneNumber.substring(1)
        : phoneNumber.startsWith('0')
        ? `254${phoneNumber.substring(1)}`
        : phoneNumber;

      const requestData = {
        BusinessShortCode: MPESA_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: MPESA_SHORT_CODE,
        PhoneNumber: formattedPhone,
        CallBackURL: MPESA_CALLBACK_URL,
        AccountReference: referenceCode,
        TransactionDesc: description,
      };

      const response = await axios.post(
        `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Store initial transaction record in database
      if (response.data.ResponseCode === '0') {
        const newTransaction: NewMpesaTransaction = {
          merchantRequestId: response.data.MerchantRequestID,
          checkoutRequestId: response.data.CheckoutRequestID,
          phoneNumber: formattedPhone,
          amount: amount.toString(),
          referenceCode,
          description,
          transactionDate: new Date(),
        };
        
        await db.insert(mpesaTransactions).values(newTransaction);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('STK Push initiation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Failed to initiate payment',
      };
    }
  }

  // Process callback from M-Pesa
  async processCallback(callbackData: any): Promise<boolean> {
    try {
      const { Body } = callbackData;
      
      if (!Body.stkCallback) {
        console.error('Invalid callback data structure');
        return false;
      }
      
      const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;
      let callbackMetadata = null;
      let mpesaReceiptNumber = null;
      
      // Extract metadata if transaction was successful
      if (ResultCode === 0 && Body.stkCallback.CallbackMetadata) {
        callbackMetadata = JSON.stringify(Body.stkCallback.CallbackMetadata);
        
        // Find MPesa receipt number from metadata
        const receiptItem = Body.stkCallback.CallbackMetadata.Item.find(
          (item: any) => item.Name === 'MpesaReceiptNumber'
        );
        
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value;
        }
      }
      
      // Update transaction in database
      await db
        .update(mpesaTransactions)
        .set({
          resultCode: ResultCode,
          resultDescription: ResultDesc,
          isComplete: true,
          isSuccessful: ResultCode === 0,
          mpesaReceiptNumber,
          callbackMetadata,
          updatedAt: new Date(),
        })
        .where(eq(mpesaTransactions.checkoutRequestId, CheckoutRequestID));
      
      return true;
    } catch (error) {
      console.error('Error processing M-Pesa callback:', error);
      return false;
    }
  }

  // Get transaction by checkout request ID
  async getTransactionByCheckoutRequestId(checkoutRequestId: string): Promise<MpesaTransaction | null> {
    try {
      const transactions = await db
        .select()
        .from(mpesaTransactions)
        .where(eq(mpesaTransactions.checkoutRequestId, checkoutRequestId))
        .limit(1);
      
      return transactions.length > 0 ? transactions[0] : null;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  // Get all transactions
  async getAllTransactions(): Promise<MpesaTransaction[]> {
    try {
      return await db.select().from(mpesaTransactions).orderBy(mpesaTransactions.createdAt);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
  }
}