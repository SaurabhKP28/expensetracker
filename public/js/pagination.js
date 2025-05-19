/**
 * Enhanced pagination system for the expense tracker
 */

/**
 * Create a reusable pagination component
 * @param {Object} config - Configuration options
 * @returns {Object} - Pagination methods
 */
function createPagination(config) {
  const defaults = {
    container: '.pagination',
    pageNumbersContainer: '#page-numbers',
    firstPageBtn: '#first-page-btn',
    prevPageBtn: '#prev-page-btn',
    nextPageBtn: '#next-page-btn',
    lastPageBtn: '#last-page-btn',
    currentPageIndicator: '#current-page',
    totalPagesIndicator: '#total-pages',
    itemsPerPageSelector: '#items-per-page',
    initialPage: 1,
    initialItemsPerPage: 10,
    maxPageNumbers: 5,
    onChange: () => {},
    totalItems: 0
  };
  
  // Merge defaults with config
  const settings = { ...defaults, ...config };
  
  // State variables
  let currentPage = settings.initialPage;
  let itemsPerPage = settings.initialItemsPerPage;
  let totalPages = Math.ceil(settings.totalItems / itemsPerPage) || 1;
  
  // DOM elements
  const container = document.querySelector(settings.container);
  const pageNumbersContainer = document.querySelector(settings.pageNumbersContainer);
  const firstPageBtn = document.querySelector(settings.firstPageBtn);
  const prevPageBtn = document.querySelector(settings.prevPageBtn);
  const nextPageBtn = document.querySelector(settings.nextPageBtn);
  const lastPageBtn = document.querySelector(settings.lastPageBtn);
  const currentPageIndicator = document.querySelector(settings.currentPageIndicator);
  const totalPagesIndicator = document.querySelector(settings.totalPagesIndicator);
  const itemsPerPageSelector = document.querySelector(settings.itemsPerPageSelector);
  
  // Initialization
  function init() {
    if (!container) {
      console.error('Pagination container not found');
      return;
    }
    
    // Initialize items per page selector
    if (itemsPerPageSelector) {
      itemsPerPageSelector.value = itemsPerPage.toString();
      
      itemsPerPageSelector.addEventListener('change', function() {
        const newItemsPerPage = parseInt(this.value, 10) || 10;
        setItemsPerPage(newItemsPerPage);
      });
    }
    
    // Page navigation event listeners
    if (firstPageBtn) {
      firstPageBtn.addEventListener('click', () => goToPage(1));
    }
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    }
    
    if (lastPageBtn) {
      lastPageBtn.addEventListener('click', () => goToPage(totalPages));
    }
    
    // Initial render
    render();
  }
  
  // Render pagination
  function render() {
    updatePageButtons();
    updatePageNumbers();
    updatePageIndicators();
  }
  
  // Update page navigation buttons
  function updatePageButtons() {
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    if (firstPageBtn) {
      firstPageBtn.disabled = currentPage <= 1;
    }
    
    if (lastPageBtn) {
      lastPageBtn.disabled = currentPage >= totalPages;
    }
  }
  
  // Update page numbers display
  function updatePageNumbers() {
    if (!pageNumbersContainer) return;
    
    pageNumbersContainer.innerHTML = '';
    
    let startPage = 1;
    let endPage = totalPages;
    
    // If we have more pages than we want to show
    if (totalPages > settings.maxPageNumbers) {
      // Calculate range of page numbers to show
      const halfMax = Math.floor(settings.maxPageNumbers / 2);
      
      if (currentPage <= halfMax) {
        // Near the start
        endPage = settings.maxPageNumbers;
      } else if (currentPage > totalPages - halfMax) {
        // Near the end
        startPage = totalPages - settings.maxPageNumbers + 1;
      } else {
        // In the middle
        startPage = currentPage - halfMax;
        endPage = currentPage + halfMax;
      }
      
      // Adjust if we're showing fewer than max
      if (endPage - startPage + 1 < settings.maxPageNumbers) {
        if (startPage === 1) {
          endPage = Math.min(settings.maxPageNumbers, totalPages);
        } else if (endPage === totalPages) {
          startPage = Math.max(1, totalPages - settings.maxPageNumbers + 1);
        }
      }
    }
    
    // Create number buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageNumber = document.createElement('button');
      pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
      pageNumber.textContent = i.toString();
      pageNumber.addEventListener('click', () => goToPage(i));
      pageNumbersContainer.appendChild(pageNumber);
    }
  }
  
  // Update current page and total pages indicators
  function updatePageIndicators() {
    if (currentPageIndicator) {
      currentPageIndicator.textContent = currentPage.toString();
    }
    
    if (totalPagesIndicator) {
      totalPagesIndicator.textContent = totalPages.toString();
    }
  }
  
  // Public method: Go to a specific page
  function goToPage(page) {
    if (page < 1 || page > totalPages) {
      return;
    }
    
    currentPage = page;
    render();
    
    // Call onChange callback with current state
    settings.onChange({
      page: currentPage,
      itemsPerPage,
      totalPages
    });
  }
  
  // Public method: Set the number of items per page
  function setItemsPerPage(count) {
    itemsPerPage = count;
    
    // Recalculate total pages
    totalPages = Math.ceil(settings.totalItems / itemsPerPage) || 1;
    
    // Adjust current page if it's now out of bounds
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    
    render();
    
    // Call onChange callback with current state
    settings.onChange({
      page: currentPage,
      itemsPerPage,
      totalPages
    });
  }
  
  // Public method: Update total items count
  function setTotalItems(count) {
    settings.totalItems = count;
    totalPages = Math.ceil(settings.totalItems / itemsPerPage) || 1;
    
    // Adjust current page if it's now out of bounds
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    
    render();
  }
  
  // Public method: Get current state
  function getState() {
    return {
      currentPage,
      itemsPerPage,
      totalPages,
      totalItems: settings.totalItems
    };
  }
  
  // Initialize and return public methods
  init();
  
  return {
    goToPage,
    setItemsPerPage,
    setTotalItems,
    getState,
    render
  };
}

// Export for global use
window.createPagination = createPagination;