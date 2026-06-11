import React, { useMemo, useState, useEffect } from 'react';
import { UserVote, UserScore, Winners, Category } from '../types';
import { loadWinners } from '../constants';
import { ApiService } from '../services/api';

interface ResultsScreenProps {
  allVotes: UserVote[];
  categories: Category[];
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ allVotes, categories }) => {
  const [detailedView, setDetailedView] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [winners, setWinners] = useState<Winners>({});
  const [serverRanking, setServerRanking] = useState<{ nickname: string; score: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Ranking vem agregado/calculado pelo servidor (/api/results).
        const [configResponse, winnersData, results] = await Promise.all([
          ApiService.getConfig(),
          loadWinners(),
          ApiService.getResults(),
        ]);
        setShowResults(configResponse.config.showResults);
        setWinners(winnersData);
        setServerRanking(results.ranking || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setShowResults(false);
        setWinners({});
        setServerRanking([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Mapa nickname → voto (para o detalhe expansível e o CSV).
  const votesByNickname = useMemo(() => {
    const map = new Map<string, UserVote>();
    allVotes.forEach(v => map.set(v.nickname, v));
    return map;
  }, [allVotes]);

  const leaderboard = useMemo<UserScore[]>(() => {
    if (!showResults) return [];
    // Caso autoritativo: usa o ranking calculado no servidor (já ordenado).
    if (serverRanking.length > 0) {
      return serverRanking.map(r => {
        const vote = votesByNickname.get(r.nickname);
        return {
          nickname: r.nickname,
          timestamp: vote?.timestamp || '',
          votes: vote?.votes || {},
          score: r.score,
        };
      });
    }
    // Fallback (ainda sem vencedores definidos): mostra participantes com 0 pts.
    return allVotes.map(v => ({ ...v, score: 0 }));
  }, [showResults, serverRanking, votesByNickname, allVotes]);

  const handleDownloadCSV = () => {
    if (leaderboard.length === 0) return;
    const headers = ['Nickname', 'Timestamp', ...categories.map(c => c.name)];
    const rows = leaderboard.map(vote => {
      const rowData = [`"${vote.nickname.replace(/"/g, '""')}"`, `"${vote.timestamp}"`];
      categories.forEach(category => {
        rowData.push(`"${(vote.votes[category.name] || '').replace(/"/g, '""')}"`);
      });
      return rowData.join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tga_goat_votes_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.5 2h-13A2.5 2.5 0 003 4.5V11c0 3.23 1.94 6.03 4.75 7.42c.54.27 1.13.42 1.75.5V22h2h2h2v-3.08c.62-.08 1.21-.23 1.75-.5C20.06 17.03 22 14.23 22 11V4.5A2.5 2.5 0 0019.5 2H18.5M12 14c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3z" />
    </svg>
  );

  const getPodiumClasses = (index: number) => {
    if (index === 0) return 'bg-[#ffd700]/10 border-[#ffd700] shadow-lg shadow-[#ffd700]/20';
    if (index === 1) return 'bg-slate-400/10 border-slate-400';
    if (index === 2) return 'bg-amber-700/10 border-amber-700';
    return 'bg-[#0f0620]/70 border-violet-900/30';
  };

  const getBorderColor = (index: number) => {
    if (index === 0) return 'border-[#ffd700]';
    if (index === 1) return 'border-slate-400';
    if (index === 2) return 'border-amber-700';
    return 'border-violet-900/30';
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-md border border-violet-800/40 rounded-lg text-center">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Carregando...
        </h1>
        <p className="mt-4 text-lg text-slate-300">Verificando configurações de resultados...</p>
      </div>
    );
  }

  if (!showResults) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-md border border-violet-800/40 rounded-lg text-center">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Resultados Ocultos
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          A apuração ainda não começou. Os resultados serão revelados em breve!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-sm border-2 border-violet-600/60 rounded-2xl shadow-2xl shadow-violet-500/20">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest bg-gradient-to-r from-violet-400 to-amber-400 text-transparent bg-clip-text">
          Resultados
        </h1>
        <p className="mt-2 text-lg text-slate-300">Ranking de pontuação dos participantes.</p>
      </div>

      <div className="space-y-4">
        {leaderboard.map((user, index) => (
          <div key={user.nickname}>
            <div
              onClick={() => setDetailedView(detailedView === user.nickname ? null : user.nickname)}
              className={`p-4 sm:p-6 rounded-lg border-2 flex items-center justify-between transition-all duration-300 cursor-pointer ${getPodiumClasses(index)} ${detailedView === user.nickname ? 'rounded-b-none' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold w-8 text-center text-slate-300">{index + 1}</div>
                {index === 0 && <TrophyIcon className="w-8 h-8 text-[#ffd700]" />}
                <div className="text-xl sm:text-2xl font-semibold text-white">{user.nickname}</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-violet-400">
                {user.score} <span className="text-base font-normal text-slate-400">pts</span>
              </div>
            </div>
            {detailedView === user.nickname && (
              <div className={`bg-[#0f0620]/80 p-4 rounded-b-lg border-x-2 border-b-2 ${getBorderColor(index)} animate-fadeIn`}>
                <h4 className="text-lg font-bold mb-3 text-center text-violet-400">Votos de {user.nickname}</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {categories.map(category => {
                    const userVote = user.votes[category.name];
                    const winner = winners[category.name];
                    const isCorrect = userVote === winner;
                    return (
                      <li key={category.id} className="flex justify-between items-center py-1 border-b border-violet-900/30">
                        <span className="text-slate-300">{category.name}:</span>
                        {userVote ? (
                          <span className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {userVote} {isCorrect ? '✔' : '✘'}
                          </span>
                        ) : (
                          <span className="text-slate-500">Não votou</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <p className="text-center text-slate-400 text-lg mt-10">
          Nenhuma votação foi registrada ainda. Vote para ver o ranking!
        </p>
      )}

      {leaderboard.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={handleDownloadCSV}
            className="px-8 py-3 text-base font-bold bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white rounded-md uppercase tracking-widest shadow-lg shadow-violet-500/40 hover:shadow-xl transition-all duration-300"
          >
            Baixar Votos (CSV)
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;
