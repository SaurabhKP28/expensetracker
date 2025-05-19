/**
 * Enhanced expenses.js - Manages expense functionality for premium users
 * Includes:
 * - Dynamic pagination
 * - Fixed date handling
 * - Improved UX with loading indicators
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated and premium
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  checkPremiumStatus();
  loadUserProfile();

  // DOM Elements
  const expenseForm = document.getElementById('expense-form');
  const expensesContainer = document.getElementById('expenses-container');
  const leaderboardBtn = document.getElementById('leaderboard-btn');
  const leaderboard = document.getElementById('leaderboard');
  const leaderboardContainer = document.getElementById('leaderboard-container');
  const reportTypeSelect = document.getElementById('report-type');
  const viewReportBtn = document.getElementById('view-report-btn');
  const downloadReportBtn = document.getElementById('download-report-btn');
  const reportContainer = document.getElementById('report-container');
  const itemsPerPageSelect = document.getElementById('items-per-page');
  const userNameElement = document.getElementById('user-name');
  const userEmailElement = document.getElementById('user-email');

  // State variables
  let isLeaderboardVisible = false;
  
  // Initialize pagination
  const pagination = window.createPagination({
    initialItemsPerPage: parseInt(itemsPerPageSelect?.value || '10', 10),
    onChange: (state) => {
      loadExpenses(state.page, state.itemsPerPage);
    }
  });
  
 // Toggle user details visibility
function toggleUserDetails() {
  const isVisible = userDetailsBox.style.display === 'block';
  if (isVisible) {
    userDetailsBox.style.display = 'none';
  } else {
    userDetailsBox.style.display = 'block';
    loadUserProfile(); // Load data only when opening
  }
}

// Load user profile data from API
async function loadUserProfile() {
  try {
    const response = await fetch('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const user = await response.json();

    // Set the fetched data
    userNameElement.textContent = user.name || 'No Name';
    userEmailElement.textContent = user.email || 'No Email';

  } catch (error) {
    console.error('Error loading user profile:', error);
    userNameElement.textContent = 'Error loading';
    userEmailElement.textContent = '';
  }
}
  
  // Check if user is actually premium
  async function checkPremiumStatus() {
    try {
      const response = await fetch('/auth/check-premium', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check premium status');
      }
      
      const data = await response.json();
      
      if (!data.isPremium) {
        window.location.href = '/expense.html';
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      window.location.href = '/expense.html';
    }
  }
  
  // Initialize by loading expenses for the first page
  loadExpenses(1, parseInt(itemsPerPageSelect?.value || '10', 10));
  
  // Add expense form submission
  /*
  if (expenseForm) {
    expenseForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const frequency = document.getElementById('frequency').value;
        
        if (!amount || !category) {
          window.utils.showToast('Please fill in all required fields', 'error');
          return;
        }
        
        const expenseData = {
          amount: parseFloat(amount),
          category,
          description,
          frequency
        };
        
        // Show loading state in button
        const submitBtn = expenseForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Adding...';
        
        const response = await fetch('/expense', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(expenseData)
        });
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add expense');
        }
        
        // Clear form
        expenseForm.reset();
        
        // Show success message
        window.utils.showToast('Expense added successfully', 'success');
        
        // Reload current page of expenses
        const state = pagination.getState();
        loadExpenses(state.currentPage, state.itemsPerPage);
        
      } catch (error) {
        window.utils.showToast(error.message, 'error');
      }
    });
  }
    */

  
  if (expenseForm) {
  expenseForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      const amount = document.getElementById('amount').value;
      const category = document.getElementById('category').value;
      const description = document.getElementById('description').value;
      const frequency = document.getElementById('frequency').value;

      if (!amount || !category) {
        window.utils.showToast('Please fill in all required fields', 'error');
        return;
      }

      const expenseData = {
        amount: parseFloat(amount),
        category,
        description,
        frequency,
      };

      // Show loading state in button
      const submitBtn = expenseForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading"></span> Adding...';

      const response = await fetch('/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add expense');
      }

      // Clear form
      expenseForm.reset();

      // Show success message
      window.utils.showToast('Expense added successfully', 'success');

      // Reload current page of expenses
      const state = pagination.getState();
      loadExpenses(state.currentPage, state.itemsPerPage);

      // Update leaderboard
      fetchLeaderboard(); // Automatically refresh the leaderboard

    } catch (error) {
      window.utils.showToast(error.message, 'error');
    }
  });
}
  
  // Leaderboard toggle
  if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', function() {
      if (isLeaderboardVisible) {
        leaderboard.style.display = 'none';
        leaderboardBtn.textContent = 'Show Leaderboard';
      } else {
        fetchLeaderboard();
        leaderboard.style.display = 'block';
        leaderboardBtn.textContent = 'Hide Leaderboard';
      }
      
      isLeaderboardVisible = !isLeaderboardVisible;
    });
  }
  
  // Report buttons
  if (viewReportBtn) {
    viewReportBtn.addEventListener('click', function() {
      const reportType = reportTypeSelect.value;
      generateReport(reportType);
    });
  }
  
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', function() {
      const reportType = reportTypeSelect.value;
      downloadReport(reportType);
    });
  }
  
  // Function to load expenses with pagination
  async function loadExpenses(page, limit) {
    try {
      if (!expensesContainer) return;
      
      expensesContainer.innerHTML = '<div class="text-center"><div class="loading"></div><p>Loading expenses...</p></div>';
      
      const response = await fetch(`/expense?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const data = await response.json();
      const expenses = data.expenses || [];
      const totalItems = data.total || 0;
      
      // Update pagination with total items
      pagination.setTotalItems(totalItems);
      
      // Update UI
      updateExpensesList(expenses);
      
    } catch (error) {
      window.utils.showToast(error.message, 'error');
      if (expensesContainer) {
        expensesContainer.innerHTML = '<p class="text-center">Error loading expenses</p>';
      }
    }
  }
  
  // Function to update the expenses list UI
  function updateExpensesList(expenses) {
    if (!expensesContainer) return;
    
    if (expenses.length === 0) {
      expensesContainer.innerHTML = '<p class="text-center">No expenses found. Add your first expense!</p>';
      return;
    }
    
    expensesContainer.innerHTML = '';
    
    expenses.forEach(expense => {
      const expenseItem = document.createElement('div');
      expenseItem.className = 'expense-item';
      expenseItem.id = `expense-${expense.id}`;
      
      // Format date using the utility function
      const formattedDate = window.utils.formatDate(expense.createdAt);
      
      expenseItem.innerHTML = `
        <div class="expense-info">
          <div class="expense-title">${expense.description || 'Untitled Expense'}</div>
          <div class="expense-meta">
            <span class="expense-category category-${expense.category}">${expense.category}</span>
            <span>${formattedDate}</span>
            ${expense.frequency ? `<span> • ${expense.frequency}</span>` : ''}
          </div>
        </div>
        <div class="expense-amount">${window.utils.formatCurrency(expense.amount)}</div>
        <div class="expense-actions">
          <button class="btn-danger btn-sm delete-expense" data-id="${expense.id}">Delete</button>
        </div>
      `;
      
      expensesContainer.appendChild(expenseItem);
      
      // Add event listeners for edit and delete buttons
      //const editBtn = expenseItem.querySelector('.edit-expense');
      const deleteBtn = expenseItem.querySelector('.delete-expense');
      
      /*
      editBtn.addEventListener('click', () => {
        openEditModal(expense);
      });
      */
      deleteBtn.addEventListener('click', () => {
        openDeleteModal(expense.id);
      });
    });
  }
  
  // Function to fetch leaderboard data
  async function fetchLeaderboard() {
    try {
      if (!leaderboardContainer) return;
      
      leaderboardContainer.innerHTML = '<div class="text-center"><div class="loading"></div><p>Loading leaderboard...</p></div>';
      
      const response = await fetch('/leaderboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const leaderboardData = await response.json();
      
      if (leaderboardData.length === 0) {
        leaderboardContainer.innerHTML = '<p class="text-center">No leaderboard data available yet.</p>';
        return;
      }
      
      leaderboardContainer.innerHTML = '';
      
      leaderboardData.forEach((user, index) => {
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = 'leaderboard-item';
        
        leaderboardItem.innerHTML = `
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-user">${user.name}</div>
          <div class="leaderboard-amount">${window.utils.formatCurrency(user.totalExpense)}</div>
        `;
        
        leaderboardContainer.appendChild(leaderboardItem);
      });
      
    } catch (error) {
      window.utils.showToast(error.message, 'error');
      leaderboardContainer.innerHTML = '<p class="text-center">Error loading leaderboard</p>';
    }
  }
  
  // Function to generate expense report with fixed date handling
 async function generateReport(timeframe) {
  try {
    if (!reportContainer) return;

    // Show loading indicator
    reportContainer.innerHTML = '<div class="text-center"><div class="loading"></div><p>Generating report...</p></div>';

    // Fetch report data from the server
    const response = await fetch(`/expense/report/${timeframe}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    const reportData = await response.json();

    // Filter expenses based on frequency
    const now = new Date();
    const filteredExpenses = reportData.expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt);

      if (timeframe === 'daily') {
        return (
          expense.frequency === 'daily' &&
          expenseDate.toDateString() === now.toDateString()
        );
      } else if (timeframe === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return (
          expense.frequency === 'weekly' &&
          expenseDate >= oneWeekAgo &&
          expenseDate <= now
        );
      } else if (timeframe === 'monthly') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return (
          expense.frequency === 'monthly' &&
          expenseDate >= oneMonthAgo &&
          expenseDate <= now
        );
      }
      return false;
    });

    // Build the report UI
    let reportHTML = `
      <div class="report-card">
        <h3>${window.utils.capitalizeFirstLetter(timeframe)} Expense Report</h3>
        <div class="report-stats">
          <div class="stat-card">
            <div class="stat-title">Total Expenses</div>
            <div class="stat-value">${window.utils.formatCurrency(reportData.totalAmount || 0)}</div>
          </div>
        </div>
    `;

    // Add category breakdown
    if (reportData.categoryTotals && reportData.categoryTotals.length > 0) {
      reportHTML += '<h4>Expenses by Category</h4><div class="category-breakdown">';
      reportData.categoryTotals.forEach(category => {
        reportHTML += `
          <div class="expense-item">
            <div class="expense-info">
              <div class="expense-title">${category.category}</div>
            </div>
            <div class="expense-amount">${window.utils.formatCurrency(category.total)}</div>
          </div>
        `;
      });
      reportHTML += '</div>';
    }

    // Add expense details
    if (filteredExpenses.length > 0) {
      reportHTML += '<h4>Expense Details</h4>';
      filteredExpenses.forEach(expense => {
        const formattedDate = window.utils.formatDate(expense.createdAt);
        reportHTML += `
          <div class="expense-item">
            <div class="expense-info">
              <div class="expense-title">${expense.description || 'Untitled Expense'}</div>
              <div class="expense-meta">
                <span class="expense-category category-${expense.category}">${expense.category}</span>
                <span>${formattedDate}</span>
              </div>
            </div>
            <div class="expense-amount">${window.utils.formatCurrency(expense.amount)}</div>
          </div>
        `;
      });
    } else {
      reportHTML += '<p class="text-center">No expenses found for this period.</p>';
    }

    reportHTML += '</div>';
    reportContainer.innerHTML = reportHTML;

  } catch (error) {
    console.error('Error generating report:', error);
    reportContainer.innerHTML = '<p class="text-center">Error generating report</p>';
  }
}
  


  // Function to open delete confirmation modal
  function openDeleteModal(expenseId) {
    const modal = window.utils.createModal({
      title: 'Delete Expense',
      content: '<p>Are you sure you want to delete this expense? This action cannot be undone.</p>',
      submitText: 'Delete',
      onSubmit: async (modal) => {
        try {
          // Update submit button to show loading
          const submitBtn = modal.getElement().querySelector('.modal-submit');
          const originalText = submitBtn.textContent;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="loading"></span> Deleting...';
          
          const response = await fetch(`/expense/${expenseId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete expense');
          }
          
          modal.close();
          window.utils.showToast('Expense deleted successfully', 'success');
          
          // Remove expense from UI with animation
          const expenseElement = document.getElementById(`expense-${expenseId}`);
          if (expenseElement) {
            expenseElement.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
              // Reload expenses after animation
              const state = pagination.getState();
              loadExpenses(state.currentPage, state.itemsPerPage);
            }, 300);
          } else {
            // Reload expenses immediately if element not found
            const state = pagination.getState();
            loadExpenses(state.currentPage, state.itemsPerPage);
          }
          
        } catch (error) {
          window.utils.showToast(error.message, 'error');
          
          // Reset submit button
          const submitBtn = modal.getElement().querySelector('.modal-submit');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Delete';
        }
      }
    });
    
    modal.open();
  }
});