import React from 'react';
import { Obstacle as ObstacleType } from '../../types/game';
import * as THREE from 'three';

// Create shared materials to reduce GPU overhead
const BARRIER_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#FF4136", 
  roughness: 0.5,
  metalness: 0.2
});

const GAP_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#FF0000", 
  transparent: true,
  opacity: 0.3,
  emissive: "#FF0000",
  emissiveIntensity: 0.3
});

interface ObstacleProps {
  obstacle: ObstacleType;
  segmentStartZ: number;
}

const Obstacle: React.FC<ObstacleProps> = ({ obstacle, segmentStartZ }) => {
  // Define obstacle appearance based on type
  const getObstacleGeometry = () => {
    switch (obstacle.type) {
      case 'barrier':
        return (
          <boxGeometry args={[1.5, 1.5, 0.5]} />
        );
      case 'gap':
        // For gaps, we'll show a visual indicator that's transparent
        return (
          <boxGeometry args={[1.5, 0.1, 1.5]} />
        );
      default:
        return null;
    }
  };
  
  // Position obstacles based on type
  let yPosition = 0;
  switch (obstacle.type) {
    case 'gap':
      yPosition = -0.35; // Slightly below the track
      break;
    case 'barrier':
      yPosition = 0; // Normal height for barriers
      break;
  }
  
  // Calculate relative Z position
  const relativeZ = obstacle.position.z - segmentStartZ;

  // Get appropriate material based on obstacle type
  const material = obstacle.type === 'barrier' ? BARRIER_MATERIAL : GAP_MATERIAL;

  return (
    <mesh
      position={[obstacle.position.x, yPosition, relativeZ]}
      scale={[obstacle.scale.x, obstacle.scale.y, obstacle.scale.z]}
      castShadow
    >
      {getObstacleGeometry()}
      <primitive object={material} />
    </mesh>
  );
};

export default Obstacle;