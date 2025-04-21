import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Sky } from '@react-three/drei';
import Scene from './game/Scene';
import Loader from './ui/Loader';
import useGameStore from '../store/gameStore';

const Game: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 75 }}
      shadows
      className="w-full h-full"
    >
      {/* Show stats only during development */}
      {process.env.NODE_ENV === 'development' && <Stats />}
      
      {/* Environment and lights */}
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      
      {/* Main game scene */}
      <Suspense fallback={<Loader />}>
        <Scene />
      </Suspense>
      
      {/* Camera controls - disabled during gameplay */}
      {gameState !== 'playing' && <OrbitControls />}
    </Canvas>
  );
};

export default Game;