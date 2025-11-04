import React, { useState, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import VotingScreen from './components/VotingScreen';
import ResultsScreen from './components/ResultsScreen';
import CategoriesScreen from './components/CategoriesScreen';
import VotersScreen from './components/VotersScreen';
import Header from './components/Header';
import { UserVote } from './types';
import { ApiService } from './services/api';

export type View = 'intro' | 'voting' | 'results' | 'categories' | 'voters';

const App: React.FC = () => {
  const [view, setView] = useState<View>('intro');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [nicknameError, setNicknameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [allVotes, setAllVotes] = useState<UserVote[]>([]);

  // Carrega os votos da API quando o componente monta
  useEffect(() => {
    loadVotesFromApi();
  }, []);

  const loadVotesFromApi = async () => {
    try {
      setIsLoading(true);
      setApiError('');
      
      // Verifica se a API está funcionando
      const isApiHealthy = await ApiService.healthCheck();
      if (!isApiHealthy) {
        setApiError('Backend não está disponível. Certifique-se de que o servidor Flask está rodando em http://localhost:5000');
        return;
      }

      // Carrega todos os votos
      const votes = await ApiService.getAllVotes();
      setAllVotes(votes);
    } catch (error) {
      console.error('Erro ao carregar votos:', error);
      setApiError(`Erro ao carregar votos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVoting = (nickname: string) => {
    const trimmedNickname = nickname.trim();
    if (trimmedNickname) {
      if (allVotes.some(vote => vote.nickname.toLowerCase() === trimmedNickname.toLowerCase())) {
        setNicknameError('Este nick já foi usado. Por favor, escolha outro ou veja os resultados.');
        return;
      }
      setCurrentUser(trimmedNickname);
      setView('voting');
      setNicknameError('');
    }
  };

  const handleSubmitVotes = async (votes: Record<string, string>) => {
    try {
      setIsLoading(true);
      setApiError('');

      // Salva o voto na API
      await ApiService.saveVote(currentUser, votes);
      
      // Recarrega todos os votos da API para manter sincronizado
      await loadVotesFromApi();
      
      setView('results');
    } catch (error) {
      console.error('Erro ao salvar voto:', error);
      setApiError(`Erro ao salvar voto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (newView: View) => {
    setView(newView);
    setNicknameError('');
    setApiError('');
    
    // Recarrega votos ao navegar para resultados ou voters
    if (newView === 'results' || newView === 'voters') {
      loadVotesFromApi();
    }
  };

  const renderView = () => {
    // Mostra loading se estiver carregando
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      );
    }

    // Mostra erro da API se houver
    if (apiError) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-6 mb-4">
            <h3 className="text-red-400 font-bold mb-2">Erro de Conexão</h3>
            <p className="text-gray-300 mb-4">{apiError}</p>
            <button
              onClick={loadVotesFromApi}
              className="px-6 py-2 bg-sky-400 text-black rounded-md font-bold hover:bg-white transition-all duration-300"
            >
              Tentar Novamente
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            Certifique-se de que o servidor Flask está rodando com: <code className="bg-gray-800 px-2 py-1 rounded">python app.py</code>
          </p>
        </div>
      );
    }

    switch (view) {
      case 'voting':
        return (
          <VotingScreen 
            nickname={currentUser} 
            onSubmit={handleSubmitVotes}
            onBackToHome={() => handleNavigate('intro')}
          />
        );
      case 'results':
        return <ResultsScreen allVotes={allVotes} />;
      case 'categories':
        return <CategoriesScreen />;
      case 'voters':
        return <VotersScreen allVotes={allVotes} />;
      case 'intro':
      default:
        return (
          <IntroScreen 
            onStart={handleStartVoting} 
            error={nicknameError}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-4 sm:p-8 flex flex-col items-center justify-center transition-all duration-500">
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-sky-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse -translate-x-1/2 -translate-y-1/2"></div>
      <div className="relative z-10 w-full max-w-4xl">
        {view !== 'voting' && (
          <Header 
            currentView={view}
            onNavigate={handleNavigate}
            hasVotes={allVotes.length > 0}
          />
        )}
        {renderView()}
      </div>
    </div>
  );
};

export default App;