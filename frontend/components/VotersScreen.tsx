import React, { useState } from 'react';
import { UserVote } from '../types';
import { CATEGORIES } from '../constants';

interface VotersScreenProps {
  allVotes: UserVote[];
}

const VotersScreen: React.FC<VotersScreenProps> = ({ allVotes }) => {
  const [expandedVoter, setExpandedVoter] = useState<string | null>(null);

  const handleToggleVoter = (nickname: string) => {
    setExpandedVoter(prev => (prev === nickname ? null : nickname));
  };
  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Votantes
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          {allVotes.length > 0
            ? `Total de ${allVotes.length} participante(s) até agora. Clique para ver os votos.`
            : 'Ninguém votou ainda. Seja o primeiro!'}
        </p>
      </div>
      
      {allVotes.length > 0 && (
        <div className="space-y-3 max-w-md mx-auto">
          {allVotes
            .slice() // Create a shallow copy to avoid mutating the original array
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Sort by most recent
            .map((vote) => (
              <div key={vote.nickname}>
                <div
                  onClick={() => handleToggleVoter(vote.nickname)}
                  className={`bg-gray-800 bg-opacity-50 border border-gray-700 p-4 flex justify-between items-center cursor-pointer transition-all duration-300 hover:border-cyan-400 ${
                    expandedVoter === vote.nickname ? 'rounded-b-none' : 'rounded-lg'
                  }`}
                >
                  <span className="font-bold text-lg text-white">{vote.nickname}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(vote.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                {expandedVoter === vote.nickname && (
                  <div className="bg-gray-900/70 p-4 rounded-b-lg border-x border-b border-gray-700 animate-fadeIn">
                    <h4 className="text-md font-bold mb-3 text-center text-cyan-400">Votos de {vote.nickname}</h4>
                    <ul className="space-y-2 text-sm">
                      {CATEGORIES.map(category => {
                        const userVote = vote.votes[category.name];
                        return (
                          <li key={category.id} className="flex justify-between items-center py-1 border-b border-gray-800">
                            <span className="text-gray-300 w-2/5 truncate">{category.name}:</span>
                            {userVote ? (
                              <span className="font-semibold text-white text-right w-3/5">
                                {userVote}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-right w-3/5">Não votou</span>
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
      )}
    </div>
  );
};

export default VotersScreen;