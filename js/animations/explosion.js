/**
 * Explosion/Separation Animation
 * Demonstrates conservation of momentum in a system where one object breaks apart
 */

import animationsConfig from './config.js';

class Explosion {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      const canvasContainer = document.getElementById('explosion-animation');
      this.canvas = canvasContainer.querySelector('canvas');
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Animation properties
    this.config = animationsConfig.explosion;
    this.isRunning = false;
    this.animationId = null;
    this.timeStep = 0.05; // seconds per frame
    this.scale = 15; // pixels per meter
    this.boundaryPadding = 20; // padding from canvas edges
    this.hasExploded = false;
    this.explosionTime = 0;
    
    // Physical objects
    this.originalObject = null;
    this.fragments = [];
    this.trajectories = []; // To store trajectory lines
    this.resetObjects();
    
    // Bind event handlers
    this.start = this.start.bind(this);
    this.reset = this.reset.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.createExplosion = this.createExplosion.bind(this);
    
    // Initialize UI connections
    this.setupControls();
    this.updateMomentumDisplay();
  }
  
  setupControls() {
    // Get control inputs
    this.massInput = document.getElementById('explosion-mass');
    this.fragmentsInput = document.getElementById('explosion-fragments');
    this.forceInput = document.getElementById('explosion-force');
    
    // Get buttons
    this.startButton = document.getElementById('explosion-start');
    this.resetButton = document.getElementById('explosion-reset');
    this.explodeButton = document.getElementById('explosion-explode');
    
    // Add event listeners
    if (this.startButton) {
      this.startButton.addEventListener('click', this.start);
    }
    
    if (this.resetButton) {
      this.resetButton.addEventListener('click', this.reset);
    }
    
    if (this.explodeButton) {
      this.explodeButton.addEventListener('click', () => {
        if (this.isRunning && !this.hasExploded) {
          this.createExplosion();
        }
      });
    }
    
    // Add input change handlers
    const inputs = [this.massInput, this.fragmentsInput, this.forceInput];
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
  
  resetObjects() {
    // Reset explosion state
    this.hasExploded = false;
    this.explosionTime = 0;
    this.fragments = [];
    this.trajectories = [];
    
    // Get values from inputs or use defaults
    const mass = this.massInput ? parseFloat(this.massInput.value) : this.config.parameters.mass.default;
    
    // Calculate object size based on mass
    const radius = 15 + mass * 2;
    
    // Center coordinates
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Create the original object
    this.originalObject = {
      x: centerX,
      y: centerY,
      radius: radius,
      mass: mass,
      vx: 0,
      vy: 0,
      color: '#9b59b6'
    };
    
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
    // Before explosion - all zero since object is stationary
    const beforeMomentum = this.calculateMomentum(this.originalObject);
    
    // Update UI display elements
    const pxBeforeElement = document.getElementById('explosion-px-before');
    const pyBeforeElement = document.getElementById('explosion-py-before');
    const totalBeforeElement = document.getElementById('explosion-total-before');
    
    if (pxBeforeElement) pxBeforeElement.textContent = beforeMomentum.px.toFixed(2) + ' kg·m/s';
    if (pyBeforeElement) pyBeforeElement.textContent = beforeMomentum.py.toFixed(2) + ' kg·m/s';
    if (totalBeforeElement) totalBeforeElement.textContent = beforeMomentum.magnitude.toFixed(2) + ' kg·m/s';
    
    // After explosion values will be updated when explosion occurs
    const pxAfterElement = document.getElementById('explosion-px-after');
    const pyAfterElement = document.getElementById('explosion-py-after');
    const totalAfterElement = document.getElementById('explosion-total-after');
    
    if (pxAfterElement) pxAfterElement.textContent = '— kg·m/s';
    if (pyAfterElement) pyAfterElement.textContent = '— kg·m/s';
    if (totalAfterElement) totalAfterElement.textContent = '— kg·m/s';
  }
  
  createExplosion() {
    if (this.hasExploded) return;
    
    // Set explosion flag
    this.hasExploded = true;
    this.explosionTime = 0;
    
    // Get number of fragments and force
    const numFragments = this.fragmentsInput ? 
      parseInt(this.fragmentsInput.value) : 
      this.config.parameters.fragments.default;
    
    const force = this.forceInput ? 
      parseFloat(this.forceInput.value) : 
      this.config.parameters.force.default;
    
    // Total mass of the original object
    const totalMass = this.originalObject.mass;
    
    // Create fragments
    this.fragments = [];
    
    // Calculate mass for each fragment - random distribution that sums to total mass
    let remainingMass = totalMass;
    const massFactors = [];
    
    for (let i = 0; i < numFragments; i++) {
      // Last fragment gets the remainder
      if (i === numFragments - 1) {
        massFactors.push(remainingMass);
      } else {
        // Random fraction of remaining mass, but at least 10%
        const factor = Math.max(0.1, Math.random() * 0.5) * remainingMass;
        massFactors.push(factor);
        remainingMass -= factor;
      }
    }
    
    // Shuffle mass factors to randomize assignment
    for (let i = massFactors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [massFactors[i], massFactors[j]] = [massFactors[j], massFactors[i]];
    }
    
    // Create fragments with random directions but ensure total momentum is conserved
    let totalPx = 0, totalPy = 0;
    
    for (let i = 0; i < numFragments - 1; i++) {
      const mass = massFactors[i];
      const radius = 10 + mass * 1.5; // Smaller than original but proportional to mass
      
      // Random angle for this fragment
      const angle = Math.random() * Math.PI * 2;
      
      // Random velocity based on force and mass (F = ma)
      // Smaller fragments move faster for the same force
      const speed = force / mass;
      const vx = speed * Math.cos(angle);
      const vy = speed * Math.sin(angle);
      
      // Calculate momentum contribution
      totalPx += mass * vx;
      totalPy += mass * vy;
      
      // Create the fragment object
      this.fragments.push({
        x: this.originalObject.x,
        y: this.originalObject.y,
        radius: radius,
        mass: mass,
        vx: vx,
        vy: vy,
        // Generate a random color with purplish hue
        color: this.generateRandomColor()
      });
    }
    
    // Last fragment - determine velocity to conserve momentum
    const lastMass = massFactors[numFragments - 1];
    const lastRadius = 10 + lastMass * 1.5;
    
    // Velocity needed to conserve momentum: p_last = -sum(p_others)
    const lastVx = -totalPx / lastMass;
    const lastVy = -totalPy / lastMass;
    
    this.fragments.push({
      x: this.originalObject.x,
      y: this.originalObject.y,
      radius: lastRadius,
      mass: lastMass,
      vx: lastVx,
      vy: lastVy,
      color: this.generateRandomColor()
    });
    
    // Update momentum display after explosion
    this.updateAfterExplosionMomentum();
    
    // Disable explode button
    if (this.explodeButton) {
      this.explodeButton.disabled = true;
    }
  }
  
  generateRandomColor() {
    // Generate colors with a purplish hue
    const r = Math.floor(100 + Math.random() * 155);
    const g = Math.floor(50 + Math.random() * 100);
    const b = Math.floor(150 + Math.random() * 105);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  updateAfterExplosionMomentum() {
    let totalPx = 0, totalPy = 0;
    
    // Sum momentum of all fragments
    this.fragments.forEach(fragment => {
      const momentum = this.calculateMomentum(fragment);
      totalPx += momentum.px;
      totalPy += momentum.py;
    });
    
    const totalMagnitude = Math.sqrt(totalPx * totalPx + totalPy * totalPy);
    
    // Update UI display elements
    const pxAfterElement = document.getElementById('explosion-px-after');
    const pyAfterElement = document.getElementById('explosion-py-after');
    const totalAfterElement = document.getElementById('explosion-total-after');
    
    if (pxAfterElement) pxAfterElement.textContent = totalPx.toFixed(2) + ' kg·m/s';
    if (pyAfterElement) pyAfterElement.textContent = totalPy.toFixed(2) + ' kg·m/s';
    if (totalAfterElement) totalAfterElement.textContent = totalMagnitude.toFixed(2) + ' kg·m/s';
  }
  
  addTrajectoryPoints() {
    if (!this.hasExploded) return;
    
    // Add current positions to trajectories
    const points = this.fragments.map(fragment => ({
      x: fragment.x,
      y: fragment.y
    }));
    
    this.trajectories.push({
      time: this.explosionTime,
      points: points
    });
    
    // Limit the number of trajectory points to avoid performance issues
    if (this.trajectories.length > 100) {
      this.trajectories.shift();
    }
  }
  
  checkBoundaryCollision(fragment) {
    let collided = false;
    
    // Left boundary
    if (fragment.x - fragment.radius < this.boundaryPadding) {
      fragment.x = this.boundaryPadding + fragment.radius;
      fragment.vx = -fragment.vx * 0.9; // Slight energy loss on collision
      collided = true;
    }
    
    // Right boundary
    if (fragment.x + fragment.radius > this.width - this.boundaryPadding) {
      fragment.x = this.width - this.boundaryPadding - fragment.radius;
      fragment.vx = -fragment.vx * 0.9;
      collided = true;
    }
    
    // Top boundary
    if (fragment.y - fragment.radius < this.boundaryPadding) {
      fragment.y = this.boundaryPadding + fragment.radius;
      fragment.vy = -fragment.vy * 0.9;
      collided = true;
    }
    
    // Bottom boundary
    if (fragment.y + fragment.radius > this.height - this.boundaryPadding) {
      fragment.y = this.height - this.boundaryPadding - fragment.radius;
      fragment.vy = -fragment.vy * 0.9;
      collided = true;
    }
    
    return collided;
  }
  
  update() {
    if (this.hasExploded) {
      // Increment explosion time
      this.explosionTime += this.timeStep;
      
      // Move fragments
      this.fragments.forEach(fragment => {
        fragment.x += fragment.vx * this.scale * this.timeStep;
        fragment.y += fragment.vy * this.scale * this.timeStep;
        
        // Check boundary collisions
        this.checkBoundaryCollision(fragment);
      });
      
      // Add trajectory points every few frames
      if (Math.round(this.explosionTime / this.timeStep) % 3 === 0) {
        this.addTrajectoryPoints();
      }
    } else {
      // Object pulsates slightly before explosion
      const pulseFactor = 1 + 0.05 * Math.sin(Date.now() / 200);
      this.originalObject.radius = (15 + this.originalObject.mass * 2) * pulseFactor;
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
    
    // Draw trajectories if explosion has occurred
    if (this.hasExploded) {
      this.drawTrajectories();
    }
    
    // Draw center of mass indicator
    this.drawCenterOfMass();
    
    // Draw objects
    if (this.hasExploded) {
      // Draw fragments
      this.fragments.forEach(fragment => {
        // Draw fragment
        this.ctx.beginPath();
        this.ctx.arc(fragment.x, fragment.y, fragment.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = fragment.color;
        this.ctx.fill();
        
        // Draw mass label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(fragment.mass.toFixed(1) + ' kg', fragment.x, fragment.y);
        
        // Draw velocity vector
        const vectorScale = 3;
        const vx = fragment.vx * vectorScale;
        const vy = fragment.vy * vectorScale;
        
        if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
          this.ctx.beginPath();
          this.ctx.moveTo(fragment.x, fragment.y);
          this.ctx.lineTo(fragment.x + vx, fragment.y + vy);
          
          // Draw arrowhead
          const arrowSize = 5;
          const angle = Math.atan2(vy, vx);
          this.ctx.lineTo(
            fragment.x + vx - arrowSize * Math.cos(angle - Math.PI / 6),
            fragment.y + vy - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          this.ctx.moveTo(fragment.x + vx, fragment.y + vy);
          this.ctx.lineTo(
            fragment.x + vx - arrowSize * Math.cos(angle + Math.PI / 6),
            fragment.y + vy - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          
          this.ctx.strokeStyle = '#34495e';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();
        }
      });
    } else {
      // Draw original object
      this.ctx.beginPath();
      this.ctx.arc(
        this.originalObject.x, 
        this.originalObject.y, 
        this.originalObject.radius, 
        0, 
        Math.PI * 2
      );
      this.ctx.fillStyle = this.originalObject.color;
      this.ctx.fill();
      
      // Draw mass label
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        this.originalObject.mass.toFixed(1) + ' kg', 
        this.originalObject.x, 
        this.originalObject.y
      );
      
      // Add instruction for explosion
      if (this.isRunning) {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          'Click "Explode" to trigger the explosion',
          this.width / 2,
          this.height - this.boundaryPadding - 10
        );
      }
    }
  }
  
  drawTrajectories() {
    if (this.trajectories.length < 2) return;
    
    // Draw paths for each fragment
    for (let fragIndex = 0; fragIndex < this.fragments.length; fragIndex++) {
      this.ctx.beginPath();
      
      // Get starting point
      let startX = this.trajectories[0].points[fragIndex].x;
      let startY = this.trajectories[0].points[fragIndex].y;
      this.ctx.moveTo(startX, startY);
      
      // Draw path
      for (let i = 1; i < this.trajectories.length; i++) {
        const point = this.trajectories[i].points[fragIndex];
        this.ctx.lineTo(point.x, point.y);
      }
      
      // Style based on fragment color but more transparent
      const fragment = this.fragments[fragIndex];
      this.ctx.strokeStyle = fragment.color;
      this.ctx.globalAlpha = 0.4;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1.0;
    }
  }
  
  drawCenterOfMass() {
    let centerX, centerY, totalMass;
    
    if (this.hasExploded) {
      // Calculate center of mass of fragments
      centerX = 0;
      centerY = 0;
      totalMass = 0;
      
      this.fragments.forEach(fragment => {
        centerX += fragment.x * fragment.mass;
        centerY += fragment.y * fragment.mass;
        totalMass += fragment.mass;
      });
      
      centerX /= totalMass;
      centerY /= totalMass;
    } else {
      // Center of mass is at the original object
      centerX = this.originalObject.x;
      centerY = this.originalObject.y;
    }
    
    // Draw center of mass marker (crosshair)
    this.ctx.beginPath();
    // Horizontal line
    this.ctx.moveTo(centerX - 8, centerY);
    this.ctx.lineTo(centerX + 8, centerY);
    // Vertical line
    this.ctx.moveTo(centerX, centerY - 8);
    this.ctx.lineTo(centerX, centerY + 8);
    
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    this.ctx.fillStyle = '#f39c12';
    this.ctx.fill();
    
    // Label
    this.ctx.fillStyle = '#f39c12';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CM', centerX, centerY - 15);
  }
  
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      if (this.startButton) {
        this.startButton.textContent = 'Pause';
      }
      if (this.explodeButton) {
        this.explodeButton.disabled = this.hasExploded;
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
    
    // Enable explode button
    if (this.explodeButton) {
      this.explodeButton.disabled = false;
    }
    
    // Reset objects
    this.resetObjects();
    
    // Reset momentum display
    this.updateMomentumDisplay();
  }
}

export function initExplosion() {
  const animation = new Explosion('explosion-animation');
  return animation;
}

export default Explosion;