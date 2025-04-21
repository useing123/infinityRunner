import { create } from 'zustand';
import { GameStore } from '../types/game';

const useGameStore = create<GameStore>((set) => ({
  score: 0,
  highScore: 0,
  lives: 3,
  gameState: 'menu',
  distance: 0,
  coins: 0,
  
  startGame: () => set({ 
    gameState: 'playing', 
    score: 0, 
    lives: 3,
    distance: 0,
    coins: 0
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
    coins: 0
  }),
  
  incrementScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  incrementCoins: (amount) => set((state) => ({ 
    coins: state.coins + amount 
  })),
  
  decrementLives: () => set((state) => {
    const newLives = state.lives - 1;
    if (newLives <= 0) {
      return {
        lives: 0,
        gameState: 'gameOver',
        highScore: state.score > state.highScore ? state.score : state.highScore
      };
    }
    return { lives: newLives };
  }),
  
  updateDistance: (distance) => set({ 
    distance,
    score: Math.floor(distance) // Basic scoring based on distance
  })
}));

export default useGameStore;