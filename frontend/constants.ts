import { Category, Winners } from './types';
import { cached, CacheKeys } from './services/cache';
import { API_BASE_URL } from './services/api';

export let SHOW_RESULTS = true;

// ============================================
// 🎮 PARA EDITAR CATEGORIAS E JOGOS:
// Edite o arquivo: backend/data/categories.json
// ============================================

// Categorias carregadas do backend
export let CATEGORIES: Category[] = [];

// Função para carregar categorias do backend
export const loadCategories = async (): Promise<Category[]> => {
    try {
        // Categorias são praticamente estáticas na sessão → TTL longo (1h).
        const data = await cached(CacheKeys.categories, 3_600_000, async () => {
            const response = await fetch(`${API_BASE_URL}/api/categories`);
            if (!response.ok) throw new Error('Erro ao carregar categorias');
            return response.json();
        });
        CATEGORIES = data.categories;
        return CATEGORIES;
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        return [];
    }
};

// GANHADORES - Carregados dinamicamente da API
export let WINNERS: Winners = {};

// Ganhadores de exemplo (mock data para testes)
const MOCK_WINNERS: Winners = {
    "Mais Aguardado": "Hades 2",
    "Melhor Performance": "Erika Ishii - Ghost of Yotei",
    "Melhor Jogo Indie de Estreia": "Wanderstop",
    "Melhor Jogo em Andamento": "Final Fantasy XIV",
    "Melhor Jogo Indie": "Blue Prince",
    "Melhor Jogo Mobile": "Wuthering Waves",
    "Melhor Jogo VR/AR": "Alien: Rogue Incursion",
    "Melhor Jogo de Ação": "Doom: The Dark Ages",
    "Melhor Jogo de Ação/Aventura": "Indiana Jones e O Grande Círculo",
    "Melhor Jogo de RPG": "Avowed",
    "Melhor Jogo de Ação/RPG": "Monster Hunter Wilds",
    "Melhor Jogo de Luta": "Fatal Fury: City of the Wolves",
    "Jogo do Ano": "Hades 2",
};

// Função para atualizar os ganhadores
export const updateWinners = (newWinners: Winners) => {
    Object.keys(WINNERS).forEach(key => delete WINNERS[key]);
    Object.assign(WINNERS, newWinners);
};

// Função para obter ganhadores da API
export const loadWinners = async (): Promise<Winners> => {
    try {
        // Mesma chave de cache do ApiService.getWinners → compartilham a entrada.
        const winners = await cached(CacheKeys.winners, 30_000, async () => {
            const response = await fetch(`${API_BASE_URL}/api/winners`);
            if (!response.ok) throw new Error('Erro ao carregar ganhadores');
            return response.json();
        });
        updateWinners(winners);
        return winners;
    } catch (error) {
        console.error('Erro ao carregar ganhadores, usando dados de exemplo:', error);
        // Em caso de erro, usa os dados mockados
        updateWinners(MOCK_WINNERS);
        return MOCK_WINNERS;
    }
};
