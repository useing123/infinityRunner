import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Collectible as CollectibleType } from '../../types/game';
import useGameStore from '../../store/gameStore';

interface CollectibleProps {
  collectible: CollectibleType;
}

const Collectible: React.FC<CollectibleProps> = ({ collectible }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { incrementCoins } = useGameStore();
  
  // Rotate collectible for visual effect
  useFrame((state) => {
    if (meshRef.current && !collectible.collected) {
      meshRef.current.rotation.y += 0.02;
      
      // Add a gentle bobbing motion
      meshRef.current.position.y = 
        collectible.position.y + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });
  
  // Define collectible appearance based on type
  const getCollectibleGeometry = () => {
    switch (collectible.type) {
      case 'coin':
        return <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />;
      case 'powerup':
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
      default:
        return <sphereGeometry args={[0.3, 16, 16]} />;
    }
  };
  
  // Define material based on collectible type
  const getCollectibleMaterial = () => {
    switch (collectible.type) {
      case 'coin':
        return <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />;
      case 'powerup':
        return <meshStandardMaterial color="#39CCCC" emissive="#39CCCC" emissiveIntensity={0.5} />;
      default:
        return <meshStandardMaterial color="#A0A0A0" />;
    }
  };
  
  // Handle collectible collection
  const handleCollect = () => {
    if (!collectible.collected) {
      collectible.collected = true;
      
      if (collectible.type === 'coin') {
        incrementCoins(1);
      }
      
      // Add collection animation/effect here
    }
  };
  
  // Only render if not collected
  if (collectible.collected) return null;
  
  return (
    <mesh
      ref={meshRef}
      position={[
        collectible.position.x, 
        collectible.position.y, 
        collectible.position.z
      ]}
      onClick={handleCollect}
      castShadow
    >
      {getCollectibleGeometry()}
      {getCollectibleMaterial()}
    </mesh>
  );
};

export default Collectible;