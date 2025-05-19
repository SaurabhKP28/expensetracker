// expense.js - Manages expense functionality for non-premium users
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // DOM Elements
    const expenseForm = document.getElementById('expense-form');
    const expensesContainer = document.getElementById('expenses-container');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const currentPageSpan = document.getElementById('current-page');
    const upgradeBtn = document.getElementById('upgrade-btn');
    const premiumPromoBtn = document.getElementById('premium-promo-btn');

    // State variables
    let currentPage = 1;
    const itemsPerPage = 10;
    let totalPages = 1;

    // Initialize
    loadExpenses(currentPage);

    // Event Listeners
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            window.location.href = '/payment.html';
        });
    }

    if (premiumPromoBtn) {
        premiumPromoBtn.addEventListener('click', function() {
            window.location.href = '/payment.html';
        });
    }

    // Add expense form submission
    if (expenseForm) {
        expenseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const amount = document.getElementById('amount').value;
                const category = document.getElementById('category').value;
                const description = document.getElementById('description').value;
                const frequency = document.getElementById('frequency').value;

                if (!amount || !category) {
                    showToast('Amount and category are required', 'error');
                    return;
                }

                const response = await fetch('/expense', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount: parseFloat(amount),
                        category,
                        description,
                        frequency
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to add expense');
                }

                showToast('Expense added successfully', 'success');
                expenseForm.reset();
                loadExpenses(currentPage);

            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // Pagination event listeners
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadExpenses(currentPage);
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                loadExpenses(currentPage);
            }
        });
    }

    // Load expenses function
    async function loadExpenses(page) {
        try {
            if (!expensesContainer) return;
            
            expensesContainer.innerHTML = '<div class="text-center"><div class="loading"></div><p>Loading expenses...</p></div>';
            
            const response = await fetch(`/expense?page=${page}&limit=${itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }

            const data = await response.json();
            const expenses = data.expenses || [];
            totalPages = Math.ceil(data.total / itemsPerPage) || 1;
            
            updateExpensesList(expenses);
            updatePagination();

        } catch (error) {
            showToast(error.message, 'error');
            if (expensesContainer) {
                expensesContainer.innerHTML = '<p class="text-center">Error loading expenses</p>';
            }
        }
    }

    // Update expenses list
    function updateExpensesList(expenses) {
        if (!expensesContainer) return;
        
        if (expenses.length === 0) {
            expensesContainer.innerHTML = '<p class="text-center">No expenses found. Add your first expense!</p>';
            return;
        }
        
        expensesContainer.innerHTML = '';
        
        expenses.forEach(expense => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';
            expenseElement.id = `expense-${expense.id}`;
            
            // Format date
            const date = new Date(expense.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            expenseElement.innerHTML = `
                <div class="expense-info">
                    <div class="expense-title">${expense.description || 'Untitled Expense'}</div>
                    <div class="expense-meta">
                        <span class="expense-category category-${expense.category}">${expense.category}</span>
                        <span>${formattedDate}</span>
                        ${expense.frequency ? `<span> • ${expense.frequency}</span>` : ''}
                    </div>
                </div>
                <div class="expense-amount">$${parseFloat(expense.amount).toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="btn-danger btn-sm delete-expense" data-id="${expense.id}">Delete</button>
                </div>
            `;
            
            expensesContainer.appendChild(expenseElement);
            
            // Add event listeners for edit and delete buttons
            const deleteBtn = expenseElement.querySelector('.delete-expense');
            
            deleteBtn.addEventListener('click', () => {
                openDeleteModal(expense.id);
            });
        });
    }

    // Update pagination UI
    function updatePagination() {
        if (!currentPageSpan) return;
        
        currentPageSpan.textContent = currentPage;
        
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage >= totalPages;
        }
    }


    // Function to open delete confirmation modal
    function openDeleteModal(expenseId) {
        // Create modal markup
        const modalHTML = `
            <div class="modal-backdrop" id="delete-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Delete Expense</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="delete-expense-form">
                        <p style="padding: 1rem;">Are you sure you want to delete this expense? This action cannot be undone.</p>
                        <div class="modal-footer">
                            <button type="button" class="btn-outline" id="cancel-delete">Cancel</button>
                            <button type="submit" class="btn-danger">Delete</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Insert modal into the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add modal event listeners
        const modal = document.getElementById('delete-modal');
        const modalClose = modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-delete');
        const deleteForm = document.getElementById('delete-expense-form');
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal functions
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        modalClose.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Close if clicked outside of modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Handle form submission
        deleteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
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
                
                // Close modal
                closeModal();
                
                // Show success message
                showToast('Expense deleted successfully', 'success');
                
                // Remove expense from UI and reload expenses
                const expenseElement = document.getElementById(`expense-${expenseId}`);
                if (expenseElement) {
                    expenseElement.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        loadExpenses(currentPage);
                    }, 300);
                } else {
                    loadExpenses(currentPage);
                }
                
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // Toast notification function
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
});