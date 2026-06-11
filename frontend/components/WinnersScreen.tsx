import React, { useEffect, useState } from 'react';
import { CATEGORIES, loadWinners } from '../constants';

const WinnersScreen: React.FC = () => {
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      setIsLoading(true);
      const winnersData = await loadWinners();
      setWinners(winnersData);
      setIsLoading(false);
    };
    fetchWinners();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-md border border-violet-800/40 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd700] mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando ganhadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-sm border-2 border-[#ffd700]/50 rounded-2xl shadow-2xl shadow-[#ffd700]/10">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest bg-gradient-to-r from-[#ffd700] to-amber-400 text-transparent bg-clip-text text-shadow-gold">
          🏆 Ganhadores 🏆
        </h1>
        <p className="mt-2 text-lg text-slate-300">Os vencedores de cada categoria do GOTY 2026</p>
      </div>

      {Object.keys(winners).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl text-slate-400">Ainda não há ganhadores definidos.</p>
          <p className="text-slate-500 mt-2">Os resultados serão anunciados em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(category => {
            const winnerTitle = winners[category.name];
            if (!winnerTitle) return null;

            const winner = category.nominees.find(n => n.title === winnerTitle);
            if (!winner) return null;

            return (
              <div
                key={category.id}
                className="group relative bg-[#0f0620]/70 p-4 rounded-xl border-2 border-[#ffd700]/30 hover:border-[#ffd700] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#ffd700]/20"
              >
                <div className="absolute top-2 right-2 text-2xl">🏆</div>

                <div className="relative overflow-hidden rounded-lg mb-4 aspect-[3/4] bg-[#07030f]">
                  <img
                    src={winner.imageUrl}
                    alt={winner.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x400/100720/ffd700?text=Vencedor';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider">
                    {category.name}
                  </h3>
                  <p className="text-lg font-black bg-gradient-to-r from-[#ffd700] to-amber-400 bg-clip-text text-transparent leading-tight">
                    {winner.title}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{category.points} pontos</span>
                    <span className="text-[#ffd700]">★ Vencedor</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WinnersScreen;
