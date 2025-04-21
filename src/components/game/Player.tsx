import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore';
import { PlayerState } from '../../types/game';

const Player: React.FC = () => {
  const playerRef = useRef<THREE.Group>(null);
  const gameState = useGameStore((state) => state.gameState);
  const decrementLives = useGameStore((state) => state.decrementLives);
  
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: { x: 0, y: 0, z: 0 },
    lane: 0,
    isJumping: false,
    isSliding: false,
    isDead: false
  });
  
  // Lane positions
  const lanePositions = [-2.5, 0, 2.5];
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || playerState.isDead) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          if (playerState.lane > -1 && !playerState.isJumping && !playerState.isSliding) {
            setPlayerState(prev => ({ ...prev, lane: prev.lane - 1 }));
          }
          break;
        case 'ArrowRight':
          if (playerState.lane < 1 && !playerState.isJumping && !playerState.isSliding) {
            setPlayerState(prev => ({ ...prev, lane: prev.lane + 1 }));
          }
          break;
        case ' ': // Space key
          if (!playerState.isJumping && !playerState.isSliding) {
            jump();
          }
          break;
        case 's':
        case 'S':
          if (!playerState.isJumping && !playerState.isSliding) {
            slide();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerState]);
  
  // Jump animation
  const jump = () => {
    setPlayerState(prev => ({ ...prev, isJumping: true }));
    
    // Reset after jump animation
    setTimeout(() => {
      setPlayerState(prev => ({ ...prev, isJumping: false }));
    }, 800);
  };
  
  // Slide animation
  const slide = () => {
    setPlayerState(prev => ({ ...prev, isSliding: true }));
    
    // Reset after slide animation
    setTimeout(() => {
      setPlayerState(prev => ({ ...prev, isSliding: false }));
    }, 800);
  };
  
  // Handle collision
  const handleCollision = () => {
    if (playerState.isDead) return;
    
    setPlayerState(prev => ({ ...prev, isDead: true }));
    decrementLives();
    
    // Reset player state after collision
    setTimeout(() => {
      setPlayerState(prev => ({
        ...prev,
        isDead: false,
        isJumping: false,
        isSliding: false
      }));
    }, 1000);
  };
  
  // Update player movement
  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    // Update position based on current lane
    const targetX = lanePositions[playerState.lane + 1];
    playerRef.current.position.x = THREE.MathUtils.lerp(
      playerRef.current.position.x,
      targetX,
      delta * 10
    );
    
    // Update y position for jump
    if (playerState.isJumping) {
      // Enhanced jump curve
      const jumpProgress = (Date.now() % 800) / 800;
      const jumpHeight = Math.sin(jumpProgress * Math.PI) * 2.5;
      playerRef.current.position.y = jumpHeight;
    } else {
      // Smooth landing
      playerRef.current.position.y = THREE.MathUtils.lerp(
        playerRef.current.position.y,
        0,
        delta * 10
      );
    }
    
    // Update scale and rotation for slide
    if (playerState.isSliding) {
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
    if (gameState === 'playing' && !playerState.isDead) {
      // Enhanced run animation
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
    
    // Update player state position for collision detection
    setPlayerState(prev => ({
      ...prev,
      position: {
        x: playerRef.current!.position.x,
        y: playerRef.current!.position.y,
        z: playerRef.current!.position.z
      }
    }));
  });
  
  return (
    <group ref={playerRef} position={[0, 0, -5]} rotation={[0, 0, 0]}>
      {/* Enhanced player character */}
      <group scale={[0.5, 1, 0.5]}>
        {/* Body */}
        <mesh castShadow position={[0, 0.75, 0]}>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshStandardMaterial color={playerState.isDead ? '#ff4444' : '#4444ff'} />
        </mesh>
        
        {/* Head */}
        <mesh castShadow position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={playerState.isDead ? '#ff4444' : '#4444ff'} />
        </mesh>
        
        {/* Arms */}
        <mesh castShadow position={[-0.65, 0.75, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color={playerState.isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
        <mesh castShadow position={[0.65, 0.75, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color={playerState.isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
        
        {/* Legs */}
        <mesh castShadow position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial color={playerState.isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
        <mesh castShadow position={[0.25, 0, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial color={playerState.isDead ? '#ff2222' : '#2222ff'} />
        </mesh>
      </group>
    </group>
  );
};

export default Player;