import React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const GameOverScreen: React.FC = () => {
  const { score, highScore, restartGame, startGame } = useGameStore(state => ({
    score: state.score,
    highScore: state.highScore,
    restartGame: state.restartGame,
    startGame: state.startGame
  }));

  const isNewHighScore = score === highScore;

  return (
    <div className="flex items-center justify-center h-full w-full bg-black/80 pointer-events-auto">
      <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4">
        <h2 className="text-4xl font-bold text-white text-center mb-2">Game Over</h2>
        
        <div className="text-center mb-8">
          <p className="text-gray-400 text-lg">Score: <span className="text-white font-bold">{score}</span></p>
          <p className="text-gray-400 text-lg">High Score: <span className="text-white font-bold">{highScore}</span></p>
          
          {isNewHighScore && (
            <div className="mt-3 animate-pulse">
              <p className="text-yellow-400 font-bold">New High Score!</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={restartGame}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-xl font-medium transition-colors"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
          
          <button
            onClick={() => startGame()}
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg text-xl font-medium transition-colors"
          >
            <Home size={20} />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;