import express from 'express';
import multer from 'multer';
import CryptoJS from 'crypto-js';
import passport from 'passport';
import { AppError } from '../utils/errorHandler.js';

const router = express.Router();

// Protect all routes with JWT authentication
router.use(passport.authenticate('jwt', { session: false }));

// Configure multer for file uploads (4MB limit)
const upload = multer({ 
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

// Text encryption endpoint
router.post('/text/encrypt', async (req, res, next) => {
  try {
    const { text, key } = req.body;
    
    if (!text || !key) {
      return next(new AppError('Text and encryption key are required', 400));
    }
    
    // Encrypt the text using AES
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    
    res.status(200).json({
      status: 'success',
      data: {
        encrypted: encrypted,
        originalLength: text.length,
        encryptedLength: encrypted.length
      }
    });
  } catch (error) {
    next(new AppError('Encryption failed', 500));
  }
});

// Text decryption endpoint
router.post('/text/decrypt', async (req, res, next) => {
  try {
    const { encryptedText, key } = req.body;
    
    if (!encryptedText || !key) {
      return next(new AppError('Encrypted text and key are required', 400));
    }
    
    try {
      // Decrypt the text using AES
      const bytes = CryptoJS.AES.decrypt(encryptedText, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        return next(new AppError('Invalid encrypted text or wrong key', 400));
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          decrypted: decrypted,
          decryptedLength: decrypted.length
        }
      });
    } catch (error) {
      next(new AppError('Invalid encrypted text or wrong key', 400));
    }
  } catch (error) {
    next(new AppError('Decryption failed', 500));
  }
});

// File encryption endpoint
router.post('/file/encrypt', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('File is required', 400));
    }
    
    const { key } = req.body;
    if (!key) {
      return next(new AppError('Encryption key is required', 400));
    }
    
    // Convert buffer to string (for text files) or base64 (for binary files)
    const fileContent = req.file.buffer.toString('base64');
    
    // Encrypt the file content
    const encrypted = CryptoJS.AES.encrypt(fileContent, key).toString();
    
    res.status(200).json({
      status: 'success',
      data: {
        encryptedContent: encrypted,
        originalName: req.file.originalname,
        encryptedName: req.file.originalname + '.encrypted',
        originalSize: req.file.size,
        encryptedSize: encrypted.length
      }
    });
  } catch (error) {
    next(new AppError('File encryption failed', 500));
  }
});

// File decryption endpoint  
router.post('/file/decrypt', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Encrypted file is required', 400));
    }
    
    const { key } = req.body;
    if (!key) {
      return next(new AppError('Decryption key is required', 400));
    }
    
    try {
      // Get encrypted content from file
      const encryptedContent = req.file.buffer.toString('utf8');
      
      // Decrypt the file content
      const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
      const decryptedBase64 = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedBase64) {
        return next(new AppError('Invalid encrypted file or wrong key', 400));
      }
      
      // Convert back from base64
      const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');
      
      // Remove .encrypted extension from filename
      const originalName = req.file.originalname.replace('.encrypted', '');
      
      res.status(200).json({
        status: 'success',
        data: {
          decryptedContent: decryptedBase64,
          originalName: originalName,
          decryptedSize: decryptedBuffer.length
        }
      });
    } catch (error) {
      next(new AppError('Invalid encrypted file or wrong key', 400));
    }
  } catch (error) {
    next(new AppError('File decryption failed', 500));
  }
});

// Get user's crypto activity (optional feature)
router.get('/activity', async (req, res, next) => {
  try {
    // This is a placeholder - in a real app, you might want to track crypto operations
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Crypto activity tracking not implemented yet',
        user: req.user.email,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(new AppError('Failed to get crypto activity', 500));
  }
});

export { router as cryptoRoutes }; 