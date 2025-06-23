import express from 'express';
import passport from 'passport';
import * as userController from '../controllers/userController.js';
import { AppError } from '../utils/errorHandler.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes after this middleware with JWT strategy
router.use(passport.authenticate('jwt', { session: false }));

// Admin routes
router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdmin, userController.createUser);

// User profile routes
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.put('/updateMe', userController.updateMe); // Allow both PATCH and PUT
router.patch('/updateMyPassword', userController.updateMyPassword);
router.delete('/deleteMe', userController.deleteMe);

// Fallback route
router.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export default router;
