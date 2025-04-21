import { PlayerState, Obstacle, Collectible } from '../types/game';

// Check if player collides with an obstacle
export const checkObstacleCollision = (
  playerState: PlayerState,
  obstacle: Obstacle
): boolean => {
  // Simple collision detection based on lanes and position
  const sameLineOrLane = playerState.lane === obstacle.lane;
  
  // Z-axis proximity (depth)
  const zDistance = Math.abs(playerState.position.z - obstacle.position.z);
  const zCollision = zDistance < 1;
  
  // Check collision specific to obstacle type
  switch (obstacle.type) {
    case 'barrier':
      // Barrier collision: same lane, close Z, not jumping
      return sameLineOrLane && zCollision && !playerState.isJumping;
      
    case 'overhead':
      // Overhead collision: same lane, close Z, jumping (not sliding)
      return sameLineOrLane && zCollision && playerState.isJumping && !playerState.isSliding;
      
    case 'gap':
      // Gap collision: same lane, close Z, not jumping and not sliding
      return sameLineOrLane && zCollision && !playerState.isJumping && !playerState.isSliding;
      
    default:
      return false;
  }
};

// Check if player collects a collectible
export const checkCollectibleCollection = (
  playerState: PlayerState,
  collectible: Collectible
): boolean => {
  // Already collected
  if (collectible.collected) return false;
  
  // Same lane check
  const sameLane = playerState.lane === collectible.lane;
  
  // Z-axis proximity (depth)
  const zDistance = Math.abs(playerState.position.z - collectible.position.z);
  const zCollision = zDistance < 1;
  
  // Y-axis check (for jumping collectibles)
  const yCollision = 
    (collectible.position.y <= 0.5 && !playerState.isJumping) || // Ground-level collectibles
    (collectible.position.y > 0.5 && playerState.isJumping);     // Air collectibles
  
  return sameLane && zCollision && yCollision;
};