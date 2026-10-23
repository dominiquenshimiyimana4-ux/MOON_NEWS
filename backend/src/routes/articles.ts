import { Router } from 'express';
import { articleController } from '../controllers/articleController';
import { authMiddleware, optionalAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public endpoints
router.get('/', optionalAuth, articleController.list);
router.get('/:slug', optionalAuth, articleController.getBySlug);

// Protected endpoints
router.post('/', authMiddleware, articleController.create);
router.patch('/:id', authMiddleware, articleController.update);
router.delete('/:id', authMiddleware, articleController.delete);

export default router;
