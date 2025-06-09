const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { BadRequestError, InternalServerError } = require('./errors');
const config = require('../config/config');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new BadRequestError('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Initialize multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Middleware to handle single file upload
 * @param {string} fieldName - Name of the file field
 * @returns {Function} Express middleware
 */
const uploadFile = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('File size is too large. Max 5MB allowed.'));
        }
        return next(err);
      }
      next();
    });
  };
};

/**
 * Middleware to handle multiple file uploads
 * @param {string} fieldName - Name of the file field
 * @param {number} maxCount - Maximum number of files
 * @returns {Function} Express middleware
 */
const uploadFiles = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('File size is too large. Max 5MB per file.'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new BadRequestError(`Maximum ${maxCount} files allowed.`));
        }
        return next(err);
      }
      next();
    });
  };
};

/**
 * Delete file from the uploads directory
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (filename) => {
  try {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    throw new InternalServerError('Error deleting file');
  }
};

/**
 * Get full URL for a file
 * @param {string} filename - Name of the file
 * @returns {string} Full URL
 */
const getFileUrl = (filename) => {
  if (!filename) return null;
  return `${config.appUrl}/uploads/${filename}`;
};

module.exports = {
  uploadFile,
  uploadFiles,
  deleteFile,
  getFileUrl,
};
