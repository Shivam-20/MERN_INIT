import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses = `
    relative transition-all duration-200 ease-out
    ${fullWidth ? 'w-full' : ''}
  `;

  const inputClasses = `
    w-full rounded-xl border-2 bg-white/80 backdrop-blur-sm
    transition-all duration-200 ease-out
    placeholder:text-gray-500
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-0
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const stateClasses = {
    default: `
      border-gray-300 focus:border-blue-500 focus:ring-blue-500/20
      hover:border-gray-400
    `,
    error: `
      border-red-500 focus:border-red-500 focus:ring-red-500/20
      bg-red-50/50
    `,
    success: `
      border-green-500 focus:border-green-500 focus:ring-green-500/20
      bg-green-50/50
    `
  };

  const getStateClass = () => {
    if (error) return stateClasses.error;
    if (success) return stateClasses.success;
    return stateClasses.default;
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`${baseClasses} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        {/* Input Field */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            ${inputClasses}
            ${sizeClasses[size]}
            ${getStateClass()}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${type === 'password' ? 'pr-12' : ''}
          `}
          {...props}
        />
        
        {/* Right Icon or Password Toggle */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          )}
          
          {icon && iconPosition === 'right' && (
            <span className="text-gray-400">
              {icon}
            </span>
          )}
          
          {/* Success/Error Icons */}
          {success && (
            <FaCheck className="text-green-500" size={16} />
          )}
          
          {error && (
            <FaExclamationTriangle className="text-red-500" size={16} />
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <FaExclamationTriangle className="mr-1" size={12} />
          {error}
        </p>
      )}
      
      {/* Success Message */}
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <FaCheck className="mr-1" size={12} />
          {success}
        </p>
      )}
    </div>
  );
};

export default Input; 