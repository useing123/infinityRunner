import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Collectible as CollectibleType } from '../../types/game';

// Create shared materials to reduce GPU overhead
const COIN_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#FFD700",
  metalness: 0.8,
  roughness: 0.2,
  emissive: "#FFD700",
  emissiveIntensity: 0.7  // Increased emissive intensity
});

const POWERUP_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#39CCCC",
  emissive: "#39CCCC",
  emissiveIntensity: 0.5
});

interface CollectibleProps {
  collectible: CollectibleType;
  segmentStartZ: number;
}

const Collectible: React.FC<CollectibleProps> = ({ collectible, segmentStartZ }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Local state to track collection for animations
  const [isCollected, setIsCollected] = useState(collectible.collected);
  const [opacity, setOpacity] = useState(1.0);
  
  // IMPORTANT: All hooks must be called before any conditional returns
  
  // Rotation and animation hook
  useFrame((state) => {
    // Only apply animations if the collectible is not collected and ref exists
    if (meshRef.current && !isCollected) {
      // Faster rotation for better visibility
      meshRef.current.rotation.y += 0.05;
      
      // Add a gentle bobbing motion
      meshRef.current.position.y = 
        (collectible.position.y) + 
        Math.sin(state.clock.getElapsedTime() * 3) * 0.15; // More pronounced bobbing
    }
  });
  
  // Update local state when prop changes
  useEffect(() => {
    if (collectible.collected && !isCollected) {
      console.log("Collectible marked as collected:", collectible.id);
      setIsCollected(true);
    }
  }, [collectible.collected, isCollected, collectible.id]);
  
  // Calculate relative Z position
  const relativeZ = collectible.position.z - segmentStartZ;
  
  // Skip rendering if collected
  if (isCollected) {
    return null;
  }

  return (
    <group
      position={[
        collectible.position.x, 
        collectible.position.y, 
        relativeZ
      ]}
    >
      {/* Add small light for better visibility */}
      <pointLight
        intensity={0.6}
        distance={1.5}
        color="#FFD700"
      />
      
      <mesh
        ref={meshRef}
        castShadow
      >
        {/* Larger coin for better visibility */}
        <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
        <primitive object={COIN_MATERIAL} />
      </mesh>
    </group>
  );
};

export default Collectible;