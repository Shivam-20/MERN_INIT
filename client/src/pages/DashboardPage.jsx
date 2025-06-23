import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import cryptoService from '../services/cryptoService';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [textResult, setTextResult] = useState('');
  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  // Handle file upload with 4MB limit
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        cryptoService.validateFileSize(selectedFile, 4);
        setFile(selectedFile);
        setFileResult(null);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // Handle text encryption/decryption
  const handleTextProcess = async (action) => {
    if (!textInput.trim() || !encryptionKey.trim()) {
      alert('Please enter both text and encryption key');
      return;
    }
    
    setIsProcessing(true);
    try {
      let result;
      if (action === 'encrypt') {
        result = await cryptoService.encryptText(textInput, encryptionKey);
        setTextResult(result.data.encrypted);
      } else {
        result = await cryptoService.decryptText(textInput, encryptionKey);
        setTextResult(result.data.decrypted);
      }
    } catch (error) {
      console.error('Error processing text:', error);
      alert(error.message);
      setTextResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file encryption/decryption
  const handleFileProcess = async (action) => {
    if (!file || !encryptionKey.trim()) {
      alert('Please select a file and enter encryption key');
      return;
    }
    
    setIsProcessing(true);
    try {
      let result;
      if (action === 'encrypt') {
        result = await cryptoService.encryptFile(file, encryptionKey);
        const blob = new Blob([result.data.encryptedContent], { type: 'text/plain' });
        setFileResult({ 
          name: result.data.encryptedName, 
          blob, 
          action: 'encrypt',
          originalSize: result.data.originalSize,
          processedSize: result.data.encryptedSize
        });
      } else {
        result = await cryptoService.decryptFile(file, encryptionKey);
        // Convert base64 back to blob
        const binaryString = atob(result.data.decryptedContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes]);
        setFileResult({ 
          name: result.data.originalName, 
          blob, 
          action: 'decrypt',
          processedSize: result.data.decryptedSize
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert(error.message);
      setFileResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download processed file
  const downloadFile = () => {
    if (fileResult) {
      const url = URL.createObjectURL(fileResult.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileResult.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner h-12 w-12 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="card">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-gray-600 mb-4">
                Choose a tool to encrypt or decrypt your data securely.
              </p>
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Go to Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('encryption')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'encryption'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Encryption Tools
            </button>
            <button
              onClick={() => setActiveTab('decryption')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'decryption'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Decryption Tools
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Settings
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('encryption')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Encrypt Data</h3>
                    <p className="text-sm text-gray-500">Secure your text and files</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('decryption')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Decrypt Data</h3>
                    <p className="text-sm text-gray-500">Restore your encrypted data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Encryption/Decryption Tools */}
        {(activeTab === 'encryption' || activeTab === 'decryption') && (
          <div className="space-y-6">
            {/* Sub-navigation */}
            <div className="card">
              <div className="p-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveSubTab('text')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeSubTab === 'text'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Text {activeTab === 'encryption' ? 'Encryption' : 'Decryption'}
                  </button>
                  <button
                    onClick={() => setActiveSubTab('file')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeSubTab === 'file'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    File {activeTab === 'encryption' ? 'Encryption' : 'Decryption'}
                  </button>
                </div>
              </div>
            </div>

            {/* Text Processing */}
            {activeSubTab === 'text' && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Text {activeTab === 'encryption' ? 'Encryption' : 'Decryption'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Encryption Key
                      </label>
                      <input
                        type="password"
                        value={encryptionKey}
                        onChange={(e) => setEncryptionKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your encryption key"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'encryption' ? 'Text to Encrypt' : 'Encrypted Text to Decrypt'}
                      </label>
                      <textarea
                        rows={4}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={activeTab === 'encryption' ? 'Enter text to encrypt...' : 'Enter encrypted text to decrypt...'}
                      />
                    </div>
                    
                    <button
                      onClick={() => handleTextProcess(activeTab === 'encryption' ? 'encrypt' : 'decrypt')}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : `${activeTab === 'encryption' ? 'Encrypt' : 'Decrypt'} Text`}
                    </button>
                    
                    {textResult && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {activeTab === 'encryption' ? 'Encrypted Result' : 'Decrypted Result'}
                        </label>
                        <textarea
                          rows={4}
                          value={textResult}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(textResult)}
                          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Copy to Clipboard
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* File Processing */}
            {activeSubTab === 'file' && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    File {activeTab === 'encryption' ? 'Encryption' : 'Decryption'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Encryption Key
                      </label>
                      <input
                        type="password"
                        value={encryptionKey}
                        onChange={(e) => setEncryptionKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your encryption key"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'encryption' ? 'File to Encrypt' : 'Encrypted File to Decrypt'}
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Maximum file size: 4MB
                          </p>
                        </div>
                      </div>
                      
                      {file && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-600">{file.name}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                              {cryptoService.isSupportedFileType(file.name) && 
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Supported</span>
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleFileProcess(activeTab === 'encryption' ? 'encrypt' : 'decrypt')}
                      disabled={isProcessing || !file}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : `${activeTab === 'encryption' ? 'Encrypt' : 'Decrypt'} File`}
                    </button>
                    
                    {fileResult && (
                      <div className="mt-4 p-4 bg-green-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-green-800">
                              File {activeTab === 'encryption' ? 'Encrypted' : 'Decrypted'} Successfully!
                            </h4>
                            <p className="text-sm text-green-600">Ready to download: {fileResult.name}</p>
                            {fileResult.originalSize && (
                              <p className="text-xs text-green-500 mt-1">
                                Original: {(fileResult.originalSize / 1024).toFixed(1)} KB
                                {fileResult.processedSize && ` → Processed: ${(fileResult.processedSize / 1024).toFixed(1)} KB`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={downloadFile}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/profile" className="card hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
                      <p className="text-sm text-gray-500">Update your personal information</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/update-password" className="card hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m0 0V7a2 2 0 012-2m3 0a2 2 0 00-2-2M9 7h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Account Information */}
            <div className="card">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Account Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Your current account details and settings.
                </p>
              </div>
              <div>
                <dl className="divide-y divide-gray-200">
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.name || 'Not provided'}
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.email}
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Account type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                      </span>
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">Member since</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
