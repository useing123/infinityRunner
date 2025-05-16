import { create } from 'zustand';
import { GameStore, Collectible, TrackSegment } from '../types/game';

// Load values from localStorage
const loadHighScore = (): number => {
  const storedHighScore = localStorage.getItem('highScore');
  return storedHighScore ? parseInt(storedHighScore, 10) : 0;
};

const loadTotalCoins = (): number => {
  const storedTotalCoins = localStorage.getItem('totalCoins');
  return storedTotalCoins ? parseInt(storedTotalCoins, 10) : 0;
};

const useGameStore = create<GameStore>((set, get) => ({
  score: 0,
  highScore: loadHighScore(),
  lives: 3,
  gameState: 'menu',
  distance: 0,
  coins: 0,
  totalCoins: loadTotalCoins(),
  playerPosition: { x: 0, y: 0, z: 0 },
  playerLane: 0,
  isJumping: false,
  isSliding: false,
  isDead: false,
  segments: [],
  speed: 15,
  cameraShake: false,
  
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
    speed: 15
  }),
  
  endGame: () => {
    const { score, coins, highScore, totalCoins } = get();
    
    // Update high score if needed
    const newHighScore = score > highScore ? score : highScore;
    
    // Update total coins
    const newTotalCoins = totalCoins + coins;
    
    // Save to localStorage
    localStorage.setItem('highScore', newHighScore.toString());
    localStorage.setItem('totalCoins', newTotalCoins.toString());
    
    set({ 
      gameState: 'gameOver', 
      highScore: newHighScore,
      totalCoins: newTotalCoins
    });
  },
  
  restartGame: () => set((state) => {
    // Save current data before reset
    localStorage.setItem('totalCoins', state.totalCoins.toString());
    
    return { 
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
      totalCoins: state.totalCoins
    };
  }),
  
  incrementScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  incrementCoins: (amount) => set((state) => {
    const newCoins = state.coins + amount;
    const newTotalCoins = state.totalCoins + amount;
    
    // Save to localStorage whenever total coins change
    localStorage.setItem('totalCoins', newTotalCoins.toString());
    
    return { 
      coins: newCoins,
      totalCoins: newTotalCoins
    };
  }),
  
  decrementLives: (amount: number) => set((state) => {
    if (state.isDead) return {};
    const newLives = state.lives - amount;
    if (newLives <= 0) {
      // If out of lives, end the game properly instead of directly changing state
      // This ensures all end-game behaviors are consistent
      setTimeout(() => {
        get().endGame();
      }, 500); // Small delay for death animation
      
      return {
        lives: 0,
        isDead: true
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

  collectCoin: (segmentId, coinId) => {
    const state = get();
    console.log("collectCoin called with:", segmentId, coinId);
    console.log("Current state - coins:", state.coins, "totalCoins:", state.totalCoins);
    
    // Create a deep copy of segments to avoid direct state mutations
    const newSegments = JSON.parse(JSON.stringify(state.segments)) as TrackSegment[];
    
    // Find and update the coin
    let coinFound = false;
    
    for (const segment of newSegments) {
      if (segment.id === segmentId) {
        segment.collectibles = segment.collectibles.map((coin: Collectible) => {
          if (coin.id === coinId && !coin.collected) {
            console.log("Found coin to collect:", coin.id);
            coinFound = true;
            return { ...coin, collected: true };
          }
          return coin;
        });
      }
    }
    
    if (!coinFound) {
      console.error("Coin not found or already collected:", coinId);
      return;
    }
    
    // Do the state updates in order
    console.log("Setting new segments");
    set({ segments: newSegments });
    
    console.log("Incrementing coins");
    set(state => ({ 
      coins: state.coins + 1,
      totalCoins: state.totalCoins + 1 
    }));
    
    // Save to localStorage
    const newTotalCoins = state.totalCoins + 1;
    localStorage.setItem('totalCoins', newTotalCoins.toString());
    console.log("Updated coins:", state.coins + 1, "total:", newTotalCoins);
  },

  returnToMenu: () => set({ gameState: 'menu' }),

  increaseSpeed: () => set((state) => ({ 
    speed: Math.min(state.speed + 0.5, 30) 
  })),

  setCameraShake: (shake: boolean) => set({ cameraShake: shake }),

  resetGame: () => {
    const { highScore, totalCoins } = get();
    set({ 
      gameState: 'menu', 
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
      speed: 15,
      cameraShake: false,
      highScore,
      totalCoins
    });
  }
}));

export default useGameStore;