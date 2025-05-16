import { create } from 'zustand';
import { GameStore, Collectible, TrackSegment, ShopItem } from '../types/game';

// Load values from localStorage
const loadHighScore = (): number => {
  const storedHighScore = localStorage.getItem('highScore');
  return storedHighScore ? parseInt(storedHighScore, 10) : 0;
};

const loadTotalCoins = (): number => {
  const storedTotalCoins = localStorage.getItem('totalCoins');
  return storedTotalCoins ? parseInt(storedTotalCoins, 10) : 0;
};

const loadOwnedItems = (): string[] => {
  const storedOwnedItems = localStorage.getItem('ownedItems');
  return storedOwnedItems ? JSON.parse(storedOwnedItems) : [];
};

// Default shop items
const defaultShopItems: ShopItem[] = [
  {
    id: 'extralife',
    name: 'Extra Life',
    description: 'Start with an extra life',
    price: 1000,
    type: 'powerup',
    owned: false,
    effect: 'Adds 1 extra life at the start of each run'
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'One-time protection from obstacles',
    price: 20000,
    type: 'powerup',
    owned: false,
    effect: 'Protects from one collision with an obstacle'
  },
  {
    id: 'magnet',
    name: 'Coin Magnet',
    description: 'Attracts coins from nearby lanes',
    price: 30000,
    type: 'ability',
    owned: false,
    effect: 'Collects coins from all lanes'
  },
  {
    id: 'doublejump',
    name: 'Double Jump',
    description: 'Allows jumping twice in a row',
    price: 50000,
    type: 'ability',
    owned: false,
    effect: 'Enables jumping again while in the air'
  },
  {
    id: 'blueskin',
    name: 'Blue Runner',
    description: 'Cool blue character skin',
    price: 250000,
    type: 'skin',
    owned: false,
  },
  {
    id: 'redskin',
    name: 'Red Runner',
    description: 'Flashy red character skin',
    price: 25000,
    type: 'skin',
    owned: false,
  },
];

// Update owned status based on localStorage
const getInitialShopItems = (): ShopItem[] => {
  const ownedItems = loadOwnedItems();
  return defaultShopItems.map(item => ({
    ...item,
    owned: ownedItems.includes(item.id)
  }));
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
  shopItems: getInitialShopItems(),
  ownedItems: loadOwnedItems(),
  
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
  },
  
  // Shop Actions
  openShop: () => set({ gameState: 'shop' }),
  
  purchaseItem: (itemId: string) => {
    const { totalCoins, shopItems, ownedItems } = get();
    
    // Find the item to purchase
    const item = shopItems.find(item => item.id === itemId);
    
    if (!item) {
      console.error("Item not found:", itemId);
      return false;
    }
    
    // Check if already owned
    if (item.owned) {
      console.log("Item already owned:", itemId);
      return false;
    }
    
    // Check if enough coins
    if (totalCoins < item.price) {
      console.log("Not enough coins to purchase:", itemId);
      return false;
    }
    
    // Purchase the item
    const newTotalCoins = totalCoins - item.price;
    const newOwnedItems = [...ownedItems, itemId];
    const newShopItems = shopItems.map(shopItem => 
      shopItem.id === itemId ? { ...shopItem, owned: true } : shopItem
    );
    
    // Save to localStorage
    localStorage.setItem('totalCoins', newTotalCoins.toString());
    localStorage.setItem('ownedItems', JSON.stringify(newOwnedItems));
    
    // Update state
    set({ 
      totalCoins: newTotalCoins,
      ownedItems: newOwnedItems,
      shopItems: newShopItems
    });
    
    console.log("Purchased item:", itemId);
    return true;
  }
}));

export default useGameStore;