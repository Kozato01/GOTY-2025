import React from 'react';

/** Set de ícones do app — estilo stroke consistente (24×24, currentColor). */

interface IconProps {
  className?: string;
}

const base = (className = '') => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
});

export const TrophyIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg {...base(className)}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg {...base(className)} strokeWidth={2.5}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg {...base(className)} aria-hidden>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg {...base(className)} strokeWidth={2.5}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg {...base(className)}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg {...base(className)}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const GithubIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

/**
 * Troféu do GOTY Vote: taça em ouro escovado sobre base preta com faixa dourada.
 * Ilustração própria (não é a estatueta do TGA). IDs de gradiente via useId
 * para várias instâncias na mesma página.
 */
export const GoldTrophy: React.FC<IconProps & { title?: string }> = ({ className = '', title }) => {
  const id = React.useId().replace(/:/g, '');
  const gold = `gold-${id}`;
  const shine = `shine-${id}`;
  const band = `band-${id}`;
  return (
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b4f1a" />
          <stop offset="0.22" stopColor="#c9a24a" />
          <stop offset="0.42" stopColor="#f6e2a1" />
          <stop offset="0.58" stopColor="#d8b45e" />
          <stop offset="0.85" stopColor="#8e6a26" />
          <stop offset="1" stopColor="#5a4116" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff8dc" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff8dc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={band} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a5c22" />
          <stop offset="0.5" stopColor="#f0d58a" />
          <stop offset="1" stopColor="#7a5c22" />
        </linearGradient>
      </defs>
      {/* alças */}
      <path d="M28 22H14c-2 0-3 1-3 3 0 16 9 27 22 29" fill="none" stroke={`url(#${gold})`} strokeWidth="6" strokeLinecap="round" />
      <path d="M92 22h14c2 0 3 1 3 3 0 16-9 27-22 29" fill="none" stroke={`url(#${gold})`} strokeWidth="6" strokeLinecap="round" />
      {/* taça */}
      <path d="M26 12h68v24c0 22-15 38-34 38S26 58 26 36Z" fill={`url(#${gold})`} />
      <path d="M26 12h68v5H26Z" fill="#f6e2a1" opacity="0.55" />
      <path d="M33 18h10v18c0 12 5 22 13 28-14-2-23-14-23-28Z" fill={`url(#${shine})`} />
      {/* estrela gravada */}
      <path d="M60 26l4.4 9 9.9 1.4-7.2 7 1.7 9.8L60 48.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4Z" fill="#5a4116" opacity="0.55" />
      <path d="M60 25l4.4 9 9.9 1.4-7.2 7 1.7 9.8L60 47.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4Z" fill="#f6e2a1" opacity="0.9" />
      {/* haste */}
      <path d="M52 73h16l-3 9c-1 4 0 9 5 12H50c5-3 6-8 5-12Z" fill={`url(#${gold})`} />
      <rect x="40" y="94" width="40" height="7" rx="1.5" fill={`url(#${gold})`} />
      {/* base */}
      <path d="M30 104h60l4 44H26Z" fill="#141312" stroke="#2a2620" strokeWidth="1" />
      <rect x="30" y="118" width="60" height="5" fill={`url(#${band})`} />
      <rect x="22" y="148" width="76" height="8" rx="1.5" fill="#0b0b0c" stroke={`url(#${band})`} strokeWidth="1.2" />
    </svg>
  );
};
