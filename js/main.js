/**
 * Main JavaScript file for Conservation of Momentum Animation Presentation
 * Handles navigation, UI interactions, and loads the animation modules
 */

// Import animation configuration
import animationsConfig from './animations/config.js';
// Import animation modules
import { initElasticCollision1D } from './animations/elasticCollision1D.js';
import { initInelasticCollision1D } from './animations/inelasticCollision1D.js';
import { initCollision2D } from './animations/collision2D.js';
import { initExplosion } from './animations/explosion.js';
import { initRocketPropulsion } from './animations/rocketPropulsion.js';

// DOM Elements
const navLinks = document.querySelectorAll('nav a');
const slides = document.querySelectorAll('.slide');

// Navigation functionality
function navigateToSlide(targetId) {
  // Hide all slides
  slides.forEach(slide => {
    slide.classList.remove('active');
  });
  
  // Remove active state from all nav links
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Show the target slide
  const targetSlide = document.getElementById(targetId);
  if (targetSlide) {
    targetSlide.classList.add('active');
    
    // Add active state to corresponding nav link
    const activeLink = document.querySelector(`nav a[href="#${targetId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

// Add event listeners to navigation links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    navigateToSlide(targetId);
    
    // Update URL hash for bookmarking
    window.location.hash = targetId;
  });
});

// Handle URL hash on page load
function handleInitialNavigation() {
  const hash = window.location.hash;
  if (hash) {
    const targetId = hash.substring(1);
    navigateToSlide(targetId);
  }
}

// Update slider values display
function setupRangeInputs() {
  const rangeInputs = document.querySelectorAll('input[type="range"]');
  rangeInputs.forEach(input => {
    const valueDisplay = input.nextElementSibling;
    if (valueDisplay && valueDisplay.classList.contains('value')) {
      // Set initial value
      updateRangeValue(input, valueDisplay);
      
      // Update on change
      input.addEventListener('input', () => {
        updateRangeValue(input, valueDisplay);
      });
    }
  });
}

function updateRangeValue(input, display) {
  let unit = '';
  
  // Determine unit based on input id
  if (input.id.includes('mass')) {
    unit = ' kg';
  } else if (input.id.includes('velocity')) {
    unit = ' m/s';
  } else if (input.id.includes('angle')) {
    unit = '°';
  }
  
  display.textContent = input.value + unit;
}

// Initialize the animation placeholders with canvas elements
function setupAnimationCanvases() {
  const animationContainers = document.querySelectorAll('.animation');
  
  animationContainers.forEach(container => {
    // Clear any existing content
    container.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
  });
}

// Resize canvases when window resizes
function handleResize() {
  const canvases = document.querySelectorAll('.animation canvas');
  canvases.forEach(canvas => {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Redraw animations if they're active
    // This will be implemented when animation modules are created
  });
}

// Initialize the application
function init() {
  handleInitialNavigation();
  setupRangeInputs();
  setupAnimationCanvases();
  
  // Add window resize listener
  window.addEventListener('resize', handleResize);
  
  // Initialize specific animations
  initElasticCollision1D();
  initInelasticCollision1D();
  initCollision2D();
  initExplosion();
  initRocketPropulsion();
  
  console.log('Conservation of Momentum Animations initialized');
  console.log('Loaded animation configurations:', animationsConfig);
}

// Start the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);