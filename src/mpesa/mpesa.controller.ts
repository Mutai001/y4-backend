import { Context } from 'hono';
import { MpesaService } from './mpesa.service';
import { stkPushRequestSchema, mpesaCallbackSchema } from './validator';
import { ZodError } from 'zod';

export class MpesaController {
  private mpesaService: MpesaService;

  constructor() {
    this.mpesaService = new MpesaService();
  }

  private formatZodError(error: ZodError): string {
    return error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
  }

  async initiatePayment(c: Context): Promise<Response> {
    try {
      const requestData = await c.req.json();
      const validationResult = stkPushRequestSchema.safeParse(requestData);
      
      if (!validationResult.success) {
        return c.json({
          success: false,
          message: 'Validation error',
          error: this.formatZodError(validationResult.error),
        }, 400);
      }
      
      const { phoneNumber, amount, referenceCode, description, bookingId } = validationResult.data;
      
      const result = await this.mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        referenceCode,
        description,
        bookingId
      );

      if (result.success) {
        return c.json({
          success: true,
          message: 'STK Push initiated successfully',
          data: result.data,
        });
      } else {
        return c.json({
          success: false,
          message: result.error || 'Failed to initiate payment',
        }, 400);
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return c.json({
        success: false,
        message: error instanceof ZodError 
          ? this.formatZodError(error) 
          : error.message || 'Internal server error',
      }, 500);
    }
  }

  async handleCallback(c: Context): Promise<Response> {
    try {
      const callbackData = await c.req.json();
      const validationResult = mpesaCallbackSchema.safeParse(callbackData);
      
      if (!validationResult.success) {
        return c.json({
          success: false,
          message: 'Invalid callback data',
          error: this.formatZodError(validationResult.error),
        }, 400);
      }
      
      const success = await this.mpesaService.processCallback(validationResult.data);

      return c.json({
        success,
        message: success 
          ? 'Callback processed successfully' 
          : 'Failed to process callback'
      }, success ? 200 : 400);
    } catch (error: any) {
      console.error('Callback handling error:', error);
      return c.json({
        success: false,
        message: 'Internal server error',
      }, 500);
    }
  }

  async getTransactionStatus(c: Context): Promise<Response> {
    try {
      const referenceCode = c.req.param('referenceCode');
      
      if (!referenceCode) {
        return c.json({
          success: false,
          message: 'Reference code is required',
        }, 400);
      }
      
      const transaction = await this.mpesaService.getTransactionByReferenceCode(referenceCode);

      if (!transaction) {
        return c.json({
          success: false,
          message: 'Transaction not found',
        }, 404);
      }

      return c.json({
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      console.error('Get transaction error:', error);
      return c.json({
        success: false,
        message: 'Internal server error',
      }, 500);
    }
  }

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
        message: 'Internal server error',
      }, 500);
    }
  }
}