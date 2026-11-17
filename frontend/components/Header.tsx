import React, { useState } from 'react';
import { View } from '../App';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  hasVotes: boolean;
  resultsVisible: boolean;
  currentUser?: string;
  onLogout?: () => void;
}

const allNavItems: { view: View; label: string }[] = [
  { view: 'intro', label: 'Início' },
  { view: 'categories', label: 'Categorias' },
  { view: 'voters', label: 'Participantes' },
  { view: 'results', label: 'Resultados' },
  { view: 'winners', label: 'Ganhadores' },
];

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, resultsVisible, currentUser, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = resultsVisible
    ? allNavItems
    : allNavItems.filter(i => i.view !== 'results' && i.view !== 'winners');

  const handleNavigate = (view: View) => {
    onNavigate(view);
    setMenuOpen(false);
  };

  return (
    <header className="relative z-50 w-full mb-8 sm:mb-12 border-b border-velvet-line">
      <div className="flex items-center justify-between gap-4 h-16">
        <button
          onClick={() => handleNavigate('intro')}
          className="flex items-center gap-2.5 shrink-0"
          aria-label="GOTY Vote 2026, início"
        >
          <img src="/brand/tga-logo.svg" alt="" className="h-6 w-auto" />
          <span className="font-display text-lg sm:text-xl uppercase text-paper leading-none">
            GOTY Vote <span className="text-gold">2026</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-7" aria-label="Principal">
          {navItems.map(({ view, label }) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => handleNavigate(view)}
                aria-current={active ? 'page' : undefined}
                className={`relative py-5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ${
                  active ? 'text-gold' : 'text-ash hover:text-paper'
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-px left-0 right-0 h-px bg-gold transition-transform duration-300 origin-center ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
          {currentUser && (
            <span className="flex items-center gap-3 pl-6 border-l border-velvet-line">
              <span className="text-xs text-ash max-w-[10rem] truncate">{currentUser}</span>
              <button
                onClick={onLogout}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-ash hover:text-gold transition-colors"
              >
                Sair
              </button>
            </span>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-11 h-11 text-ash hover:text-gold transition-colors"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          <span className={`block w-6 h-px bg-current transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-px bg-current transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-px bg-current transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <nav
            className="md:hidden absolute right-0 left-0 top-full z-50 bg-velvet border border-velvet-line shadow-[0_16px_32px_rgba(0,0,0,0.6)] animate-fadeIn"
            aria-label="Principal"
          >
            {navItems.map(({ view, label }) => (
              <button
                key={view}
                onClick={() => handleNavigate(view)}
                aria-current={currentView === view ? 'page' : undefined}
                className={`w-full text-left px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] border-b border-velvet-line ${
                  currentView === view ? 'text-gold' : 'text-ash hover:text-paper'
                }`}
              >
                {label}
              </button>
            ))}
            {currentUser && (
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-ash truncate">{currentUser}</span>
                <button
                  onClick={() => { onLogout?.(); setMenuOpen(false); }}
                  className="text-sm font-semibold uppercase tracking-[0.14em] text-gold"
                >
                  Sair
                </button>
              </div>
            )}
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
