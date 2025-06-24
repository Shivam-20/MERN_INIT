import React from 'react';

const GlassCard = ({ children, className = '', style = {} }) => (
  <div
    className={`relative overflow-hidden backdrop-blur-2xl bg-white/30 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.18)] rounded-3xl p-8 animate-fadeInUp transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${className}`}
    style={style}
  >
    {/* Water ripple SVG overlay */}
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-20 animate-pulse"
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{zIndex: 1}}
    >
      <ellipse cx="200" cy="100" rx="180" ry="80" fill="url(#rippleGradient)" />
      <defs>
        <radialGradient id="rippleGradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.1" />
        </radialGradient>
      </defs>
    </svg>
    {/* Shine/diagonal light animation */}
    <div className="absolute -top-1/4 -left-1/4 w-[150%] h-1/2 bg-gradient-to-tr from-white/60 to-transparent opacity-40 rotate-12 animate-shine pointer-events-none" style={{zIndex: 2}} />
    <div className="relative z-10">{children}</div>
  </div>
);

export default GlassCard; 