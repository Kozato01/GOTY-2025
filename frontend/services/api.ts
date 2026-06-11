// Serviço para comunicação com a API do backend
import { getIdToken } from './auth';
import { cached, invalidate, CacheKeys } from './cache';

// TTLs do cache em memória (ms)
const TTL_VOLATILE = 8_000;   // votos/resultados (mudam com cada voto)
const TTL_STABLE = 30_000;    // config/vencedores (mudam raramente)

export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? window.location.origin  // Em produção/Docker, usa a mesma URL do site
  : 'http://localhost:5000'; // Em desenvolvimento, usa o servidor Flask separado

// Monta headers incluindo o ID token do Google quando logado.
function authHeaders(json = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = getIdToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export interface ResultsResponse {
  totalVoters: number;
  byCategory: Record<string, Record<string, number>>;
  ranking: { nickname: string; score: number }[];
}

export interface ApiVote {
  nickname: string;
  timestamp: string;
  votes: Record<string, string>;
}

export interface ConfigResponse {
  status: string;
  config: {
    showResults: boolean;
  };
}

export class ApiService {
  // Salva um novo voto na API
  static async saveVote(nickname: string, votes: Record<string, string>): Promise<{ status: string; message?: string }> {
    try {
      const voteData = {
        nickname,
        timestamp: new Date().toISOString(),
        votes
      };

      const response = await fetch(`${API_BASE_URL}/api/vote`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(voteData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          throw new Error(errorData.error || 'Você já votou.');
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Novo voto → invalida caches de votos/resultados.
      invalidate(CacheKeys.votes, CacheKeys.results);
      return result;
    } catch (error) {
      console.error('Erro ao salvar voto:', error);
      throw error;
    }
  }

  // Resultados agregados (calculados no servidor) — cacheado
  static async getResults(): Promise<ResultsResponse> {
    return cached(CacheKeys.results, TTL_VOLATILE, async () => {
      const response = await fetch(`${API_BASE_URL}/api/results`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    });
  }

  // Voto do usuário logado (usuário recorrente) — null se ainda não votou
  static async getMyVote(): Promise<ApiVote | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        headers: authHeaders(false),
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      // Falha de rede/backend não bloqueia o fluxo normal de login.
      console.error('Erro ao consultar voto existente:', error);
      return null;
    }
  }

  // LGPD — apaga o próprio voto
  static async deleteMyVote(): Promise<{ status: string; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    invalidate(CacheKeys.votes, CacheKeys.results);
    return await response.json();
  }

  // Obtém todos os votos da API — cacheado
  static async getAllVotes(): Promise<ApiVote[]> {
    return cached(CacheKeys.votes, TTL_VOLATILE, async () => {
      const response = await fetch(`${API_BASE_URL}/api/votes`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    });
  }

  // Verifica se a API está funcionando
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('API não está disponível:', error);
      return false;
    }
  }

  // Deleta um usuário
  static async deleteUser(nickname: string): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nickname })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      invalidate(CacheKeys.votes, CacheKeys.results);
      return result;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Obtém as configurações atuais — cacheado
  static async getConfig(): Promise<ConfigResponse> {
    return cached(CacheKeys.config, TTL_STABLE, async () => {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    });
  }

  // Toggle resultados (admin)
  static async toggleResults(): Promise<{ status: string; message?: string; showResults?: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/toggle-results`, {
        method: 'POST',
        headers: authHeaders(false),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      invalidate(CacheKeys.config);
      return await response.json();
    } catch (error) {
      console.error('Erro ao alterar configuração de resultados:', error);
      throw error;
    }
  }

  // Obtém ganhadores atuais — cacheado
  static async getWinners(): Promise<Record<string, string>> {
    try {
      return await cached(CacheKeys.winners, TTL_STABLE, async () => {
        const response = await fetch(`${API_BASE_URL}/api/winners`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
      });
    } catch (error) {
      console.error('Erro ao carregar ganhadores:', error);
      return {};
    }
  }

  // Atualiza ganhadores (admin)
  static async setWinners(winners: Record<string, string>): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/winners`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(winners)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Vencedores mudaram → invalida vencedores e ranking de resultados.
      invalidate(CacheKeys.winners, CacheKeys.results);
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar ganhadores:', error);
      throw error;
    }
  }
}