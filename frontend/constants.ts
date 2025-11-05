
import { Category, Winners } from './types';
export let SHOW_RESULTS = true;

export const CATEGORIES: Category[] = [
    {
        id: 1,
        name: "Jogo do Ano",
        points: 10,
        options: ["Elden Ring Shadow Of The Erdtree","Black Myth: Wukong","Astro Bot","Balatro","Final Fantasy 7 Rebirth","Metaphor: ReFantazio",
        ],
    },
    {
        id: 2,
        name: "Melhor Direção de Jogo",
        points: 5,
        options: ["Astro Bot","Balatro","Elden Ring Shadow Of The Erdtree","Final Fantasy 7 Rebirth","Black Myth: Wukong","Metaphor: ReFantazio",
        ],
    },
    {
        id: 3,
        name: "Melhor Narrativa",
        points: 5,
        options: ["Final Fantasy 7 Rebirth","Like a Dragon Infinite Wealth","Metaphor ReFantazio","Senua’s Saga Hellblade 2","Silent Hill 2",
        ],
    },
    {
        id: 4,
        name: "Melhor Direção de Arte",
        points: 5,
        options: ["Astro Bot","Black Myth Wukong","Elden Ring Shadow of the Erdtree","Metaphor ReFantazio","Neva",
        ],
    },
    {
        id: 5,
        name: "Melhor Trilha Sonora",
        points: 5,
        options: [ "The Last of Us Part II", "Final Fantasy 7 Rebirth", "Ghost of Tsushima", "Hades", "Ori and the Will of the Wisps" ],
    },
    {
        id: 6,
        name: "Melhor Design de Áudio",
        points: 5,
        options: [ "Senua’s Saga Hellblade 2", "Doom Eternal", "Half-Life: Alyx", "Ghost of Tsushima", "Resident Evil 3" ],
    },
    {
        id: 7,
        name: "Melhor Atuação",
        points: 5,
        options: [ "Melina Juergens (Senua, de Hellblade 2)", "Ashley Johnson (Ellie)", "Laura Bailey (Abby)", "Daisuke Tsuji (Jin Sakai)", "Logan Cunningham (Hades)" ],
    },
    {
        id: 8,
        name: "Inovação em Acessibilidade",
        points: 5,
        options: [ "Prince of Persia The Lost Crown", "Grounded", "Hyperdot", "The Last of Us Part II", "Watch Dogs: Legion" ],
    },
    {
        id: 9,
        name: "Jogos com Maior Impacto Social",
        points: 5,
        options: [ "Neva", "If Found...", "Kentucky Route Zero: TV Edition", "Spiritfarer", "Tell Me Why" ],
    },
    {
        id: 10,
        name: "Melhor Jogo Contínuo",
        points: 5,
        options: [ "Helldivers 2", "Apex Legends", "Destiny 2", "Call of Duty: Warzone", "Fortnite", "No Man's Sky" ],
    },
    {
        id: 11,
        name: "Melhor Suporte à Comunidade",
        points: 3,
        options: [ "Baldur’s Gate 3", "Apex Legends", "Destiny 2", "Fall Guys: Ultimate Knockout", "Fortnite", "No Man's Sky" ],
    },
    {
        id: 12,
        name: "Melhor Jogo Independente",
        points: 3,
        options: [ "Balatro", "Carrion", "Fall Guys: Ultimate Knockout", "Hades", "Spelunky 2" ],
    },
    {
        id: 13,
        name: "Melhor Estreia de um Estúdio Indie",
        points: 3,
        options: [ "Balatro", "Carrion (Phobia Game Studio)", "Mortal Shell (Cold Symmetry)", "Raji: An Ancient Epic (Nodding Heads Games)", "Phasmophobia (Kinetic Games)" ],
    },
    {
        id: 14,
        name: "Melhor Jogo Mobile",
        points: 3,
        options: [ "Balatro", "Among Us", "Call of Duty: Mobile", "Genshin Impact", "Legends of Runeterra" ],
    },
    {
        id: 15,
        name: "Melhor VR / AR",
        points: 3,
        options: [ "Batman Arkham Shadow", "Dreams", "Half-Life: Alyx", "Marvel's Iron Man VR", "Star Wars: Squadrons" ],
    },
    {
        id: 16,
        name: "Melhor Jogo de Ação",
        points: 3,
        options: [ "Black Myth Wukong", "Doom Eternal", "Hades", "Half-Life: Alyx", "Nioh 2", "Streets of Rage 4" ],
    },
    {
        id: 17,
        name: "Melhor Jogo de Ação / Aventura",
        points: 3,
        options: [ "Astro Bot", "Assassin's Creed Valhalla", "Ghost of Tsushima", "Marvel's Spider-Man: Miles Morales", "Ori and the Will of the Wisps", "Star Wars Jedi: Fallen Order" ],
    },
    {
        id: 18,
        name: "Melhor RPG",
        points: 3,
        options: [ "Metaphor ReFantazio", "Final Fantasy 7 Rebirth", "Genshin Impact", "Persona 5 Royal", "Wasteland 3", "Yakuza: Like a Dragon" ],
    },
    {
        id: 19,
        name: "Melhor Jogo de Luta",
        points: 3,
        options: [ "Tekken 8", "Granblue Fantasy: Versus", "Mortal Kombat 11 Ultimate", "Street Fighter V: Champion Edition", "One-Punch Man: A Hero Nobody Knows" ],
    },
    {
        id: 20,
        name: "Melhor Jogo para Família",
        points: 3,
        options: [ "Astro Bot", "Animal Crossing: New Horizons", "Crash Bandicoot 4: It's About Time", "Fall Guys: Ultimate Knockout", "Mario Kart Live: Home Circuit", "Minecraft Dungeons" ],
    },
    {
        id: 21,
        name: "Melhor Jogo de Simulação / Estratégia",
        points: 2,
        options: [ "Frostpunk 2", "Crusader Kings III", "Desperados III", "Gears Tactics", "Microsoft Flight Simulator", "XCOM: Chimera Squad" ],
    },
    {
        id: 22,
        name: "Melhor Jogo de Esporte / Corrida",
        points: 2,
        options: [ "EA Sports FC 25", "DiRT 5", "F1 2020", "FIFA 21", "NBA 2K21", "Tony Hawk's Pro Skater 1 + 2" ],
    },
    {
        id: 23,
        name: "Melhor Jogo Multiplayer",
        points: 2,
        options: [ "Helldivers 2", "Among Us", "Animal Crossing: New Horizons", "Call of Duty: Warzone", "Fall Guys: Ultimate Knockout", "Valorant" ],
    },
    {
        id: 24,
        name: "Melhor Adaptação",
        points: 2,
        options: [ "Fallout", "The Last of Us (Série)", "Arcane", "Cyberpunk: Edgerunners", "The Witcher (Série)" ],
    },
    {
        id: 25,
        name: "Jogo Mais Aguardado de 2025",
        points: 2,
        options: [ "GTA 6", "God of War Ragnarök", "Hogwarts Legacy", "The Legend of Zelda: Tears of the Kingdom", "Elden Ring" ],
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
        if (response.ok) {const winners = await response.json();updateWinners(winners);return winners;
        }
        return {};
    } catch (error) {
        console.error('Erro ao carregar ganhadores:', error);
        return {};
    }
};