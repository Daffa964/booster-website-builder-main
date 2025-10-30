// server/src/routes/aiBuilder.ts
import { Router } from 'express';
// Import semua controller yang dibutuhkan
import { startAiBuildProcess, getAiBuildStatus, completeAiBuildProcess, failAiBuildProcess } from '../controllers/aiBuilderController';

const router = Router();

router.post('/start', startAiBuildProcess);
router.get('/status/:jobId', getAiBuildStatus);
router.post('/complete/:jobId', completeAiBuildProcess); // <-- Endpoint untuk operator (sukses)
router.post('/fail/:jobId', failAiBuildProcess); // <-- Endpoint opsional untuk operator (gagal)

export default router;