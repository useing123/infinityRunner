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
      shadows={{ type: 'basic', enabled: true }}
      dpr={[1, 1.5]} // Limit pixel ratio for better performance
      performance={{ min: 0.5 }} // Allow throttling for lower-end devices
      gl={{ antialias: false, powerPreference: 'high-performance' }} // Disable antialiasing for performance
      className="w-full h-full"
    >
      {/* Show stats only during development */}
      {process.env.NODE_ENV === 'development' && <Stats />}
      
      {/* Simpler environment and optimized lights */}
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
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