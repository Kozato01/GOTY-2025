import React, { useEffect, useState } from 'react';
import { CATEGORIES, loadWinners } from '../constants';
import { GoldTrophy } from './icons';

const GOTY_CATEGORY = 'Jogo do Ano';

const FALLBACK_COVER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#141312"/></svg>'
);

const WinnersScreen: React.FC = () => {
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWinners().then(data => {
      setWinners(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 text-center" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-velvet-line border-t-gold mx-auto mb-4"></div>
        <p className="text-ash">Abrindo os envelopes…</p>
      </div>
    );
  }

  // Só categorias com vencedor que existe entre os indicados.
  const entries = CATEGORIES.flatMap(category => {
    const winner = category.nominees.find(n => n.title === winners[category.name]);
    return winner ? [{ category, winner }] : [];
  });
  const goty = entries.find(e => e.category.name === GOTY_CATEGORY);
  const rest = entries.filter(e => e !== goty);

  return (
    <div className="w-full">
      <header className="text-center">
        <h1 className="font-display text-4xl sm:text-7xl uppercase text-paper leading-none">Ganhadores</h1>
        <p className="mt-4 text-ash">Os vencedores de cada categoria do The Game Awards 2026</p>
      </header>

      {entries.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center py-12 border-y border-velvet-line">
          <GoldTrophy className="w-16 h-20 opacity-40 grayscale" />
          <p className="mt-6 font-display text-2xl uppercase text-paper">Os envelopes ainda estão lacrados</p>
          <p className="mt-2 text-ash">Os vencedores aparecem aqui depois da cerimônia, em 10 de dezembro.</p>
        </div>
      ) : (
        <>
          {/* Jogo do Ano: a revelação sob o holofote */}
          {goty && (
            <section className="relative overflow-hidden mt-12 px-3 sm:px-6 grid sm:grid-cols-[minmax(0,18rem)_1fr] gap-6 sm:gap-10 items-center py-8 sm:py-10 animate-spotlight bg-[radial-gradient(ellipse_70%_90%_at_35%_0%,rgba(201,162,74,0.16),transparent_70%)]">
              <div className="gold-rule absolute top-0 inset-x-0" aria-hidden />
              <div className="gold-rule absolute bottom-0 inset-x-0" aria-hidden />
              {/* Estatueta ao fundo, à direita, fundida ao palco */}
              <img
                src="/brand/tga-trophy.webp"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 w-[28rem] h-[28rem] object-cover mix-blend-lighten opacity-60 hidden md:block [mask-image:radial-gradient(closest-side,#000_55%,transparent)]"
              />
              <div className="relative mx-auto w-48 sm:w-full aspect-[3/4] overflow-hidden outline outline-1 outline-gold/60 outline-offset-4 shadow-[0_24px_40px_rgba(0,0,0,0.6)]">
                <img
                  src={goty.winner.imageUrl}
                  alt={goty.winner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
                />
              </div>
              <div className="relative text-center sm:text-left">
                <p className="font-display text-5xl sm:text-7xl lg:text-8xl uppercase text-paper leading-[0.9] text-balance">
                  {goty.winner.title}
                </p>
                <p className="mt-5 flex items-center justify-center sm:justify-start gap-3 text-sm text-ash">
                  <img src="/brand/tga-logo.svg" alt="" className="h-6 w-auto shrink-0" />
                  <span>
                    <span className="font-display uppercase text-gold">{goty.category.name}</span> · vale <strong className="font-mono text-gold font-semibold">{goty.category.points} pontos</strong> no bolão
                  </span>
                </p>
              </div>
            </section>
          )}

          {/* Demais categorias: grade uniforme, mesma proporção de capa */}
          {rest.length > 0 && (
            <ul className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
              {rest.map(({ category, winner }) => (
                <li key={category.id} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-velvet outline outline-1 outline-velvet-line group-hover:outline-gold/50 transition-[outline-color]">
                    <img
                      src={winner.imageUrl}
                      alt={winner.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
                    />
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ash leading-snug">{category.name}</p>
                  <p className="mt-1 font-semibold text-paper leading-snug line-clamp-2">{winner.title}</p>
                  <p className="mt-1 font-mono text-xs text-gold">{category.points} pts</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default WinnersScreen;
