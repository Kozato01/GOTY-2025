import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '../constants';

interface VotingScreenProps {
  nickname: string;
  onSubmit: (votes: Record<string, string>) => Promise<void>;
  onBackToHome?: () => void;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ nickname, onSubmit, onBackToHome }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = useMemo(() => CATEGORIES[currentStep], [currentStep]);
  const progress = useMemo(() => ((currentStep + 1) / CATEGORIES.length) * 100, [currentStep]);

  const handleSelect = (option: string) => {
    setVotes(prev => ({ ...prev, [currentCategory.name]: option }));
  };

  const handleNext = () => {
    if (currentStep < CATEGORIES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
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

  const isOptionSelected = (option: string) => {
    return votes[currentCategory.name] === option;
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-transparent border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-300"
              title="Voltar ao início"
            >
              🏠 Home
            </button>
          )}
          <h2 className="text-lg font-bold text-sky-400">Votando como: {nickname}</h2>
        </div>
        <div className="text-lg font-semibold">{currentStep + 1} / {CATEGORIES.length}</div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
        <div className="bg-sky-400 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
      </div>

      <div key={currentCategory.id} className="animate-fadeIn">
        <h3 className="text-2xl sm:text-3xl font-black text-center mb-2">
          {currentCategory.name}
        </h3>
        <p className="text-center text-gray-400 mb-8">({currentCategory.points} pontos)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentCategory.options.map(option => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
                isOptionSelected(option)
                  ? 'bg-sky-400 border-sky-400 text-black font-bold'
                  : 'bg-gray-800 bg-opacity-50 border-gray-700 hover:border-sky-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-transparent border-2 border-gray-500 text-gray-300 rounded-md uppercase tracking-widest hover:bg-gray-700 hover:text-white transition-all duration-300"
          >
            Voltar
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!votes[currentCategory.name] || isSubmitting}
          className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-sky-400 text-black rounded-md uppercase tracking-widest hover:bg-white hover:shadow-lg hover:shadow-sky-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
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