import React, { useState } from 'react';
import { View } from '../App';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  hasVotes: boolean;
  currentUser?: string;
  onLogout?: () => void;
}

const TgaLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]">
    <path d="M6 5h12M6 5c-1 0-2 1-2 2v2c0 2 1 3 2 3M6 5V3h12v2M18 5c1 0 2 1 2 2v2c0 2-1 3-2 3M6 12c0 3 3 5 6 5s6-2 6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17v3m-3 0h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9l.5 1.5h1.5l-1.2.9.5 1.6-1.3-1-1.3 1 .5-1.6-1.2-.9h1.5z" fill="currentColor"/>
  </svg>
);

const allNavItems: { view: View; label: string }[] = [
  { view: 'intro', label: 'Home' },
  { view: 'categories', label: 'Categorias' },
  { view: 'voters', label: 'Participantes' },
  { view: 'results', label: 'Resultados' },
  { view: 'winners', label: 'Ganhadores' },
];

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, hasVotes, currentUser, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (view: View) => {
    onNavigate(view);
    setMenuOpen(false);
  };

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
      <header className="w-full max-w-4xl mx-auto mb-8 bg-[#100720]/90 backdrop-blur-sm border-2 border-violet-600/60 rounded-2xl animate-fadeIn shadow-lg shadow-violet-600/20 relative z-50 overflow-hidden">

        {/* Andar 1 — Logo centrado */}
        <div
          className="flex items-center justify-center gap-3 py-4 cursor-pointer border-b border-violet-700/30 hover:bg-violet-400/5 transition-colors duration-200"
          onClick={() => handleNavigate('intro')}
        >
          <TgaLogo />
          <div className="text-center leading-none">
            <span className="font-black text-2xl sm:text-3xl tracking-widest uppercase text-white">
              GOTY{' '}
              <span className="bg-gradient-to-r from-violet-400 to-amber-400 text-transparent bg-clip-text">VOTE</span>{' '}
              <span className="text-violet-400">2026</span>
            </span>
          </div>
          <TgaLogo />
        </div>

        {/* Usuário logado + Sair */}
        {currentUser && (
          <div className="flex items-center justify-center gap-3 px-4 py-2 border-b border-violet-700/30 bg-violet-400/5">
            <span className="text-xs sm:text-sm text-slate-300">
              Logado como <strong className="text-violet-300">{currentUser}</strong>
            </span>
            <button
              onClick={() => { onLogout?.(); setMenuOpen(false); }}
              className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-violet-700/50 hover:border-violet-400 rounded-lg transition-all duration-200"
            >
              Sair
            </button>
          </div>
        )}

        {/* Andar 2 — Nav links (desktop) + hamburger (mobile) */}
        <div className="flex items-center justify-center px-4 py-1.5">

          {/* Desktop: tabs visíveis */}
          <nav className="hidden sm:flex items-center gap-1">
            {allNavItems.map(({ view, label }) => {
              const active = currentView === view;
              return (
                <button
                  key={view}
                  onClick={() => handleNavigate(view)}
                  className={`relative px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-lg
                    ${active
                      ? 'text-violet-400'
                      : 'text-slate-400 hover:text-white hover:bg-violet-400/5'
                    }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-violet-400 to-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile: hamburger */}
          <div className="sm:hidden relative w-full flex justify-end">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="flex flex-col justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-violet-400 hover:bg-violet-400/10 transition-all duration-200"
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#100720] border-2 border-violet-600/60 rounded-xl shadow-2xl shadow-violet-600/20 overflow-hidden animate-fadeIn">
                {allNavItems.map(({ view, label }) => (
                  <button
                    key={view}
                    onClick={() => handleNavigate(view)}
                    className={`w-full text-left px-5 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 border-b border-violet-900/30 last:border-b-0
                      ${currentView === view
                        ? 'text-violet-400 bg-violet-400/10'
                        : 'text-slate-300 hover:text-white hover:bg-violet-400/5'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  );
};

export default Header;
