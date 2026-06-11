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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      );
    }

    if (apiError) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-4">
            <h3 className="text-red-400 font-bold mb-2">Erro de Conexão</h3>
            <p className="text-slate-300 mb-4">{apiError}</p>
            <button
              onClick={loadVotesFromApi}
              className="px-6 py-2 bg-violet-600 text-white rounded-md font-bold hover:bg-violet-500 transition-all duration-300"
            >
              Tentar Novamente
            </button>
          </div>
          <p className="text-slate-500 text-sm">
            Certifique-se de que o servidor Flask está rodando com: <code className="bg-[#0f0620] px-2 py-1 rounded">python app.py</code>
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
    <div className="min-h-screen bg-transparent text-white p-4 sm:p-8 flex flex-col items-center justify-center transition-all duration-500">
      {/* Glowing corners */}
      <div className="fixed top-0 left-0 w-40 h-40 bg-violet-600 opacity-15 blur-3xl rounded-full animate-pulse"></div>
      <div className="fixed top-0 right-0 w-40 h-40 bg-amber-600 opacity-10 blur-3xl rounded-full animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-40 h-40 bg-amber-600 opacity-10 blur-3xl rounded-full animate-pulse"></div>
      <div className="fixed bottom-0 right-0 w-40 h-40 bg-violet-600 opacity-15 blur-3xl rounded-full animate-pulse"></div>

      {/* Telegram Button */}
      <a
        href="https://t.me/seu_grupo_aqui"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 rounded-full shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
        title="Junte-se ao nosso grupo do Telegram"
      >
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </a>

      <div className="relative z-10 w-full max-w-4xl">
        <Header
          currentView={view}
          onNavigate={handleNavigate}
          hasVotes={allVotes.length > 0}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        {renderView()}

        <footer className="mt-8 text-center">
          <button
            onClick={() => handleNavigate('privacy')}
            className="text-slate-500 hover:text-violet-400 transition-colors duration-200 text-xs font-medium underline-offset-2 hover:underline"
          >
            Política de Privacidade · LGPD
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
