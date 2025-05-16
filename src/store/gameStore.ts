import { create } from 'zustand';
import { GameStore } from '../types/game';

const useGameStore = create<GameStore>((set, get) => ({
  score: 0,
  highScore: 0,
  lives: 3,
  gameState: 'menu',
  distance: 0,
  coins: 0,
  playerPosition: { x: 0, y: 0, z: 0 },
  playerLane: 0,
  isJumping: false,
  isSliding: false,
  isDead: false,
  segments: [],
  
  startGame: () => set({ 
    gameState: 'playing', 
    score: 0, 
    lives: 3,
    distance: 0,
    coins: 0,
    playerPosition: { x: 0, y: 0, z: 0 },
    playerLane: 0,
    isJumping: false,
    isSliding: false,
    isDead: false,
    segments: [],
  }),
  
  endGame: () => set((state) => {
    const newHighScore = state.score > state.highScore;
    return {
      gameState: 'gameOver',
      highScore: newHighScore ? state.score : state.highScore
    };
  }),
  
  restartGame: () => set({ 
    gameState: 'playing', 
    score: 0, 
    lives: 3,
    distance: 0,
    coins: 0,
    playerPosition: { x: 0, y: 0, z: 0 },
    playerLane: 0,
    isJumping: false,
    isSliding: false,
    isDead: false,
    segments: [],
  }),
  
  incrementScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  incrementCoins: (amount) => set((state) => ({ 
    coins: state.coins + amount 
  })),
  
  decrementLives: (hp: number) => set((state) => {
    if (state.isDead) return {};
    const newLives = state.lives - hp;
    if (newLives <= 0) {
      return {
        lives: 0,
        isDead: true,
        gameState: 'gameOver',
        highScore: state.score > state.highScore ? state.score : state.highScore
      };
    }
    return { lives: newLives, isDead: true };
  }),
  
  updateDistance: (distance) => set({ 
    distance,
    score: Math.floor(distance)
  }),

  updatePlayerState: (newState) => set((state) => ({
    playerPosition: newState.position ?? state.playerPosition,
    playerLane: newState.lane ?? state.playerLane,
    isJumping: newState.isJumping ?? state.isJumping,
    isSliding: newState.isSliding ?? state.isSliding,
    isDead: newState.isDead ?? state.isDead,
  })),

  setSegments: (segments) => set({ segments }),

  collectCoin: (segmentId, coinId) => set((state) => {
    const newSegments = state.segments.map(segment => {
      if (segment.id === segmentId) {
        return {
          ...segment,
          collectibles: segment.collectibles.map(coin => {
            if (coin.id === coinId && !coin.collected) {
              get().incrementCoins(1);
              return { ...coin, collected: true };
            }
            return coin;
          })
        };
      }
      return segment;
    });
    return { segments: newSegments };
  }),
}));

export default useGameStore;