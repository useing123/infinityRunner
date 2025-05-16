import React from 'react';
import useGameStore from '../../store/gameStore';
import MainMenu from './MainMenu';
import HUD from './HUD';
import GameOverScreen from './GameOverScreen';

// Debug panel to show game state
const DebugPanel = () => {
  const { coins, totalCoins, score, lives } = useGameStore();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white p-2 text-xs pointer-events-none">
      <div>DEBUG STATE:</div>
      <div>Coins: {coins}</div>
      <div>Total Coins: {totalCoins}</div>
      <div>Score: {score}</div>
      <div>Lives: {lives}</div>
    </div>
  );
};

const UI: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'playing' && <HUD />}
      {gameState === 'gameOver' && <GameOverScreen />}
      <DebugPanel />
    </div>
  );
};

export default UI; 