// payment.js - Handles Cashfree payment integration

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Check if Cashfree script is loaded
  if (typeof Cashfree === 'undefined') {
    console.error('Cashfree SDK not loaded');
  }
  
  // DOM Elements
  const paymentBtn = document.getElementById('payment-btn');
  const paymentStatus = document.getElementById('payment-status');
  
  // First check if user is already premium
  checkPremiumStatus();
  
  async function checkPremiumStatus() {
    try {
      const response = await fetch('/auth/check-premium', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check premium status');
      }
      
      const data = await response.json();
      
      if (data.isPremium) {
        if (paymentStatus) {
          paymentStatus.innerHTML = 'You are already a premium user!';
          paymentStatus.className = 'payment-status-success';
        }
        
        if (paymentBtn) {
          paymentBtn.innerHTML = 'Already Premium';
          paymentBtn.disabled = true;
        }
        
        setTimeout(() => {
          window.location.href = '/expenses.html';
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  }
  
  // Handle payment button click
  if (paymentBtn) {
    paymentBtn.addEventListener('click', async function() {
      try {
        paymentBtn.disabled = true;
        paymentBtn.innerHTML = '<span class="loading"></span> Processing...';
        
        if (paymentStatus) {
          paymentStatus.innerHTML = 'Initializing payment...';
          paymentStatus.className = 'payment-status-processing';
        }
        
        // Create payment order
        const response = await fetch('/api/payments/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: 2000 }) // ₹20.00
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // If user is already premium
          if (errorData.isPremium) {
            if (paymentStatus) {
              paymentStatus.innerHTML = 'You are already a premium user!';
              paymentStatus.className = 'payment-status-success';
            }
            
            setTimeout(() => {
              window.location.href = '/expenses.html';
            }, 1500);
            
            return;
          }
          
          throw new Error(errorData.message || 'Payment initialization failed');
        }
        
        const data = await response.json();
        const paymentSessionId = data.paymentSessionId;
        const orderId = data.orderId;
        
        if (!paymentSessionId) {
          throw new Error('Payment session ID not received');
        }
        
        // Configure Cashfree checkout
        const cashfree = Cashfree({ mode: "sandbox" });
        
        const checkoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self",
          onSuccess: function(data) {
            // This callback will only be called if the page isn't redirected
            handlePaymentSuccess(orderId);
          },
          onFailure: function(data) {
            // Handle payment failure
            handlePaymentFailure(data);
          },
          components: ["order-details", "card", "upi", "netbanking"]
        };
        
        // Render Cashfree checkout
        await cashfree.checkout(checkoutOptions);
        
      } catch (error) {
        console.error('Payment Error:', error);
        
        if (paymentStatus) {
          paymentStatus.innerHTML = `Payment Error: ${error.message}`;
          paymentStatus.className = 'payment-status-error';
        }
        
        if (paymentBtn) {
          paymentBtn.disabled = false;
          paymentBtn.textContent = 'Try Again';
        }
      }
    });
  }
  
  // Check for payment status based on URL params
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  
  if (orderId) {
    checkPaymentStatus(orderId);
  }
  
  // Function to check payment status
  async function checkPaymentStatus(orderId) {
    try {
      if (paymentStatus) {
        paymentStatus.innerHTML = 'Checking payment status...';
        paymentStatus.className = 'payment-status-processing';
      }
      
      const response = await fetch(`/api/payments/payment-status/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }
      
      const data = await response.json();
      const status = data.orderStatus.toLowerCase();
      
      if (status === 'paid' || status === 'success' || status === 'successful') {
        handlePaymentSuccess(orderId);
      } else if (status === 'pending') {
        if (paymentStatus) {
          paymentStatus.innerHTML = 'Payment is still processing...';
          paymentStatus.className = 'payment-status-processing';
        }
        
        // Check again after 5 seconds
        setTimeout(() => {
          checkPaymentStatus(orderId);
        }, 5000);
      } else {
        handlePaymentFailure({ orderId });
      }
      
    } catch (error) {
      console.error('Payment Status Error:', error);
      
      if (paymentStatus) {
        paymentStatus.innerHTML = `Error checking payment status: ${error.message}`;
        paymentStatus.className = 'payment-status-error';
      }
      
      if (paymentBtn) {
        paymentBtn.disabled = false;
        paymentBtn.textContent = 'Try Again';
      }
    }
  }
  
  // Function to handle successful payment
  function handlePaymentSuccess(orderId) {
    if (paymentStatus) {
      paymentStatus.innerHTML = 'Payment successful! You are now a premium user.';
      paymentStatus.className = 'payment-status-success';
    }
    
    if (paymentBtn) {
      paymentBtn.innerHTML = 'Success! Redirecting...';
      paymentBtn.disabled = true;
    }
    
    // Update order status on server
    fetch(`/api/payments/order/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderStatus: 'PAID'
      })
    })
    .catch(err => console.error('Error updating order status:', err));
    
    // Redirect to premium dashboard after 2 seconds
    setTimeout(() => {
      window.location.href = '/expenses.html';
    }, 2000);
  }
  
  // Function to handle failed payment
  function handlePaymentFailure(data) {
    console.error('Payment failed:', data);
    
    if (paymentStatus) {
      paymentStatus.innerHTML = 'Payment failed. Please try again.';
      paymentStatus.className = 'payment-status-error';
    }
    
    if (paymentBtn) {
      paymentBtn.disabled = false;
      paymentBtn.textContent = 'Try Again';
    }
  }
});