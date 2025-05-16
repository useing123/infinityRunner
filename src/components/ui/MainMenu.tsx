import React from 'react';
import { Play, Settings, Coins, ShoppingCart } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const MainMenu: React.FC = () => {
  const { startGame, openShop, highScore, totalCoins } = useGameStore(state => ({
    startGame: state.startGame,
    openShop: state.openShop,
    highScore: state.highScore,
    totalCoins: state.totalCoins
  }));

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 pointer-events-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Infinity Runner</h1>
        
        <div className="flex flex-row justify-center gap-6 mb-8">
          {/* High Score Display */}
          <div className="bg-gray-800 rounded-lg px-4 py-2 text-center">
            <h2 className="text-lg font-bold text-white">High Score</h2>
            <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
          </div>
          
          {/* Total Coins Display */}
          <div className="bg-gray-800 rounded-lg px-4 py-2 text-center flex flex-col items-center">
            <h2 className="text-lg font-bold text-white">Total Coins</h2>
            <div className="flex items-center gap-1">
              <Coins size={20} className="text-yellow-400" />
              <p className="text-2xl font-bold text-yellow-400">{totalCoins}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full w-48 transition duration-300 flex justify-center items-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Play
          </button>
          
          <button
            onClick={openShop}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-full w-48 transition duration-300 flex justify-center items-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Shop
          </button>
          
          {/* Game instructions */}
          <div className="mt-8 text-white text-sm max-w-md bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-center">Controls</h3>
            <ul className="text-left">
              <li>← → Arrow keys: Move left/right</li>
              <li>↑ / Space: Jump</li>
              <li>↓ / S: Slide</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;