import React from 'react';
import * as THREE from 'three';
import { TrackSegment, Obstacle as ObstacleType, Collectible as CollectibleType } from '../../types/game';
import Obstacle from './Obstacle';
import Collectible from './Collectible';

// Create shared materials to reduce GPU overhead
const TRACK_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#8a8a8a",
  roughness: 0.8,
  metalness: 0.2
});

const BARRIER_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#666666"
});

const LANE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "white",
  emissive: "white",
  emissiveIntensity: 0.2
});

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
        <primitive object={TRACK_MATERIAL} />
      </mesh>
      
      {/* Side barriers */}
      <mesh 
        castShadow
        position={[-4, 0, segment.length / 2]}
      >
        <boxGeometry args={[0.3, 1, segment.length]} />
        <primitive object={BARRIER_MATERIAL} />
      </mesh>
      
      <mesh 
        castShadow
        position={[4, 0, segment.length / 2]}
      >
        <boxGeometry args={[0.3, 1, segment.length]} />
        <primitive object={BARRIER_MATERIAL} />
      </mesh>
      
      {/* Lane dividers */}
      <mesh 
        position={[-1.25, -0.38, segment.length / 2]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.1, segment.length]} />
        <primitive object={LANE_MATERIAL} />
      </mesh>
      
      <mesh 
        position={[1.25, -0.38, segment.length / 2]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.1, segment.length]} />
        <primitive object={LANE_MATERIAL} />
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