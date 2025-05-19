/**
 * Utility functions for the expense tracker application
 */

/**
 * Formats a date to a readable string
 * @param {string|Date} dateInput - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
function formatDate(dateInput, options = {}) {
  try {
    // Handle various date formats
    let date;
    
    if (!dateInput) {
      return 'N/A';
    }
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Try parsing ISO format first
      date = new Date(dateInput);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Try parsing MM/DD/YYYY format
        const parts = dateInput.split(/[\/\-\.]/);
        if (parts.length === 3) {
          // Try both MM-DD-YYYY and YYYY-MM-DD formats
          date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          
          // If still invalid, try YYYY-MM-DD format
          if (isNaN(date.getTime())) {
            date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          }
        }
      }
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    }
    
    // If date is still invalid, return a default message
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date input:', dateInput);
      return 'Invalid Date';
    }
    
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Merge options
    const formatOptions = { ...defaultOptions, ...options };
    
    return date.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date Error';
  }
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null) {
    return '$0.00';
  }
  
  return '$' + parseFloat(amount).toFixed(2);
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Display toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (info, success, error)
 */
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <div class="toast-close">&times;</div>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  const timeout = setTimeout(() => {
    removeToast(toast);
  }, 5000);
  
  // Add close button functionality
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    clearTimeout(timeout);
    removeToast(toast);
  });
  
  function removeToast(toastElement) {
    toastElement.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      toastElement.remove();
      
      // Remove container if empty
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 300);
  }
}

/**
 * Create a modal dialog
 * @param {Object} options - Modal options
 * @returns {Object} - Modal object with open and close methods
 */
function createModal(options = {}) {
  const defaults = {
    title: 'Modal',
    content: '',
    onClose: () => {},
    onSubmit: () => {},
    submitText: 'Submit',
    cancelText: 'Cancel',
    width: '500px',
    showFooter: true
  };
  
  const settings = { ...defaults, ...options };
  
  // Create modal element
  const modalElement = document.createElement('div');
  modalElement.className = 'modal-backdrop';
  modalElement.id = `modal-${Date.now()}`;
  
  // Create modal content
  modalElement.innerHTML = `
    <div class="modal" style="max-width: ${settings.width}">
      <div class="modal-header">
        <h3 class="modal-title">${settings.title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${settings.content}
      </div>
      ${settings.showFooter ? `
        <div class="modal-footer">
          <button type="button" class="btn-outline modal-cancel">${settings.cancelText}</button>
          <button type="button" class="btn modal-submit">${settings.submitText}</button>
        </div>
      ` : ''}
    </div>
  `;
  
  // Append to body
  document.body.appendChild(modalElement);
  
  // Get elements
  const closeBtn = modalElement.querySelector('.modal-close');
  const cancelBtn = modalElement.querySelector('.modal-cancel');
  const submitBtn = modalElement.querySelector('.modal-submit');
  
  // Define methods
  const modal = {
    open() {
      document.body.appendChild(modalElement);
      // Show with animation
      setTimeout(() => {
        modalElement.classList.add('active');
      }, 10);
      return this;
    },
    
    close() {
      modalElement.classList.remove('active');
      setTimeout(() => {
        if (modalElement.parentNode) {
          modalElement.parentNode.removeChild(modalElement);
        }
      }, 300);
      settings.onClose();
      return this;
    },
    
    // Update content
    setContent(content) {
      const modalBody = modalElement.querySelector('.modal-body');
      modalBody.innerHTML = content;
      return this;
    },
    
    // Get modal element
    getElement() {
      return modalElement;
    }
  };
  
  // Event listeners
  closeBtn.addEventListener('click', () => modal.close());
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.close());
  }
  
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      settings.onSubmit(modal);
    });
  }
  
  // Close if clicked outside modal
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      modal.close();
    }
  });
  
  return modal;
}

// Export utilities for global use
window.utils = {
  formatDate,
  formatCurrency,
  capitalizeFirstLetter,
  showToast,
  createModal
};