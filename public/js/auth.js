// auth.js - Handles authentication logic

document.addEventListener('DOMContentLoaded', function() {
  // Check which form is present on the current page
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const resetPasswordForm = document.getElementById('reset-password-form');

  // Handle signup form submission
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const errorMessage = document.getElementById('error-message');
      const submitButton = e.target.querySelector('button');
      
      try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading"></span> Signing up...';
        
        const formData = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        };
        
        const response = await fetch('/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }
        
        // Show success message and redirect to login
        errorMessage.textContent = 'Signup successful! Redirecting to login...';
        errorMessage.style.color = 'green';
        
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1500);
        
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.color = 'red';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
      }
    });
  }
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const errorMessage = document.getElementById('error-message');
      const submitButton = e.target.querySelector('button');
      
      try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading"></span> Logging in...';
        
        const formData = {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        };
        
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
        
        // Save the token to localStorage
        localStorage.setItem('token', data.token);
        
        // Check if user is premium and redirect accordingly
        checkUserPremiumStatus(data.token);
        
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.color = 'red';
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    });
  }
  
  // Handle forgot password form submission
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const message = document.getElementById('message');
      const submitButton = e.target.querySelector('button');
      
      try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading"></span> Sending...';
        
        const email = document.getElementById('email').value;
        
        const response = await fetch('/password/forgotpassword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          message.textContent = 'Password reset link has been sent to your email';
          message.className = 'success-message';
        } else {
          message.textContent = data.message || 'Error sending reset email';
          message.className = 'error-message';
        }
      } catch (error) {
        message.textContent = 'Error sending reset email';
        message.className = 'error-message';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Reset Link';
      }
    });
  }
  
  // Handle reset password form submission
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const message = document.getElementById('message');
      const submitButton = e.target.querySelector('button');
      
      try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading"></span> Resetting...';
        
        const password = document.getElementById('password').value;
        const token = new URLSearchParams(window.location.search).get('token');
        
        if (!token) {
          message.textContent = 'Invalid reset link';
          message.className = 'error-message';
          return;
        }
        
        const response = await fetch('/password/resetpassword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          message.textContent = 'Password reset successful. Redirecting to login...';
          message.className = 'success-message';
          
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 2000);
        } else {
          message.textContent = data.error || 'Failed to reset password';
          message.className = 'error-message';
        }
      } catch (error) {
        message.textContent = 'Error resetting password';
        message.className = 'error-message';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Reset Password';
      }
    });
  }
});

// Check if user is premium and redirect accordingly
async function checkUserPremiumStatus(token) {
  try {
    const response = await fetch('/auth/check-premium', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Premium status check:', data);

    if (response.ok) {
      if (data.isPremium) {
        console.log('User is premium, redirecting to premium page.');
        window.location.href = '/expenses.html';  // Redirect to premium page
      } else {
        console.log('User is not premium, redirecting to basic page.');
        window.location.href = '/expense.html';  // Redirect to basic page
      }
    } else {
      throw new Error(data.error || 'Failed to check premium status');
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
    // Default to non-premium if there's an error
    window.location.href = '/expense.html';
  }
}

// Function to logout user
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

// Check if user is logged in on page load
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  
  // Redirect to login if no token
  if (!token) {
    // Only redirect if not already on login or signup page
    const currentPath = window.location.pathname;
    if (currentPath !== '/login.html' && 
        currentPath !== '/signup.html' && 
        currentPath !== '/forgot-password.html' && 
        !currentPath.includes('/reset-password.html')) {
      window.location.href = '/login.html';
    }
    return false;
  }
  
  return true;
}

// Add this to pages that require authentication
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAuthStatus);
} else {
  checkAuthStatus();
}