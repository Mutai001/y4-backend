import { Hono } from 'hono';
import { MpesaController } from './mpesa.controller';
import { validateBody } from './middleware/zod-validator';
import { stkPushRequestSchema, mpesaCallbackSchema } from './validator';

const mpesaRouter = new Hono();
const mpesaController = new MpesaController();

// Payment endpoints
mpesaRouter.post('/initiate', validateBody(stkPushRequestSchema), (c) => 
  mpesaController.initiatePayment(c)
);

mpesaRouter.post('/callback', validateBody(mpesaCallbackSchema), (c) => 
  mpesaController.handleCallback(c)
);

// Transaction endpoints
mpesaRouter.get('/:referenceCode', (c) => 
  mpesaController.getTransactionStatus(c)
);

mpesaRouter.get('/', (c) => 
  mpesaController.getAllTransactions(c)
);

export default mpesaRouter;