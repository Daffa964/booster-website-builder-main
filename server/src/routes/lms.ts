// server/src/routes/lms.ts
import { Router } from 'express';
import { getLmsContent, addModule, addChapter, addLesson, updateLesson, getUserProgress } from '../controllers/lmsController';

const router = Router();

router.get('/content', getLmsContent);
router.post('/modules', addModule);
router.post('/chapters', addChapter);
router.post('/lessons', addLesson);
router.put('/lessons/:id', updateLesson);
router.get('/progress/:userId', getUserProgress);

export default router;