import React, { useState, useEffect, useRef } from 'react';
import { UserVote, Category } from '../types';
import { initGoogleAuth, renderGoogleButton, isConfigured, getProfile, GoogleProfile } from '../services/auth';
import { ApiService } from '../services/api';
import { CheckCircleIcon, RefreshIcon, PlusIcon } from './icons';

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

  const totalCategories = categories.length;
  const maxPoints = categories.reduce((acc, c) => acc + c.points, 0);


  const stats = [
    { value: allVotes.length, label: 'Participantes' },
    { value: totalCategories, label: 'Categorias' },
    { value: maxPoints, label: 'Pontos em jogo' },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-12 sm:gap-16">

      {/* Palco: troféu sob o holofote */}
      <section className="w-full flex flex-col items-center">
        {/* Estatueta: o fundo escuro da foto se funde ao palco (lighten + vinheta) */}
        <img
          src="/brand/tga-trophy.webp"
          alt="Estatueta do The Game Awards"
          width={800}
          height={800}
          className="w-64 h-64 sm:w-96 sm:h-96 object-cover mix-blend-lighten animate-spotlight [mask-image:radial-gradient(closest-side,#000_62%,transparent)]"
        />
        <img src="/brand/tga-logo.svg" alt="The Game Awards" className="-mt-6 sm:-mt-10 h-7 sm:h-9 w-auto" />

        <h1 className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl uppercase leading-[0.9] text-paper text-balance">
          GOTY Vote <span className="text-gold">2026</span>
        </h1>
        <p className="mt-5 text-sm sm:text-base text-ash">
          Bolão entre amigos · The Game Awards · 11 de dezembro
        </p>

        {/* Contagem regressiva */}
        <div className="mt-10 w-full">
          {countdown ? (
            <div role="timer" aria-label="Contagem regressiva para a cerimônia" className="flex justify-center gap-2 sm:gap-4">
              {[
                { v: countdown.days, l: 'Dias' },
                { v: countdown.hours, l: 'Horas' },
                { v: countdown.minutes, l: 'Min' },
                { v: countdown.seconds, l: 'Seg' },
              ].map(({ v, l }) => (
                <div key={l} className="w-[4.5rem] sm:w-28 border border-gold/35 bg-ink/60 py-3 sm:py-5">
                  <div className="font-display font-mono text-3xl sm:text-5xl text-gold leading-none">
                    {String(v).padStart(2, '0')}
                  </div>
                  <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-ash">{l}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-display text-2xl sm:text-3xl uppercase text-gold">A cerimônia já aconteceu</p>
          )}
        </div>

        {/* Login / estado do voto */}
        <div className="mt-12 w-full max-w-sm">
          {!profile ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-paper/90">Entre com sua conta Google para votar</p>
              <div ref={googleBtnRef} className="flex justify-center min-h-[44px]"></div>
              {!isConfigured() && (
                <p className="text-gold text-xs">Login Google não configurado (defina VITE_GOOGLE_CLIENT_ID).</p>
              )}
              <p className="text-ash text-xs leading-relaxed">
                Garante <strong className="text-paper/90 font-semibold">1 voto por pessoa</strong>. Seu e-mail <strong className="text-paper/90 font-semibold">não é armazenado</strong>.
              </p>
            </div>
          ) : checkingVote ? (
            <div className="flex flex-col items-center gap-3 py-4" role="status">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-velvet-line border-t-gold"></div>
              <p className="text-sm text-ash">Verificando seu voto…</p>
            </div>
          ) : votedNickname ? (
            <div className="flex flex-col items-stretch gap-3">
              <div className="border border-gold/40 bg-velvet px-6 py-5">
                <CheckCircleIcon className="w-8 h-8 text-gold mx-auto" />
                <p className="mt-2 text-paper font-semibold">
                  Voto registrado, <span className="text-gold">{votedNickname}</span>
                </p>
                <p className="text-ash text-sm mt-1">Agora é torcer. Os vencedores saem em 11 de dezembro.</p>
              </div>
              <button
                onClick={() => onReturningUser(votedNickname)}
                className="w-full px-6 py-4 font-semibold bg-gold hover:bg-gold-bright text-ink uppercase tracking-[0.14em] text-sm transition-colors duration-200"
              >
                Ver resultados
              </button>

              {!redoConfirm ? (
                <button
                  onClick={() => setRedoConfirm(true)}
                  className="group w-full flex items-center justify-center gap-2 px-6 py-3 text-sm text-ash hover:text-paper transition-colors"
                >
                  <RefreshIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Mudou de ideia? Refazer votação
                </button>
              ) : (
                <div className="border border-burgundy-bright/40 bg-velvet px-5 py-4 flex flex-col gap-3 animate-fadeIn" role="alertdialog" aria-label="Confirmar refazer votação">
                  <p className="text-paper/90 text-sm leading-relaxed">
                    Seu voto atual será <strong className="text-burgundy-bright">apagado</strong> e você vota tudo de novo. Confirma?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRedoVote}
                      disabled={redoing}
                      className="px-5 py-2.5 text-sm font-semibold bg-burgundy hover:bg-burgundy-bright hover:text-ink text-paper uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {redoing ? 'Apagando…' : 'Sim, refazer'}
                    </button>
                    <button
                      onClick={() => setRedoConfirm(false)}
                      disabled={redoing}
                      className="px-5 py-2.5 text-sm font-semibold text-ash hover:text-paper border border-velvet-line uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                  {redoError && <p className="text-burgundy-bright text-sm" role="alert">{redoError}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-3">
                {profile.picture && (
                  <img src={profile.picture} alt="" className="w-8 h-8 rounded-full border border-gold/50" referrerPolicy="no-referrer" />
                )}
                <span className="text-ash text-sm">Olá, <strong className="text-paper font-semibold">{profile.name}</strong></span>
              </div>
              <label className="sr-only" htmlFor="nickname">Nickname</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escolha seu nickname"
                maxLength={30}
                className="w-full px-5 py-4 text-center text-lg bg-ink border border-velvet-line focus:outline-none focus:border-gold transition-colors placeholder:text-ash text-paper"
              />
              <label className="flex items-start gap-2.5 text-left text-xs text-ash cursor-pointer leading-relaxed">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#c9a24a] shrink-0"
                />
                <span>Autorizo o uso do meu login Google apenas para garantir um voto único. Meu e-mail não é armazenado (LGPD).</span>
              </label>
              {error && <p className="text-burgundy-bright text-sm" role="alert">{error}</p>}
              <button
                onClick={() => onStart(nickname)}
                disabled={!canStart}
                className="w-full px-6 py-4 font-semibold bg-gold hover:bg-gold-bright text-ink uppercase tracking-[0.14em] transition-colors duration-200 disabled:bg-velvet-line disabled:text-ash disabled:cursor-not-allowed"
              >
                Começar a votação
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Números do bolão */}
      <dl className="w-full grid grid-cols-3 border-y border-velvet-line divide-x divide-velvet-line">
        {stats.map(({ value, label }) => (
          <div key={label} className="py-5 sm:py-6">
            <dt className="px-1 text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.18em] text-ash">{label}</dt>
            <dd className="mt-1.5 font-display font-mono text-2xl sm:text-4xl text-paper">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Como funciona */}
      <section className="w-full max-w-2xl text-left">
        <button
          onClick={() => setShowRules(prev => !prev)}
          aria-expanded={showRules}
          className="w-full flex items-center justify-between py-4 border-b border-velvet-line text-left group"
        >
          <span className="font-display text-lg sm:text-xl uppercase text-paper group-hover:text-gold transition-colors">Como funciona</span>
          <PlusIcon className={`w-5 h-5 text-gold transition-transform duration-300 ${showRules ? 'rotate-45' : ''}`} />
        </button>
        {showRules && (
          <ul className="pt-5 space-y-3 text-sm text-ash leading-relaxed animate-fadeIn">
            <li>Escolha um indicado em cada uma das <strong className="text-paper font-semibold">{totalCategories} categorias</strong> e revise a cédula antes de confirmar.</li>
            <li>Cada categoria vale uma quantidade diferente de pontos. O máximo possível é <strong className="text-paper font-semibold">{maxPoints} pontos</strong>.</li>
            <li>Os votos são comparados com os <strong className="text-paper font-semibold">vencedores reais</strong> do The Game Awards, anunciados em 11 de dezembro.</li>
            <li>Quem somar mais pontos fica no topo do <strong className="text-paper font-semibold">ranking</strong>.</li>
          </ul>
        )}
      </section>
    </div>
  );
};

export default IntroScreen;
