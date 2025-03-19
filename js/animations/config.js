/**
 * Animation Configuration
 * 
 * Defines settings and parameters for all animations
 */

const animationsConfig = {
  // Global settings
  global: {
    fps: 60,
    scale: 1.0,
    objectSize: 20,
    debugMode: false
  },
  
  // 1D Elastic Collision
  elastic1D: {
    canvasId: 'elastic-1d-animation',
    floor: 0.8,
    gravity: 0,
    friction: 0.0,
    restitution: 1.0,
    animationSpeed: 1.0
  },
  
  // 1D Inelastic Collision
  inelastic1D: {
    canvasId: 'inelastic-1d-animation',
    floor: 0.8,
    gravity: 0,
    friction: 0.0,
    restitution: 0.0, // completely inelastic
    animationSpeed: 1.0
  },
  
  // 2D Collision
  collision2D: {
    canvasId: 'collision-2d-animation',
    gravity: 0,
    friction: 0.0,
    restitution: 0.9,
    animationSpeed: 0.8,
    worldBounds: true
  },
  
  // Explosion
  explosion: {
    canvasId: 'explosion-animation',
    gravity: 0.1,
    friction: 0.0,
    particleCount: 20,
    explosionForce: 3.0,
    animationSpeed: 1.0
  },
  
  // Rocket Propulsion
  rocketPropulsion: {
    canvasId: 'rocket-animation',
    gravity: 0.2,
    thrust: 0.05,
    fuel: 100,
    particleCount: 15,
    animationSpeed: 1.0
  }
};

export default animationsConfig;