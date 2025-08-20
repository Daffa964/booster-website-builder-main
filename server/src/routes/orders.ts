// server/src/routes/orders.ts
import { Router } from 'express';
import { createOrder, getOrderStatus, getOrdersByUserId } from '../controllers/orderController';

const router = Router();

router.post('/create', createOrder);
router.get('/status/:orderId', getOrderStatus);
router.get('/user/:userId', getOrdersByUserId);

export default router;