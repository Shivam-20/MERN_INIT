import React, { useState } from 'react';
import { FaFile, FaDownload, FaTrash } from 'react-icons/fa';
import FileUpload from './FileUpload';
import FileUploadAdvanced from './FileUploadAdvanced';
import Card from './Card';

const FileUploadDemo = () => {
  const [selectedFiles, setSelectedFiles] = useState({
    basic: null,
    advanced: null,
    custom: null
  });

  const handleFileSelect = (type, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const removeFile = (type) => {
    setSelectedFiles(prev => ({
      ...prev,
      [type]: null
    }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">File Upload Components</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore different file upload designs with drag & drop, progress tracking, and modern UI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic File Upload */}
        <Card title="Basic File Upload" subtitle="Simple drag & drop with validation">
          <div className="space-y-4">
            <FileUpload
              onFileSelect={(file) => handleFileSelect('basic', file)}
              acceptedTypes=".txt,.pdf,.doc,.docx"
              maxSize={5}
              placeholder="Drop your document here"
              subtitle="Supports: TXT, PDF, DOC, DOCX (Max 5MB)"
            />
            
            {selectedFiles.basic && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaFile className="text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-900">{selectedFiles.basic.name}</p>
                      <p className="text-sm text-blue-700">
                        {(selectedFiles.basic.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile('basic')}
                    className="p-2 text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Advanced File Upload */}
        <Card title="Advanced File Upload" subtitle="With progress tracking and enhanced UI">
          <div className="space-y-4">
            <FileUploadAdvanced
              onFileSelect={(file) => handleFileSelect('advanced', file)}
              acceptedTypes=".jpg,.jpeg,.png,.gif"
              maxSize={10}
              placeholder="Upload your images"
              subtitle="Supports: JPG, PNG, GIF (Max 10MB)"
              showProgress={true}
            />
            
            {selectedFiles.advanced && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaFile className="text-green-500" />
                    <div>
                      <p className="font-medium text-green-900">{selectedFiles.advanced.name}</p>
                      <p className="text-sm text-green-700">
                        {(selectedFiles.advanced.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile('advanced')}
                    className="p-2 text-green-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Custom File Upload */}
        <Card title="Custom File Upload" subtitle="Tailored for specific use cases">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                id="custom-file"
                className="hidden"
                accept=".zip,.rar,.7z"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleFileSelect('custom', file);
                }}
              />
              <label
                htmlFor="custom-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaDownload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">ZIP, RAR, 7Z (Max 50MB)</p>
                </div>
              </label>
            </div>
            
            {selectedFiles.custom && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaFile className="text-purple-500" />
                    <div>
                      <p className="font-medium text-purple-900">{selectedFiles.custom.name}</p>
                      <p className="text-sm text-purple-700">
                        {(selectedFiles.custom.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile('custom')}
                    className="p-2 text-purple-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Features Comparison */}
        <Card title="Features Comparison" subtitle="What each component offers">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Basic Upload</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Drag & drop support</li>
                  <li>• File validation</li>
                  <li>• Error handling</li>
                  <li>• File type icons</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Advanced Upload</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Progress tracking</li>
                  <li>• Upload status</li>
                  <li>• Enhanced animations</li>
                  <li>• Better visual feedback</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Custom Upload</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tailored styling</li>
                  <li>• Specific use cases</li>
                  <li>• Flexible configuration</li>
                  <li>• Custom validation</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FileUploadDemo; 