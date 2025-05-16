import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import Player from './Player';
import World from './World';
import useGameStore from '../../store/gameStore';

const Scene: React.FC = () => {
  const { gameState, updateDistance } = useGameStore(state => ({
    gameState: state.gameState,
    updateDistance: state.updateDistance
  }));
  
  // Keep track of when the game started to reset the timer
  const gameStartTime = useRef(0);
  const { clock } = useThree();
  
  // Reset game elements and clock when game starts
  useEffect(() => {
    if (gameState === 'playing') {
      // Store the current time as the new reference point
      gameStartTime.current = clock.getElapsedTime();
      // Reset the score to 0
      updateDistance(0);
    }
  }, [gameState, clock, updateDistance]);
  
  useFrame(({ clock }) => {
    if (gameState === 'playing') {
      // Calculate elapsed time since game started
      const currentTime = clock.getElapsedTime();
      const gameTime = currentTime - gameStartTime.current;
      
      // Update distance/score based on time since game started
      updateDistance(gameTime * 5); // Simple distance calculation
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