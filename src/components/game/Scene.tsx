import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import Player from './Player';
import World from './World';
import useGameStore from '../../store/gameStore';

const Scene: React.FC = () => {
  const { gameState, updateDistance } = useGameStore(state => ({
    gameState: state.gameState,
    updateDistance: state.updateDistance
  }));
  
  useEffect(() => {
    // Reset game elements when game starts
  }, [gameState]);
  
  useFrame(({ clock }) => {
    if (gameState === 'playing') {
      // Update distance/score based on time
      const elapsedTime = clock.getElapsedTime();
      updateDistance(elapsedTime * 5); // Simple distance calculation
    }
  });
  
  return (
    <group>
      <Player />
      <World />
    </group>
  );
};

export default Scene;