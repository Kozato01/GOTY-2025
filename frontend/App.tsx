import React, { useState, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import VotingScreen from './components/VotingScreen';
import ResultsScreen from './components/ResultsScreen';
import CategoriesScreen from './components/CategoriesScreen';
import VotersScreen from './components/VotersScreen';
import WinnersScreen from './components/WinnersScreen';
import PrivacyScreen from './components/PrivacyScreen';
import Header from './components/Header';
import { UserVote, Category } from './types';
import { ApiService } from './services/api';
import { signOut } from './services/auth';
import { loadCategories } from './constants';

export type View = 'intro' | 'voting' | 'results' | 'categories' | 'voters' | 'winners' | 'privacy';

const App: React.FC = () => {
  const [view, setView] = useState<View>('intro');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [nicknameError, setNicknameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [allVotes, setAllVotes] = useState<UserVote[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories().then(cats => setCategories(cats));
    loadVotesFromApi();
  }, []);

  const loadVotesFromApi = async () => {
    try {
      setIsLoading(true);
      setApiError('');
      const isApiHealthy = await ApiService.healthCheck();
      if (!isApiHealthy) {
        setApiError('Backend não está disponível. Verifique se o servidor está rodando.');
        return;
      }
      const votes = await ApiService.getAllVotes();
      setAllVotes(votes);
    } catch (error) {
      console.error('Erro ao carregar votos:', error);
      setApiError(`Erro ao carregar votos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Identidade real = login Google (validado no backend). O nickname é só exibição;
  // a unicidade do voto é garantida pelo backend (1 voto por conta Google).
  const handleStartVoting = (nickname: string) => {
    const trimmedNickname = nickname.trim();
    if (trimmedNickname) {
      setCurrentUser(trimmedNickname);
      setView('voting');
      setNicknameError('');
    }
  };

  const handleSubmitVotes = async (votes: Record<string, string>) => {
    try {
      setIsLoading(true);
      setApiError('');
      await ApiService.saveVote(currentUser, votes);
      await loadVotesFromApi();
      setView('results');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao salvar voto:', error);
      // 409: esta conta Google já votou → leva direto aos resultados.
      if (/já votou/i.test(msg)) {
        await loadVotesFromApi();
        setApiError('');
        setView('results');
        return;
      }
      setApiError(`Erro ao salvar voto: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Usuário recorrente (já votou): reaproveita o nickname salvo e vai
  // direto aos resultados, sem redigitar nickname/consentimento.
  const handleReturningUser = async (nickname: string) => {
    setCurrentUser(nickname);
    setNicknameError('');
    await loadVotesFromApi();
    setView('results');
  };

  const handleLogout = () => {
    signOut();
    setCurrentUser('');
    setNicknameError('');
    setApiError('');
    setView('intro');
  };

  const handleNavigate = (newView: View) => {
    setView(newView);
    setNicknameError('');
    setApiError('');
    if (newView === 'results' || newView === 'voters') {
      loadVotesFromApi();
    }
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-ash">Carregando...</p>
        </div>
      );
    }

    if (apiError) {
      return (
        <div className="text-center py-12">
          <div className="bg-burgundy/10 border border-burgundy/60 rounded-lg p-6 mb-4">
            <h3 className="text-burgundy-bright font-bold mb-2">Erro de Conexão</h3>
            <p className="text-paper/80 mb-4">{apiError}</p>
            <button
              onClick={loadVotesFromApi}
              className="px-6 py-2 bg-gold text-ink rounded-md font-bold hover:bg-gold-bright transition-all duration-300"
            >
              Tentar Novamente
            </button>
          </div>
          <p className="text-ash text-sm">
            Certifique-se de que o servidor Flask está rodando com: <code className="bg-velvet px-2 py-1 rounded">python app.py</code>
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
          />
        );
      case 'results':
        return <ResultsScreen allVotes={allVotes} categories={categories} />;
      case 'categories':
        return <CategoriesScreen />;
      case 'voters':
        return <VotersScreen allVotes={allVotes} categories={categories} />;
      case 'winners':
        return <WinnersScreen />;
      case 'privacy':
        return <PrivacyScreen onBack={() => handleNavigate('intro')} />;
      case 'intro':
      default:
        return (
          <IntroScreen
            onStart={handleStartVoting}
            onReturningUser={handleReturningUser}
            initialNickname={currentUser}
            error={nicknameError}
            allVotes={allVotes}
            categories={categories}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-paper px-4 sm:px-8 pb-8 flex flex-col items-center transition-all duration-500">
      <div className="relative z-10 w-full max-w-5xl">
        <Header
          currentView={view}
          onNavigate={handleNavigate}
          hasVotes={allVotes.length > 0}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        {/* key={view} remonta a tela ao navegar → animação de entrada consistente */}
        <div key={view} className="animate-fadeIn">
          {renderView()}
        </div>

        <footer className="mt-8 text-center">
          <button
            onClick={() => handleNavigate('privacy')}
            className="text-ash hover:text-gold transition-colors duration-200 text-xs font-medium underline-offset-2 hover:underline"
          >
            Política de Privacidade · LGPD
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
