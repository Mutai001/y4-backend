import { z } from 'zod';

// Validator for phone numbers
export const phoneNumberSchema = z
  .string()
  .refine(
    (value) => {
      // Accept Kenyan phone numbers in various formats:
      // +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
      return /^(\+254|254|07|01)\d{8,9}$/.test(value);
    },
    {
      message: 'Invalid phone number format. Use formats like +254XXXXXXXXX, 254XXXXXXXXX, or 07XXXXXXXX',
    }
  );

// Validator for STK push request
export const stkPushRequestSchema = z.object({
  phoneNumber: phoneNumberSchema,
  amount: z
    .number()
    .positive({ message: 'Amount must be greater than 0' })
    .refine((val) => val >= 1, {
      message: 'Amount must be at least 1',
    }),
  referenceCode: z
    .string()
    .min(1, { message: 'Reference code is required' })
    .max(50, { message: 'Reference code cannot exceed 50 characters' }),
  description: z
    .string()
    .min(1, { message: 'Description is required' })
    .max(255, { message: 'Description cannot exceed 255 characters' })
    .default('Payment'),
});

// Validator for M-Pesa callback data
export const mpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode: z.number(),
      ResultDesc: z.string(),
      CallbackMetadata: z
        .object({
          Item: z.array(
            z.object({
              Name: z.string(),
              Value: z.union([z.string(), z.number()]).optional(),
            })
          ),
        })
        .optional(),
    }),
  }),
});

// Type for STK Push request
export type StkPushRequest = z.infer<typeof stkPushRequestSchema>;

// Type for M-Pesa callback
export type MpesaCallback = z.infer<typeof mpesaCallbackSchema>;

// Validator for transaction query
export const transactionQuerySchema = z.object({
  checkoutRequestId: z.string().min(1, { message: 'Checkout request ID is required' }),
});

// Validator for transaction status response
export const transactionStatusResponseSchema = z.object({
  id: z.number(),
  merchantRequestId: z.string(),
  checkoutRequestId: z.string(),
  phoneNumber: z.string(),
  amount: z.string().or(z.number()),
  referenceCode: z.string(),
  description: z.string(),
  transactionDate: z.string().or(z.date()),
  mpesaReceiptNumber: z.string().nullable(),
  resultCode: z.number().nullable(),
  resultDescription: z.string().nullable(),
  isComplete: z.boolean(),
  isSuccessful: z.boolean(),
  callbackMetadata: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

// Generic API response schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// M-Pesa API response schema
export const mpesaApiResponseSchema = z.object({
  ResponseCode: z.string(),
  ResponseDescription: z.string(),
  MerchantRequestID: z.string(),
  CheckoutRequestID: z.string(),
  CustomerMessage: z.string().optional(),
});