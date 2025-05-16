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
  
  restartGame: () => {
    // Get current state values we want to preserve
    const { totalCoins, highScore } = get();
    
    // Save current data before reset
    localStorage.setItem('totalCoins', totalCoins.toString());
    
    // Reset game state completely
    set({ 
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
      totalCoins: totalCoins,
      highScore: highScore
    });
  },
  
  incrementScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  incrementCoins: (amount) => {
    // Use separate set call to ensure state updates properly
    set((state) => ({
      coins: state.coins + amount,
      totalCoins: state.totalCoins + amount
    }));
    
    // Save to localStorage
    const { totalCoins } = get();
    localStorage.setItem('totalCoins', totalCoins.toString());
  },
  
  decrementLives: (amount: number) => set((state) => {
    if (state.isDead) return {};
    const newLives = state.lives - amount;
    if (newLives <= 0) {
      // Game over, check if we have a new high score
      const newHighScore = state.score > state.highScore;
      
      if (newHighScore) {
        localStorage.setItem('highScore', state.score.toString());
      }
      
      // Save total coins
      localStorage.setItem('totalCoins', state.totalCoins.toString());
      
      return {
        lives: 0,
        isDead: true,
        gameState: 'gameOver',
        highScore: newHighScore ? state.score : state.highScore
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
    // First increment the coins counter immediately
    get().incrementCoins(1);
    
    // Then update the segments to mark coin as collected
    set((state) => {
      // Create a deep copy of segments to avoid direct state mutations
      const newSegments = JSON.parse(JSON.stringify(state.segments)) as TrackSegment[];
      
      // Find and update the coin
      let coinFound = false;
      
      for (const segment of newSegments) {
        if (segment.id === segmentId) {
          segment.collectibles = segment.collectibles.map((coin: Collectible) => {
            if (coin.id === coinId) {
              coinFound = true;
              return { ...coin, collected: true };
            }
            return coin;
          });
        }
      }
      
      if (!coinFound) {
        console.error("Coin not found:", coinId, "in segment:", segmentId);
        return {};
      }
      
      // Return the updated segments
      return { segments: newSegments };
    });
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