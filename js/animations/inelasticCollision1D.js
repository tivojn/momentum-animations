/**
 * One-dimensional Inelastic Collision Animation
 * Demonstrates conservation of momentum in a completely inelastic collision
 * where objects stick together after collision
 */

import animationsConfig from './config.js';

class InelasticCollision1D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      const canvasContainer = document.getElementById('inelastic-1d-animation');
      this.canvas = canvasContainer.querySelector('canvas');
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Animation properties
    this.config = animationsConfig.inelasticCollision1D;
    this.isRunning = false;
    this.animationId = null;
    this.timeStep = 0.05; // seconds per frame
    this.scale = 50; // pixels per meter
    this.boundaryPadding = 50; // padding from canvas edges
    
    // Physical objects
    this.objects = [];
    this.combinedObject = null;
    this.resetObjects();
    
    // Bind event handlers
    this.start = this.start.bind(this);
    this.reset = this.reset.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.calculateInelasticCollision = this.calculateInelasticCollision.bind(this);
    
    // Initialize UI connections
    this.setupControls();
    this.updateMomentumDisplay();
  }
  
  setupControls() {
    // Get control inputs
    this.mass1Input = document.getElementById('inelastic-mass1');
    this.mass2Input = document.getElementById('inelastic-mass2');
    this.velocity1Input = document.getElementById('inelastic-velocity1');
    this.velocity2Input = document.getElementById('inelastic-velocity2');
    
    // Get buttons
    this.startButton = document.getElementById('inelastic-start');
    this.resetButton = document.getElementById('inelastic-reset');
    
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
        initialVelocity: velocity1
      },
      {
        x: x2,
        y: centerY,
        radius: radius2,
        mass: mass2,
        velocity: velocity2,
        color: '#e74c3c',
        initialX: x2,
        initialVelocity: velocity2
      }
    ];
    
    // Reset combined object
    this.combinedObject = null;
    
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
    const p1BeforeElement = document.getElementById('inelastic-p1-before');
    const p2BeforeElement = document.getElementById('inelastic-p2-before');
    const totalBeforeElement = document.getElementById('inelastic-total-before');
    
    if (p1BeforeElement) p1BeforeElement.textContent = momentum1Before.toFixed(2) + ' kg·m/s';
    if (p2BeforeElement) p2BeforeElement.textContent = momentum2Before.toFixed(2) + ' kg·m/s';
    if (totalBeforeElement) totalBeforeElement.textContent = totalBefore.toFixed(2) + ' kg·m/s';
    
    // After collision values will be updated when collision occurs
  }
  
  calculateInelasticCollision() {
    const obj1 = this.objects[0];
    const obj2 = this.objects[1];
    
    // Calculate the final velocity using conservation of momentum
    // For completely inelastic collision: m1*v1 + m2*v2 = (m1+m2)*v'
    const totalMass = obj1.mass + obj2.mass;
    const finalVelocity = (obj1.mass * obj1.velocity + obj2.mass * obj2.velocity) / totalMass;
    
    // Calculate combined radius - proportional to combined mass but not direct sum
    // to avoid excessively large object
    const combinedRadius = Math.sqrt(obj1.radius**2 + obj2.radius**2) * 1.2;
    
    // Create combined object
    this.combinedObject = {
      x: (obj1.x + obj2.x) / 2, // Average position
      y: obj1.y, // Same height
      radius: combinedRadius,
      mass: totalMass,
      velocity: finalVelocity,
      // Blend the colors of the two objects
      color: this.blendColors(obj1.color, obj2.color)
    };
    
    // Update momentum display after collision
    const momentumAfter = this.calculateMomentum(this.combinedObject);
    
    // Update UI display elements
    const p1AfterElement = document.getElementById('inelastic-p1-after');
    const p2AfterElement = document.getElementById('inelastic-p2-after');
    const totalAfterElement = document.getElementById('inelastic-total-after');
    
    if (p1AfterElement) p1AfterElement.textContent = '0 kg·m/s (combined)';
    if (p2AfterElement) p2AfterElement.textContent = '0 kg·m/s (combined)';
    if (totalAfterElement) totalAfterElement.textContent = momentumAfter.toFixed(2) + ' kg·m/s';
    
    // Add combined momentum display
    const combinedAfterElement = document.getElementById('inelastic-combined-after');
    if (combinedAfterElement) combinedAfterElement.textContent = momentumAfter.toFixed(2) + ' kg·m/s';
  }
  
  blendColors(color1, color2) {
    // Simple color blending function - assumes hex colors like '#3498db'
    const r1 = parseInt(color1.substr(1, 2), 16);
    const g1 = parseInt(color1.substr(3, 2), 16);
    const b1 = parseInt(color1.substr(5, 2), 16);
    
    const r2 = parseInt(color2.substr(1, 2), 16);
    const g2 = parseInt(color2.substr(3, 2), 16);
    const b2 = parseInt(color2.substr(5, 2), 16);
    
    // Average the colors
    const r = Math.floor((r1 + r2) / 2);
    const g = Math.floor((g1 + g2) / 2);
    const b = Math.floor((b1 + b2) / 2);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  checkCollision() {
    // If already collided, no need to check
    if (this.combinedObject) return;
    
    const obj1 = this.objects[0];
    const obj2 = this.objects[1];
    
    // Calculate distance between centers
    const distance = Math.abs(obj1.x - obj2.x);
    const minDistance = obj1.radius + obj2.radius;
    
    // Check if objects are colliding
    if (distance <= minDistance) {
      // Calculate new velocity and create combined object
      this.calculateInelasticCollision();
    }
  }
  
  checkBoundaryCollision(object) {
    // Left boundary
    if (object.x - object.radius < this.boundaryPadding) {
      object.x = this.boundaryPadding + object.radius;
      object.velocity = -object.velocity; // Reverse direction
    }
    
    // Right boundary
    if (object.x + object.radius > this.width - this.boundaryPadding) {
      object.x = this.width - this.boundaryPadding - object.radius;
      object.velocity = -object.velocity; // Reverse direction
    }
  }
  
  update() {
    if (this.combinedObject) {
      // Move combined object
      this.combinedObject.x += this.combinedObject.velocity * this.scale * this.timeStep;
      
      // Check boundary collisions for combined object
      this.checkBoundaryCollision(this.combinedObject);
    } else {
      // Update positions based on velocities
      this.objects.forEach(obj => {
        obj.x += obj.velocity * this.scale * this.timeStep;
      });
      
      // Check for collisions between objects
      this.checkCollision();
      
      // Check boundary collisions for individual objects
      this.objects.forEach(obj => this.checkBoundaryCollision(obj));
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
    
    if (this.combinedObject) {
      // Draw combined object
      this.ctx.beginPath();
      this.ctx.arc(this.combinedObject.x, this.combinedObject.y, this.combinedObject.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.combinedObject.color;
      this.ctx.fill();
      
      // Draw mass label
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.combinedObject.mass + ' kg', this.combinedObject.x, this.combinedObject.y);
      
      // Draw velocity vector for combined object
      const vectorLength = this.combinedObject.velocity * 5; // Scale for visualization
      this.ctx.beginPath();
      this.ctx.moveTo(this.combinedObject.x, this.combinedObject.y - this.combinedObject.radius - 5);
      this.ctx.lineTo(this.combinedObject.x + vectorLength, this.combinedObject.y - this.combinedObject.radius - 5);
      
      // Draw arrowhead
      if (Math.abs(vectorLength) > 2) {
        const arrowSize = 5;
        const arrowDirection = Math.sign(vectorLength);
        this.ctx.lineTo(this.combinedObject.x + vectorLength - arrowSize * arrowDirection, 
                        this.combinedObject.y - this.combinedObject.radius - 5 - arrowSize);
        this.ctx.moveTo(this.combinedObject.x + vectorLength, this.combinedObject.y - this.combinedObject.radius - 5);
        this.ctx.lineTo(this.combinedObject.x + vectorLength - arrowSize * arrowDirection, 
                        this.combinedObject.y - this.combinedObject.radius - 5 + arrowSize);
      }
      
      this.ctx.strokeStyle = '#2ecc71';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Add velocity text
      this.ctx.fillStyle = '#34495e';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.combinedObject.velocity.toFixed(1) + ' m/s', 
                       this.combinedObject.x, this.combinedObject.y - this.combinedObject.radius - 15);
    } else {
      // Draw individual objects
      this.objects.forEach(obj => {
        // Draw velocity vectors
        const vectorLength = obj.velocity * 5; // Scale for visualization
        this.ctx.beginPath();
        this.ctx.moveTo(obj.x, obj.y - obj.radius - 5);
        this.ctx.lineTo(obj.x + vectorLength, obj.y - obj.radius - 5);
        
        // Draw arrowhead
        if (Math.abs(vectorLength) > 2) {
          const arrowSize = 5;
          const arrowDirection = Math.sign(vectorLength);
          this.ctx.lineTo(obj.x + vectorLength - arrowSize * arrowDirection, 
                          obj.y - obj.radius - 5 - arrowSize);
          this.ctx.moveTo(obj.x + vectorLength, obj.y - obj.radius - 5);
          this.ctx.lineTo(obj.x + vectorLength - arrowSize * arrowDirection, 
                          obj.y - obj.radius - 5 + arrowSize);
        }
        
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Add velocity text
        this.ctx.fillStyle = '#34495e';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(obj.velocity.toFixed(1) + ' m/s', obj.x, obj.y - obj.radius - 15);
        
        // Draw the object
        this.ctx.beginPath();
        this.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = obj.color;
        this.ctx.fill();
        
        // Draw mass label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(obj.mass + ' kg', obj.x, obj.y);
      });
    }
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
    
    // Clear "after collision" displays
    const p1AfterElement = document.getElementById('inelastic-p1-after');
    const p2AfterElement = document.getElementById('inelastic-p2-after');
    const totalAfterElement = document.getElementById('inelastic-total-after');
    const combinedAfterElement = document.getElementById('inelastic-combined-after');
    
    if (p1AfterElement) p1AfterElement.textContent = '— kg·m/s';
    if (p2AfterElement) p2AfterElement.textContent = '— kg·m/s';
    if (totalAfterElement) totalAfterElement.textContent = '— kg·m/s';
    if (combinedAfterElement) combinedAfterElement.textContent = '— kg·m/s';
  }
}

export function initInelasticCollision1D() {
  const animation = new InelasticCollision1D('inelastic-1d-animation');
  return animation;
}

export default InelasticCollision1D;