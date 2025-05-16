import React from 'react';
import useGameStore from '../../store/gameStore';
import MainMenu from './MainMenu';
import HUD from './HUD';
import GameOverScreen from './GameOverScreen';

const UI: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'playing' && <HUD />}
      {gameState === 'gameOver' && <GameOverScreen />}
    </div>
  );
};

export default UI; 