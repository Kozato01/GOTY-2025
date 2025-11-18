
import { Category, Winners } from './types';
export let SHOW_RESULTS = true;

export const CATEGORIES: Category[] = [
    {
        id: 1,
        name: "Jogo do Ano",
        points: 10,
        options: ["Clair Obscur: Expedition 33", "Death Stranding 2: On the Beach", "Donkey Kong Bananza", "Hades 2", "Hollow Knight: Silksong", "Kingdom Come: Deliverance 2"],
    },
    {
        id: 2,
        name: "Melhor Direção",
        points: 5,
        options: ["Clair Obscur: Expedition 33", "Death Stranding 2: On the Beach", "Ghost of Yotei", "Hades 2", "Split Fiction"],
    },
    {
        id: 3,
        name: "Melhor Narrativa",
        points: 5,
        options: ["Clair Obscur: Expedition 33", "Death Stranding 2: On the Beach", "Ghost of Yotei", "Kingdom Come: Deliverance 2", "Silent Hill f"],
    },
    {
        id: 4,
        name: "Melhor Direção de Arte",
        points: 5,
        options: ["Clair Obscur: Expedition 33", "Death Stranding 2: On the Beach", "Ghost of Yotei", "Hades 2", "Hollow Knight: Silksong"],
    },
    {
        id: 5,
        name: "Melhor Trilha Sonora e Música",
        points: 5,
        options: ["Hollow Knight: Silksong", "Hades 2", "Clair Obscur: Expedition 33", "Ghost of Yotei", "Death Stranding 2: On the Beach"],
    },
    {
        id: 6,
        name: "Melhor Design de Áudio",
        points: 5,
        options: ["Battlefield 6", "Clair Obscur: Expedition 33", "Death Stranding 2: On the Beach", "Ghost of Yotei", "Silent Hill f"],
    },
    {
        id: 7,
        name: "Melhor Performance",
        points: 5,
        options: ["Ben Starr - Clair Obscur: Expedition 33", "Charlie Cox - Clair Obscur: Expedition 33", "Erika Ishii - Ghost of Yotei", "Jennifer English - Clair Obscur: Expedition 33", "Konatsu Kato - Silent Hill f", "Troy Baker - Indiana Jones e o Grande Círculo"],
    },
    {
        id: 8,
        name: "Jogo de Impacto",
        points: 5,
        options: ["Consume Me", "Despelote", "Lost Records: Bloom and Rage", "South of Midnight", "Wanderstop"],
    },
    {
        id: 9,
        name: "Melhor Jogo Contínuo",
        points: 5,
        options: ["Final Fantasy XIV", "Fortnite", "Helldivers 2", "Marvel Rivals", "No Man's Sky"],
    },
    {
        id: 10,
        name: "Melhor Suporte à Comunidade",
        points: 3,
        options: ["Baldur's Gate 3", "Final Fantasy XIV", "Fortnite", "Helldivers 2", "No Man's Sky"],
    },
    {
        id: 11,
        name: "Melhor Jogo Independente",
        points: 3,
        options: ["Absolum", "Ball x Pit", "Blue Prince", "Clair Obscur: Expedition 33", "Hades 2", "Hollow Knight: Silksong"],
    },
    {
        id: 12,
        name: "Melhor Jogo Independente de Estreia",
        points: 3,
        options: ["Blue Prince", "Clair Obscur: Expedition 33", "Despelote", "Dispatch", "Megabonk"],
    },
    {
        id: 13,
        name: "Melhor Jogo Mobile",
        points: 3,
        options: ["Destiny: Rising", "Persona 5: The Phantom X", "Sonic Rumble", "Umamusume: Pretty Derby", "Wuthering Waves"],
    },
    {
        id: 14,
        name: "Melhor Jogo VR/AR",
        points: 3,
        options: ["Alien: Rogue Incursion", "Arken Age", "Ghost Town", "Marvel's Deadpool VR", "The Midnight Walk"],
    },
    {
        id: 15,
        name: "Melhor Jogo de Ação",
        points: 3,
        options: ["Battlefield 6", "Doom: The Dark Ages", "Hades 2", "Ninja Gaiden 4", "Shinobi: Art of Vengeance"],
    },
    {
        id: 16,
        name: "Melhor Jogo de Ação e Aventura",
        points: 3,
        options: ["Death Stranding 2: On the Beach", "Ghost of Yotei", "Indiana Jones e O Grande Círculo", "Hollow Knight: Silksong", "Split Fiction"],
    },
    {
        id: 17,
        name: "Melhor RPG",
        points: 3,
        options: ["Avowed", "Clair Obscur: Expedition 33", "Kingdom Come: Deliverance 2", "The Outer Worlds 2", "Monster Hunter Wilds"],
    },
    {
        id: 18,
        name: "Melhor Jogo de Luta",
        points: 3,
        options: ["2XKO", "Capcom Fighting Collection 2", "Fatal Fury: City of the Wolves", "Mortal Kombat: Legacy Kollection", "Virtua Fighter 5 R.E.V.O. World Stage"],
    },
    {
        id: 19,
        name: "Melhor Jogo Para a Família",
        points: 3,
        options: ["Donkey Kong Bananza", "LEGO Party!", "LEGO Voyagers", "Mario Kart World", "Sonic Racing: CrossWorlds", "Split Fiction"],
    },
    {
        id: 20,
        name: "Melhor Jogo de Simulação/Estratégia",
        points: 2,
        options: ["The Alters", "Final Fantasy Tactics - The Ivalice Chronicles", "Jurassic World Evolution 3", "Civilization VII", "Tempest Rising", "Two Point Museum"],
    },
    {
        id: 21,
        name: "Melhor Jogo de Esportes/Corrida",
        points: 2,
        options: ["EA Sports FC 26", "F1 25", "Mario Kart World", "Rematch", "Sonic Racing: CrossWorlds"],
    },
    {
        id: 22,
        name: "Melhor Jogo Multiplayer",
        points: 2,
        options: ["Arc Raiders", "Battlefield 6", "Elden Ring: Nightreign", "Peak", "Split Fiction"],
    },
    {
        id: 23,
        name: "Melhor Adaptação",
        points: 2,
        options: ["Um Filme Minecraft", "Devil May Cry", "Splinter Cell: Death Watch", "Until Dawn", "The Last of Us"],
    },
    {
        id: 24,
        name: "Inovação em Acessibilidade",
        points: 5,
        options: ["Assassin's Creed Shadows", "Atomfall", "Doom: The Dark Ages", "EA Sports FC 26", "South of Midnight"],
    },
    {
        id: 25,
        name: "Jogo Mais Aguardado",
        points: 2,
        options: ["007 First Light", "GTA 6", "Marvel's Wolverine", "Resident Evil Requiem", "The Witcher 4"],
    },
];



// GANHADORES - Carregados dinamicamente da API
export let WINNERS: Winners = {};

// Função para atualizar os ganhadores
export const updateWinners = (newWinners: Winners) => {
    Object.keys(WINNERS).forEach(key => delete WINNERS[key]);
    Object.assign(WINNERS, newWinners);
};

// Função para obter ganhadores da API
export const loadWinners = async (): Promise<Winners> => {
    try {
        const API_BASE_URL = window.location.origin;
        const response = await fetch(`${API_BASE_URL}/api/winners`);
        if (response.ok) {
            const winners = await response.json(); updateWinners(winners); return winners;
        }
        return {};
    } catch (error) {
        console.error('Erro ao carregar ganhadores:', error);
        return {};
    }
};
