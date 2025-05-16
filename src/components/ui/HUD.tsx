import React, { useEffect } from 'react';
import { Heart, Coins, Medal } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const HUD: React.FC = () => {
  // Get all needed values from game store
  const { score, lives, coins, highScore, totalCoins, gameState } = useGameStore((state) => ({
    score: state.score,
    lives: state.lives,
    coins: state.coins,
    highScore: state.highScore,
    totalCoins: state.totalCoins,
    gameState: state.gameState
  }));

  // Debug: Log when coins change for debugging
  useEffect(() => {
    console.log("HUD: Coins updated:", coins);
  }, [coins]);

  // Debug: Log when totalCoins change for debugging
  useEffect(() => {
    console.log("HUD: TotalCoins updated:", totalCoins);
  }, [totalCoins]);

  // Only show HUD during gameplay
  if (gameState !== 'playing') return null;

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none">
      <div className="flex justify-between items-start p-4">
        {/* Left side: Score and lives */}
        <div className="flex flex-col gap-2">
          {/* Score */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2 text-white flex items-center">
            <Medal className="text-yellow-400 mr-2" size={20} />
            <div>
              <p className="text-sm font-semibold">Score</p>
              <p className="text-xl font-bold">{score}</p>
            </div>
          </div>
          
          {/* Lives */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2 text-white flex items-center">
            <Heart className="text-red-500 mr-2" size={20} />
            <div>
              <p className="text-sm font-semibold">Lives</p>
              <p className="text-xl font-bold">{lives}</p>
            </div>
          </div>
        </div>
        
        {/* Right side: Coins, high score */}
        <div className="flex flex-col gap-2">
          {/* Coins */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2 text-white flex items-center">
            <Coins className="text-yellow-400 mr-2" size={20} />
            <div>
              <p className="text-sm font-semibold">Coins</p>
              <p className="text-xl font-bold">{coins}</p>
            </div>
          </div>
          
          {/* Total Coins */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2 text-white flex items-center">
            <Coins className="text-orange-400 mr-2" size={20} />
            <div>
              <p className="text-sm font-semibold">Total Coins</p>
              <p className="text-xl font-bold">{totalCoins}</p>
            </div>
          </div>
          
          {/* High Score */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2 text-white flex items-center">
            <Medal className="text-amber-400 mr-2" size={20} />
            <div>
              <p className="text-sm font-semibold">High Score</p>
              <p className="text-xl font-bold">{highScore}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;