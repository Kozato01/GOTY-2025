import React, { useMemo, useState, useEffect } from 'react';
import { UserVote, UserScore } from '../types';
import { CATEGORIES, WINNERS } from '../constants';
import { ApiService } from '../services/api';

interface ResultsScreenProps {
  allVotes: UserVote[];
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ allVotes }) => {
  const [detailedView, setDetailedView] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await ApiService.getConfig();
        setShowResults(response.config.showResults);
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const categoryPointsMap = useMemo(() => {
    const map = new Map<string, number>();
    CATEGORIES.forEach(cat => map.set(cat.name, cat.points));
    return map;
  }, []);

  const leaderboard = useMemo(() => {
    if (!showResults) return [];
    
    const scores: UserScore[] = allVotes.map(userVote => {
      let score = 0;
      for (const categoryName in userVote.votes) {
        if (userVote.votes[categoryName] === WINNERS[categoryName]) {
          score += categoryPointsMap.get(categoryName) || 0;
        }
      }
      return { ...userVote, score };
    });

    return scores.sort((a, b) => b.score - a.score);
  }, [allVotes, categoryPointsMap, showResults]);
  
  const handleDownloadCSV = () => {
    if (leaderboard.length === 0) return;

    const headers = ['Nickname', 'Timestamp', ...CATEGORIES.map(c => c.name)];
    
    const rows = leaderboard.map(vote => {
        const rowData = [
            `"${vote.nickname.replace(/"/g, '""')}"`,
            `"${vote.timestamp}"`
        ];
        CATEGORIES.forEach(category => {
            const userVote = vote.votes[category.name] || '';
            rowData.push(`"${userVote.replace(/"/g, '""')}"`);
        });
        return rowData.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tga_goat_votes_2025.csv');
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
    if (index === 0) return 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/30';
    if (index === 1) return 'bg-gray-400/20 border-gray-400';
    if (index === 2) return 'bg-yellow-800/20 border-yellow-800';
    return 'bg-gray-800/50 border-gray-700';
  }
  
  const getBorderColor = (index: number) => {
    if (index === 0) return 'border-yellow-500';
    if (index === 1) return 'border-gray-400';
    if (index === 2) return 'border-yellow-800';
    return 'border-gray-700';
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg text-center">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Carregando...
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Verificando configurações de resultados...
        </p>
      </div>
    );
  }

  if (!showResults) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg text-center">
        {/* Para exibir os resultados, altere a constante SHOW_RESULTS no arquivo 'constants.ts' para true. */}
        {/* #XPTO- ALTERAÇÃO PARA TRUE */}
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Resultados Ocultos
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          A apuração ainda não começou. Os resultados serão revelados em breve!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Resultados
        </h1>
        <p className="mt-2 text-lg text-gray-300">Ranking de pontuação dos participantes.</p>
      </div>

      <div className="space-y-4">
        {leaderboard.map((user, index) => (
          <div key={user.nickname}>
            <div 
              onClick={() => setDetailedView(detailedView === user.nickname ? null : user.nickname)}
              className={`p-4 sm:p-6 rounded-lg border-2 flex items-center justify-between transition-all duration-300 cursor-pointer ${getPodiumClasses(index)} ${detailedView === user.nickname ? 'rounded-b-none' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold w-8 text-center">{index + 1}</div>
                {index === 0 && <TrophyIcon className="w-8 h-8 text-yellow-400" />}
                <div className="text-xl sm:text-2xl font-semibold">{user.nickname}</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-400">{user.score} <span className="text-base font-normal text-gray-400">pts</span></div>
            </div>
            {detailedView === user.nickname && (
               <div className={`bg-gray-900/70 p-4 rounded-b-lg border-x-2 border-b-2 ${getBorderColor(index)} animate-fadeIn`}>
                <h4 className="text-lg font-bold mb-3 text-center text-sky-400">Votos de {user.nickname}</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {CATEGORIES.map(category => {
                    const userVote = user.votes[category.name];
                    const winner = WINNERS[category.name];
                    const isCorrect = userVote === winner;
                    return (
                      <li key={category.id} className="flex justify-between items-center py-1 border-b border-gray-800">
                        <span className="text-gray-300">{category.name}:</span>
                        {userVote ? (
                          <span className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {userVote} {isCorrect ? '✔' : '✘'}
                          </span>
                        ) : (
                          <span className="text-gray-500">Não votou</span>
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
         <p className="text-center text-gray-400 text-lg mt-10">Nenhuma votação foi registrada ainda. Vote para ver o ranking!</p>
      )}

      {leaderboard.length > 0 && (
        <div className="mt-12 text-center">
            <button
                onClick={handleDownloadCSV}
                className="px-8 py-3 text-base font-bold bg-green-600 text-white rounded-md uppercase tracking-widest hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/50 transition-all duration-300"
            >
                Baixar Votos (CSV)
            </button>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;