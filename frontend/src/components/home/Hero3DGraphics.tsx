import React from 'react';

// 3D-style SVG Capsule
export const Capsule3D = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pillBody" x1="0" y1="30" x2="60" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#c7d2fe" />
        <stop offset="0.55" stopColor="#a78bfa" />
        <stop offset="1" stopColor="#818cf8" />
      </linearGradient>
      <linearGradient id="pillGlass" x1="10" y1="15" x2="50" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#818cf8" stopOpacity="0.1" />
      </linearGradient>
      <filter id="pillShadow" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#a5b4fc" floodOpacity="0.23" />
      </filter>
      <radialGradient id="pillHighlight" cx="0.4" cy="0.3" r="0.6">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.88" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x="8" y="18" width="44" height="24" rx="12" fill="url(#pillBody)" filter="url(#pillShadow)" />
    <rect x="8" y="18" width="44" height="24" rx="12" fill="url(#pillGlass)" />
    <ellipse cx="24" cy="27" rx="6" ry="4" fill="url(#pillHighlight)" />
    <ellipse cx="36" cy="33" rx="8" ry="3" fill="#fff" fillOpacity="0.10" />
    <rect x="8" y="18" width="44" height="24" rx="12" stroke="#ede9fe" strokeWidth="1.2" opacity="0.7" />
  </svg>
);

// 3D-style SVG Heart
export const Heart3D = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="heartGradient" cx="0.5" cy="0.5" r="0.7">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="100%" stopColor="#f472b6" />
      </radialGradient>
      <radialGradient id="heartInner" cx="0.7" cy="0.6" r="0.5">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
      </radialGradient>
      <filter id="heartShadow" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#f472b6" floodOpacity="0.13" />
      </filter>
    </defs>
    <path d="M28 50C-8 28 10 6 28 18C46 6 64 28 28 50Z" fill="url(#heartGradient)" filter="url(#heartShadow)" />
    <ellipse cx="32" cy="26" rx="8" ry="4" fill="url(#heartInner)" />
    <ellipse cx="36" cy="33" rx="7" ry="2.4" fill="#fff" fillOpacity="0.10" />
    <path d="M28 50C-8 28 10 6 28 18C46 6 64 28 28 50Z" stroke="#f9a8d4" strokeWidth="1.2" opacity="0.5" />
  </svg>
);

// 3D-style SVG Sparkle
export const Sparkle3D = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sparkleGradient" cx="0.5" cy="0.5" r="0.7">
        <stop offset="0%" stopColor="#a5b4fc" />
        <stop offset="100%" stopColor="#818cf8" />
      </radialGradient>
      <radialGradient id="sparkleGlow" cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
      </radialGradient>
      <filter id="sparkleShadow" x="0" y="0" width="34" height="34" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#818cf8" floodOpacity="0.16" />
      </filter>
    </defs>
    <polygon points="17,2 21,13 32,17 21,21 17,32 13,21 2,17 13,13" fill="url(#sparkleGradient)" filter="url(#sparkleShadow)" />
    <ellipse cx="17" cy="17" rx="6" ry="2.5" fill="url(#sparkleGlow)" />
    <ellipse cx="20" cy="21" rx="5" ry="1.5" fill="#fff" fillOpacity="0.10" />
    <polygon points="17,2 21,13 32,17 21,21 17,32 13,21 2,17 13,13" stroke="#a5b4fc" strokeWidth="1" opacity="0.5" />
  </svg>
);

// Wrapper for easy placement
const Hero3DGraphics = () => (
  <div className="absolute inset-0 pointer-events-none z-0 select-none" aria-hidden="true" role="presentation">
    {/* Top left capsule - desktop only */}
    <div className="hidden md:block absolute left-[2vw] top-[10vh] w-10 h-10 animate-float-slow">
      <span className="block w-full h-full"><Capsule3D /></span>
    </div>
    {/* Top right heart - desktop only */}
    <div className="hidden md:block absolute right-[3vw] top-[18vh] w-10 h-10 animate-float-medium">
      <span className="block w-full h-full"><Heart3D /></span>
    </div>
    {/* Bottom right sparkle - always visible, smaller on mobile */}
    <div className="absolute right-[6vw] bottom-[8vh] w-8 h-8 animate-float-fast">
      <span className="block w-full h-full"><Sparkle3D /></span>
    </div>
  </div>
);

export default Hero3DGraphics;
