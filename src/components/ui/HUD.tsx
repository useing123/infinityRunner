import React from 'react';
import { Heart, Coins } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const HUD: React.FC = () => {
  const { score, highScore, lives, distance, coins } = useGameStore(state => ({
    score: state.score,
    highScore: state.highScore,
    lives: state.lives,
    distance: state.distance,
    coins: state.coins
  }));

  return (
    <div className="p-4 w-full">
      {/* Top bar with lives and coins */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart 
              key={i} 
              size={28} 
              className={i < lives ? "text-red-500 fill-red-500" : "text-gray-500"} 
            />
          ))}
        </div>
        
        <div className="bg-gray-800/70 rounded-full px-4 py-2 text-white flex items-center gap-2">
          <Coins size={20} className="text-yellow-400" />
          <span className="font-bold">{coins}</span>
        </div>
      </div>
      
      {/* Score display */}
      <div className="flex flex-col items-center">
        <div className="bg-gray-800/70 rounded-full px-6 py-2 text-white">
          <p className="text-2xl font-bold">{score}</p>
        </div>
        <p className="text-sm text-white mt-1">High: {highScore}</p>
      </div>
      
      {/* Distance meter */}
      <div className="absolute bottom-4 left-4 bg-gray-800/70 rounded-full px-4 py-2 text-white">
        <p>{distance.toFixed(0)}m</p>
      </div>
    </div>
  );
};

export default HUD;