import React from 'react';
import { Obstacle as ObstacleType } from '../../types/game';

interface ObstacleProps {
  obstacle: ObstacleType;
}

const Obstacle: React.FC<ObstacleProps> = ({ obstacle }) => {
  // Define obstacle appearance based on type
  const getObstacleGeometry = () => {
    switch (obstacle.type) {
      case 'barrier':
        return (
          <boxGeometry args={[1.5, 1, 0.5]} />
        );
      case 'gap':
        return (
          <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
        );
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
        return <meshStandardMaterial color="#0074D9" />;
      case 'overhead':
        return <meshStandardMaterial color="#FFDC00" />;
      default:
        return <meshStandardMaterial color="#A0A0A0" />;
    }
  };
  
  // Position overhead obstacles higher
  const yPosition = obstacle.type === 'overhead' ? 1.5 : 0;
  
  return (
    <mesh
      position={[obstacle.position.x, yPosition, obstacle.position.z]}
      scale={[obstacle.scale.x, obstacle.scale.y, obstacle.scale.z]}
      castShadow
    >
      {getObstacleGeometry()}
      {getObstacleMaterial()}
    </mesh>
  );
};

export default Obstacle;