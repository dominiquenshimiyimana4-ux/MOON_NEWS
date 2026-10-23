import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Profile
router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, userController.updateProfile);

// Bookmarks
router.get('/bookmarks', authMiddleware, userController.getBookmarks);
router.post('/bookmarks', authMiddleware, userController.addBookmark);
router.delete('/bookmarks/:articleId', authMiddleware, userController.removeBookmark);

// Newsletter
router.post('/newsletter', userController.subscribeNewsletter);
router.post('/newsletter/unsubscribe', userController.unsubscribeNewsletter);

export default router;
