import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '../constants';

interface VotingScreenProps {
  nickname: string;
  onSubmit: (votes: Record<string, string>) => Promise<void>;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ nickname, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = useMemo(() => CATEGORIES[currentStep], [currentStep]);
  const progress = useMemo(() => ((currentStep + 1) / CATEGORIES.length) * 100, [currentStep]);

  const handleSelect = (title: string) => {
    setVotes(prev => ({ ...prev, [currentCategory.name]: title }));
  };

  const handleNext = () => {
    if (currentStep < CATEGORIES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
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

  const isOptionSelected = (title: string) => votes[currentCategory.name] === title;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-[#100720]/90 backdrop-blur-sm border-2 border-violet-600/60 rounded-2xl shadow-2xl shadow-violet-500/20">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          {nickname}
        </div>
        <div className="text-lg font-semibold text-slate-300">{currentStep + 1} / {CATEGORIES.length}</div>
      </div>

      <div className="w-full bg-[#0f0620] rounded-full h-2.5 mb-8">
        <div
          className="bg-gradient-to-r from-violet-500 to-amber-400 h-2.5 rounded-full"
          style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
        ></div>
      </div>

      <div key={currentCategory.id} className="animate-fadeIn">
        <h3 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">
          {currentCategory.name}
        </h3>
        <p className="text-center text-slate-400 mb-8">({currentCategory.points} pontos)</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentCategory.nominees.map(nominee => (
            <button
              key={nominee.id}
              onClick={() => handleSelect(nominee.title)}
              className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                isOptionSelected(nominee.title)
                  ? 'border-violet-400 shadow-lg shadow-violet-400/50 scale-105'
                  : 'border-violet-900/40 hover:border-amber-400'
              }`}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-[#07030f]">
                <img
                  src={nominee.imageUrl}
                  alt={nominee.title}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isOptionSelected(nominee.title) ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x400/100720/8b5cf6?text=Game';
                  }}
                />
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  isOptionSelected(nominee.title)
                    ? 'bg-violet-500/20'
                    : 'bg-gradient-to-t from-[#07030f]/90 via-[#07030f]/20 to-transparent group-hover:from-[#07030f]/70'
                }`}></div>

                {isOptionSelected(nominee.title) && (
                  <div className="absolute top-2 right-2 bg-violet-500 rounded-full p-1 animate-scale-in">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <div className={`absolute bottom-0 left-0 right-0 p-3 transition-colors duration-300 ${
                isOptionSelected(nominee.title)
                  ? 'bg-violet-700'
                  : 'bg-gradient-to-t from-[#07030f] to-transparent'
              }`}>
                <p className="text-sm font-bold leading-tight line-clamp-2 text-white">
                  {nominee.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-transparent border-2 border-slate-500 text-slate-300 rounded-md uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all duration-300"
          >
            Voltar
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!votes[currentCategory.name] || isSubmitting}
          className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white rounded-md uppercase tracking-widest shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Salvando...
            </>
          ) : (
            currentStep < CATEGORIES.length - 1 ? 'Próxima Categoria' : 'Finalizar Votação'
          )}
        </button>
      </div>
    </div>
  );
};

export default VotingScreen;
