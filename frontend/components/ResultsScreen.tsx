import React, { useMemo, useState, useEffect } from 'react';
import { UserVote, UserScore, Winners, Category } from '../types';
import { loadWinners } from '../constants';
import { ApiService } from '../services/api';
import { TrophyIcon, CheckIcon, XIcon } from './icons';

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

  const getPodiumClasses = (index: number) => {
    if (index === 0) return 'bg-gold/10 border-gold shadow-lg shadow-gold/20';
    if (index === 1) return 'bg-paper/5 border-paper/40';
    if (index === 2) return 'bg-burgundy/10 border-burgundy/60';
    return 'bg-ink/70 border-velvet-line';
  };

  const getBorderColor = (index: number) => {
    if (index === 0) return 'border-gold';
    if (index === 1) return 'border-paper/40';
    if (index === 2) return 'border-burgundy/60';
    return 'border-velvet-line';
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fadeIn p-5 sm:p-8 bg-velvet/95 border border-velvet-line rounded-lg text-center">
        <h1 className="font-display text-3xl sm:text-6xl uppercase tracking-wide text-shadow-gold text-paper">
          Carregando...
        </h1>
        <p className="mt-4 text-lg text-ash">Verificando configurações de resultados...</p>
      </div>
    );
  }

  if (!showResults) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fadeIn p-5 sm:p-8 bg-velvet/95 border border-velvet-line rounded-lg text-center">
        <h1 className="font-display text-3xl sm:text-6xl uppercase tracking-wide text-shadow-gold text-paper">
          Resultados Ocultos
        </h1>
        <p className="mt-4 text-lg text-ash">
          A apuração ainda não começou. Os resultados serão revelados em breve!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-4 sm:p-8 bg-velvet/95 border border-velvet-line rounded-lg shadow-2xl shadow-black/40">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-6xl uppercase tracking-wide text-paper">
          Resulta<span className="text-gold">dos</span>
        </h1>
        <p className="mt-2 text-lg text-ash">Ranking de pontuação dos participantes.</p>
      </div>

      <div className="space-y-4">
        {leaderboard.map((user, index) => (
          <div key={user.nickname}>
            <div
              onClick={() => setDetailedView(detailedView === user.nickname ? null : user.nickname)}
              className={`p-3 sm:p-6 rounded-lg border-2 flex items-center justify-between gap-2 transition-all duration-300 cursor-pointer ${getPodiumClasses(index)} ${detailedView === user.nickname ? 'rounded-b-none' : ''}`}
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="font-mono text-lg sm:text-2xl font-bold w-6 sm:w-8 text-center text-ash shrink-0">{index + 1}</div>
                {index === 0 && <TrophyIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gold shrink-0" />}
                <div className="text-base sm:text-2xl font-semibold text-paper truncate min-w-0">{user.nickname}</div>
              </div>
              <div className="font-display text-xl sm:text-3xl text-gold shrink-0">
                {user.score} <span className="font-sans text-sm sm:text-base font-normal text-ash">pts</span>
              </div>
            </div>
            {detailedView === user.nickname && (
              <div className={`bg-ink/80 p-4 rounded-b-lg border-x-2 border-b-2 ${getBorderColor(index)} animate-fadeIn`}>
                <h4 className="text-lg font-bold mb-3 text-center text-gold">Votos de {user.nickname}</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {categories.map(category => {
                    const userVote = user.votes[category.name];
                    const winner = winners[category.name];
                    const isCorrect = userVote === winner;
                    return (
                      <li key={category.id} className="flex justify-between items-center gap-2 py-1 border-b border-velvet-line min-w-0">
                        <span className="text-ash shrink-0">{category.name}:</span>
                        {userVote ? (
                          <span className={`font-semibold truncate min-w-0 text-right inline-flex items-center gap-1 justify-end ${isCorrect ? 'text-emerald-400' : 'text-burgundy-bright'}`}>
                            <span className="truncate">{userVote}</span>
                            {isCorrect
                              ? <CheckIcon className="w-3.5 h-3.5 shrink-0" />
                              : <XIcon className="w-3.5 h-3.5 shrink-0" />}
                          </span>
                        ) : (
                          <span className="text-ash/60">Não votou</span>
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
        <p className="text-center text-ash text-lg mt-10">
          Nenhuma votação foi registrada ainda. Vote para ver o ranking!
        </p>
      )}

      {leaderboard.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={handleDownloadCSV}
            className="px-8 py-3 text-base font-bold bg-gold hover:bg-gold-bright text-ink rounded-md uppercase tracking-widest shadow-lg shadow-black/30 transition-all duration-300"
          >
            Baixar Votos (CSV)
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;
