/**
 * One-dimensional Elastic Collision Animation
 * Demonstrates conservation of momentum in a perfectly elastic collision
 */

import animationsConfig from './config.js';

class ElasticCollision1D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      const canvasContainer = document.getElementById('elastic-1d-animation');
      this.canvas = canvasContainer.querySelector('canvas');
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Animation properties
    this.config = animationsConfig.elasticCollision1D;
    this.isRunning = false;
    this.animationId = null;
    this.timeStep = 0.05; // seconds per frame
    this.scale = 50; // pixels per meter
    this.boundaryPadding = 50; // padding from canvas edges
    
    // Physical objects
    this.objects = [];
    this.resetObjects();
    
    // Bind event handlers
    this.start = this.start.bind(this);
    this.reset = this.reset.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.calculateCollision = this.calculateCollision.bind(this);
    
    // Initialize UI connections
    this.setupControls();
    this.updateMomentumDisplay();
  }
  
  setupControls() {
    // Get control inputs
    this.mass1Input = document.getElementById('elastic-mass1');
    this.mass2Input = document.getElementById('elastic-mass2');
    this.velocity1Input = document.getElementById('elastic-velocity1');
    this.velocity2Input = document.getElementById('elastic-velocity2');
    
    // Get buttons
    this.startButton = document.getElementById('elastic-start');
    this.resetButton = document.getElementById('elastic-reset');
    
    // Add event listeners
    if (this.startButton) {
      this.startButton.addEventListener('click', this.start);
    }
    
    if (this.resetButton) {
      this.resetButton.addEventListener('click', this.reset);
    }
    
    // Add input change handlers
    const inputs = [this.mass1Input, this.mass2Input, this.velocity1Input, this.velocity2Input];
    inputs.forEach(input => {
      if (input) {
        input.addEventListener('change', () => {
          this.resetObjects();
          this.updateMomentumDisplay();
        });
      }
    });
  }
  
  resetObjects() {
    // Get values from inputs or use defaults
    const mass1 = this.mass1Input ? parseFloat(this.mass1Input.value) : this.config.parameters.mass1.default;
    const mass2 = this.mass2Input ? parseFloat(this.mass2Input.value) : this.config.parameters.mass2.default;
    const velocity1 = this.velocity1Input ? parseFloat(this.velocity1Input.value) : this.config.parameters.velocity1.default;
    const velocity2 = this.velocity2Input ? parseFloat(this.velocity2Input.value) : this.config.parameters.velocity2.default;
    
    // Calculate sizes based on mass (for visual representation)
    const radius1 = 10 + mass1 * 3;
    const radius2 = 10 + mass2 * 3;
    
    // Calculate initial positions
    const centerY = this.height / 2;
    let x1, x2;
    
    // Position objects based on their velocities to ensure they will collide
    if (velocity1 > 0 && velocity2 < 0) {
      // Objects moving toward each other
      x1 = this.width * 0.25;
      x2 = this.width * 0.75;
    } else if (velocity1 > velocity2) {
      // First object will catch up to second
      x1 = this.boundaryPadding;
      x2 = this.width / 2;
    } else {
      // Objects moving apart or second faster than first
      x1 = this.width / 3;
      x2 = this.width * 2 / 3;
    }
    
    // Create the objects
    this.objects = [
      {
        x: x1,
        y: centerY,
        radius: radius1,
        mass: mass1,
        velocity: velocity1,
        color: '#3498db',
        initialX: x1,
        initialVelocity: velocity1,
        hasCollided: false
      },
      {
        x: x2,
        y: centerY,
        radius: radius2,
        mass: mass2,
        velocity: velocity2,
        color: '#e74c3c',
        initialX: x2,
        initialVelocity: velocity2,
        hasCollided: false
      }
    ];
    
    // Draw initial state
    this.render();
  }
  
  calculateMomentum(object) {
    return object.mass * object.velocity;
  }
  
  updateMomentumDisplay() {
    // Calculate momentums
    const momentum1Before = this.calculateMomentum(this.objects[0]);
    const momentum2Before = this.calculateMomentum(this.objects[1]);
    const totalBefore = momentum1Before + momentum2Before;
    
    // Update UI display elements
    const p1BeforeElement = document.getElementById('elastic-p1-before');
    const p2BeforeElement = document.getElementById('elastic-p2-before');
    const totalBeforeElement = document.getElementById('elastic-total-before');
    
    if (p1BeforeElement) p1BeforeElement.textContent = momentum1Before.toFixed(2) + ' kg·m/s';
    if (p2BeforeElement) p2BeforeElement.textContent = momentum2Before.toFixed(2) + ' kg·m/s';
    if (totalBeforeElement) totalBeforeElement.textContent = totalBefore.toFixed(2) + ' kg·m/s';
    
    // After collision values will be updated when collision occurs
  }
  
  calculateCollision() {
    const obj1 = this.objects[0];
    const obj2 = this.objects[1];
    
    // Calculate final velocities using elastic collision formula
    const v1Final = ((obj1.mass - obj2.mass) * obj1.velocity + 2 * obj2.mass * obj2.velocity) / (obj1.mass + obj2.mass);
    const v2Final = ((obj2.mass - obj1.mass) * obj2.velocity + 2 * obj1.mass * obj1.velocity) / (obj1.mass + obj2.mass);
    
    obj1.velocity = v1Final;
    obj2.velocity = v2Final;
    
    // Mark as collided
    obj1.hasCollided = true;
    obj2.hasCollided = true;
    
    // Update momentum display after collision
    const momentum1After = this.calculateMomentum(obj1);
    const momentum2After = this.calculateMomentum(obj2);
    const totalAfter = momentum1After + momentum2After;
    
    // Update UI display elements
    const p1AfterElement = document.getElementById('elastic-p1-after');
    const p2AfterElement = document.getElementById('elastic-p2-after');
    const totalAfterElement = document.getElementById('elastic-total-after');
    
    if (p1AfterElement) p1AfterElement.textContent = momentum1After.toFixed(2) + ' kg·m/s';
    if (p2AfterElement) p2AfterElement.textContent = momentum2After.toFixed(2) + ' kg·m/s';
    if (totalAfterElement) totalAfterElement.textContent = totalAfter.toFixed(2) + ' kg·m/s';
  }
  
  checkCollision() {
    const obj1 = this.objects[0];
    const obj2 = this.objects[1];
    
    // Calculate distance between centers
    const distance = Math.abs(obj1.x - obj2.x);
    const minDistance = obj1.radius + obj2.radius;
    
    // Check if objects are colliding and haven't collided before
    if (distance <= minDistance && !obj1.hasCollided && !obj2.hasCollided) {
      // Move objects apart to prevent sticking
      const overlap = minDistance - distance;
      if (obj1.x < obj2.x) {
        obj1.x -= overlap / 2;
        obj2.x += overlap / 2;
      } else {
        obj1.x += overlap / 2;
        obj2.x -= overlap / 2;
      }
      
      // Calculate new velocities
      this.calculateCollision();
    }
    
    // Check for boundary collisions
    this.objects.forEach(obj => {
      // Left boundary
      if (obj.x - obj.radius < this.boundaryPadding) {
        obj.x = this.boundaryPadding + obj.radius;
        obj.velocity = -obj.velocity; // Reverse direction
      }
      
      // Right boundary
      if (obj.x + obj.radius > this.width - this.boundaryPadding) {
        obj.x = this.width - this.boundaryPadding - obj.radius;
        obj.velocity = -obj.velocity; // Reverse direction
      }
    });
  }
  
  update() {
    // Update positions based on velocities
    this.objects.forEach(obj => {
      obj.x += obj.velocity * this.scale * this.timeStep;
    });
    
    // Check for collisions
    this.checkCollision();
    
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
    
    // Draw floor line
    this.ctx.beginPath();
    this.ctx.moveTo(this.boundaryPadding, this.height / 2 + 50);
    this.ctx.lineTo(this.width - this.boundaryPadding, this.height / 2 + 50);
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw boundary walls
    this.ctx.beginPath();
    this.ctx.moveTo(this.boundaryPadding, this.height / 2 - 50);
    this.ctx.lineTo(this.boundaryPadding, this.height / 2 + 50);
    this.ctx.moveTo(this.width - this.boundaryPadding, this.height / 2 - 50);
    this.ctx.lineTo(this.width - this.boundaryPadding, this.height / 2 + 50);
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw velocity vectors
    this.objects.forEach(obj => {
      // Draw velocity vector
      const vectorLength = obj.velocity * 5; // Scale for visualization
      this.ctx.beginPath();
      this.ctx.moveTo(obj.x, obj.y - obj.radius - 5);
      this.ctx.lineTo(obj.x + vectorLength, obj.y - obj.radius - 5);
      
      // Draw arrowhead
      if (Math.abs(vectorLength) > 2) {
        const arrowSize = 5;
        const arrowDirection = Math.sign(vectorLength);
        this.ctx.lineTo(obj.x + vectorLength - arrowSize * arrowDirection, obj.y - obj.radius - 5 - arrowSize);
        this.ctx.moveTo(obj.x + vectorLength, obj.y - obj.radius - 5);
        this.ctx.lineTo(obj.x + vectorLength - arrowSize * arrowDirection, obj.y - obj.radius - 5 + arrowSize);
      }
      
      this.ctx.strokeStyle = obj.hasCollided ? '#2ecc71' : '#34495e';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Add velocity text
      this.ctx.fillStyle = '#34495e';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(obj.velocity.toFixed(1) + ' m/s', obj.x, obj.y - obj.radius - 15);
    });
    
    // Draw objects
    this.objects.forEach(obj => {
      this.ctx.beginPath();
      this.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = obj.color;
      this.ctx.fill();
      
      // Draw mass label in center of object
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(obj.mass + ' kg', obj.x, obj.y);
    });
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
    
    // Reset objects
    this.resetObjects();
    
    // Reset momentum display
    this.updateMomentumDisplay();
    
    // Reset collision indicator
    this.objects.forEach(obj => {
      obj.hasCollided = false;
    });
    
    // Clear "after collision" displays
    const p1AfterElement = document.getElementById('elastic-p1-after');
    const p2AfterElement = document.getElementById('elastic-p2-after');
    const totalAfterElement = document.getElementById('elastic-total-after');
    
    if (p1AfterElement) p1AfterElement.textContent = '— kg·m/s';
    if (p2AfterElement) p2AfterElement.textContent = '— kg·m/s';
    if (totalAfterElement) totalAfterElement.textContent = '— kg·m/s';
  }
}

export function initElasticCollision1D() {
  const animation = new ElasticCollision1D('elastic-1d-animation');
  return animation;
}

export default ElasticCollision1D;