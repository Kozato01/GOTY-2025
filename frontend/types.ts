export interface Game {
  id: string;
  title: string;
  imageUrl: string;
}

export interface Category {
  id: number;
  name: string;
  points: number;
  nominees: Game[];
}

export interface UserVote {
  nickname: string;
  votes: Record<string, string>;
  timestamp: string;
}

export type Winners = Record<string, string>;

export interface UserScore extends UserVote {
  score: number;
}