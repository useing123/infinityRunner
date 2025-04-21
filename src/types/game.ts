export type GameState = 'menu' | 'playing' | 'gameOver';

export interface GameStore {
  score: number;
  highScore: number;
  lives: number;
  gameState: GameState;
  distance: number;
  coins: number;
  
  // Player State
  playerPosition: { x: number; y: number; z: number };
  playerLane: number;
  isJumping: boolean;
  isSliding: boolean;
  isDead: boolean;

  // Track Segments
  segments: TrackSegment[];

  // Actions
  startGame: () => void;
  endGame: () => void;
  restartGame: () => void;
  incrementScore: (points: number) => void;
  incrementCoins: (amount: number) => void;
  decrementLives: () => void;
  updateDistance: (distance: number) => void;
  updatePlayerState: (newState: Partial<PlayerState>) => void;
  setSegments: (segments: TrackSegment[]) => void;
  collectCoin: (segmentId: string, coinId: string) => void;
}

export interface PlayerState {
  position: { x: number; y: number; z: number };
  lane: number; // -1: left, 0: center, 1: right
  isJumping: boolean;
  isSliding: boolean;
  isDead: boolean;
}

export interface Obstacle {
  id: string;
  type: 'barrier' | 'gap' | 'overhead';
  position: { x: number; y: number; z: number };
  lane: number; // -1: left, 0: center, 1: right
  scale: { x: number; y: number; z: number };
}

export interface Collectible {
  id: string;
  type: 'coin' | 'powerup';
  position: { x: number; y: number; z: number };
  lane: number; // -1: left, 0: center, 1: right
  collected: boolean;
}

export type TrackSegmentDifficulty = 'easy' | 'medium' | 'hard';

export interface TrackSegment {
  id: string;
  difficulty: TrackSegmentDifficulty;
  position: { x: number; y: number; z: number };
  obstacles: Obstacle[];
  collectibles: Collectible[];
  length: number;
}