import React, { useEffect } from 'react';
import Game from './components/Game';
import GameUI from './components/ui/GameUI';
import useGameStore from './store/gameStore';

function App() {
  const gameState = useGameStore((state) => state.gameState);
  
  // Handle keyboard controls globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      // Game controls will be handled in the player component
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Game Canvas */}
      <Game />
      
      {/* UI Overlay */}
      <GameUI />
    </div>
  );
}

export default App;