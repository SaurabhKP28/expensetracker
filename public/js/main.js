/**
 * Main entry point for the expense tracker application.
 * This script loads all the necessary components and initializes the app.
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('ExpenseTracker application initialized');
  
  // Check for token and redirect if needed
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  
  // Load all dependencies
  const scripts = [
    '/js/utils.js',
    '/js/pagination.js',
    '/js/auth.js',
    '/js/expenses.js'
  ];
  
  // Load scripts sequentially to ensure proper dependency order
  const loadScript = (index) => {
    if (index >= scripts.length) return;
    
    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => loadScript(index + 1);
    script.onerror = (error) => console.error(`Error loading script ${scripts[index]}:`, error);
    document.body.appendChild(script);
  };
  
  loadScript(0);
});