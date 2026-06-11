import React, { useState, useEffect, useRef } from 'react';
import { UserVote, Category } from '../types';
import { initGoogleAuth, renderGoogleButton, isConfigured, getProfile, GoogleProfile } from '../services/auth';
import { ApiService } from '../services/api';

interface IntroScreenProps {
  onStart: (nickname: string) => void;
  onReturningUser: (nickname: string) => void;
  initialNickname: string;
  error: string;
  allVotes: UserVote[];
  categories: Category[];
}

const TGA_DATE = new Date('2026-12-11T20:00:00-05:00');

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return null;
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  const [time, setTime] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onReturningUser, initialNickname, error, allVotes, categories }) => {
  // Sessão fica em memória no services/auth — ao voltar pra home continua logado.
  const [profile, setProfile] = useState<GoogleProfile | null>(getProfile());
  const [nickname, setNickname] = useState(initialNickname);
  const [showRules, setShowRules] = useState(false);
  const [consent, setConsent] = useState(Boolean(initialNickname));
  const [checkingVote, setCheckingVote] = useState(false);
  const [votedNickname, setVotedNickname] = useState<string | null>(null);
  const [redoConfirm, setRedoConfirm] = useState(false);
  const [redoing, setRedoing] = useState(false);
  const [redoError, setRedoError] = useState('');
  const countdown = useCountdown(TGA_DATE);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Após o login, consulta GET /api/me: usuário recorrente (já votou) não
  // redigita nickname — vê o card "voto registrado" e escolhe o que fazer.
  const handleLogin = async (p: GoogleProfile) => {
    setProfile(p);
    setCheckingVote(true);
    try {
      const existing = await ApiService.getMyVote();
      if (existing) setVotedNickname(existing.nickname);
    } finally {
      setCheckingVote(false);
    }
  };

  // Refazer votação: apaga o voto atual (DELETE /api/me) e vai direto
  // para a votação reaproveitando o nickname — o novo voto substitui o antigo.
  const handleRedoVote = async () => {
    if (!votedNickname) return;
    setRedoing(true);
    setRedoError('');
    try {
      await ApiService.deleteMyVote();
      onStart(votedNickname);
    } catch (e) {
      setRedoError(e instanceof Error ? e.message : 'Erro ao apagar o voto');
      setRedoing(false);
      setRedoConfirm(false);
    }
  };

  // Já estava logado ao abrir a home (voltou da votação/resultados):
  // verifica se já votou para mostrar a mensagem em vez do formulário.
  useEffect(() => {
    if (!getProfile()) return;
    setCheckingVote(true);
    ApiService.getMyVote()
      .then((existing) => {
        if (existing) setVotedNickname(existing.nickname);
      })
      .finally(() => setCheckingVote(false));
  }, []);

  // Inicializa o login Google e renderiza o botão oficial.
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const ready = initGoogleAuth(handleLogin);
      if (ready && googleBtnRef.current && !profile) {
        renderGoogleButton(googleBtnRef.current);
        clearInterval(timer);
      }
      if (tries > 40) clearInterval(timer); // ~4s de espera pelo script GIS
    }, 100);
    return () => clearInterval(timer);
  }, [profile]);

  const canStart = Boolean(profile) && nickname.trim().length > 0 && consent;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && canStart) onStart(nickname);
  };

  const totalVotesComputed = allVotes.reduce((acc, v) => acc + Object.keys(v.votes).length, 0);
  const totalCategories = categories.length;
  const maxPoints = categories.reduce((acc, c) => acc + c.points, 0);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center text-center animate-fadeIn gap-6">

      {/* Hero */}
      <div className="w-full p-8 sm:p-12 bg-[#100720]/90 backdrop-blur-sm border-2 border-violet-600/60 rounded-2xl shadow-2xl shadow-violet-500/20">
        <div className="mb-6">
          <svg className="mx-auto w-20 h-20 text-violet-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]" viewBox="0 0 24 24" fill="none">
            <path d="M6 5h12M6 5c-1 0-2 1-2 2v2c0 2 1 3 2 3M6 5V3h12v2M18 5c1 0 2 1 2 2v2c0 2-1 3-2 3M6 12c0 3 3 5 6 5s6-2 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17v3m-3 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 9l.5 1.5h1.5l-1.2.9.5 1.6-1.3-1-1.3 1 .5-1.6-1.2-.9h1.5z" fill="currentColor"/>
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest leading-tight">
          <span className="bg-gradient-to-r from-violet-300 to-violet-500 text-transparent bg-clip-text">GOTY VOTE</span>{' '}
          <span className="bg-gradient-to-r from-amber-300 to-amber-500 text-transparent bg-clip-text">2026</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400 font-semibold tracking-wide">
          Bolão entre amigos · The Game Awards · 11 de Dezembro
        </p>

        {/* Countdown */}
        <div className="mt-8">
          {countdown ? (
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Contagem regressiva para a cerimônia</p>
              <div className="flex justify-center gap-3">
                {[
                  { value: countdown.days,    label: 'Dias' },
                  { value: countdown.hours,   label: 'Horas' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Seg' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-[#0f0620] border border-violet-700/50 rounded-xl px-3 py-2 min-w-[60px]">
                    <div className="text-2xl sm:text-3xl font-black text-violet-400 tabular-nums">{pad(value)}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-amber-400 font-black text-xl tracking-widest">🏆 Cerimônia encerrada!</div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f0620]/80 border border-violet-700/40 rounded-xl p-4">
            <div className="text-3xl font-black text-violet-400">{allVotes.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Participantes</div>
          </div>
          <div className="bg-[#0f0620]/80 border border-violet-700/40 rounded-xl p-4">
            <div className="text-3xl font-black text-violet-400">{totalVotesComputed}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Votos Computados</div>
          </div>
          <div className="bg-[#0f0620]/80 border border-violet-700/40 rounded-xl p-4">
            <div className="text-3xl font-black text-violet-400">{totalCategories}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Categorias</div>
          </div>
        </div>

        {/* Login + Nickname */}
        <div className="mt-10 w-full max-w-sm mx-auto">
          {!profile ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-slate-400">Entre com sua conta Google para votar</p>
              <div ref={googleBtnRef} className="flex justify-center"></div>
              {!isConfigured() && (
                <p className="text-amber-400/80 text-xs">Login Google não configurado (defina VITE_GOOGLE_CLIENT_ID).</p>
              )}
              <p className="text-slate-500 text-xs leading-relaxed mt-1">
                Garante <strong className="text-slate-400">1 voto por pessoa</strong>. Seu e-mail <strong className="text-slate-400">não é armazenado</strong>.
              </p>
            </div>
          ) : checkingVote ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
              <p className="text-sm text-slate-400">Verificando seu voto...</p>
            </div>
          ) : votedNickname ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full bg-[#0f0620] border-2 border-amber-500/40 rounded-xl px-6 py-5">
                <div className="text-amber-400 text-2xl mb-1">✓</div>
                <p className="text-slate-200 font-bold">
                  Voto registrado, <span className="text-amber-400">{votedNickname}</span>!
                </p>
                <p className="text-slate-400 text-sm mt-1">Agora é torcer — os vencedores saem em 11 de Dezembro.</p>
              </div>
              <button
                onClick={() => onReturningUser(votedNickname)}
                className="w-full px-6 py-4 text-lg font-bold bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white rounded-xl uppercase tracking-widest shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver Resultados
              </button>

              {/* Refazer votação: substitui o voto antigo por um novo */}
              {!redoConfirm ? (
                <button
                  onClick={() => setRedoConfirm(true)}
                  className="w-full bg-[#0f0620] border-2 border-violet-700/50 hover:border-violet-500 rounded-xl px-6 py-4 flex items-center gap-4 text-left transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] group"
                >
                  <svg className="w-8 h-8 text-violet-400 shrink-0 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>
                  </svg>
                  <span>
                    <span className="block font-bold text-slate-200 uppercase tracking-wider text-sm">Refazer Votação</span>
                    <span className="block text-slate-500 text-xs mt-0.5">Mudou de ideia? Apague seu voto e escolha tudo de novo.</span>
                  </span>
                </button>
              ) : (
                <div className="w-full bg-[#0f0620] border border-red-700/50 rounded-xl px-5 py-4 flex flex-col gap-3 animate-fadeIn">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Seu voto atual será <strong className="text-red-400">apagado</strong> e você fará a votação do zero. Tem certeza?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRedoVote}
                      disabled={redoing}
                      className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
                    >
                      {redoing ? 'Apagando...' : 'Sim, refazer'}
                    </button>
                    <button
                      onClick={() => setRedoConfirm(false)}
                      disabled={redoing}
                      className="px-5 py-2 text-sm font-bold bg-[#1a0f33] hover:bg-violet-900/40 text-slate-300 border border-violet-700/50 rounded-lg uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                  {redoError && <p className="text-red-400 text-sm font-medium">{redoError}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-3">
                {profile.picture && (
                  <img src={profile.picture} alt="" className="w-8 h-8 rounded-full border border-violet-500/50" referrerPolicy="no-referrer" />
                )}
                <span className="text-slate-300 text-sm">Olá, <strong className="text-white">{profile.name}</strong></span>
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escolha seu nickname"
                maxLength={30}
                className="w-full px-6 py-4 text-center text-lg bg-[#0f0620] border-2 border-violet-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:shadow-lg focus:shadow-violet-500/30 transition-all duration-300 placeholder-slate-500 text-white"
                aria-label="Nickname Input"
              />
              <label className="flex items-start gap-2 text-left text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-violet-500"
                />
                <span>Autorizo o uso do meu login Google apenas para garantir um voto único. Meu e-mail não é armazenado (LGPD).</span>
              </label>
              {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
              <button
                onClick={() => onStart(nickname)}
                disabled={!canStart}
                className="w-full px-6 py-4 text-lg font-bold bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white rounded-xl uppercase tracking-widest shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                Começar a Votação
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Como Funciona */}
      <div className="w-full bg-[#100720]/90 backdrop-blur-sm border-2 border-violet-900/50 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowRules(prev => !prev)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-violet-400/5 transition-colors duration-200"
        >
          <span className="font-bold text-base uppercase tracking-widest text-slate-200">Como Funciona</span>
          <span className={`text-violet-400 text-xl font-bold transition-transform duration-300 ${showRules ? 'rotate-45' : ''}`}>+</span>
        </button>

        {showRules && (
          <div className="px-6 pb-6 animate-fadeIn border-t border-violet-900/40">
            <ul className="mt-4 space-y-3 text-left">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-black mt-0.5">01</span>
                <span className="text-slate-300 text-sm leading-relaxed">Escolha um candidato em cada uma das <strong className="text-white">{totalCategories} categorias</strong> disponíveis.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-black mt-0.5">02</span>
                <span className="text-slate-300 text-sm leading-relaxed">Cada categoria vale uma quantidade de pontos diferente. O total máximo é <strong className="text-white">{maxPoints} pontos</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-black mt-0.5">03</span>
                <span className="text-slate-300 text-sm leading-relaxed">Os votos são comparados com os <strong className="text-white">vencedores reais</strong> do The Game Awards — anunciados em 11 de Dezembro.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 font-black mt-0.5">04</span>
                <span className="text-slate-300 text-sm leading-relaxed">Quem acertar mais categorias (com peso em pontos) fica no topo do <strong className="text-white">ranking</strong>.</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* GitHub */}
      <a
        href="https://github.com/Kozato01/GOTY-2025"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-slate-500 hover:text-violet-400 transition-colors duration-200 text-sm font-medium pb-2"
      >
        <GitHubIcon />
        Ver código no GitHub
      </a>

    </div>
  );
};

export default IntroScreen;
