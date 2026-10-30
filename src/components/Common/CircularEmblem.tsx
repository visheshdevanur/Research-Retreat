import React from 'react';

interface CircularEmblemProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

export const CircularEmblem: React.FC<CircularEmblemProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  glow = false,
}) => {
  // Balanced institutional dimensions
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32',
    lg: 'w-52 h-52 md:w-60 md:h-60',
    xl: 'w-72 h-72 md:w-88 md:h-88',
  }[size];

  // Prefer .png if src points to .jpg, ensuring transparent corners
  const imageSrc = src.endsWith('.jpg') ? src.replace('.jpg', '.png') : src;

  return (
    <div
      className={`relative rounded-full flex items-center justify-center select-none flex-shrink-0 transition-transform duration-500 ${sizeClasses} ${className}`}
      style={{
        boxShadow: glow
          ? '0 0 30px rgba(66, 217, 255, 0.45), 0 0 15px rgba(214, 181, 111, 0.4), 0 10px 28px rgba(3, 7, 24, 0.8)'
          : '0 0 16px rgba(66, 217, 255, 0.25), 0 6px 20px rgba(3, 7, 24, 0.7)',
      }}
    >
      {/* 1. Refined Thin Metallic & Pearl-White Outer Border (#FFFFFF, #F8FAFF, #D6B56F) */}
      <div
        className="absolute inset-0 rounded-full p-[2.5px]"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 25%, #D6B56F 50%, #42D9FF 75%, #FFFFFF 100%)',
        }}
      >
        {/* 2. Fine Inner Midnight Contour Border */}
        <div className="w-full h-full rounded-full p-[1.5px] bg-[#071633]">
          {/* 3. Clean Circular Backing & Contain Container */}
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
            <img
              src={imageSrc}
              alt={alt}
              className="w-full h-full object-contain object-center rounded-full block"
            />

            {/* Subtle Specular Sheen across top-left of glass bezel */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 45%, rgba(66, 217, 255, 0.2) 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
