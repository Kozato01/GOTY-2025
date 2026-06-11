import React, { useState } from 'react';
import { UserVote, Category } from '../types';

interface VotersScreenProps {
  allVotes: UserVote[];
  categories: Category[];
}

const VotersScreen: React.FC<VotersScreenProps> = ({ allVotes, categories }) => {
  const [expandedVoter, setExpandedVoter] = useState<string | null>(null);

  const handleToggleVoter = (nickname: string) => {
    setExpandedVoter(prev => (prev === nickname ? null : nickname));
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-md border border-violet-800/40 rounded-2xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Votantes
        </h1>
        <p className="mt-2 text-lg text-slate-300">
          {allVotes.length > 0
            ? `Total de ${allVotes.length} participante(s) até agora. Clique para ver os votos.`
            : 'Ninguém votou ainda. Seja o primeiro!'}
        </p>
      </div>

      {allVotes.length > 0 && (
        <div className="space-y-3 max-w-md mx-auto">
          {allVotes
            .slice()
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((vote) => (
              <div key={vote.nickname}>
                <div
                  onClick={() => handleToggleVoter(vote.nickname)}
                  className={`bg-[#0f0620]/70 border border-violet-800/40 p-4 flex justify-between items-center cursor-pointer transition-all duration-300 hover:border-violet-400 ${
                    expandedVoter === vote.nickname ? 'rounded-t-lg' : 'rounded-lg'
                  }`}
                >
                  <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
                    {vote.nickname}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(vote.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                {expandedVoter === vote.nickname && (
                  <div className="bg-[#100720]/80 p-4 rounded-b-lg border-x border-b border-violet-600/40 animate-fadeIn">
                    <h4 className="text-md font-bold mb-3 text-center text-violet-400">
                      Votos de {vote.nickname}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {categories.map(category => {
                        const userVote = vote.votes[category.name];
                        return (
                          <li key={category.id} className="flex justify-between items-center py-1 border-b border-violet-900/30">
                            <span className="text-slate-300 w-2/5 truncate">{category.name}:</span>
                            {userVote ? (
                              <span className="font-semibold text-white text-right w-3/5">{userVote}</span>
                            ) : (
                              <span className="text-slate-500 text-right w-3/5">Não votou</span>
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
