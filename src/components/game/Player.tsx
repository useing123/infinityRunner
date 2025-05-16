import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../../store/gameStore';
import { PlayerState } from '../../types/game';

// Create shared materials to reduce GPU overhead
const PLAYER_BODY_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#4444ff',
  roughness: 0.7,
  metalness: 0.3,
  emissive: '#2222ff',
  emissiveIntensity: 0.3
});

const PLAYER_BODY_DEAD_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#ff4444',
  roughness: 0.7,
  metalness: 0.3,
  emissive: '#ff2222',
  emissiveIntensity: 0.3
});

const PLAYER_LIMB_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#2222ff',
  roughness: 0.7,
  metalness: 0.3
});

const PLAYER_LIMB_DEAD_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#ff2222',
  roughness: 0.7,
  metalness: 0.3
});

const EYE_WHITE_MATERIAL = new THREE.MeshStandardMaterial({ color: 'white' });
const EYE_BLACK_MATERIAL = new THREE.MeshStandardMaterial({ color: 'black' });

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
  
  // Reduce update frequency of glow for better performance
  const [glowIntensity, setGlowIntensity] = useState(0.2);
  const lastGlowUpdate = useRef(0);
  
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
        case 'ArrowUp':
          if (!isJumping && !isSliding) {
            newIsJumping = true;
          }
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
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
  
  // Update player movement with performance optimization
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
    
    // Update rotation for run animation - only if playing and not too many frames have passed
    if (gameState === 'playing' && !isDead && state.clock.elapsedTime - lastGlowUpdate.current > 0.1) {
      const runSpeed = 12;
      const time = state.clock.getElapsedTime();
      
      // Only animate limbs if we have proper structure and it's time to update
      if (playerRef.current.children[0]) {
        // Leg animation - less frequent updates
        const legs = playerRef.current.children[0].children.slice(-2);
        legs.forEach((leg, i) => {
          if (leg instanceof THREE.Mesh) {
            leg.position.z = Math.sin(time * runSpeed + (i * Math.PI)) * 0.2;
          }
        });
      
        // Arm animation - less frequent updates
        const arms = playerRef.current.children[0].children.slice(2, 4);
        arms.forEach((arm, i) => {
          if (arm instanceof THREE.Mesh) {
            arm.position.z = Math.sin(time * runSpeed + (i * Math.PI)) * 0.2;
          }
        });
      }
      
      // Update glow only periodically
      lastGlowUpdate.current = state.clock.elapsedTime;
      const newIntensity = 0.2 + (Math.sin(time * 2) + 1) * 0.15;
      setGlowIntensity(newIntensity);
    }
    
    // Update player state position in the store - throttle this for performance
    if (state.clock.elapsedTime - lastGlowUpdate.current > 0.1) {
      updatePlayerState({
        position: {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y,
          z: playerRef.current.position.z
        },
      });
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
      {/* Glow effect with increased intensity for better visibility */}
      <pointLight
        position={[0, 1, 0]}
        intensity={glowIntensity * 1.2}
        distance={4}
        color={isDead ? '#ff6666' : '#6688ff'}
      />
      
      {/* Enhanced player character */}
      <group scale={[0.5, 1, 0.5]}>
        {/* Body */}
        <mesh castShadow position={[0, 0.75, 0]}>
          <boxGeometry args={[1, 1.5, 1]} />
          <primitive object={isDead ? PLAYER_BODY_DEAD_MATERIAL : PLAYER_BODY_MATERIAL} />
        </mesh>
        
        {/* Head */}
        <mesh castShadow position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <primitive object={isDead ? PLAYER_BODY_DEAD_MATERIAL : PLAYER_BODY_MATERIAL} />
        </mesh>
        
        {/* Arms */}
        <mesh castShadow position={[-0.65, 0.75, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <primitive object={isDead ? PLAYER_LIMB_DEAD_MATERIAL : PLAYER_LIMB_MATERIAL} />
        </mesh>
        <mesh castShadow position={[0.65, 0.75, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <primitive object={isDead ? PLAYER_LIMB_DEAD_MATERIAL : PLAYER_LIMB_MATERIAL} />
        </mesh>
        
        {/* Legs */}
        <mesh castShadow position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <primitive object={isDead ? PLAYER_LIMB_DEAD_MATERIAL : PLAYER_LIMB_MATERIAL} />
        </mesh>
        <mesh castShadow position={[0.25, 0, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <primitive object={isDead ? PLAYER_LIMB_DEAD_MATERIAL : PLAYER_LIMB_MATERIAL} />
        </mesh>
        
        {/* Add eyes for more character */}
        <mesh position={[-0.2, 1.85, 0.35]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <primitive object={EYE_WHITE_MATERIAL} />
        </mesh>
        <mesh position={[0.2, 1.85, 0.35]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <primitive object={EYE_WHITE_MATERIAL} />
        </mesh>
        
        {/* Eye pupils */}
        <mesh position={[-0.2, 1.85, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <primitive object={EYE_BLACK_MATERIAL} />
        </mesh>
        <mesh position={[0.2, 1.85, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <primitive object={EYE_BLACK_MATERIAL} />
        </mesh>
      </group>
    </group>
  );
};

export default Player;