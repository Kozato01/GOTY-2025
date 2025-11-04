import React from 'react';
import { View } from '../App';
import { SHOW_RESULTS } from '../constants';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  hasVotes: boolean;
}

const TgaLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-400">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 7L12 12M22 7L12 12M12 22V12M17 4.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const NavLink: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ onClick, isActive, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-300 ${
            isActive ? 'text-sky-400' : 'text-gray-400 hover:text-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, hasVotes }) => {
  return (
    <header className="w-full max-w-4xl mx-auto mb-8 p-4 bg-black bg-opacity-30 border border-gray-800 rounded-lg flex items-center justify-between animate-fadeIn">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('intro')}>
        <TgaLogo />
        <span className="font-bold text-lg hidden sm:block">GOTY 2025</span>
      </div>
      <nav className="flex items-center space-x-1 sm:space-x-2">
        <NavLink onClick={() => onNavigate('intro')} isActive={currentView === 'intro'}>
          Início
        </NavLink>
        <NavLink onClick={() => onNavigate('categories')} isActive={currentView === 'categories'}>
          Categorias
        </NavLink>
        <NavLink 
            onClick={() => onNavigate('voters')} 
            isActive={currentView === 'voters'}
            disabled={!hasVotes}
        >
          Votantes
        </NavLink>
        <NavLink 
            onClick={() => onNavigate('results')} 
            isActive={currentView === 'results'}
            disabled={!hasVotes || !SHOW_RESULTS}
        >
          Resultados
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;