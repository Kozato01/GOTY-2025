import React, { useState } from 'react';

interface IntroScreenProps {
  onStart: (nickname: string) => void;
  error: string;
}

const TgaLogo = () => (
  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-sky-400">
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 7L12 12M22 7L12 12M12 22V12M17 4.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, error }) => {
  const [nickname, setNickname] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onStart(nickname);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center animate-fadeIn p-8 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg">
      <TgaLogo />
      <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
        GOTY VOTE <span className="text-sky-400">2025</span>
      </h1>
      <p className="mt-4 text-lg text-gray-300 max-w-md">
        Insira seu nick/telegram/nome para começar a votar nas categorias do The Game Awards deste ano.
      </p>

      <div className="mt-12 w-full max-w-sm">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Seu Nickname"
          className="w-full px-6 py-4 text-center text-lg bg-gray-900 bg-opacity-50 border-2 border-sky-400 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all duration-300 placeholder-gray-500"
          aria-label="Nickname Input"
        />
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        <button
          onClick={() => onStart(nickname)}
          disabled={!nickname.trim()}
          className="w-full mt-4 px-6 py-4 text-lg font-bold bg-sky-400 text-black rounded-md uppercase tracking-widest hover:bg-white hover:shadow-lg hover:shadow-sky-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Começar a Votação
        </button>
      </div>
    </div>
  );
};

export default IntroScreen;