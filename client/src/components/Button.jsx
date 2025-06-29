import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500
      active:scale-95
    `,
    secondary: `
      bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-gray-500
      active:scale-95
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-green-500
      active:scale-95
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-500
      active:scale-95
    `,
    warning: `
      bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-yellow-500
      active:scale-95
    `,
    outline: `
      bg-transparent border-2 border-blue-600 text-blue-600
      hover:bg-blue-600 hover:text-white
      focus:ring-blue-500
      active:scale-95
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100
      focus:ring-gray-500
      active:scale-95
    `,
    glass: `
      bg-white/10 backdrop-blur-sm border border-white/20 text-white
      hover:bg-white/20 hover:border-white/30
      focus:ring-white/50
      active:scale-95
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <FaSpinner className={`animate-spin ${iconClasses[size]} ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={`${iconClasses[size]} ${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={`${iconClasses[size]} ${children ? 'ml-2' : ''}`}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button; 