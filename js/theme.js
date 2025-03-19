/**
 * Theme switcher for Conservation of Momentum Animations
 * Allows toggling between light and dark themes following Shadcn design principles
 */

document.addEventListener('DOMContentLoaded', () => {
  // Create theme toggle button
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = '🌓';
  themeToggle.setAttribute('aria-label', 'Toggle dark mode');
  document.body.appendChild(themeToggle);
  
  // Check for user preference
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');
  
  // Set initial theme
  if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark');
  }
  
  // Toggle theme when button is clicked
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    
    // Save preference
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
});