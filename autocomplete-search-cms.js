// Advanced Search with Autocomplete - Unique Variable Names

// DOM element selectors
const getSearchElementBySelector = (selector) => document.querySelector(selector);
const getAllSearchElementsBySelector = (selector) => document.querySelectorAll(selector);

// Main elements
const searchForm = getSearchElementBySelector('[tu-autosearch-element="search-form"]');
const searchInput = getSearchElementBySelector('[tu-autosearch-element="search-input"]');
const searchResultsContainer = getSearchElementBySelector('[tu-autosearch-element="search-results"]');
const searchResultItems = getAllSearchElementsBySelector('[tu-autosearch-element="search-result-item"]');
const searchNoResultsBlock = getSearchElementBySelector('[tu-autosearch-element="empty"]');

// State
let searchFocusedItemIndex = -1;

// Helper functions
function setSearchElementVisibility(element, isVisible) {
  element.style.display = isVisible ? 'block' : 'none';
}

function resetSearchState() {
  setSearchElementVisibility(searchResultsContainer, true);
  setSearchElementVisibility(searchNoResultsBlock, false);
  performSearch();
}

// Event handlers
function performSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  let hasMatchingResults = false;

  searchResultItems.forEach(resultItem => {
    const isItemMatch = searchTerm === '' || resultItem.textContent.toLowerCase().includes(searchTerm);
    setSearchElementVisibility(resultItem, isItemMatch);
    if (isItemMatch) hasMatchingResults = true;
  });

  setSearchElementVisibility(searchNoResultsBlock, !hasMatchingResults);
  setSearchElementVisibility(searchResultsContainer, hasMatchingResults);

  searchFocusedItemIndex = -1;
}

function handleSearchKeyboardNavigation(event) {
  const visibleResultItems = Array.from(searchResultItems).filter(item => item.style.display !== 'none');

  if (visibleResultItems.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp':
      event.preventDefault();
      if (!searchResultsContainer.style.display || searchResultsContainer.style.display === 'none') {
        setSearchElementVisibility(searchResultsContainer, true);
        searchFocusedItemIndex = event.key === 'ArrowDown' ? 0 : visibleResultItems.length - 1;
      } else {
        searchFocusedItemIndex = event.key === 'ArrowDown'
          ? (searchFocusedItemIndex + 1) % visibleResultItems.length
          : (searchFocusedItemIndex - 1 + visibleResultItems.length) % visibleResultItems.length;
      }
      updateSearchFocusedItem(visibleResultItems);
      break;
    case 'Enter':
      event.preventDefault();
      if (searchFocusedItemIndex >= 0) {
        handleSearchResultItemSelection(visibleResultItems[searchFocusedItemIndex]);
      }
      break;
    case 'Escape':
      setSearchElementVisibility(searchResultsContainer, false);
      setSearchElementVisibility(searchNoResultsBlock, false);
      searchInput.blur();
      break;
  }
}

function handleSearchOutsideClick(event) {
  if (!searchForm.contains(event.target)) {
    setSearchElementVisibility(searchResultsContainer, false);
    setSearchElementVisibility(searchNoResultsBlock, false);
  }
}

function handleSearchResultItemSelection(selectedItem) {
  const actionType = selectedItem.getAttribute('tu-autosearch-action');
  if (actionType === 'open-link') {
    const linkElement = selectedItem.querySelector('a');
    if (linkElement) linkElement.click();
  } else if (actionType === 'autocomplete') {
    searchInput.value = selectedItem.textContent.trim();
    setSearchElementVisibility(searchResultsContainer, false);
    setSearchElementVisibility(searchNoResultsBlock, false);
  }
}

function updateSearchFocusedItem(visibleResultItems) {
  visibleResultItems.forEach((item, index) => {
    item.classList.toggle('is-focused', index === searchFocusedItemIndex);
  });
  if (searchFocusedItemIndex >= 0) {
    const focusedItem = visibleResultItems[searchFocusedItemIndex];
    const containerRect = searchResultsContainer.getBoundingClientRect();
    const itemRect = focusedItem.getBoundingClientRect();
    
    // Calculate the scroll offset
    const scrollOffset = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize); // 3rem in pixels
    
    if (itemRect.bottom > containerRect.bottom - scrollOffset) {
      // Scroll down if the item is below the visible area
      searchResultsContainer.scrollTop += itemRect.bottom - containerRect.bottom + scrollOffset;
    } else if (itemRect.top < containerRect.top) {
      // Scroll up if the item is above the visible area
      searchResultsContainer.scrollTop += itemRect.top - containerRect.top;
    }
  }
}

// Setup functions
function setupSearchEventListeners() {
  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('focus', () => searchInput.value === '' ? resetSearchState() : performSearch());
  searchInput.addEventListener('keyup', (event) => event.key === 'Backspace' && performSearch());
  searchInput.addEventListener('keydown', handleSearchKeyboardNavigation);
  document.addEventListener('click', handleSearchOutsideClick);
}

function handleSearchFormSubmission() {
  if (searchForm.getAttribute('tu-autosearch-form-submit') === 'false') {
    searchForm.addEventListener('submit', (event) => event.preventDefault());
  }
}

function setupSearchKeyboardShortcut() {
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      searchInput.focus();
    }
  });
}

// Initialization
function initializeAdvancedSearch() {
  setSearchElementVisibility(searchResultsContainer, false);
  setSearchElementVisibility(searchNoResultsBlock, false);
  setupSearchEventListeners();
  handleSearchFormSubmission();
  setupSearchKeyboardShortcut();
}

// Initialize the advanced search
document.addEventListener('DOMContentLoaded', initializeAdvancedSearch);