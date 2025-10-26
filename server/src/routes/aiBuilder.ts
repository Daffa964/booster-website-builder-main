// server/src/routes/aiBuilder.ts
import { Router } from 'express';
import { startAiBuildProcess } from '../controllers/aiBuilderController'; // Hanya import ini

const router = Router();

router.post('/start', startAiBuildProcess);
// Hapus atau komentari rute status:
// router.get('/status/:jobId', getAiBuildStatus);

export default router;