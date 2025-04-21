import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore';
import { TrackSegment, Obstacle, Collectible, PlayerState } from '../../types/game';
import TrackSegmentComponent from './TrackSegment';

// Define approximate bounding boxes or radii for collision
const PLAYER_BOUNDS = { width: 0.8, height: 1.8, depth: 0.8 }; // Approx based on Player mesh
const COIN_RADIUS = 0.3;
const OBSTACLE_BOUNDS = { // Simplified - assumes box obstacles for now
    barrier: { width: 1.5, height: 1.5, depth: 0.5 }, 
    gap: { width: 1.5, height: 0.1, depth: 2 }, // Treat gap as flat collision zone
    overhead: { width: 1.5, height: 1.5, depth: 0.5 }, // Check Y position for overhead
};

const World: React.FC = () => {
  const worldRef = useRef<THREE.Group>(null);
  // Get state and actions from store
  const {
    gameState,
    segments,
    playerLane,
    isJumping,
    isSliding,
    isDead,
    playerPosition,
    setSegments, // Action to update segments in store
    decrementLives,
    collectCoin
  } = useGameStore((state) => ({
    gameState: state.gameState,
    segments: state.segments, // Use segments from store
    playerLane: state.playerLane,
    isJumping: state.isJumping,
    isSliding: state.isSliding,
    isDead: state.isDead,
    playerPosition: state.playerPosition,
    setSegments: state.setSegments,
    decrementLives: state.decrementLives,
    collectCoin: state.collectCoin
  }));

  // Remove local segment state
  // const [segments, setSegments] = useState<TrackSegment[]>([]); 
  const segmentLength = 100; // Length of each track segment
  const visibleSegments = 3; // Number of segments visible at once
  const lanePositions = [-2.5, 0, 2.5]; // Same as in Player
  
  // Initialize track - update store
  useEffect(() => {
    if (gameState === 'playing') {
      if (segments.length === 0) { // Only initialize if store segments are empty
          const initialSegments = Array.from({ length: visibleSegments }).map((_, i) => 
            createTrackSegment(i * segmentLength)
          );
          setSegments(initialSegments); // Update store
      }
    } else {
       // Clear segments in store when not playing (optional, handled by restart/start)
       // setSegments([]); 
    }
    // Depend on gameState only, segments change via actions
  }, [gameState, setSegments]); 
  
  // Create a new track segment with obstacles and collectibles (no changes needed here)
  const createTrackSegment = (zPosition: number): TrackSegment => {
    const id = `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const difficulty: 'easy' | 'medium' | 'hard' = 
      zPosition < 300 ? 'easy' : 
      zPosition < 600 ? 'medium' : 'hard';
    
    // Adjust lane mapping for obstacles/collectibles if needed
    // Assuming their `lane` property (-1, 0, 1) matches player lane
    const obstacleCount = difficulty === 'easy' ? 3 : 
                         difficulty === 'medium' ? 5 : 8;
    
    const obstacles: Obstacle[] = Array.from({ length: obstacleCount }).map((_, i) => {
       const type = ['barrier', 'gap', 'overhead'][Math.floor(Math.random() * 3)] as 'barrier' | 'gap' | 'overhead';
       const lane = Math.floor(Math.random() * 3) -1; // Lane -1, 0, 1
       return {
        id: `obstacle-${id}-${i}`,
        type: type,
        position: {
            x: lanePositions[lane + 1], // Position based on lane
            y: type === 'overhead' ? 2.0 : 0, // Position overhead obstacles higher
            z: zPosition + (i + 1) * (segmentLength / (obstacleCount + 1))
        },
        lane: lane,
        scale: { x: 1, y: 1, z: 1 } // Scale might be needed for accurate bounds
       };
    });
    
    const collectibleCount = 10 + Math.floor(Math.random() * 10);
    const collectibles: Collectible[] = Array.from({ length: collectibleCount }).map((_, i) => {
        const lane = Math.floor(Math.random() * 3) - 1;
        return {
            id: `collectible-${id}-${i}`,
            type: Math.random() < 0.9 ? 'coin' : 'powerup',
            position: {
                x: lanePositions[lane + 1],
                y: Math.random() < 0.5 ? 0.5 : 1.5, // Consistent height for coins
                z: zPosition + i * (segmentLength / collectibleCount)
            },
            lane: lane,
            collected: false
        };
    });
    
    return {
      id,
      difficulty,
      position: { x: 0, y: 0, z: zPosition },
      obstacles,
      collectibles,
      length: segmentLength
    };
  };
  
  // Update track & Check Collisions
  useFrame((state, delta) => {
    if (gameState !== 'playing' || !worldRef.current) return;
    
    // Move the entire world backward to simulate forward movement
    const speed = 20; // Adjust for desired speed
    worldRef.current.position.z -= delta * speed;
    const worldZOffset = worldRef.current.position.z;

    // --- Collision Detection Logic --- 
    if (!isDead) { // Only check collisions if player is not already dead/invincible
        const playerWorldY = playerPosition.y + PLAYER_BOUNDS.height / 2; // Approx center Y using bounds
        const PLAYER_FIXED_Z = -5.0; // Player's approximate fixed Z position relative to camera

        segments.forEach(segment => {
            // Check Obstacles
            segment.obstacles.forEach(obstacle => {
                const obstacleWorldZ = obstacle.position.z + worldZOffset; // Obstacle's current world Z
                // Corrected dz calculation using player's fixed Z
                const dz = Math.abs(PLAYER_FIXED_Z - obstacleWorldZ);
                // dy calculation comparing centers
                const obstacleCenterY = obstacle.position.y + OBSTACLE_BOUNDS[obstacle.type].height / 2;
                const dy = Math.abs(playerWorldY - obstacleCenterY);

                // Simple AABB collision check (Axis-Aligned Bounding Box)
                // Check Z overlap first
                if (dz < (PLAYER_BOUNDS.depth / 2 + OBSTACLE_BOUNDS[obstacle.type].depth / 2)) {
                    // Check X overlap (lane check - keep for obstacles for simplicity for now)
                    if (obstacle.lane === playerLane) {
                         // Check Y overlap based on obstacle type
                        const verticalCollision = dy < (PLAYER_BOUNDS.height / 2 + OBSTACLE_BOUNDS[obstacle.type].height / 2);
                        
                        let collisionDetected = false;
                        switch(obstacle.type) {
                            case 'barrier':
                                if (!isSliding && verticalCollision) collisionDetected = true;
                                break;
                            case 'gap':
                                // Collision if player is NOT jumping over the gap zone
                                if (!isJumping && verticalCollision) collisionDetected = true;
                                break;
                            case 'overhead':
                                // Collision if player is NOT sliding under
                                if (!isSliding && verticalCollision) collisionDetected = true;
                                break;
                        }

                        if (collisionDetected) {
                            console.log("Collision with obstacle!", obstacle.id);
                            decrementLives(); 
                            return; 
                        }
                    }
                }
            });

            if (isDead) return; 

            // Check Collectibles (Coins)
            segment.collectibles.forEach(coin => {
                if (coin.collected || coin.type !== 'coin') return;

                const coinWorldZ = coin.position.z + worldZOffset; // Coin's current world Z
                const coinWorldX = coin.position.x; 
                const playerWorldX = playerPosition.x; 

                // Corrected dz calculation using player's fixed Z
                const dz = Math.abs(PLAYER_FIXED_Z - coinWorldZ); 
                // dy calculation comparing centers (player center vs coin center)
                const dy = Math.abs(playerWorldY - coin.position.y); // Assuming coin.position.y is its center
                const dx = Math.abs(playerWorldX - coinWorldX); 
                
                const Z_TOLERANCE = 1.0; 
                if (dz < (PLAYER_BOUNDS.depth / 2 + Z_TOLERANCE)) { 
                    if (dx < (PLAYER_BOUNDS.width / 2 + COIN_RADIUS)) { 
                        if (dy < (PLAYER_BOUNDS.height / 2 + COIN_RADIUS)) {
                             console.log("Collecting coin!", coin.id);
                             collectCoin(segment.id, coin.id); 
                        }
                    }
                }
            });
        });
    }

    // Update track segments - use store action
    const playerProgress = -worldZOffset; 

    // Corrected condition for recycling:
    if (segments.length > 0 && playerProgress >= segments[0].position.z + segments[0].length) {
        // console.log(`>>> Recycling segment! PlayerProgress=${playerProgress.toFixed(2)}, Seg0End=${segments.length > 0 ? (segments[0].position.z + segments[0].length).toFixed(2) : 'N/A'}`); // Keep log temporarily if needed
        const newSegments = [...segments];
        const removedSegment = newSegments.shift(); 
        
        // We need to check if newSegments still has elements after shifting
        if (newSegments.length > 0) { 
            const lastSegmentZ = newSegments[newSegments.length - 1].position.z;
            const newSegmentToAdd = createTrackSegment(lastSegmentZ + segmentLength);
            // console.log(`>>> Adding segment ${newSegmentToAdd.id} at Z=${newSegmentToAdd.position.z.toFixed(2)}`); // Keep log temporarily if needed
            newSegments.push(newSegmentToAdd);
            setSegments(newSegments); 
        } else {
            // This case should ideally not happen if visibleSegments >= 2
            // If it does, we might need to regenerate based on player progress
            console.warn(">>> Segment array became empty after shift, re-initializing.");
            const recoverySegment = createTrackSegment(Math.floor(playerProgress / segmentLength) * segmentLength);
            setSegments([recoverySegment]);
        }
    }
  });
  
  return (
    <group ref={worldRef}>
      {/* Ground mesh... */}
       <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, -(segmentLength * visibleSegments / 2)]} // Center ground relative to visible segments
      >
        <planeGeometry args={[10, segmentLength * (visibleSegments + 1)]} /> // Make ground larger
        <meshStandardMaterial 
          color="#4a6741"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Render segments from store */}
      {segments.map((segment) => (
        <TrackSegmentComponent 
          key={segment.id} 
          segment={segment} 
        />
      ))}
      
      {/* Decorative elements... */}
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