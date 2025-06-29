import React, { useState, useRef } from 'react';
import { 
  FaCloudUploadAlt, 
  FaFile, 
  FaFileAlt, 
  FaFileImage, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFileArchive,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';

const FileUpload = ({
  onFileSelect,
  acceptedTypes = '*',
  maxSize = 4, // in MB
  multiple = false,
  disabled = false,
  loading = false,
  className = '',
  placeholder = 'Choose a file or drag it here',
  subtitle = 'Maximum file size: 4MB'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: <FaFilePdf className="text-red-500" />,
      doc: <FaFileWord className="text-blue-500" />,
      docx: <FaFileWord className="text-blue-500" />,
      xls: <FaFileExcel className="text-green-500" />,
      xlsx: <FaFileExcel className="text-green-500" />,
      jpg: <FaFileImage className="text-purple-500" />,
      jpeg: <FaFileImage className="text-purple-500" />,
      png: <FaFileImage className="text-purple-500" />,
      gif: <FaFileImage className="text-purple-500" />,
      zip: <FaFileArchive className="text-orange-500" />,
      rar: <FaFileArchive className="text-orange-500" />,
      txt: <FaFileAlt className="text-gray-500" />,
      json: <FaFileAlt className="text-yellow-500" />,
      csv: <FaFileAlt className="text-green-500" />
    };
    return iconMap[extension] || <FaFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    setError('');
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type if specified
    if (acceptedTypes !== '*') {
      const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = acceptedTypesArray.some(type => {
        if (type.startsWith('.')) {
          return type.toLowerCase() === fileExtension;
        }
        return file.type.match(type);
      });
      
      if (!isValidType) {
        setError(`File type not supported. Accepted types: ${acceptedTypes}`);
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = async (file) => {
    if (validateFile(file)) {
      setIsUploading(true);
      setSelectedFile(file);
      
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsUploading(false);
      onFileSelect(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const baseClasses = `
    relative transition-all duration-300 ease-out
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const uploadAreaClasses = `
    w-full border-2 border-dashed rounded-xl p-8 text-center
    transition-all duration-300 ease-out
    ${isDragOver 
      ? 'border-blue-500 bg-blue-50/50 scale-105 shadow-lg' 
      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 hover:shadow-md'
    }
    ${disabled || loading ? 'border-gray-200 bg-gray-50' : ''}
  `;

  return (
    <div className={baseClasses}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={acceptedTypes}
        multiple={multiple}
        disabled={disabled || loading}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          className={uploadAreaClasses}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`
                p-4 rounded-full transition-all duration-300
                ${isDragOver 
                  ? 'bg-blue-100 text-blue-600 scale-110' 
                  : 'bg-gray-100 text-gray-400'
                }
                ${isUploading ? 'animate-pulse' : ''}
              `}>
                {isUploading ? (
                  <FaSpinner className="animate-spin" size={48} />
                ) : (
                  <FaCloudUploadAlt size={48} />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">
                {isDragOver ? 'Drop your file here' : 'Upload a file'}
              </h3>
              <p className="text-sm text-gray-500">
                {placeholder}
              </p>
              <p className="text-xs text-gray-400">
                {subtitle}
              </p>
            </div>

            {!disabled && !loading && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 hover:scale-105 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <FaFile className="mr-2" />
                Browse Files
              </button>
            )}

            {loading && (
              <div className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg">
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full border-2 border-green-200 bg-green-50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
                <div className="flex items-center mt-1">
                  <FaCheckCircle className="text-green-500 mr-1" size={12} />
                  <span className="text-xs text-green-600">File selected successfully</span>
                </div>
              </div>
            </div>
            
            {!disabled && !loading && (
              <button
                type="button"
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                title="Remove file"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" size={14} />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 