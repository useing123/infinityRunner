import React from 'react';
import { Play, Settings } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const MainMenu: React.FC = () => {
  const startGame = useGameStore((state) => state.startGame);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-indigo-900/80 to-purple-900/80 pointer-events-auto">
      <div className="text-center p-8 rounded-lg">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-wider">
          3D RUNNER
        </h1>
        <p className="text-xl text-indigo-200 mb-12">
          Run, jump, and slide to avoid obstacles and collect coins!
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={startGame}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-xl font-medium transition-colors duration-300"
          >
            <Play size={24} />
            Play Game
          </button>
          <button className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-xl font-medium transition-colors duration-300">
            <Settings size={24} />
            Settings
          </button>
        </div>

        <div className="mt-12 text-indigo-200 text-sm">
          <p className="mb-2">Controls:</p>
          <p>← → : Move left/right</p>
          <p>Space : Jump</p>
          <p>S : Slide</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;