import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore';
import { PlayerState } from '../../types/game';

const Player: React.FC = () => {
  const playerRef = useRef<THREE.Group>(null);
  const gameState = useGameStore((state) => state.gameState);
  const {
    playerLane,
    isJumping,
    isSliding,
    isDead,
    updatePlayerState,
  } = useGameStore((state) => ({
    playerLane: state.playerLane,
    isJumping: state.isJumping,
    isSliding: state.isSliding,
    isDead: state.isDead,
    updatePlayerState: state.updatePlayerState,
  }));
  
  // Lane positions
  const lanePositions = [-2.5, 0, 2.5];
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || isDead) return;
      
      let newLane = playerLane;
      let newIsJumping = isJumping;
      let newIsSliding = isSliding;
      
      switch (e.key) {
        case 'ArrowLeft':
          if (playerLane > -1 && !isJumping && !isSliding) {
            newLane = playerLane - 1;
          }
          break;
        case 'ArrowRight':
          if (playerLane < 1 && !isJumping && !isSliding) {
            newLane = playerLane + 1;
          }
          break;
        case ' ': // Space key
          if (!isJumping && !isSliding) {
            newIsJumping = true;
          }
          break;
        case 's':
        case 'S':
          if (!isJumping && !isSliding) {
            newIsSliding = true;
          }
          break;
      }
      
      // Update store if state changed
      if (newLane !== playerLane || newIsJumping !== isJumping || newIsSliding !== isSliding) {
          updatePlayerState({ lane: newLane, isJumping: newIsJumping, isSliding: newIsSliding });
          
          // Handle jump/slide timeouts locally for now, or move to useFrame/store logic
          if (newIsJumping) {
            setTimeout(() => {
                updatePlayerState({ isJumping: false });
            }, 800); 
          }
          if (newIsSliding) {
             setTimeout(() => {
                updatePlayerState({ isSliding: false });
            }, 800); 
          }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerLane, isJumping, isSliding, isDead, updatePlayerState]);
  
  // Update player movement
  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    // Update position based on current lane
    const targetX = lanePositions[playerLane + 1];
    playerRef.current.position.x = THREE.MathUtils.lerp(
      playerRef.current.position.x,
      targetX,
      delta * 10
    );
    
    // Update y position for jump
    if (isJumping) {
      const jumpProgress = (Date.now() % 800) / 800;
      const jumpHeight = Math.sin(jumpProgress * Math.PI) * 2.5;
      playerRef.current.position.y = jumpHeight;
    } else {
      playerRef.current.position.y = THREE.MathUtils.lerp(
        playerRef.current.position.y,
        0,
        delta * 10
      );
    }
    
    // Update scale and rotation for slide
    if (isSliding) {
      playerRef.current.scale.y = THREE.MathUtils.lerp(
        playerRef.current.scale.y,
        0.5,
        delta * 10
      );
      playerRef.current.rotation.x = THREE.MathUtils.lerp(
        playerRef.current.rotation.x,
        Math.PI * 0.1,
        delta * 10
      );
    } else {
      playerRef.current.scale.y = THREE.MathUtils.lerp(
        playerRef.current.scale.y,
        1,
        delta * 10
      );
      playerRef.current.rotation.x = THREE.MathUtils.lerp(
        playerRef.current.rotation.x,
        0,
        delta * 10
      );
    }
    
    // Update rotation for run animation
    if (gameState === 'playing' && !isDead) {
      const runSpeed = 12;
      const runAmplitude = 0.15;
      const time = state.clock.getElapsedTime();
      
      // Leg animation
      if (playerRef.current.children[0]) {
        const legs = playerRef.current.children[0].children.slice(-2);
        legs.forEach((leg, i) => {
          if (leg instanceof THREE.Mesh) {
            leg.position.z = Math.sin(time * runSpeed + (i * Math.PI)) * 0.2;
          }
        });
      }
      
      // Arm animation
      if (playerRef.current.children[0]) {
        const arms = playerRef.current.children[0].children.slice(2, 4);
        arms.forEach((arm, i) => {
          if (arm instanceof THREE.Mesh) {
            arm.position.z = Math.sin(time * runSpeed + (i * Math.PI)) * 0.2;
          }
        });
      }
    }
    
    // Update player state position in the store
    updatePlayerState({
      position: {
        x: playerRef.current!.position.x,
        y: playerRef.current!.position.y,
        z: playerRef.current!.position.z
      },
    });

    // Handle resetting isDead state after a short delay (e.g., invincibility frames)
    if (isDead) {
        const deadTimer = setTimeout(() => {
            updatePlayerState({ isDead: false });
        }, 1000); // 1 second invulnerability/dead display
    }
  });
  
  // Move isDead timer logic to useEffect for proper cleanup
  useEffect(() => {
    let deadTimer: NodeJS.Timeout | null = null;
    if (isDead) {
        deadTimer = setTimeout(() => {
            updatePlayerState({ isDead: false });
        }, 1000); // 1 second invulnerability/dead display
    }
    return () => {
        if (deadTimer) clearTimeout(deadTimer);
    };
  }, [isDead, updatePlayerState]);
  
  return (
    <group ref={playerRef} position={[0, 0, -5]} rotation={[0, 0, 0]}>
      {/* Enhanced player character */}
      <group scale={[0.5, 1, 0.5]}>
        {/* Body */}
        <mesh castShadow position={[0, 0.75, 0]}>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshStandardMaterial color={isDead ? '#ff4444' : '#4444ff'} />
        </mesh>
        
        {/* Head */}
        <mesh castShadow position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={isDead ? '#ff4444' : '#4444ff'} />
        </mesh>
        
        {/* Arms */}
        <mesh castShadow position={[-0.65, 0.75, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color={isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
        <mesh castShadow position={[0.65, 0.75, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color={isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
        
        {/* Legs */}
        <mesh castShadow position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial color={isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
        <mesh castShadow position={[0.25, 0, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial color={isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
      </group>
    </group>
  );
};

export default Player;