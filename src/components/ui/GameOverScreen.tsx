import React from 'react';
import { Medal, Coins, RotateCcw, Home } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const GameOverScreen: React.FC = () => {
  const { score, coins, highScore, totalCoins, restartGame, returnToMenu } = useGameStore(state => ({
    score: state.score,
    coins: state.coins,
    highScore: state.highScore,
    totalCoins: state.totalCoins,
    restartGame: state.restartGame,
    returnToMenu: state.returnToMenu
  }));

  // Check if the current score is a new high score
  const isNewHighScore = score === highScore && score > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 pointer-events-auto">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-white mb-2">GAME OVER</h2>
        
        {isNewHighScore && (
          <div className="text-yellow-400 font-bold text-xl mb-4 flex items-center justify-center">
            <Medal className="mr-2" size={20} />
            NEW HIGH SCORE!
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Score */}
          <div className="bg-gray-800 rounded-lg px-4 py-4">
            <p className="text-sm text-gray-400">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          
          {/* High Score */}
          <div className="bg-gray-800 rounded-lg px-4 py-4">
            <p className="text-sm text-gray-400">High Score</p>
            <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
          </div>
          
          {/* Coins collected this run */}
          <div className="bg-gray-800 rounded-lg px-4 py-4 flex flex-col items-center">
            <p className="text-sm text-gray-400">Coins Collected</p>
            <div className="flex items-center">
              <Coins className="text-yellow-400 mr-2" size={18} />
              <p className="text-2xl font-bold text-white">{coins}</p>
            </div>
          </div>
          
          {/* Total Coins */}
          <div className="bg-gray-800 rounded-lg px-4 py-4 flex flex-col items-center">
            <p className="text-sm text-gray-400">Total Coins</p>
            <div className="flex items-center">
              <Coins className="text-orange-400 mr-2" size={18} />
              <p className="text-2xl font-bold text-white">{totalCoins}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={restartGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center"
          >
            <RotateCcw size={18} className="mr-2" />
            Play Again
          </button>
          
          <button 
            onClick={returnToMenu}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center"
          >
            <Home size={18} className="mr-2" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;