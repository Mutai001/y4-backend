import { z } from 'zod';

export const phoneNumberSchema = z
  .string()
  .refine(
    (value) => /^(\+254|254|07|01)\d{8,9}$/.test(value),
    { message: 'Invalid Kenyan phone number format' }
  );

export const stkPushRequestSchema = z.object({
  phoneNumber: phoneNumberSchema,
  amount: z.number().positive().min(1),
  referenceCode: z.string().min(1).max(50),
  description: z.string().min(1).max(255).default('Payment'),
  bookingId: z.number().int().positive()
});

export const mpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode: z.number(),
      ResultDesc: z.string(),
      CallbackMetadata: z.object({
        Item: z.array(
          z.object({
            Name: z.string(),
            Value: z.union([z.string(), z.number()]).optional(),
          })
        ),
      }).optional(),
    }),
  }),
});

export type StkPushRequest = z.infer<typeof stkPushRequestSchema>;
export type MpesaCallback = z.infer<typeof mpesaCallbackSchema>;