import React, { useState } from 'react';
import { fitWideCover } from './cover';
import { CATEGORIES } from '../constants';
import { CheckIcon } from './icons';

interface VotingScreenProps {
  nickname: string;
  onSubmit: (votes: Record<string, string>) => Promise<void>;
}

const FALLBACK_COVER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#141312"/><rect x="0.5" y="0.5" width="299" height="399" fill="none" stroke="#2a2620"/></svg>'
);

const Cover: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className={`w-full h-full object-cover ${className}`}
    onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
                  onLoad={fitWideCover}
  />
);

const VotingScreen: React.FC<VotingScreenProps> = ({ nickname, onSubmit }) => {
  const total = CATEGORIES.length;
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = CATEGORIES[currentStep];
  const votedCount = CATEGORIES.filter(c => votes[c.name]).length;
  const allVoted = votedCount === total;

  const goTo = (step: number) => {
    setReviewing(false);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (title: string) => {
    setVotes(prev => ({ ...prev, [currentCategory.name]: title }));
  };

  const handleNext = () => {
    // Pula para a próxima categoria ainda sem voto; sem pendências, abre a revisão.
    const nextPending = CATEGORIES.findIndex((c, i) => i > currentStep && !votes[c.name]);
    if (nextPending !== -1) return goTo(nextPending);
    if (currentStep < total - 1 && !allVoted) return goTo(currentStep + 1);
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(votes);
    } catch (error) {
      console.error('Erro ao submeter votos:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentCategory) {
    return <p className="text-center text-ash py-12">Nenhuma categoria carregada.</p>;
  }

  // Trilho de categorias: ficha cheia = votada, aro = pendente, ouro = atual.
  const tracker = (
    <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Categorias">
      {CATEGORIES.map((c, i) => {
        const done = Boolean(votes[c.name]);
        const current = !reviewing && i === currentStep;
        return (
          <li key={c.id}>
            <button
              onClick={() => goTo(i)}
              aria-label={`${c.name}${done ? ', votada' : ', pendente'}`}
              aria-current={current ? 'step' : undefined}
              className="w-6 h-6 flex items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  current
                    ? 'w-3 h-3 bg-gold ring-2 ring-gold/30 ring-offset-2 ring-offset-ink'
                    : done
                      ? 'w-2.5 h-2.5 bg-gold/70'
                      : 'w-2.5 h-2.5 border border-ash/60'
                }`}
              />
            </button>
          </li>
        );
      })}
    </ol>
  );

  // ── Revisão final ───────────────────────────────────────────────
  if (reviewing) {
    const totalPoints = CATEGORIES.reduce((acc, c) => acc + c.points, 0);
    return (
      <div className="w-full max-w-3xl mx-auto animate-fadeIn">
        <div className="text-center">
          {tracker}
          <h2 className="mt-6 font-display text-4xl sm:text-6xl uppercase text-paper leading-none">Sua cédula</h2>
          <p className="mt-3 text-ash text-sm sm:text-base">
            Confira as {total} escolhas de <strong className="text-paper font-semibold">{nickname}</strong>. Toque em uma categoria para trocar.
          </p>
        </div>

        <ul className="mt-8 border-t border-velvet-line">
          {CATEGORIES.map((c, i) => {
            const title = votes[c.name];
            const nominee = c.nominees.find(n => n.title === title);
            return (
              <li key={c.id} className="border-b border-velvet-line">
                <button
                  onClick={() => goTo(i)}
                  className="group w-full flex items-center gap-4 py-3 text-left hover:bg-velvet transition-colors px-2 -mx-2"
                >
                  <span className="w-12 aspect-[3/4] shrink-0 overflow-hidden bg-velvet border border-velvet-line">
                    {nominee && <Cover src={nominee.imageUrl} alt="" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] uppercase tracking-[0.16em] text-ash">{c.name}</span>
                    <span className={`block font-semibold leading-snug ${title ? 'text-paper' : 'text-burgundy-bright'}`}>
                      {title ?? 'Sem voto'}
                    </span>
                  </span>
                  <span className="font-mono text-sm text-gold shrink-0">{c.points} pts</span>
                  <span className="text-xs uppercase tracking-[0.14em] text-ash group-hover:text-gold transition-colors shrink-0">Trocar</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <p className="text-sm text-ash md:flex-1 min-w-0">
            Até <strong className="text-paper font-semibold">{totalPoints} pontos</strong> em jogo. Depois de confirmar, só dá para mudar refazendo a votação.
          </p>
          <div className="flex w-full md:w-auto shrink-0 gap-3">
            <button
              onClick={() => goTo(total - 1)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ash border border-velvet-line hover:border-gold/60 hover:text-paper transition-colors disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allVoted || isSubmitting}
              className="flex-[2] sm:flex-none px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] bg-gold hover:bg-gold-bright text-ink transition-colors disabled:bg-velvet-line disabled:text-ash disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-ink/30 border-t-ink" />
                  Enviando…
                </>
              ) : 'Confirmar voto'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Uma categoria por vez ──────────────────────────────────────
  const selected = votes[currentCategory.name];
  const isLast = currentStep === total - 1;
  const nextLabel = allVoted || (isLast && selected) ? 'Revisar cédula' : 'Próxima';

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center">
        {tracker}
      </div>

      <div key={currentCategory.id} className="animate-fadeIn">
        <h2 className="mt-5 text-center font-display text-3xl sm:text-5xl uppercase text-paper leading-none text-balance">
          {currentCategory.name}
        </h2>
        <p className="mt-3 text-center text-sm text-ash">
          Categoria <span className="font-mono text-paper">{currentStep + 1}</span> de {total} · vale <span className="font-mono text-gold">{currentCategory.points} pontos</span>
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5" role="radiogroup" aria-label={currentCategory.name}>
          {currentCategory.nominees.map(nominee => {
            const isSel = selected === nominee.title;
            return (
              <button
                key={nominee.id}
                role="radio"
                aria-checked={isSel}
                onClick={() => handleSelect(nominee.title)}
                className="group text-left"
              >
                <span
                  className={`relative block aspect-[3/4] overflow-hidden bg-velvet transition-all duration-300 ${
                    isSel
                      ? 'outline outline-2 outline-gold outline-offset-2'
                      : 'outline outline-1 outline-velvet-line group-hover:outline-gold/50'
                  }`}
                >
                  <Cover
                    src={nominee.imageUrl}
                    alt=""
                    className={`transition duration-500 ${isSel ? 'scale-[1.03]' : 'group-hover:scale-[1.03]'} ${selected && !isSel ? 'brightness-[0.55] saturate-50' : ''}`}
                  />
                  {isSel && (
                    <span className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gold text-ink flex items-center justify-center animate-scale-in shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                      <CheckIcon className="w-4 h-4" />
                    </span>
                  )}
                </span>
                <span className={`mt-2.5 block text-sm sm:text-base font-semibold leading-snug line-clamp-2 transition-colors ${isSel ? 'text-gold' : 'text-paper/90 group-hover:text-paper'}`}>
                  {nominee.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navegação fixa no rodapé: sempre ao alcance no celular */}
      <div className="sticky bottom-0 z-20 mt-8 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 bg-ink/95 backdrop-blur-sm border-t border-velvet-line flex items-center gap-3">
        <button
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          className="px-5 sm:px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ash border border-velvet-line hover:border-gold/60 hover:text-paper transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Voltar
        </button>
        <span className="hidden sm:block flex-1 text-center text-sm text-ash truncate">
          {selected ? <>Seu voto: <strong className="text-paper font-semibold">{selected}</strong></> : 'Escolha um indicado'}
        </span>
        <button
          onClick={handleNext}
          disabled={!selected}
          className="flex-1 sm:flex-none px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] bg-gold hover:bg-gold-bright text-ink transition-colors disabled:bg-velvet-line disabled:text-ash disabled:cursor-not-allowed"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
};

export default VotingScreen;
