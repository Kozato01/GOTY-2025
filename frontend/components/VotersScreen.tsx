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
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-4 sm:p-8 bg-velvet/95 border border-velvet-line rounded-lg shadow-2xl shadow-black/40">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-6xl uppercase tracking-wide text-paper">
          Vot<span className="text-gold">antes</span>
        </h1>
        <p className="mt-2 text-lg text-ash">
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
                  className={`bg-ink/70 border border-velvet-line p-3 sm:p-4 flex justify-between items-center gap-2 cursor-pointer transition-all duration-300 hover:border-gold/60 ${
                    expandedVoter === vote.nickname ? 'rounded-t-lg' : 'rounded-lg'
                  }`}
                >
                  <span className="font-bold text-base sm:text-lg text-gold truncate min-w-0">
                    {vote.nickname}
                  </span>
                  <span className="text-xs sm:text-sm text-ash shrink-0">
                    {new Date(vote.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                {expandedVoter === vote.nickname && (
                  <div className="bg-velvet/90 p-4 rounded-b-lg border-x border-b border-velvet-line animate-fadeIn">
                    <h4 className="text-md font-bold mb-3 text-center text-gold">
                      Votos de {vote.nickname}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {categories.map(category => {
                        const userVote = vote.votes[category.name];
                        return (
                          <li key={category.id} className="flex justify-between items-center py-1 border-b border-velvet-line">
                            <span className="text-ash w-2/5 truncate">{category.name}:</span>
                            {userVote ? (
                              <span className="font-semibold text-paper text-right w-3/5">{userVote}</span>
                            ) : (
                              <span className="text-ash/60 text-right w-3/5">Não votou</span>
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
