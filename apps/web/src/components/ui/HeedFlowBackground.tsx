import React from 'react';

export interface HeedFlowBackgroundProps {
  intensity?: 'landing' | 'auth' | 'dashboard' | 'timeline' | 'security' | 'high' | 'medium' | 'low';
  density?: 'compact' | 'normal' | 'expressive';
  animated?: boolean;
}

export function HeedFlowBackground({
  intensity = 'dashboard',
  density = 'normal',
  animated = true,
}: HeedFlowBackgroundProps) {
  let opacity = 0.04;
  let strokeWidthMultiplier = 1;

  switch (intensity) {
    case 'landing':
    case 'high':
      opacity = 0.085;
      strokeWidthMultiplier = 1.25;
      break;
    case 'auth':
      opacity = 0.05;
      strokeWidthMultiplier = 1;
      break;
    case 'security':
      opacity = 0.065;
      strokeWidthMultiplier = 1.1;
      break;
    case 'timeline':
      opacity = 0.045;
      strokeWidthMultiplier = 0.9;
      break;
    case 'dashboard':
    case 'medium':
      opacity = 0.035;
      strokeWidthMultiplier = 0.85;
      break;
    case 'low':
      opacity = 0.02;
      strokeWidthMultiplier = 0.7;
      break;
  }

  const isExpressive = density === 'expressive' || intensity === 'landing';
  const isSecurity = intensity === 'security';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ opacity }}
    >
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="heedNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <linearGradient id="heedFlowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--line-strong)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heedFlowGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--allow)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--block)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Subtle physical texture layer */}
        <rect width="100%" height="100%" filter="url(#heedNoise)" opacity="0.15" />

        {/* Primary boundary line curves representing information flow contours */}
        <path
          d="M -150,180 C 250,80 600,380 1150,220 S 1750,450 2100,280"
          fill="none"
          stroke="url(#heedFlowGrad1)"
          strokeWidth={1.5 * strokeWidthMultiplier}
          className={animated ? 'motion-safe:animate-pulse' : ''}
        />

        <path
          d="M -100,520 C 350,680 820,320 1380,560 S 1900,220 2200,420"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth={1 * strokeWidthMultiplier}
          strokeDasharray="4 8"
        />

        {isExpressive && (
          <path
            d="M 50,-50 C 450,250 350,680 950,750 S 1650,520 2100,900"
            fill="none"
            stroke="url(#heedFlowGrad2)"
            strokeWidth={1.2 * strokeWidthMultiplier}
            opacity="0.6"
          />
        )}

        {isSecurity && (
          <>
            {/* Structured boundary grid lines for technical feel */}
            <line x1="20%" y1="0" x2="20%" y2="100%" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 6" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 6" />
            <line x1="80%" y1="0" x2="80%" y2="100%" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 6" />
            <circle cx="20%" cy="180" r="3" fill="var(--accent)" opacity="0.6" />
            <circle cx="50%" cy="420" r="3" fill="var(--allow)" opacity="0.6" />
            <circle cx="80%" cy="300" r="3" fill="var(--block)" opacity="0.6" />
          </>
        )}

        {/* Abstract contextual nodes */}
        <circle cx="280" cy="140" r="2.5" fill="var(--accent)" opacity="0.6" />
        <circle cx="780" cy="460" r="3" fill="var(--muted)" opacity="0.4" />
        <circle cx="1220" cy="240" r="2" fill="var(--faint)" opacity="0.5" />
        {isExpressive && (
          <>
            <circle cx="1540" cy="380" r="2.5" fill="var(--accent)" opacity="0.5" />
            <circle cx="480" cy="620" r="3.5" fill="var(--line-strong)" opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}
export default HeedFlowBackground;
