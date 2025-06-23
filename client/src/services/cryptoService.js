import api from './api';

// Crypto service for encryption/decryption operations
const cryptoService = {
  // Text encryption
  encryptText: async (text, key) => {
    try {
      console.log('🔐 Encrypting text with API endpoint: /api/v1/crypto/text/encrypt');
      console.log('📝 Text to encrypt:', text);
      console.log('🔑 Key:', key ? '[KEY PROVIDED]' : '[NO KEY]');
      
      const requestData = { text, key };
      console.log('📤 Request data:', requestData);
      
      const response = await api.post('/api/v1/crypto/text/encrypt', requestData);
      console.log('✅ Encryption successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Text encryption failed');
    }
  },

  // Text decryption
  decryptText: async (encryptedText, key) => {
    try {
      console.log('🔓 Decrypting text with API endpoint: /api/v1/crypto/text/decrypt');
      console.log('📝 Encrypted text:', encryptedText);
      console.log('🔑 Key:', key ? '[KEY PROVIDED]' : '[NO KEY]');
      
      const requestData = { encryptedText, key };
      console.log('📤 Request data:', requestData);
      
      const response = await api.post('/api/v1/crypto/text/decrypt', requestData);
      console.log('✅ Decryption successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Invalid encrypted text or wrong key');
    }
  },

  // File encryption
  encryptFile: async (file, key) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);

      const response = await api.post('/api/v1/crypto/file/encrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File encryption failed');
    }
  },

  // File decryption
  decryptFile: async (file, key) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);

      const response = await api.post('/api/v1/crypto/file/decrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File decryption failed');
    }
  },

  // Get crypto activity (optional)
  getCryptoActivity: async () => {
    try {
      const response = await api.get('/api/v1/crypto/activity');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get crypto activity');
    }
  },

  // Helper function to create downloadable blob from encrypted content
  createDownloadableBlob: (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    return {
      url,
      download: filename,
      cleanup: () => URL.revokeObjectURL(url)
    };
  },

  // Helper function to download file
  downloadFile: (content, filename, type = 'text/plain') => {
    const { url, cleanup } = cryptoService.createDownloadableBlob(content, filename, type);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup after a short delay
    setTimeout(cleanup, 100);
  },

  // Helper function to validate file size (4MB limit)
  validateFileSize: (file, maxSizeMB = 4) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }
    return true;
  },

  // Helper function to get file extension
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },

  // Helper function to validate file type (basic check)
  isSupportedFileType: (filename) => {
    const supportedTypes = ['txt', 'json', 'csv', 'xml', 'html', 'css', 'js', 'md', 'log'];
    const extension = cryptoService.getFileExtension(filename);
    return supportedTypes.includes(extension);
  }
};

export default cryptoService; 