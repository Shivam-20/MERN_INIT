import express from 'express';
import * as userController from '../controllers/userController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(isAuthenticated);

// User profile routes
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Admin routes can be added here

// Fallback route
router.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export default router;
