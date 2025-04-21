import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore';
import { TrackSegment, Obstacle, Collectible } from '../../types/game';
import TrackSegmentComponent from './TrackSegment';

const World: React.FC = () => {
  const worldRef = useRef<THREE.Group>(null);
  const gameState = useGameStore((state) => state.gameState);
  
  // Track segments
  const [segments, setSegments] = useState<TrackSegment[]>([]);
  const segmentLength = 100; // Length of each track segment
  const visibleSegments = 3; // Number of segments visible at once
  
  // Initialize track
  useEffect(() => {
    if (gameState === 'playing') {
      // Create initial track segments
      const initialSegments = Array.from({ length: visibleSegments }).map((_, i) => 
        createTrackSegment(i * segmentLength)
      );
      setSegments(initialSegments);
    } else {
      // Clear segments when not playing
      setSegments([]);
    }
  }, [gameState]);
  
  // Create a new track segment with obstacles and collectibles
  const createTrackSegment = (zPosition: number): TrackSegment => {
    const id = `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const difficulty: 'easy' | 'medium' | 'hard' = 
      zPosition < 300 ? 'easy' : 
      zPosition < 600 ? 'medium' : 'hard';
    
    // Generate obstacles based on difficulty
    const obstacleCount = difficulty === 'easy' ? 3 : 
                         difficulty === 'medium' ? 5 : 8;
    
    const obstacles: Obstacle[] = Array.from({ length: obstacleCount }).map((_, i) => ({
      id: `obstacle-${id}-${i}`,
      type: ['barrier', 'gap', 'overhead'][Math.floor(Math.random() * 3)] as 'barrier' | 'gap' | 'overhead',
      position: {
        x: [-2.5, 0, 2.5][Math.floor(Math.random() * 3)],
        y: 0,
        z: zPosition + (i + 1) * (segmentLength / (obstacleCount + 1))
      },
      lane: [-1, 0, 1][Math.floor(Math.random() * 3)],
      scale: { x: 1, y: 1, z: 1 }
    }));
    
    // Generate collectibles (coins, powerups)
    const collectibleCount = 10 + Math.floor(Math.random() * 10);
    const collectibles: Collectible[] = Array.from({ length: collectibleCount }).map((_, i) => ({
      id: `collectible-${id}-${i}`,
      type: Math.random() < 0.9 ? 'coin' : 'powerup',
      position: {
        x: [-2.5, 0, 2.5][Math.floor(Math.random() * 3)],
        y: Math.random() < 0.5 ? 0 : 1, // Some coins are elevated
        z: zPosition + i * (segmentLength / collectibleCount)
      },
      lane: [-1, 0, 1][Math.floor(Math.random() * 3)],
      collected: false
    }));
    
    return {
      id,
      difficulty,
      position: { x: 0, y: 0, z: zPosition },
      obstacles,
      collectibles,
      length: segmentLength
    };
  };
  
  // Update track - recycle segments as player moves
  useFrame((state, delta) => {
    if (gameState !== 'playing' || !worldRef.current) return;
    
    // Move the entire world backward to simulate forward movement
    const speed = 20; // Adjust for desired speed
    worldRef.current.position.z -= delta * speed;
    
    // Update track segments
    if (worldRef.current.position.z > segmentLength) {
      worldRef.current.position.z = 0;
      
      // Remove the first segment and add a new one at the end
      setSegments(prev => {
        const newSegments = [...prev];
        newSegments.shift();
        
        const lastSegmentZ = newSegments[newSegments.length - 1].position.z;
        newSegments.push(createTrackSegment(lastSegmentZ + segmentLength));
        
        return newSegments;
      });
    }
  });
  
  return (
    <group ref={worldRef}>
      {/* Enhanced ground with grass */}
      <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[200, 1000]} />
        <meshStandardMaterial 
          color="#4a6741"
          roughness={1}
          metalness={0}
        />
      </mesh>
      
      {/* Track segments */}
      {segments.map((segment) => (
        <TrackSegmentComponent 
          key={segment.id} 
          segment={segment} 
        />
      ))}
      
      {/* Add some decorative elements */}
      {Array.from({ length: 20 }).map((_, i) => (
        <group key={i} position={[Math.sin(i * 0.5) * 20, 0, i * 50 - 500]}>
          <mesh castShadow position={[0, 2, 0]}>
            <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
            <meshStandardMaterial color="#2d4a1c" />
          </mesh>
          <mesh castShadow position={[0, 4, 0]}>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshStandardMaterial color="#2d4a1c" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default World;