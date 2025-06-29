import React from 'react';

const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'p-6',
  onClick,
  disabled = false
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-2xl backdrop-blur-xl
    border border-white/20 shadow-2xl
    transition-all duration-300 ease-out
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variantClasses = {
    default: 'bg-white/10 hover:bg-white/15',
    primary: 'bg-blue-500/10 hover:bg-blue-500/15 border-blue-400/30',
    success: 'bg-green-500/10 hover:bg-green-500/15 border-green-400/30',
    warning: 'bg-yellow-500/10 hover:bg-yellow-500/15 border-yellow-400/30',
    danger: 'bg-red-500/10 hover:bg-red-500/15 border-red-400/30',
    dark: 'bg-gray-900/20 hover:bg-gray-900/30 border-gray-700/30'
  };

  const hoverClasses = hover && !disabled ? 'hover:scale-[1.02] hover:shadow-3xl' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${hoverClasses}
        ${padding}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard; 