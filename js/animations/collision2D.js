/**
 * Two-dimensional Collision Animation
 * Demonstrates conservation of momentum in two dimensions with vector components
 */

import animationsConfig from './config.js';

class Collision2D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      const canvasContainer = document.getElementById('collision-2d-animation');
      this.canvas = canvasContainer.querySelector('canvas');
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Animation properties
    this.config = animationsConfig.collision2D;
    this.isRunning = false;
    this.animationId = null;
    this.timeStep = 0.05; // seconds per frame
    this.scale = 15; // pixels per meter (smaller than 1D to fit 2D space)
    this.boundaryPadding = 20; // padding from canvas edges
    
    // Physical objects
    this.objects = [];
    this.trajectories = []; // To store trajectory lines
    this.hasCollided = false;
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
    this.mass1Input = document.getElementById('collision2d-mass1');
    this.mass2Input = document.getElementById('collision2d-mass2');
    this.velocity1Input = document.getElementById('collision2d-velocity1');
    this.angle1Input = document.getElementById('collision2d-angle1');
    this.velocity2Input = document.getElementById('collision2d-velocity2');
    this.angle2Input = document.getElementById('collision2d-angle2');
    
    // Get buttons
    this.startButton = document.getElementById('collision2d-start');
    this.resetButton = document.getElementById('collision2d-reset');
    
    // Add event listeners
    if (this.startButton) {
      this.startButton.addEventListener('click', this.start);
    }
    
    if (this.resetButton) {
      this.resetButton.addEventListener('click', this.reset);
    }
    
    // Add input change handlers
    const inputs = [
      this.mass1Input, this.mass2Input, 
      this.velocity1Input, this.angle1Input,
      this.velocity2Input, this.angle2Input
    ];
    inputs.forEach(input => {
      if (input) {
        input.addEventListener('change', () => {
          this.resetObjects();
          this.updateMomentumDisplay();
        });
      }
    });
  }
  
  // Convert angle in degrees to radians
  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  // Convert radians to degrees
  toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  
  resetObjects() {
    // Get values from inputs or use defaults
    const mass1 = this.mass1Input ? parseFloat(this.mass1Input.value) : this.config.parameters.mass1.default;
    const mass2 = this.mass2Input ? parseFloat(this.mass2Input.value) : this.config.parameters.mass2.default;
    
    const velocity1 = this.velocity1Input ? parseFloat(this.velocity1Input.value) : this.config.parameters.velocity1.default;
    const angle1 = this.angle1Input ? parseFloat(this.angle1Input.value) : this.config.parameters.angle1.default;
    
    const velocity2 = this.velocity2Input ? parseFloat(this.velocity2Input.value) : this.config.parameters.velocity2.default;
    const angle2 = this.angle2Input ? parseFloat(this.angle2Input.value) : this.config.parameters.angle2.default;
    
    // Calculate vector components
    const vx1 = velocity1 * Math.cos(this.toRadians(angle1));
    const vy1 = velocity1 * Math.sin(this.toRadians(angle1));
    
    const vx2 = velocity2 * Math.cos(this.toRadians(angle2));
    const vy2 = velocity2 * Math.sin(this.toRadians(angle2));
    
    // Calculate sizes based on mass (for visual representation)
    const radius1 = 10 + mass1 * 2;
    const radius2 = 10 + mass2 * 2;
    
    // Calculate initial positions
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Position objects to ensure they will collide
    // Object 1 starts from left side of canvas
    const x1 = centerX - 100;
    const y1 = centerY;
    
    // Object 2 starts from position that ensures collision
    const x2 = centerX + 100;
    const y2 = centerY;
    
    // Create the objects
    this.objects = [
      {
        x: x1,
        y: y1,
        radius: radius1,
        mass: mass1,
        vx: vx1,
        vy: vy1,
        speed: velocity1,
        angle: angle1,
        color: '#3498db',
        initialX: x1,
        initialY: y1,
        initialVx: vx1,
        initialVy: vy1
      },
      {
        x: x2,
        y: y2,
        radius: radius2,
        mass: mass2,
        vx: vx2,
        vy: vy2,
        speed: velocity2,
        angle: angle2,
        color: '#e74c3c',
        initialX: x2,
        initialY: y2,
        initialVx: vx2,
        initialVy: vy2
      }
    ];
    
    // Reset collision flag and trajectories
    this.hasCollided = false;
    this.trajectories = [];
    
    // Draw initial state
    this.render();
  }
  
  calculateMomentum(object) {
    // Calculate momentum components
    const px = object.mass * object.vx;
    const py = object.mass * object.vy;
    
    // Calculate total momentum magnitude
    return {
      px: px,
      py: py,
      magnitude: Math.sqrt(px * px + py * py)
    };
  }
  
  updateMomentumDisplay() {
    // Calculate momentums
    const momentum1 = this.calculateMomentum(this.objects[0]);
    const momentum2 = this.calculateMomentum(this.objects[1]);
    
    // Calculate total momentum components
    const totalPx = momentum1.px + momentum2.px;
    const totalPy = momentum1.py + momentum2.py;
    const totalMagnitude = Math.sqrt(totalPx * totalPx + totalPy * totalPy);
    
    // Update UI display elements
    const p1xBeforeElement = document.getElementById('collision2d-p1x-before');
    const p1yBeforeElement = document.getElementById('collision2d-p1y-before');
    const p1MagBeforeElement = document.getElementById('collision2d-p1-mag-before');
    
    const p2xBeforeElement = document.getElementById('collision2d-p2x-before');
    const p2yBeforeElement = document.getElementById('collision2d-p2y-before');
    const p2MagBeforeElement = document.getElementById('collision2d-p2-mag-before');
    
    const totalPxBeforeElement = document.getElementById('collision2d-total-px-before');
    const totalPyBeforeElement = document.getElementById('collision2d-total-py-before');
    const totalMagBeforeElement = document.getElementById('collision2d-total-mag-before');
    
    if (p1xBeforeElement) p1xBeforeElement.textContent = momentum1.px.toFixed(2) + ' kg·m/s';
    if (p1yBeforeElement) p1yBeforeElement.textContent = momentum1.py.toFixed(2) + ' kg·m/s';
    if (p1MagBeforeElement) p1MagBeforeElement.textContent = momentum1.magnitude.toFixed(2) + ' kg·m/s';
    
    if (p2xBeforeElement) p2xBeforeElement.textContent = momentum2.px.toFixed(2) + ' kg·m/s';
    if (p2yBeforeElement) p2yBeforeElement.textContent = momentum2.py.toFixed(2) + ' kg·m/s';
    if (p2MagBeforeElement) p2MagBeforeElement.textContent = momentum2.magnitude.toFixed(2) + ' kg·m/s';
    
    if (totalPxBeforeElement) totalPxBeforeElement.textContent = totalPx.toFixed(2) + ' kg·m/s';
    if (totalPyBeforeElement) totalPyBeforeElement.textContent = totalPy.toFixed(2) + ' kg·m/s';
    if (totalMagBeforeElement) totalMagBeforeElement.textContent = totalMagnitude.toFixed(2) + ' kg·m/s';
  }
  
  updateMomentumAfterCollision() {
    // Calculate momentums after collision
    const momentum1 = this.calculateMomentum(this.objects[0]);
    const momentum2 = this.calculateMomentum(this.objects[1]);
    
    // Calculate total momentum components
    const totalPx = momentum1.px + momentum2.px;
    const totalPy = momentum1.py + momentum2.py;
    const totalMagnitude = Math.sqrt(totalPx * totalPx + totalPy * totalPy);
    
    // Update UI display elements
    const p1xAfterElement = document.getElementById('collision2d-p1x-after');
    const p1yAfterElement = document.getElementById('collision2d-p1y-after');
    const p1MagAfterElement = document.getElementById('collision2d-p1-mag-after');
    
    const p2xAfterElement = document.getElementById('collision2d-p2x-after');
    const p2yAfterElement = document.getElementById('collision2d-p2y-after');
    const p2MagAfterElement = document.getElementById('collision2d-p2-mag-after');
    
    const totalPxAfterElement = document.getElementById('collision2d-total-px-after');
    const totalPyAfterElement = document.getElementById('collision2d-total-py-after');
    const totalMagAfterElement = document.getElementById('collision2d-total-mag-after');
    
    if (p1xAfterElement) p1xAfterElement.textContent = momentum1.px.toFixed(2) + ' kg·m/s';
    if (p1yAfterElement) p1yAfterElement.textContent = momentum1.py.toFixed(2) + ' kg·m/s';
    if (p1MagAfterElement) p1MagAfterElement.textContent = momentum1.magnitude.toFixed(2) + ' kg·m/s';
    
    if (p2xAfterElement) p2xAfterElement.textContent = momentum2.px.toFixed(2) + ' kg·m/s';
    if (p2yAfterElement) p2yAfterElement.textContent = momentum2.py.toFixed(2) + ' kg·m/s';
    if (p2MagAfterElement) p2MagAfterElement.textContent = momentum2.magnitude.toFixed(2) + ' kg·m/s';
    
    if (totalPxAfterElement) totalPxAfterElement.textContent = totalPx.toFixed(2) + ' kg·m/s';
    if (totalPyAfterElement) totalPyAfterElement.textContent = totalPy.toFixed(2) + ' kg·m/s';
    if (totalMagAfterElement) totalMagAfterElement.textContent = totalMagnitude.toFixed(2) + ' kg·m/s';
  }
  
  calculateCollision() {
    const obj1 = this.objects[0];
    const obj2 = this.objects[1];
    
    // Calculate vector from center of obj1 to center of obj2
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalized collision vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Tangent vector (perpendicular to collision vector)
    const tx = -ny;
    const ty = nx;
    
    // Project velocities onto normal and tangent directions
    const v1n = obj1.vx * nx + obj1.vy * ny;  // Velocity of first object in normal direction
    const v1t = obj1.vx * tx + obj1.vy * ty;  // Velocity of first object in tangent direction
    
    const v2n = obj2.vx * nx + obj2.vy * ny;  // Velocity of second object in normal direction
    const v2t = obj2.vx * tx + obj2.vy * ty;  // Velocity of second object in tangent direction
    
    // Calculate new normal velocities (tangential velocities remain the same)
    // Using one-dimensional elastic collision formula
    const m1 = obj1.mass;
    const m2 = obj2.mass;
    
    const v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
    const v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);
    
    // Convert back to cartesian coordinates
    obj1.vx = v1nAfter * nx + v1t * tx;
    obj1.vy = v1nAfter * ny + v1t * ty;
    
    obj2.vx = v2nAfter * nx + v2t * tx;
    obj2.vy = v2nAfter * ny + v2t * ty;
    
    // Update speed and angle (for display purposes)
    obj1.speed = Math.sqrt(obj1.vx * obj1.vx + obj1.vy * obj1.vy);
    obj1.angle = this.toDegrees(Math.atan2(obj1.vy, obj1.vx));
    
    obj2.speed = Math.sqrt(obj2.vx * obj2.vx + obj2.vy * obj2.vy);
    obj2.angle = this.toDegrees(Math.atan2(obj2.vy, obj2.vx));
    
    // Mark as collided
    this.hasCollided = true;
    
    // Add current position to trajectory
    this.addTrajectoryPoints(obj1, obj2);
    
    // Update momentum display
    this.updateMomentumAfterCollision();
  }
  
  checkCollision() {
    const obj1 = this.objects[0];
    const obj2 = this.objects[1];
    
    // Calculate distance between centers
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = obj1.radius + obj2.radius;
    
    // Check if objects are colliding and haven't collided before
    if (distance <= minDistance && !this.hasCollided) {
      // Move objects apart to prevent sticking
      const overlap = minDistance - distance;
      const overlapX = (overlap * dx) / distance / 2;
      const overlapY = (overlap * dy) / distance / 2;
      
      obj1.x -= overlapX;
      obj1.y -= overlapY;
      obj2.x += overlapX;
      obj2.y += overlapY;
      
      // Calculate new velocities
      this.calculateCollision();
    }
  }
  
  addTrajectoryPoints(obj1, obj2) {
    // Add trajectory points for both objects
    this.trajectories.push({
      x1: obj1.x,
      y1: obj1.y,
      x2: obj2.x,
      y2: obj2.y,
      isCollision: this.hasCollided
    });
    
    // Limit the number of trajectory points to avoid cluttering
    if (this.trajectories.length > 100) {
      this.trajectories.shift();
    }
  }
  
  checkBoundaryCollision(obj) {
    let collided = false;
    
    // Left boundary
    if (obj.x - obj.radius < this.boundaryPadding) {
      obj.x = this.boundaryPadding + obj.radius;
      obj.vx = -obj.vx;
      collided = true;
    }
    
    // Right boundary
    if (obj.x + obj.radius > this.width - this.boundaryPadding) {
      obj.x = this.width - this.boundaryPadding - obj.radius;
      obj.vx = -obj.vx;
      collided = true;
    }
    
    // Top boundary
    if (obj.y - obj.radius < this.boundaryPadding) {
      obj.y = this.boundaryPadding + obj.radius;
      obj.vy = -obj.vy;
      collided = true;
    }
    
    // Bottom boundary
    if (obj.y + obj.radius > this.height - this.boundaryPadding) {
      obj.y = this.height - this.boundaryPadding - obj.radius;
      obj.vy = -obj.vy;
      collided = true;
    }
    
    // Update speed and angle if collided with boundary
    if (collided) {
      obj.speed = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy);
      obj.angle = this.toDegrees(Math.atan2(obj.vy, obj.vx));
    }
    
    return collided;
  }
  
  update() {
    // Add current trajectory points before updating positions
    if (this.isRunning && this.trajectories.length === 0) {
      this.addTrajectoryPoints(this.objects[0], this.objects[1]);
    }
    
    // Update positions based on velocities
    this.objects.forEach(obj => {
      obj.x += obj.vx * this.scale * this.timeStep;
      obj.y += obj.vy * this.scale * this.timeStep;
    });
    
    // Check for collisions between objects
    this.checkCollision();
    
    // Check boundary collisions for both objects
    let boundaryCollided = false;
    this.objects.forEach(obj => {
      if (this.checkBoundaryCollision(obj)) {
        boundaryCollided = true;
      }
    });
    
    // Add trajectory points if there was a boundary collision
    if (boundaryCollided) {
      this.addTrajectoryPoints(this.objects[0], this.objects[1]);
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
    
    // Draw boundary
    this.ctx.beginPath();
    this.ctx.rect(
      this.boundaryPadding, 
      this.boundaryPadding, 
      this.width - 2 * this.boundaryPadding, 
      this.height - 2 * this.boundaryPadding
    );
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw trajectory lines
    this.drawTrajectories();
    
    // Draw x and y axes for reference
    this.drawAxes();
    
    // Draw velocity vectors
    this.objects.forEach(obj => {
      // Scale velocity for visualization
      const vectorScale = 5;
      const vx = obj.vx * vectorScale;
      const vy = obj.vy * vectorScale;
      
      this.ctx.beginPath();
      this.ctx.moveTo(obj.x, obj.y);
      this.ctx.lineTo(obj.x + vx, obj.y + vy);
      
      // Draw arrowhead
      const arrowSize = 5;
      const angle = Math.atan2(vy, vx);
      this.ctx.lineTo(
        obj.x + vx - arrowSize * Math.cos(angle - Math.PI / 6),
        obj.y + vy - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.moveTo(obj.x + vx, obj.y + vy);
      this.ctx.lineTo(
        obj.x + vx - arrowSize * Math.cos(angle + Math.PI / 6),
        obj.y + vy - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      
      this.ctx.strokeStyle = this.hasCollided ? '#2ecc71' : '#34495e';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Add velocity text
      this.ctx.fillStyle = '#34495e';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      const textOffset = obj.radius + 15;
      this.ctx.fillText(
        `${obj.speed.toFixed(1)} m/s, ${obj.angle.toFixed(0)}°`, 
        obj.x + vx * 1.2, 
        obj.y + vy * 1.2
      );
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
  
  drawTrajectories() {
    if (this.trajectories.length < 2) return;
    
    // Draw paths for object 1
    this.ctx.beginPath();
    this.ctx.moveTo(this.trajectories[0].x1, this.trajectories[0].y1);
    for (let i = 1; i < this.trajectories.length; i++) {
      this.ctx.lineTo(this.trajectories[i].x1, this.trajectories[i].y1);
      
      // Mark collision point
      if (this.trajectories[i].isCollision && !this.trajectories[i-1].isCollision) {
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.trajectories[i].x1, this.trajectories[i].y1, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.trajectories[i].x1, this.trajectories[i].y1);
      }
    }
    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // Draw paths for object 2
    this.ctx.beginPath();
    this.ctx.moveTo(this.trajectories[0].x2, this.trajectories[0].y2);
    for (let i = 1; i < this.trajectories.length; i++) {
      this.ctx.lineTo(this.trajectories[i].x2, this.trajectories[i].y2);
      
      // Mark collision point
      if (this.trajectories[i].isCollision && !this.trajectories[i-1].isCollision) {
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.trajectories[i].x2, this.trajectories[i].y2, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f39c12';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.trajectories[i].x2, this.trajectories[i].y2);
      }
    }
    this.ctx.strokeStyle = '#e74c3c';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
  
  drawAxes() {
    // Draw x and y axes through center of canvas for reference
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.ctx.beginPath();
    // X axis
    this.ctx.moveTo(this.boundaryPadding, centerY);
    this.ctx.lineTo(this.width - this.boundaryPadding, centerY);
    // Y axis
    this.ctx.moveTo(centerX, this.boundaryPadding);
    this.ctx.lineTo(centerX, this.height - this.boundaryPadding);
    
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // Add labels
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('x', this.width - this.boundaryPadding - 10, centerY + 15);
    this.ctx.fillText('y', centerX - 15, this.boundaryPadding + 15);
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
    
    // Reset "after collision" displays
    const p1xAfterElement = document.getElementById('collision2d-p1x-after');
    const p1yAfterElement = document.getElementById('collision2d-p1y-after');
    const p1MagAfterElement = document.getElementById('collision2d-p1-mag-after');
    
    const p2xAfterElement = document.getElementById('collision2d-p2x-after');
    const p2yAfterElement = document.getElementById('collision2d-p2y-after');
    const p2MagAfterElement = document.getElementById('collision2d-p2-mag-after');
    
    const totalPxAfterElement = document.getElementById('collision2d-total-px-after');
    const totalPyAfterElement = document.getElementById('collision2d-total-py-after');
    const totalMagAfterElement = document.getElementById('collision2d-total-mag-after');
    
    if (p1xAfterElement) p1xAfterElement.textContent = '— kg·m/s';
    if (p1yAfterElement) p1yAfterElement.textContent = '— kg·m/s';
    if (p1MagAfterElement) p1MagAfterElement.textContent = '— kg·m/s';
    
    if (p2xAfterElement) p2xAfterElement.textContent = '— kg·m/s';
    if (p2yAfterElement) p2yAfterElement.textContent = '— kg·m/s';
    if (p2MagAfterElement) p2MagAfterElement.textContent = '— kg·m/s';
    
    if (totalPxAfterElement) totalPxAfterElement.textContent = '— kg·m/s';
    if (totalPyAfterElement) totalPyAfterElement.textContent = '— kg·m/s';
    if (totalMagAfterElement) totalMagAfterElement.textContent = '— kg·m/s';
  }
}

export function initCollision2D() {
  const animation = new Collision2D('collision-2d-animation');
  return animation;
}

export default Collision2D;