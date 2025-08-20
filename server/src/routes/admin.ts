// server/src/routes/admin.ts
import { Router } from 'express';
import { getPendingOrders, getVerifiedOrders, verifyPayment, completeOrder } from '../controllers/adminController';

const router = Router();

router.get('/orders/pending', getPendingOrders);
router.get('/orders/verified', getVerifiedOrders);
router.post('/orders/verify', verifyPayment);
router.post('/orders/complete', completeOrder); // Menggantikan fungsi upload

export default router;