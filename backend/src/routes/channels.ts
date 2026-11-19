import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { channelController } from '../controllers/channelController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Channel registration/payment endpoints create database records, so rate
// limit writes to blunt abuse.
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Public: the active channel directory.
router.get('/', channelController.listPublic);

// Station endpoints (any signed-in station account).
router.get('/mine', authMiddleware, channelController.getMine);
router.post('/', authMiddleware, writeLimiter, channelController.create);
router.patch('/mine', authMiddleware, channelController.updateMine);
router.post('/subscribe', authMiddleware, writeLimiter, channelController.subscribe);
router.post('/payments/:ref/confirm', authMiddleware, channelController.confirmPayment);
router.delete('/mine/subscription', authMiddleware, channelController.cancelSubscription);

// Administrator channel management and review queue.
router.post('/admin', authMiddleware, writeLimiter, requireRole('admin'), channelController.createAdmin);
router.get('/admin/all', authMiddleware, requireRole('admin'), channelController.listAll);
router.patch('/:id/review', authMiddleware, requireRole('admin'), channelController.review);

export default router;
