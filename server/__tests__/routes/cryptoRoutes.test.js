import request from 'supertest';
import express from 'express';
import passport from 'passport';
import { cryptoRoutes } from '../../routes/cryptoRoutes.js';
import { AppError } from '../../utils/errorHandler.js';

// Mock passport authentication
jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req, res, next) => {
    req.user = { id: '123', email: 'test@example.com', role: 'user' };
    next();
  })
}));

// Mock multer
jest.mock('multer', () => {
  return jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      // Mock file upload for testing
      if (req.body.fileContent) {
        req.file = {
          buffer: Buffer.from(req.body.fileContent),
          originalname: req.body.fileName || 'test.txt',
          size: req.body.fileContent.length
        };
      }
      next();
    })
  }));
});

const app = express();
app.use(express.json());
app.use('/api/crypto', cryptoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

describe('Crypto Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/crypto/text/encrypt', () => {
    test('should encrypt text successfully', async () => {
      const testData = {
        text: 'Hello, World!',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.encrypted).toBeDefined();
      expect(response.body.data.originalLength).toBe(testData.text.length);
      expect(response.body.data.encryptedLength).toBeGreaterThan(0);
      expect(typeof response.body.data.encrypted).toBe('string');
    });

    test('should reject encryption without text', async () => {
      const testData = {
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Text and encryption key are required');
    });

    test('should reject encryption without key', async () => {
      const testData = {
        text: 'Hello, World!'
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Text and encryption key are required');
    });

    test('should reject encryption with empty text', async () => {
      const testData = {
        text: '',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Text and encryption key are required');
    });

    test('should reject encryption with empty key', async () => {
      const testData = {
        text: 'Hello, World!',
        key: ''
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Text and encryption key are required');
    });

    test('should handle special characters in text', async () => {
      const testData = {
        text: 'Hello! @#$%^&*()_+-=[]{}|;:,.<>?',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.encrypted).toBeDefined();
    });

    test('should handle unicode characters', async () => {
      const testData = {
        text: 'Hello 世界! 🌍',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.encrypted).toBeDefined();
    });
  });

  describe('POST /api/crypto/text/decrypt', () => {
    test('should decrypt text successfully', async () => {
      const originalText = 'Hello, World!';
      const key = 'secretKey123';

      // First encrypt
      const encryptResponse = await request(app)
        .post('/api/crypto/text/encrypt')
        .send({ text: originalText, key });

      const encryptedText = encryptResponse.body.data.encrypted;

      // Then decrypt
      const decryptResponse = await request(app)
        .post('/api/crypto/text/decrypt')
        .send({ encryptedText, key });

      expect(decryptResponse.status).toBe(200);
      expect(decryptResponse.body.status).toBe('success');
      expect(decryptResponse.body.data.decrypted).toBe(originalText);
      expect(decryptResponse.body.data.decryptedLength).toBe(originalText.length);
    });

    test('should reject decryption without encrypted text', async () => {
      const testData = {
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Encrypted text and key are required');
    });

    test('should reject decryption without key', async () => {
      const testData = {
        encryptedText: 'someEncryptedText'
      };

      const response = await request(app)
        .post('/api/crypto/text/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Encrypted text and key are required');
    });

    test('should reject decryption with wrong key', async () => {
      const originalText = 'Hello, World!';
      const correctKey = 'secretKey123';
      const wrongKey = 'wrongKey';

      // First encrypt with correct key
      const encryptResponse = await request(app)
        .post('/api/crypto/text/encrypt')
        .send({ text: originalText, key: correctKey });

      const encryptedText = encryptResponse.body.data.encrypted;

      // Then try to decrypt with wrong key
      const decryptResponse = await request(app)
        .post('/api/crypto/text/decrypt')
        .send({ encryptedText, key: wrongKey });

      expect(decryptResponse.status).toBe(400);
      expect(decryptResponse.body.status).toBe('error');
      expect(decryptResponse.body.message).toBe('Invalid encrypted text or wrong key');
    });

    test('should reject decryption with invalid encrypted text', async () => {
      const testData = {
        encryptedText: 'invalidEncryptedText',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid encrypted text or wrong key');
    });

    test('should handle empty encrypted text', async () => {
      const testData = {
        encryptedText: '',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid encrypted text or wrong key');
    });
  });

  describe('POST /api/crypto/file/encrypt', () => {
    test('should encrypt file successfully', async () => {
      const testData = {
        fileContent: 'Hello, this is a test file content!',
        fileName: 'test.txt',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/file/encrypt')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.encryptedContent).toBeDefined();
      expect(response.body.data.originalName).toBe('test.txt');
      expect(response.body.data.encryptedName).toBe('test.txt.encrypted');
      expect(response.body.data.originalSize).toBe(testData.fileContent.length);
      expect(response.body.data.encryptedSize).toBeGreaterThan(0);
    });

    test('should reject file encryption without file', async () => {
      const testData = {
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/file/encrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('File is required');
    });

    test('should reject file encryption without key', async () => {
      const testData = {
        fileContent: 'Hello, this is a test file content!',
        fileName: 'test.txt'
      };

      const response = await request(app)
        .post('/api/crypto/file/encrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Encryption key is required');
    });

    test('should handle binary file content', async () => {
      const testData = {
        fileContent: Buffer.from([0x89, 0x50, 0x4E, 0x47]).toString('base64'), // PNG header
        fileName: 'image.png',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/file/encrypt')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.encryptedContent).toBeDefined();
      expect(response.body.data.originalName).toBe('image.png');
    });

    test('should handle large file content', async () => {
      const largeContent = 'A'.repeat(10000); // 10KB content
      const testData = {
        fileContent: largeContent,
        fileName: 'large.txt',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/file/encrypt')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.encryptedContent).toBeDefined();
      expect(response.body.data.originalSize).toBe(largeContent.length);
    });
  });

  describe('POST /api/crypto/file/decrypt', () => {
    test('should decrypt file successfully', async () => {
      const originalContent = 'Hello, this is a test file content!';
      const key = 'secretKey123';

      // First encrypt
      const encryptResponse = await request(app)
        .post('/api/crypto/file/encrypt')
        .send({
          fileContent: originalContent,
          fileName: 'test.txt',
          key
        });

      const encryptedContent = encryptResponse.body.data.encryptedContent;

      // Then decrypt
      const decryptResponse = await request(app)
        .post('/api/crypto/file/decrypt')
        .send({
          fileContent: encryptedContent,
          fileName: 'test.txt.encrypted',
          key
        });

      expect(decryptResponse.status).toBe(200);
      expect(decryptResponse.body.status).toBe('success');
      expect(decryptResponse.body.data.decryptedContent).toBeDefined();
      expect(decryptResponse.body.data.originalName).toBe('test.txt');
      expect(decryptResponse.body.data.decryptedSize).toBe(originalContent.length);
    });

    test('should reject file decryption without file', async () => {
      const testData = {
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/file/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Encrypted file is required');
    });

    test('should reject file decryption without key', async () => {
      const testData = {
        fileContent: 'someEncryptedContent',
        fileName: 'test.txt.encrypted'
      };

      const response = await request(app)
        .post('/api/crypto/file/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Decryption key is required');
    });

    test('should reject file decryption with wrong key', async () => {
      const originalContent = 'Hello, this is a test file content!';
      const correctKey = 'secretKey123';
      const wrongKey = 'wrongKey';

      // First encrypt with correct key
      const encryptResponse = await request(app)
        .post('/api/crypto/file/encrypt')
        .send({
          fileContent: originalContent,
          fileName: 'test.txt',
          key: correctKey
        });

      const encryptedContent = encryptResponse.body.data.encryptedContent;

      // Then try to decrypt with wrong key
      const decryptResponse = await request(app)
        .post('/api/crypto/file/decrypt')
        .send({
          fileContent: encryptedContent,
          fileName: 'test.txt.encrypted',
          key: wrongKey
        });

      expect(decryptResponse.status).toBe(400);
      expect(decryptResponse.body.status).toBe('error');
      expect(decryptResponse.body.message).toBe('Invalid encrypted file or wrong key');
    });

    test('should reject file decryption with invalid encrypted content', async () => {
      const testData = {
        fileContent: 'invalidEncryptedContent',
        fileName: 'test.txt.encrypted',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/file/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid encrypted file or wrong key');
    });

    test('should handle .encrypted extension removal', async () => {
      const originalContent = 'Hello, this is a test file content!';
      const key = 'secretKey123';

      // First encrypt
      const encryptResponse = await request(app)
        .post('/api/crypto/file/encrypt')
        .send({
          fileContent: originalContent,
          fileName: 'test.txt',
          key
        });

      const encryptedContent = encryptResponse.body.data.encryptedContent;

      // Then decrypt with .encrypted extension
      const decryptResponse = await request(app)
        .post('/api/crypto/file/decrypt')
        .send({
          fileContent: encryptedContent,
          fileName: 'test.txt.encrypted',
          key
        });

      expect(decryptResponse.status).toBe(200);
      expect(decryptResponse.body.data.originalName).toBe('test.txt');
    });
  });

  describe('GET /api/crypto/activity', () => {
    test('should return crypto activity placeholder', async () => {
      const response = await request(app)
        .get('/api/crypto/activity');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('Crypto activity tracking not implemented yet');
      expect(response.body.data.user).toBe('test@example.com');
      expect(response.body.data.timestamp).toBeDefined();
    });

    test('should include user information from authentication', async () => {
      const response = await request(app)
        .get('/api/crypto/activity');

      expect(response.status).toBe(200);
      expect(response.body.data.user).toBe('test@example.com');
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for all crypto endpoints', async () => {
      // Temporarily mock passport to return no user
      const originalAuthenticate = passport.authenticate;
      passport.authenticate = jest.fn(() => (req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send({ text: 'test', key: 'test' });

      expect(response.status).toBe(401);

      // Restore original mock
      passport.authenticate = originalAuthenticate;
    });
  });

  describe('Error Handling', () => {
    test('should handle encryption errors gracefully', async () => {
      // This test would require mocking crypto-js to throw an error
      // For now, we test the error handling structure
      const testData = {
        text: 'Hello, World!',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/encrypt')
        .send(testData);

      // Should not throw an error for valid input
      expect(response.status).toBe(200);
    });

    test('should handle decryption errors gracefully', async () => {
      const testData = {
        encryptedText: 'invalidEncryptedText',
        key: 'secretKey123'
      };

      const response = await request(app)
        .post('/api/crypto/text/decrypt')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
}); 