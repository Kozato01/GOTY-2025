// Serviço para comunicação com a API do backend
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? window.location.origin  // Em produção, usa a mesma URL do site
  : 'http://localhost:5000'; // Em desenvolvimento, usa o servidor Flask separado

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao salvar voto:', error);
      throw error;
    }
  }

  // Obtém todos os votos da API
  static async getAllVotes(): Promise<ApiVote[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/votes`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar votos:', error);
      throw error;
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Obtém as configurações atuais
  static async getConfig(): Promise<ConfigResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      throw error;
    }
  }

  // Toggle resultados
  static async toggleResults(): Promise<{ status: string; message?: string; showResults?: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/toggle-results`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao alterar configuração de resultados:', error);
      throw error;
    }
  }

  // Obtém ganhadores atuais
  static async getWinners(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/winners`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar ganhadores:', error);
      return {};
    }
  }

  // Atualiza ganhadores (webhook)
  static async setWinners(winners: Record<string, string>): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/winners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(winners)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar ganhadores:', error);
      throw error;
    }
  }
}