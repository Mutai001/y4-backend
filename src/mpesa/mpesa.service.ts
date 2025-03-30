// File: src/mpesa/mpesa.service.ts
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { mpesaTransactions, bookings } from '../drizzle/schema';
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
    return Buffer.from(`${MPESA_SHORT_CODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  }

  // Get current timestamp in YYYYMMDDHHmmss format
  private getTimestamp(): string {
    return new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  }

  // Format phone number
  private formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.startsWith('+254')
      ? phoneNumber.substring(1)
      : phoneNumber.startsWith('0')
      ? `254${phoneNumber.substring(1)}`
      : phoneNumber;
  }

  // Initiate STK Push request
  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    referenceCode: string,
    description: string,
    bookingId: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Verify booking exists
      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, bookingId)
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

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

      // Store transaction record
      if (response.data.ResponseCode === '0') {
        await db.insert(mpesaTransactions).values({
          booking_id: bookingId,
          phone_number: formattedPhone,
          amount: amount.toString(),
          reference_code: referenceCode,
          mpesa_receipt_number: null,
          transaction_date: new Date(),
          status: 'Pending',
          created_at: new Date(),
          updated_at: new Date()
        });
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
      
      const { CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;
      let mpesaReceiptNumber = null;
      
      if (ResultCode === 0 && Body.stkCallback.CallbackMetadata) {
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
          mpesa_receipt_number: mpesaReceiptNumber,
          status: ResultCode === 0 ? 'Completed' : 'Failed',
          updated_at: new Date(),
        })
        .where(eq(mpesaTransactions.reference_code, CheckoutRequestID));
      
      return true;
    } catch (error) {
      console.error('Error processing M-Pesa callback:', error);
      return false;
    }
  }

  // Get transaction by reference code
  async getTransactionByReferenceCode(referenceCode: string) {
    try {
      return await db.query.mpesaTransactions.findFirst({
        where: eq(mpesaTransactions.reference_code, referenceCode),
        with: {
          booking: {
            with: {
              patient: true,
              therapist: true,
              slot: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  // Get all transactions
  async getAllTransactions() {
    try {
      return await db.query.mpesaTransactions.findMany({
        with: {
          booking: {
            with: {
              patient: true,
              therapist: true
            }
          }
        },
        orderBy: (transactions, { desc }) => [desc(transactions.created_at)]
      });
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
  }
}