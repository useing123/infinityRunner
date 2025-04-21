import React from 'react';
import { TrackSegment, Obstacle as ObstacleType, Collectible as CollectibleType } from '../../types/game';
import Obstacle from './Obstacle';
import Collectible from './Collectible';

interface TrackSegmentProps {
  segment: TrackSegment;
}

const TrackSegmentComponent: React.FC<TrackSegmentProps> = ({ segment }) => {
  return (
    <group position={[segment.position.x, segment.position.y, segment.position.z]}>
      {/* Enhanced track base */}
      <mesh 
        receiveShadow 
        position={[0, -0.4, segment.length / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[8, segment.length]} />
        <meshStandardMaterial 
          color="#8a8a8a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Side barriers */}
      <mesh 
        castShadow
        position={[-4, 0, segment.length / 2]}
      >
        <boxGeometry args={[0.3, 1, segment.length]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      <mesh 
        castShadow
        position={[4, 0, segment.length / 2]}
      >
        <boxGeometry args={[0.3, 1, segment.length]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Lane dividers */}
      <mesh 
        position={[-1.25, -0.38, segment.length / 2]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.1, segment.length]} />
        <meshStandardMaterial 
          color="white"
          emissive="white"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh 
        position={[1.25, -0.38, segment.length / 2]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.1, segment.length]} />
        <meshStandardMaterial 
          color="white"
          emissive="white"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Obstacles */}
      {segment.obstacles.map((obstacle: ObstacleType) => (
        <Obstacle 
          key={obstacle.id}
          obstacle={obstacle}
          segmentStartZ={segment.position.z}
        />
      ))}
      
      {/* Collectibles */}
      {segment.collectibles.map((collectible: CollectibleType) => (
        <Collectible 
          key={collectible.id}
          collectible={collectible}
          segmentStartZ={segment.position.z}
        />
      ))}
    </group>
  );
};

export default TrackSegmentComponent;