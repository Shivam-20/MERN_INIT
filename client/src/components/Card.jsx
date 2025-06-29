import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  variant = 'default',
  padding = 'p-6',
  className = '',
  onClick,
  hover = true,
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-2xl
    transition-all duration-300 ease-out
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${hover && !disabled ? 'hover:scale-[1.02] hover:shadow-2xl' : ''}
  `;

  const variantClasses = {
    default: 'bg-white shadow-lg border border-gray-200',
    glass: `
      bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl
      hover:bg-white/15 hover:border-white/30
    `,
    primary: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-lg',
    danger: 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg',
    dark: 'bg-gray-900 text-white border border-gray-700 shadow-lg'
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${padding}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Header */}
      {(title || subtitle || header) && (
        <div className="mb-4">
          {header ? (
            header
          ) : (
            <>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 