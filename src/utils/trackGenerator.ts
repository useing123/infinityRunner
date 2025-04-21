import { TrackSegment, Obstacle, Collectible, TrackSegmentDifficulty } from '../types/game';

// Generate a unique ID
const generateId = (): string => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Create a random obstacle
export const createRandomObstacle = (
  segmentId: string,
  zPosition: number,
  difficulty: TrackSegmentDifficulty
): Obstacle => {
  // Obstacle types distribution based on difficulty
  const obstacleTypes: ('barrier' | 'gap' | 'overhead')[] = 
    difficulty === 'easy' ? ['barrier', 'barrier', 'gap'] :
    difficulty === 'medium' ? ['barrier', 'gap', 'overhead'] :
    ['barrier', 'gap', 'overhead', 'overhead'];
  
  const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
  
  // Randomize lane placement
  const lane = [-1, 0, 1][Math.floor(Math.random() * 3)];
  
  // Scale obstacles based on difficulty
  const scaleModifier = 
    difficulty === 'easy' ? 0.8 :
    difficulty === 'medium' ? 1 : 1.2;
  
  return {
    id: `obstacle-${segmentId}-${generateId()}`,
    type,
    position: {
      x: lane * 2.5, // Translate lane index to world position
      y: 0,
      z: zPosition
    },
    lane,
    scale: {
      x: 1 * scaleModifier,
      y: 1 * scaleModifier,
      z: 1 * scaleModifier
    }
  };
};

// Create a random collectible
export const createRandomCollectible = (
  segmentId: string,
  zPosition: number
): Collectible => {
  // 10% chance for a powerup, 90% for coins
  const type = Math.random() < 0.1 ? 'powerup' : 'coin';
  
  // Randomize lane placement
  const lane = [-1, 0, 1][Math.floor(Math.random() * 3)];
  
  // Some collectibles should be placed in the air for jumping
  const isAirCollectible = Math.random() < 0.3;
  
  return {
    id: `collectible-${segmentId}-${generateId()}`,
    type,
    position: {
      x: lane * 2.5, // Translate lane index to world position
      y: isAirCollectible ? 1 : 0,
      z: zPosition
    },
    lane,
    collected: false
  };
};

// Generate obstacles for a track segment
export const generateObstacles = (
  segmentId: string,
  difficulty: TrackSegmentDifficulty,
  segmentLength: number,
  startZ: number
): Obstacle[] => {
  // Number of obstacles based on difficulty
  const obstacleCount = 
    difficulty === 'easy' ? 3 + Math.floor(Math.random() * 2) :
    difficulty === 'medium' ? 4 + Math.floor(Math.random() * 3) :
    6 + Math.floor(Math.random() * 4);
  
  const obstacles: Obstacle[] = [];
  
  // Minimum spacing between obstacles
  const minSpacing = segmentLength / (obstacleCount * 2);
  
  // Generate obstacles with spacing
  for (let i = 0; i < obstacleCount; i++) {
    const zPosition = startZ + (i + 0.5) * (segmentLength / obstacleCount) + 
      (Math.random() * minSpacing) - (minSpacing / 2);
    
    obstacles.push(createRandomObstacle(segmentId, zPosition, difficulty));
  }
  
  return obstacles;
};

// Generate collectibles for a track segment
export const generateCollectibles = (
  segmentId: string,
  segmentLength: number,
  startZ: number,
  obstacles: Obstacle[]
): Collectible[] => {
  // Number of collectibles
  const collectibleCount = 10 + Math.floor(Math.random() * 10);
  
  const collectibles: Collectible[] = [];
  
  // Generate collectibles with spacing
  for (let i = 0; i < collectibleCount; i++) {
    const zPosition = startZ + i * (segmentLength / collectibleCount);
    
    // Check if there's an obstacle at this position
    const hasObstacle = obstacles.some(obstacle => 
      Math.abs(obstacle.position.z - zPosition) < 1
    );
    
    // Only add collectible if there's no obstacle too close
    if (!hasObstacle) {
      collectibles.push(createRandomCollectible(segmentId, zPosition));
    }
  }
  
  return collectibles;
};

// Generate a complete track segment
export const generateTrackSegment = (
  difficulty: TrackSegmentDifficulty,
  zPosition: number,
  segmentLength: number
): TrackSegment => {
  const id = `segment-${generateId()}`;
  
  // Generate obstacles first
  const obstacles = generateObstacles(id, difficulty, segmentLength, zPosition);
  
  // Then generate collectibles, avoiding obstacle positions
  const collectibles = generateCollectibles(id, segmentLength, zPosition, obstacles);
  
  return {
    id,
    difficulty,
    position: {
      x: 0,
      y: 0,
      z: zPosition
    },
    obstacles,
    collectibles,
    length: segmentLength
  };
};