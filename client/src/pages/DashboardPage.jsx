import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import cryptoService from '../services/cryptoService';
import { 
  FaCopy, 
  FaSave, 
  FaKey, 
  FaTrash, 
  FaDownload, 
  FaLock,
  FaUnlock,
  FaFile,
  FaFileAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FileUploadAdvanced from '../components/FileUploadAdvanced';

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
  const [showPassword, setShowPassword] = useState(false);
  
  // Password storage functionality
  const [storedPasswords, setStoredPasswords] = useState([]);
  const [newPasswordName, setNewPasswordName] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Load stored passwords from localStorage on component mount
  useEffect(() => {
    const savedPasswords = localStorage.getItem(`encryption_passwords_${user?.email}`);
    if (savedPasswords) {
      setStoredPasswords(JSON.parse(savedPasswords));
    }
  }, [user?.email]);

  // Save passwords to localStorage whenever they change
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`encryption_passwords_${user?.email}`, JSON.stringify(storedPasswords));
    }
  }, [storedPasswords, user?.email]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  // Password management functions
  const addPassword = () => {
    if (newPasswordName.trim() && newPasswordValue.trim()) {
      const newPassword = {
        id: Date.now(),
        name: newPasswordName.trim(),
        value: newPasswordValue.trim(),
        createdAt: new Date().toISOString()
      };
      setStoredPasswords([...storedPasswords, newPassword]);
      setNewPasswordName('');
      setNewPasswordValue('');
    }
  };

  const removePassword = (id) => {
    setStoredPasswords(storedPasswords.filter(pwd => pwd.id !== id));
  };

  const usePassword = (password) => {
    setEncryptionKey(password.value);
  };

  // Save current key with a prompt for name
  const saveCurrentKey = () => {
    if (!encryptionKey.trim()) {
      alert('Please enter an encryption key first');
      return;
    }
    
    const keyName = prompt('Enter a name for this encryption key:');
    if (keyName && keyName.trim()) {
      const newPassword = {
        id: Date.now(),
        name: keyName.trim(),
        value: encryptionKey.trim(),
        createdAt: new Date().toISOString()
      };
      setStoredPasswords([...storedPasswords, newPassword]);
    }
  };

  // Copy text with success feedback
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handle file upload with 4MB limit
  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setFileResult(null);
    } else {
      setFile(null);
      setFileResult(null);
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
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 text-lg">
            Secure your data with powerful encryption tools
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="primary" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
              <FaShieldAlt className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Secure Encryption</h3>
            <p className="text-gray-600">AES-256 encryption</p>
          </Card>

          <Card variant="success" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
              <FaFile className="text-green-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">File Support</h3>
            <p className="text-gray-600">Up to 4MB files</p>
          </Card>

          <Card variant="warning" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mx-auto mb-4">
              <FaKey className="text-yellow-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Key Manager</h3>
            <p className="text-gray-600">{storedPasswords.length} saved keys</p>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('encryption')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'encryption'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Encryption Tools
            </button>
            <button
              onClick={() => setActiveTab('passwords')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'passwords'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Password Manager
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card title="Recent Activity" subtitle="Your latest encryption activities">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <FaLock className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Text Encryption</h4>
                    <p className="text-sm text-gray-600">Last used: 2 hours ago</p>
                  </div>
                  <FaCheckCircle className="text-green-500" />
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <FaFile className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">File Decryption</h4>
                    <p className="text-sm text-gray-600">Last used: 1 day ago</p>
                  </div>
                  <FaCheckCircle className="text-green-500" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Quick Actions" subtitle="Common encryption tasks">
                <div className="space-y-3">
                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={() => setActiveTab('encryption')}
                    icon={<FaLock />}
                  >
                    Encrypt Text
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={() => setActiveTab('encryption')}
                    icon={<FaFile />}
                  >
                    Encrypt File
                  </Button>
                  <Button 
                    variant="ghost" 
                    fullWidth 
                    onClick={() => setActiveTab('passwords')}
                    icon={<FaKey />}
                  >
                    Manage Keys
                  </Button>
                </div>
              </Card>

              <Card title="Security Tips" subtitle="Best practices for encryption">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Always use strong, unique encryption keys</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Keep your keys secure and never share them</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Regularly backup your encrypted files</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'encryption' && (
          <div className="space-y-6">
            {/* Encryption Key Input */}
            <Card title="Encryption Key" subtitle="Enter your encryption key">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter encryption key"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    icon={<FaKey />}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
                <Button
                  variant="outline"
                  onClick={saveCurrentKey}
                  icon={<FaSave />}
                >
                  Save Key
                </Button>
              </div>
            </Card>

            {/* Sub-tabs for Text/File */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveSubTab('text')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSubTab === 'text'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaFileAlt className="inline mr-2" />
                  Text
                </button>
                <button
                  onClick={() => setActiveSubTab('file')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSubTab === 'file'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaFile className="inline mr-2" />
                  File
                </button>
              </div>
            </div>

            {activeSubTab === 'text' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Input Text" subtitle="Enter text to encrypt or decrypt">
                  <div className="space-y-4">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter your text here..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex space-x-3">
                      <Button
                        variant="primary"
                        onClick={() => handleTextProcess('encrypt')}
                        loading={isProcessing}
                        icon={<FaLock />}
                        fullWidth
                      >
                        Encrypt
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleTextProcess('decrypt')}
                        loading={isProcessing}
                        icon={<FaUnlock />}
                        fullWidth
                      >
                        Decrypt
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card title="Result" subtitle="Encrypted or decrypted text">
                  <div className="space-y-4">
                    <textarea
                      value={textResult}
                      readOnly
                      placeholder="Result will appear here..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none bg-gray-50"
                    />
                    {textResult && (
                      <Button
                        variant="secondary"
                        onClick={() => copyToClipboard(textResult)}
                        icon={<FaCopy />}
                        fullWidth
                      >
                        {copySuccess ? 'Copied!' : 'Copy Result'}
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeSubTab === 'file' && (
              <div className="space-y-6">
                <Card title="File Upload" subtitle="Select a file to encrypt or decrypt">
                  <div className="space-y-4">
                    <FileUploadAdvanced
                      onFileSelect={handleFileChange}
                      acceptedTypes=".txt,.json,.csv,.xml,.html,.css,.js,.md,.log"
                      maxSize={4}
                      placeholder="Choose a file to encrypt or decrypt"
                      subtitle="Supported formats: TXT, JSON, CSV, XML, HTML, CSS, JS, MD, LOG (Max 4MB)"
                      showProgress={true}
                    />
                    <div className="flex space-x-3">
                      <Button
                        variant="primary"
                        onClick={() => handleFileProcess('encrypt')}
                        loading={isProcessing}
                        icon={<FaLock />}
                        fullWidth
                        disabled={!file}
                      >
                        Encrypt File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleFileProcess('decrypt')}
                        loading={isProcessing}
                        icon={<FaUnlock />}
                        fullWidth
                        disabled={!file}
                      >
                        Decrypt File
                      </Button>
                    </div>
                  </div>
                </Card>

                {fileResult && (
                  <Card title="Processed File" subtitle="Download your processed file">
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-800">
                          File {fileResult.action === 'encrypt' ? 'encrypted' : 'decrypted'} successfully!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Size: {fileResult.processedSize} bytes
                        </p>
                      </div>
                      <Button
                        variant="success"
                        onClick={downloadFile}
                        icon={<FaDownload />}
                        fullWidth
                      >
                        Download {fileResult.name}
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'passwords' && (
          <div className="space-y-6">
            <Card title="Password Manager" subtitle="Manage your encryption keys">
              <div className="space-y-4">
                {/* Add new password */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Key name"
                    value={newPasswordName}
                    onChange={(e) => setNewPasswordName(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Key value"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                  />
                  <Button
                    variant="primary"
                    onClick={addPassword}
                    icon={<FaSave />}
                  >
                    Add Key
                  </Button>
                </div>

                {/* Stored passwords */}
                <div className="space-y-2">
                  {storedPasswords.map((password) => (
                    <div key={password.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{password.name}</h4>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(password.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => usePassword(password)}
                          icon={<FaKey />}
                        >
                          Use
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removePassword(password.id)}
                          icon={<FaTrash />}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {storedPasswords.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FaKey className="text-4xl mx-auto mb-4 opacity-50" />
                      <p>No saved keys yet. Add your first encryption key above.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
