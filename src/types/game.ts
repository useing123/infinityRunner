export type GameState = 'menu' | 'playing' | 'gameOver' | 'shop';

export interface GameStore {
  score: number;
  highScore: number;
  lives: number;
  gameState: GameState;
  distance: number;
  coins: number;         // Current game coins
  totalCoins: number;    // Persistent total coins
  shopItems: ShopItem[]; // Available items in the shop
  ownedItems: string[];  // IDs of owned items
  speed: number;         // Game speed
  cameraShake: boolean;  // Camera shake effect
  
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
  decrementLives: (amount: number) => void;
  updateDistance: (distance: number) => void;
  updatePlayerState: (newState: Partial<PlayerState>) => void;
  setSegments: (segments: TrackSegment[]) => void;
  collectCoin: (segmentId: string, coinId: string) => void;
  
  // Speed and Effects
  increaseSpeed: () => void;
  setCameraShake: (shake: boolean) => void;
  resetGame: () => void;
  
  // Shop Actions
  openShop: () => void;
  returnToMenu: () => void;
  purchaseItem: (itemId: string) => boolean;
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
  type: 'barrier' | 'gap'; // Simplified to only two obstacle types
  position: { x: number; y: number; z: number };
  lane: number; // -1: left, 0: center, 1: right
  scale: { x: number; y: number; z: number };
}

export interface Collectible {
  id: string;
  type: 'coin'; // Simplified to only have coins
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

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'powerup' | 'skin' | 'ability';
  owned: boolean;
  imageUrl?: string;
  effect?: string;
}