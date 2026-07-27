import React from 'react';

interface MindlapLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const MindlapLogo: React.FC<MindlapLogoProps> = ({
  variant = 'light',
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const heightMap = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className={`flex items-center ${variant === 'dark' ? 'bg-white/95 px-3 py-1.5 rounded-xl shadow-md backdrop-blur-sm' : ''}`}>
        <img
          src="/logo.png"
          alt="Mindlap Logo"
          className={`${heightMap[size]} w-auto object-contain mix-blend-multiply select-none`}
        />
      </div>

      {showSubtitle && (
        <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-1 ${
          variant === 'dark' ? 'text-purple-300' : 'text-purple-700'
        }`}>
          Therapy Clinic EMR
        </span>
      )}
    </div>
  );
};

export default MindlapLogo;
