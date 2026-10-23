import { Router } from 'express';
import { commentController } from '../controllers/commentController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// Public endpoints
router.get('/', optionalAuth, commentController.listForArticle);

// Protected endpoints
router.post('/', authMiddleware, commentController.create);
router.patch('/:id', authMiddleware, commentController.update);
router.delete('/:id', authMiddleware, commentController.delete);
router.post('/:id/like', optionalAuth, commentController.likeComment);

export default router;
