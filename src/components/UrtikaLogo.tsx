import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const UrtikaLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size = 24 }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer Shield Contour */}
        <path d="M 120 148 L 256 96 L 332 128" />
        <path d="M 120 148 L 120 286 C 120 372 188 424 256 446 C 324 424 392 372 392 286 L 392 216" />

        {/* Plus / Medical Cross on top right */}
        <path d="M 392 144 L 448 144" strokeWidth="28" />
        <path d="M 420 116 L 420 172" strokeWidth="28" />

        {/* Central Leaf / Drop contour */}
        <path d="M 256 128 C 172 208 172 320 256 384 C 340 320 340 208 256 128 Z" />

        {/* Central stem / vein */}
        <path d="M 256 160 L 256 446" />

        {/* Leaf veins */}
        <path d="M 256 248 C 224 236 196 264 196 264" />
        <path d="M 256 312 C 220 304 204 336 204 336" />
        <path d="M 256 248 C 288 236 316 264 316 264" />
        <path d="M 256 312 C 292 304 308 336 308 336" />

        {/* Upper curved contour line */}
        <path d="M 128 176 C 188 196 220 186 256 168 C 292 186 324 196 384 176" />
      </g>
    </svg>
  );
};
