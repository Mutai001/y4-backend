import { Context } from 'hono';
import { MpesaService } from './mpesa.service';
import { 
  stkPushRequestSchema, 
  mpesaCallbackSchema,
  apiResponseSchema 
} from './validator';
import { ZodError } from 'zod';

export class MpesaController {
  private mpesaService: MpesaService;

  constructor() {
    this.mpesaService = new MpesaService();
  }

  // Format ZodError into a readable format
  private formatZodError(error: ZodError): string {
    return error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
  }

  // Initiate STK Push payment
  async initiatePayment(c: Context): Promise<Response> {
    try {
      const requestData = await c.req.json();
      
      // Validate request data using Zod
      const validationResult = stkPushRequestSchema.safeParse(requestData);
      
      if (!validationResult.success) {
        return c.json({
          success: false,
          message: 'Validation error',
          error: this.formatZodError(validationResult.error),
        }, 400);
      }
      
      // Extract validated data
      const { phoneNumber, amount, referenceCode, description } = validationResult.data;
      
      console.log('Validated payment request:', { phoneNumber, amount, referenceCode, description });
      
      const result = await this.mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        referenceCode,
        description
      );

      if (result.success) {
        return c.json({
          success: true,
          message: 'STK Push initiated successfully',
          data: result.data,
        });
      } else {
        console.error('Payment initiation failed:', result.error);
        return c.json({
          success: false,
          message: result.error || 'Failed to initiate payment',
          details: 'Check server logs for more information',
        }, 500);
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return c.json({
        success: false,
        message: error instanceof ZodError 
          ? this.formatZodError(error) 
          : error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }, 500);
    }
  }

  // Handle M-Pesa callback
  async handleCallback(c: Context): Promise<Response> {
    try {
      const callbackData = await c.req.json();
      
      // Validate callback data
      const validationResult = mpesaCallbackSchema.safeParse(callbackData);
      
      if (!validationResult.success) {
        console.error('Invalid callback data:', this.formatZodError(validationResult.error));
        return c.json({
          success: false,
          message: 'Invalid callback data format',
          error: this.formatZodError(validationResult.error),
        }, 400);
      }
      
      const success = await this.mpesaService.processCallback(validationResult.data);

      if (success) {
        return c.json({
          success: true,
          message: 'Callback processed successfully',
        });
      } else {
        return c.json({
          success: false,
          message: 'Failed to process callback',
        }, 500);
      }
    } catch (error: any) {
      console.error('Callback handling error:', error);
      return c.json({
        success: false,
        message: error instanceof ZodError 
          ? this.formatZodError(error) 
          : error.message || 'Internal server error',
      }, 500);
    }
  }

  // Get transaction status by checkout request ID
  async getTransactionStatus(c: Context): Promise<Response> {
    try {
      const checkoutRequestId = c.req.param('checkoutRequestId');
      
      // Simple validation
      if (!checkoutRequestId || checkoutRequestId.trim() === '') {
        return c.json({
          success: false,
          message: 'Checkout request ID is required',
        }, 400);
      }
      
      const transaction = await this.mpesaService.getTransactionByCheckoutRequestId(checkoutRequestId);

      if (transaction) {
        return c.json({
          success: true,
          data: transaction,
        });
      } else {
        return c.json({
          success: false,
          message: 'Transaction not found',
        }, 404);
      }
    } catch (error: any) {
      console.error('Get transaction error:', error);
      return c.json({
        success: false,
        message: error.message || 'Internal server error',
      }, 500);
    }
  }

  // Get all transactions
  async getAllTransactions(c: Context): Promise<Response> {
    try {
      const transactions = await this.mpesaService.getAllTransactions();
      return c.json({
        success: true,
        data: transactions,
      });
    } catch (error: any) {
      console.error('Get all transactions error:', error);
      return c.json({
        success: false,
        message: error.message || 'Internal server error',
      }, 500);
    }
  }
} 