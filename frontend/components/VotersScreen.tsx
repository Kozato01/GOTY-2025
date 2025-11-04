import React from 'react';
import { UserVote } from '../types';

interface VotersScreenProps {
  allVotes: UserVote[];
}

const VotersScreen: React.FC<VotersScreenProps> = ({ allVotes }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Votantes
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          {allVotes.length > 0
            ? `Total de ${allVotes.length} participante(s) até agora.`
            : 'Ninguém votou ainda. Seja o primeiro!'}
        </p>
      </div>
      
      {allVotes.length > 0 && (
        <div className="space-y-3 max-w-md mx-auto">
          {allVotes
            .slice() // Create a shallow copy to avoid mutating the original array
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Sort by most recent
            .map((vote, index) => (
              <div
                key={index}
                className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-4 flex justify-between items-center"
              >
                <span className="font-bold text-lg text-white">{vote.nickname}</span>
                <span className="text-sm text-gray-400">
                  {new Date(vote.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default VotersScreen;