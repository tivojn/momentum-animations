/**
 * Rocket Propulsion Animation
 * Demonstrates conservation of momentum in a real-world application
 * where ejected mass (exhaust) propels a rocket forward
 */

import animationsConfig from './config.js';

class RocketPropulsion {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      const canvasContainer = document.getElementById('rocket-animation');
      this.canvas = canvasContainer.querySelector('canvas');
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Animation properties
    this.config = animationsConfig.rocketPropulsion;
    this.isRunning = false;
    this.animationId = null;
    this.timeStep = 0.05; // seconds per frame
    this.scale = 20; // pixels per meter
    this.gravity = 9.8; // m/s²
    this.propellantUsed = 0; // kg
    
    // Initialize the rocket and particles
    this.rocket = null;
    this.exhaustParticles = [];
    this.resetSimulation();
    
    // Bind event handlers
    this.start = this.start.bind(this);
    this.reset = this.reset.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    
    // Initialize UI connections
    this.setupControls();
    this.updateMomentumDisplay();
  }
  
  setupControls() {
    // Get control inputs
    this.rocketMassInput = document.getElementById('rocket-mass');
    this.propellantMassInput = document.getElementById('rocket-propellant');
    this.exhaustVelocityInput = document.getElementById('rocket-exhaust-velocity');
    this.burnRateInput = document.getElementById('rocket-burn-rate');
    
    // Get buttons
    this.startButton = document.getElementById('rocket-start');
    this.resetButton = document.getElementById('rocket-reset');
    
    // Add event listeners
    if (this.startButton) {
      this.startButton.addEventListener('click', this.start);
    }
    
    if (this.resetButton) {
      this.resetButton.addEventListener('click', this.reset);
    }
    
    // Add input change handlers
    const inputs = [
      this.rocketMassInput, 
      this.propellantMassInput, 
      this.exhaustVelocityInput,
      this.burnRateInput
    ];
    
    inputs.forEach(input => {
      if (input) {
        input.addEventListener('change', () => {
          this.resetSimulation();
        });
      }
    });
  }
  
  resetSimulation() {
    // Get values from inputs or use defaults
    const dryMass = this.rocketMassInput ? 
      parseFloat(this.rocketMassInput.value) : 
      this.config.parameters.rocketMass.default;
      
    const propellantMass = this.propellantMassInput ? 
      parseFloat(this.propellantMassInput.value) : 
      this.config.parameters.propellantMass.default;
      
    const exhaustVelocity = this.exhaustVelocityInput ? 
      parseFloat(this.exhaustVelocityInput.value) : 
      this.config.parameters.exhaustVelocity.default;
      
    const burnRate = this.burnRateInput ? 
      parseFloat(this.burnRateInput.value) : 
      this.config.parameters.burnRate.default;
    
    // Reset propellant used
    this.propellantUsed = 0;
    
    // Create rocket
    this.rocket = {
      x: this.width / 2,
      y: this.height - 100,
      width: 40,
      height: 80,
      dryMass: dryMass,
      propellantMass: propellantMass,
      exhaustVelocity: exhaustVelocity,
      burnRate: burnRate,
      velocity: 0,
      acceleration: 0,
      color: '#3498db',
      isLaunched: false,
      trail: []
    };
    
    // Clear exhaust particles
    this.exhaustParticles = [];
    
    // Draw initial state
    this.render();
    
    // Update momentum display
    this.updateMomentumDisplay();
  }
  
  calculateMomentum() {
    const rocketMass = this.rocket.dryMass + this.rocket.propellantMass - this.propellantUsed;
    const rocketMomentum = rocketMass * this.rocket.velocity;
    
    // Calculate exhaust momentum (opposite direction)
    const exhaustMomentum = this.propellantUsed * -this.rocket.exhaustVelocity;
    
    return {
      rocket: rocketMomentum,
      exhaust: exhaustMomentum,
      total: rocketMomentum + exhaustMomentum
    };
  }
  
  updateMomentumDisplay() {
    const momentum = this.calculateMomentum();
    
    // Update UI display elements
    const rocketMomentumElement = document.getElementById('rocket-momentum');
    const exhaustMomentumElement = document.getElementById('exhaust-momentum');
    const totalMomentumElement = document.getElementById('rocket-total-momentum');
    
    if (rocketMomentumElement) {
      rocketMomentumElement.textContent = momentum.rocket.toFixed(2) + ' kg·m/s';
    }
    
    if (exhaustMomentumElement) {
      exhaustMomentumElement.textContent = momentum.exhaust.toFixed(2) + ' kg·m/s';
    }
    
    if (totalMomentumElement) {
      totalMomentumElement.textContent = momentum.total.toFixed(2) + ' kg·m/s';
    }
  }
  
  addExhaustParticle() {
    // Calculate how much propellant is used in this step
    const propellantBurned = this.rocket.burnRate * this.timeStep;
    
    // Only add particles if there's propellant left
    if (this.propellantUsed < this.rocket.propellantMass) {
      // Update propellant used
      this.propellantUsed += propellantBurned;
      
      // Ensure we don't use more than available
      if (this.propellantUsed > this.rocket.propellantMass) {
        this.propellantUsed = this.rocket.propellantMass;
      }
      
      // Calculate position at bottom center of rocket
      const exhaustX = this.rocket.x;
      const exhaustY = this.rocket.y + this.rocket.height / 2;
      
      // Add small variation to make it look more natural
      const velocityVariation = (Math.random() - 0.5) * 2; // -1 to 1
      const angleVariation = (Math.random() - 0.5) * 0.5; // -0.25 to 0.25 radians
      
      // Add multiple particles for a more dynamic effect
      const particleCount = 3;
      for (let i = 0; i < particleCount; i++) {
        // Each particle represents a fraction of the propellant
        const particleMass = propellantBurned / particleCount;
        
        // Create particle with velocity opposite to rocket but with slight variation
        this.exhaustParticles.push({
          x: exhaustX + (Math.random() - 0.5) * 10,
          y: exhaustY + (Math.random() - 0.5) * 5,
          radius: 3 + Math.random() * 3,
          velocity: -this.rocket.exhaustVelocity + velocityVariation,
          angle: Math.PI / 2 + angleVariation, // Downward with variation
          mass: particleMass,
          lifespan: 1.0, // 1 second lifespan
          color: `rgba(${200 + Math.random() * 55}, ${50 + Math.random() * 50}, 0, 1.0)`
        });
      }
    }
  }
  
  updateExhaustParticles() {
    // Update each particle
    for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
      const particle = this.exhaustParticles[i];
      
      // Update position based on velocity and angle
      particle.x += Math.cos(particle.angle) * particle.velocity * this.timeStep * this.scale;
      particle.y += Math.sin(particle.angle) * particle.velocity * this.timeStep * this.scale;
      
      // Apply gravity
      particle.angle = Math.atan2(
        Math.sin(particle.angle) * particle.velocity + this.gravity * this.timeStep,
        Math.cos(particle.angle) * particle.velocity
      );
      
      // Update lifespan
      particle.lifespan -= this.timeStep;
      
      // Remove expired particles
      if (particle.lifespan <= 0) {
        this.exhaustParticles.splice(i, 1);
      }
    }
  }
  
  updateRocket() {
    if (!this.rocket.isLaunched) {
      // Start launch when animation starts
      this.rocket.isLaunched = true;
    }
    
    // Calculate current rocket mass
    const currentMass = this.rocket.dryMass + this.rocket.propellantMass - this.propellantUsed;
    
    // Calculate thrust force (F = m * v)
    // Mass ejected per second * exhaust velocity
    const thrustForce = this.propellantUsed < this.rocket.propellantMass
      ? this.rocket.burnRate * this.rocket.exhaustVelocity
      : 0;
    
    // Calculate acceleration (F = m * a => a = F / m)
    // Include gravity
    this.rocket.acceleration = (thrustForce / currentMass) - this.gravity;
    
    // Update velocity
    this.rocket.velocity += this.rocket.acceleration * this.timeStep;
    
    // Update position
    this.rocket.y -= this.rocket.velocity * this.timeStep * this.scale;
    
    // Add position to trail for visualization
    if (this.rocket.trail.length % 5 === 0) { // Add every 5th point to avoid too many points
      this.rocket.trail.push({
        x: this.rocket.x,
        y: this.rocket.y,
        velocity: this.rocket.velocity
      });
      
      // Limit trail length
      if (this.rocket.trail.length > 100) {
        this.rocket.trail.shift();
      }
    }
  }
  
  update() {
    if (this.isRunning) {
      // Add exhaust particles
      this.addExhaustParticle();
      
      // Update rocket
      this.updateRocket();
      
      // Update exhaust particles
      this.updateExhaustParticles();
      
      // Update momentum display
      this.updateMomentumDisplay();
    }
    
    // Render the updated state
    this.render();
    
    // Continue animation if running
    if (this.isRunning) {
      this.animationId = requestAnimationFrame(this.update);
    }
  }
  
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background gradient (sky)
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    skyGradient.addColorStop(0, '#1a2980');
    skyGradient.addColorStop(1, '#26d0ce');
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw ground
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(0, this.height - 50, this.width, 50);
    
    // Draw rocket trail
    this.drawRocketTrail();
    
    // Draw exhaust particles
    this.drawExhaustParticles();
    
    // Draw rocket
    this.drawRocket();
    
    // Draw information panel
    this.drawInfoPanel();
  }
  
  drawRocket() {
    const rocket = this.rocket;
    
    // Save context for rotation
    this.ctx.save();
    this.ctx.translate(rocket.x, rocket.y);
    
    // Draw rocket body
    this.ctx.fillStyle = rocket.color;
    
    // Rocket body (rounded rectangle)
    this.ctx.beginPath();
    const radius = 5;
    this.ctx.moveTo(-rocket.width / 2 + radius, -rocket.height / 2);
    this.ctx.lineTo(rocket.width / 2 - radius, -rocket.height / 2);
    this.ctx.arcTo(rocket.width / 2, -rocket.height / 2, rocket.width / 2, -rocket.height / 2 + radius, radius);
    this.ctx.lineTo(rocket.width / 2, rocket.height / 2 - radius);
    this.ctx.arcTo(rocket.width / 2, rocket.height / 2, rocket.width / 2 - radius, rocket.height / 2, radius);
    this.ctx.lineTo(-rocket.width / 2 + radius, rocket.height / 2);
    this.ctx.arcTo(-rocket.width / 2, rocket.height / 2, -rocket.width / 2, rocket.height / 2 - radius, radius);
    this.ctx.lineTo(-rocket.width / 2, -rocket.height / 2 + radius);
    this.ctx.arcTo(-rocket.width / 2, -rocket.height / 2, -rocket.width / 2 + radius, -rocket.height / 2, radius);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw nose cone
    this.ctx.fillStyle = '#e74c3c';
    this.ctx.beginPath();
    this.ctx.moveTo(-rocket.width / 2, -rocket.height / 2);
    this.ctx.lineTo(rocket.width / 2, -rocket.height / 2);
    this.ctx.lineTo(0, -rocket.height / 2 - 20);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw fins
    this.ctx.fillStyle = '#2c3e50';
    
    // Left fin
    this.ctx.beginPath();
    this.ctx.moveTo(-rocket.width / 2, rocket.height / 4);
    this.ctx.lineTo(-rocket.width / 2 - 15, rocket.height / 2);
    this.ctx.lineTo(-rocket.width / 2, rocket.height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Right fin
    this.ctx.beginPath();
    this.ctx.moveTo(rocket.width / 2, rocket.height / 4);
    this.ctx.lineTo(rocket.width / 2 + 15, rocket.height / 2);
    this.ctx.lineTo(rocket.width / 2, rocket.height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw propellant tank indicator (if propellant remains)
    if (this.propellantUsed < this.rocket.propellantMass) {
      const propellantPercentage = (this.rocket.propellantMass - this.propellantUsed) / this.rocket.propellantMass;
      const tankHeight = rocket.height * 0.6;
      
      this.ctx.fillStyle = '#f39c12';
      this.ctx.fillRect(
        -rocket.width / 4, 
        -rocket.height / 4 + tankHeight * (1 - propellantPercentage),
        rocket.width / 2,
        tankHeight * propellantPercentage
      );
      
      // Tank border
      this.ctx.strokeStyle = '#2c3e50';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-rocket.width / 4, -rocket.height / 4, rocket.width / 2, tankHeight);
    }
    
    // Restore context
    this.ctx.restore();
  }
  
  drawExhaustParticles() {
    this.exhaustParticles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      
      // Set color with opacity based on lifespan
      const opacity = Math.min(1, particle.lifespan);
      const color = particle.color.replace(/[\d.]+\)$/, `${opacity})`);
      this.ctx.fillStyle = color;
      
      this.ctx.fill();
    });
  }
  
  drawRocketTrail() {
    if (this.rocket.trail.length < 2) return;
    
    // Draw path
    this.ctx.beginPath();
    this.ctx.moveTo(this.rocket.trail[0].x, this.rocket.trail[0].y);
    
    for (let i = 1; i < this.rocket.trail.length; i++) {
      this.ctx.lineTo(this.rocket.trail[i].x, this.rocket.trail[i].y);
    }
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw velocity indicators at intervals
    for (let i = 0; i < this.rocket.trail.length; i += 10) {
      if (i < this.rocket.trail.length) {
        const point = this.rocket.trail[i];
        
        // Skip if near the top or bottom of canvas (to avoid clutter)
        if (point.y < 30 || point.y > this.height - 30) continue;
        
        // Draw small indicator
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        
        // Label with velocity
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${point.velocity.toFixed(1)} m/s`, point.x + 10, point.y);
      }
    }
  }
  
  drawInfoPanel() {
    // Current rocket data
    const currentMass = this.rocket.dryMass + this.rocket.propellantMass - this.propellantUsed;
    const propellantRemaining = this.rocket.propellantMass - this.propellantUsed;
    const propellantPercentage = (propellantRemaining / this.rocket.propellantMass) * 100;
    
    // Draw panel background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(10, 10, 220, 130);
    
    // Draw data
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    
    this.ctx.fillText(`Velocity: ${this.rocket.velocity.toFixed(2)} m/s`, 20, 30);
    this.ctx.fillText(`Acceleration: ${this.rocket.acceleration.toFixed(2)} m/s²`, 20, 50);
    this.ctx.fillText(`Current Mass: ${currentMass.toFixed(2)} kg`, 20, 70);
    this.ctx.fillText(`Propellant: ${propellantRemaining.toFixed(2)} kg (${propellantPercentage.toFixed(1)}%)`, 20, 90);
    this.ctx.fillText(`Altitude: ${((this.height - 50 - this.rocket.y) / this.scale).toFixed(2)} m`, 20, 110);
    
    // Draw time scale
    this.ctx.fillText(`Time Scale: 1 second = ${this.timeStep * 1000} milliseconds`, 20, 130);
  }
  
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      if (this.startButton) {
        this.startButton.textContent = 'Pause';
      }
      this.update();
    } else {
      this.isRunning = false;
      if (this.startButton) {
        this.startButton.textContent = 'Resume';
      }
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }
  
  reset() {
    // Stop animation
    this.isRunning = false;
    if (this.startButton) {
      this.startButton.textContent = 'Start';
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Reset simulation
    this.resetSimulation();
  }
}

export function initRocketPropulsion() {
  const animation = new RocketPropulsion('rocket-animation');
  return animation;
}

export default RocketPropulsion;