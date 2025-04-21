import React from 'react';
import { Obstacle as ObstacleType } from '../../types/game';

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
          <boxGeometry args={[1.5, 1, 0.5]} />
        );
      case 'gap':
        // Return null to make the gap visually empty
        // Collision logic still applies in World.tsx
        return null; 
      case 'overhead':
        return (
          <boxGeometry args={[1.5, 0.5, 0.5]} />
        );
      default:
        return (
          <boxGeometry args={[1, 1, 1]} />
        );
    }
  };
  
  // Define material based on obstacle type
  const getObstacleMaterial = () => {
    switch (obstacle.type) {
      case 'barrier':
        return <meshStandardMaterial color="#FF4136" />;
      case 'gap':
        // No material needed if geometry is null
        return null;
      case 'overhead':
        return <meshStandardMaterial color="#FFDC00" />;
      default:
        return <meshStandardMaterial color="#A0A0A0" />;
    }
  };
  
  // Position overhead obstacles higher
  // No special positioning needed for gap anymore
  const yPosition = obstacle.type === 'overhead' ? 1.5 : 0;
  
  // Return null if the geometry is null (for gap type)
  const geometry = getObstacleGeometry();
  if (!geometry) return null;

  // Calculate relative Z position
  const relativeZ = obstacle.position.z - segmentStartZ;

  return (
    <mesh
      position={[obstacle.position.x, yPosition, relativeZ]}
      scale={[obstacle.scale.x, obstacle.scale.y, obstacle.scale.z]}
      castShadow
    >
      {geometry} // Use the stored geometry
      {getObstacleMaterial()}
    </mesh>
  );
};

export default Obstacle;