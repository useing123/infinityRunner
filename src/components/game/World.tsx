import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore';
import { TrackSegment, Obstacle, Collectible, PlayerState } from '../../types/game';
import TrackSegmentComponent from './TrackSegment';

// Define approximate bounding boxes or radii for collision
const PLAYER_BOUNDS = { width: 0.8, height: 1.8, depth: 0.8 }; // Approx based on Player mesh
const COIN_RADIUS = 0.3;
const OBSTACLE_BOUNDS = { // Simplified - only 2 obstacle types now
    barrier: { width: 1.5, height: 1.5, depth: 0.5 }, 
    gap: { width: 1.5, height: 0.1, depth: 2 }, // Treat gap as flat collision zone
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
    collectCoin,
    incrementCoins
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
    collectCoin: state.collectCoin,
    incrementCoins: state.incrementCoins
  }));

  const segmentLength = 100; // Length of each track segment
  const visibleSegments = 2; // Reduced for better performance
  const lanePositions = [-2.5, 0, 2.5]; // Same as in Player
  
  // Bug Fix: Reset world position when game state changes to 'playing'
  useEffect(() => {
    if (gameState === 'playing' && worldRef.current) {
      // Reset the world position whenever the game starts/restarts
      worldRef.current.position.z = 0;
      console.log("World position reset to 0");
    }
  }, [gameState]);
  
  // Initialize track - update store
  useEffect(() => {
    if (gameState === 'playing') {
      if (segments.length === 0) { // Only initialize if store segments are empty
          const initialSegments = Array.from({ length: visibleSegments }).map((_, i) => 
            createTrackSegment(i * segmentLength)
          );
          setSegments(initialSegments); // Update store
      }
    }
  }, [gameState, setSegments]); 
  
  // Create a new track segment with obstacles and collectibles (simplified)
  const createTrackSegment = (zPosition: number): TrackSegment => {
    const id = `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const difficulty: 'easy' | 'medium' | 'hard' = 
      zPosition < 300 ? 'easy' : 
      zPosition < 600 ? 'medium' : 'hard';
    
    // Simplified obstacle count
    const obstacleCount = difficulty === 'easy' ? 2 : 
                         difficulty === 'medium' ? 3 : 4;
    
    // Create obstacle zones to avoid overlapping
    const zoneSize = segmentLength / (obstacleCount + 1);
    const obstacleZones: {min: number, max: number}[] = [];
    
    const obstacles: Obstacle[] = Array.from({ length: obstacleCount }).map((_, i) => {
       // Calculate a random position within a zone to avoid overlapping
       const zoneStart = zPosition + (i + 0.2) * zoneSize;
       const zoneEnd = zPosition + (i + 0.8) * zoneSize;
       const zPos = zoneStart + Math.random() * (zoneEnd - zoneStart);
       
       // Add this zone to our tracking array
       obstacleZones.push({min: zPos - 1, max: zPos + 1});
       
       // Only two obstacle types: barrier and gap
       const type = Math.random() > 0.5 ? 'barrier' : 'gap';
       const lane = Math.floor(Math.random() * 3) - 1; // Lane -1, 0, 1
       return {
        id: `obstacle-${id}-${i}`,
        type: type,
        position: {
            x: lanePositions[lane + 1], // Position based on lane
            y: 0, // All obstacles at ground level
            z: zPos
        },
        lane: lane,
        scale: { x: 1, y: 1, z: 1 }
       };
    });
    
    // Generate collectibles avoiding obstacle zones
    const collectibleCount = 5 + Math.floor(Math.random() * 5);
    const collectibles: Collectible[] = [];
    
    // Distribute coins evenly along segment, but avoiding obstacles
    for (let i = 0; i < collectibleCount; i++) {
        const zPos = zPosition + i * (segmentLength / collectibleCount);
        
        // Check if position overlaps with any obstacle zone
        const overlapsObstacle = obstacleZones.some(zone => 
            zPos >= zone.min && zPos <= zone.max
        );
        
        if (!overlapsObstacle) {
            const lane = Math.floor(Math.random() * 3) - 1;
            collectibles.push({
                id: `collectible-${id}-${i}`,
                type: 'coin', // Only using coins for simplicity
                position: {
                    x: lanePositions[lane + 1],
                    y: 1.0, // Consistent height for all coins
                    z: zPos
                },
                lane: lane,
                collected: false
            });
        }
    }
    
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
                        
                        // Simplified collision detection for only two obstacle types
                        switch(obstacle.type) {
                            case 'barrier':
                                if (!isJumping && verticalCollision) collisionDetected = true;
                                break;
                            case 'gap':
                                if (!isJumping && verticalCollision) collisionDetected = true;
                                break;
                        }

                        if (collisionDetected) {
                            console.log("Collision with obstacle!", obstacle.id, "Type:", obstacle.type);
                            
                            // Apply proper damage based on obstacle type
                            if (obstacle.type === 'barrier') {
                                console.log("Barrier hit! Damage: 3");
                                decrementLives(3);
                            } else {
                                console.log("Gap hit! Damage: 1");
                                decrementLives(1);
                            }
                            return; 
                        }
                    }
                }
            });

            if (isDead) return; 

            // Check Collectibles (Coins)
            segment.collectibles.forEach(coin => {
                if (coin.collected) return;

                const coinWorldZ = coin.position.z + worldZOffset; // Coin's current world Z
                const coinWorldX = coin.position.x; 
                const playerWorldX = playerPosition.x; 

                // UPDATED COIN COLLECTION LOGIC
                // 1. Use lane-based detection first (more reliable)
                const sameLane = playerLane === coin.lane;
                
                // 2. Z-axis proximity check with wider tolerance
                const Z_TOLERANCE = 1.5; // Increased from 1.0
                const zDistance = Math.abs(PLAYER_FIXED_Z - coinWorldZ);
                const zCollision = zDistance < Z_TOLERANCE;
                
                // Simpler coin collection logic with debugging for coin IDs
                if (sameLane && zCollision) {
                    console.log(`COIN COLLECTION ATTEMPT - ID: ${coin.id} | SEGMENT: ${segment.id}`);
                    
                    // Instead of setting collected locally, let the store handle it
                    // This avoids state synchronization issues
                    
                    // Add logic to prevent multiple collection attempts for the same coin
                    if (!coin.collected) {
                        // Call incrementCoins directly instead of collectCoin
                        // This simplifies the logic and avoids segment/coin ID mismatches
                        incrementCoins(1);
                        
                        // Mark as collected for visual feedback only
                        coin.collected = true;
                    }
                }
            });
        });
    }

    // Update track segments - use store action
    const playerProgress = -worldZOffset; 

    // Corrected condition for recycling:
    if (segments.length > 0 && playerProgress >= segments[0].position.z + segments[0].length) {
        const newSegments = [...segments];
        newSegments.shift(); 
        
        // We need to ensure we always have enough segments
        if (newSegments.length < visibleSegments) { 
            const lastSegment = newSegments[newSegments.length - 1];
            const newSegmentToAdd = createTrackSegment(lastSegment.position.z + segmentLength);
            newSegments.push(newSegmentToAdd);
            setSegments(newSegments); 
        } else if (newSegments.length === 0) {
            // Recovery if we somehow lost all segments
            console.warn(">>> Segment array became empty after shift, re-initializing.");
            const recoverySegment = createTrackSegment(Math.floor(playerProgress / segmentLength) * segmentLength);
            setSegments([recoverySegment]);
        } else {
            setSegments(newSegments);
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
        {/* <planeGeometry args={[10, segmentLength * (visibleSegments + 1)]} /> // Make ground larger
        <meshStandardMaterial 
          color="#222222"
          roughness={0.8}
          metalness={0.2}
        /> */}
      </mesh>

      {/* Render segments from store */}
      {segments.map((segment) => (
        <TrackSegmentComponent 
          key={segment.id} 
          segment={segment} 
        />
      ))}
      
      {/* Removed decorative elements for simplicity */}
    </group>
  );
};

export default World;