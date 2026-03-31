document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordScreen = document.getElementById('password-screen');
    const shortenerScreen = document.getElementById('shortener-screen');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    const urlInput = document.getElementById('url-input');
    const slugInput = document.getElementById('slug-input');
    const shortenButton = document.getElementById('shorten-button');
    const resultContainer = document.getElementById('result-container');
    const shortenedUrl = document.getElementById('shortened-url');
    const copyButton = document.getElementById('copy-button');
    const errorMessage = document.getElementById('error-message');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // History elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const linksList = document.getElementById('links-list');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    const container = document.getElementById('main-container');
    
    // State
    let currentPage = 1;
    let totalPages = 1;
    let currentSearch = '';
    let allLinks = [];

    // Event Listeners
    passwordSubmit.addEventListener('click', validatePassword);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') validatePassword();
    });
    shortenButton.addEventListener('click', shortenUrl);
    copyButton.addEventListener('click', copyToClipboard);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Tab navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // History search
    searchButton.addEventListener('click', () => {
        currentPage = 1;
        currentSearch = searchInput.value.trim();
        loadLinks();
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            currentSearch = searchInput.value.trim();
            loadLinks();
        }
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadLinks();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadLinks();
        }
    });

    // Check for saved theme preference and apply it
    initializeTheme();

    // Functions
    async function validatePassword() {
        const password = passwordInput.value;

        if (!password) {
            passwordError.textContent = 'Please enter a password.';
            return;
        }

        try {
            passwordSubmit.disabled = true;
            passwordSubmit.textContent = 'Checking...';

            const response = await fetch('/.netlify/functions/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store password temporarily for subsequent requests
                sessionStorage.setItem('password', password);

                passwordScreen.classList.remove('active');
                shortenerScreen.classList.add('active');
                
                // Load links when entering the app
                loadLinks();
            } else {
                passwordError.textContent = data.error || 'Authentication failed. Please try again.';
                passwordInput.value = '';
            }
        } catch (error) {
            passwordError.textContent = 'An error occurred. Please try again.';
            console.error('Authentication error:', error);
        } finally {
            passwordSubmit.disabled = false;
            passwordSubmit.textContent = 'Submit';
        }
    }

    async function shortenUrl() {
        const url = urlInput.value;
        const slug = slugInput.value;
        const password = sessionStorage.getItem('password');

        // Basic URL validation
        if (!url) {
            showError('Please enter a URL to shorten.');
            return;
        }

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL.');
            return;
        }

        // Hide any previous errors and results
        errorMessage.textContent = '';
        resultContainer.classList.add('hidden');

        try {
            // Show loading state
            shortenButton.textContent = 'Shortening...';
            shortenButton.disabled = true;

            const response = await fetch('/.netlify/functions/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password,
                    url,
                    slug
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to shorten URL');
            }

            const data = await response.json();

            // Display the result
            shortenedUrl.textContent = data.shortURL;
            resultContainer.classList.remove('hidden');

            // Reset inputs
            urlInput.value = '';
            slugInput.value = '';
            
            // Refresh the links list if we're on the history tab
            if (document.getElementById('history-tab').classList.contains('active')) {
                loadLinks();
            }
        } catch (error) {
            showError(`Error: ${error.message}`);
            // If authentication error, go back to password screen
            if (error.message.includes('Invalid password') || error.message.includes('Password is required')) {
                sessionStorage.removeItem('password');
                passwordScreen.classList.add('active');
                shortenerScreen.classList.remove('active');
            }
        } finally {
            // Reset button state
            shortenButton.textContent = 'Shorten URL';
            shortenButton.disabled = false;
        }
    }

    function copyToClipboard() {
        const text = shortenedUrl.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    }

    function showError(message) {
        errorMessage.textContent = message;
    }

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Tab switching
    function switchTab(tabName) {
        // Update tab buttons
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab content
        tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Toggle wide container for history tab
        if (tabName === 'history') {
            container.classList.add('wide');
        } else {
            container.classList.remove('wide');
        }
        
        // Load links when switching to history tab
        if (tabName === 'history') {
            loadLinks();
        }
    }
    
    // Load links from API
    async function loadLinks() {
        const password = sessionStorage.getItem('password');
        
        if (!password) {
            return;
        }
        
        linksList.innerHTML = '<div class="loading">Loading links...</div>';
        pagination.classList.add('hidden');
        
        try {
            const params = new URLSearchParams();
            params.append('password', password);
            params.append('page', currentPage);
            params.append('limit', 10);
            
            if (currentSearch) {
                params.append('search', currentSearch);
            }
            
            const response = await fetch(`/.netlify/functions/api/links?${params.toString()}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to load links');
            }
            
            const data = await response.json();
            allLinks = data.links || [];
            totalPages = Math.ceil((data.total || 0) / 10);
            
            renderLinks(allLinks);
            updatePagination();
        } catch (error) {
            linksList.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            
            if (error.message.includes('Invalid password') || error.message.includes('Password is required')) {
                sessionStorage.removeItem('password');
                passwordScreen.classList.add('active');
                shortenerScreen.classList.remove('active');
            }
        }
    }
    
    // Render links list
    function renderLinks(links) {
        if (links.length === 0) {
            linksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔗</div>
                    <p>No links found.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">${currentSearch ? 'Try adjusting your search.' : 'Create your first shortened link!'}</p>
                </div>
            `;
            return;
        }
        
        linksList.innerHTML = links.map(link => {
            const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const originalUrl = link.originalURL || link.originalUrl || '';
            const truncatedUrl = originalUrl.length > 50 ? originalUrl.substring(0, 50) + '...' : originalUrl;
            
            return `
                <div class="link-card" data-id="${link.idString || link.id}">
                    <div class="link-card-header">
                        <span class="link-short-url">${link.shortURL || link.shortUrl || ''}</span>
                        <span class="link-date">${createdDate}</span>
                    </div>
                    <div class="link-original-url" title="${originalUrl}">${truncatedUrl}</div>
                    <div class="link-clicks">👆 ${link.clicks || 0} clicks</div>
                    <div class="link-actions">
                        <button class="btn-copy" data-url="${link.shortURL || link.shortUrl || ''}">Copy</button>
                        <button class="btn-edit" data-id="${link.idString || link.id}">Edit</button>
                        <button class="btn-danger btn-delete" data-id="${link.idString || link.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                navigator.clipboard.writeText(url)
                    .then(() => {
                        const originalText = btn.textContent;
                        btn.textContent = 'Copied!';
                        setTimeout(() => {
                            btn.textContent = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy:', err);
                    });
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const linkId = btn.dataset.id;
                const link = allLinks.find(l => (l.idString || l.id) === linkId);
                if (link) {
                    showEditModal(link);
                }
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const linkId = btn.dataset.id;
                showDeleteModal(linkId);
            });
        });
        
        // Add click handler to cards for opening the link
        document.querySelectorAll('.link-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const linkId = card.dataset.id;
                    const link = allLinks.find(l => (l.idString || l.id) === linkId);
                    if (link && (link.shortURL || link.shortUrl)) {
                        window.open(link.shortURL || link.shortUrl, '_blank');
                    }
                }
            });
        });
    }
    
    // Update pagination controls
    function updatePagination() {
        if (totalPages <= 1) {
            pagination.classList.add('hidden');
            return;
        }
        
        pagination.classList.remove('hidden');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Show edit modal
    function showEditModal(link) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('edit-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'edit-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <h2>Edit Link</h2>
                    <div class="form-group">
                        <label>Original URL</label>
                        <input type="url" id="edit-url" placeholder="Enter URL">
                    </div>
                    <div class="form-group">
                        <label>Custom Slug (optional)</label>
                        <input type="text" id="edit-slug" placeholder="Custom slug">
                    </div>
                    <div class="modal-buttons">
                        <button class="btn-cancel" id="edit-cancel">Cancel</button>
                        <button id="edit-save">Save Changes</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Close modal on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
            
            document.getElementById('edit-cancel').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Populate modal with link data
        document.getElementById('edit-url').value = link.originalURL || link.originalUrl || '';
        document.getElementById('edit-slug').value = link.path || '';
        
        // Handle save
        const saveBtn = document.getElementById('edit-save');
        saveBtn.onclick = async () => {
            const password = sessionStorage.getItem('password');
            const originalURL = document.getElementById('edit-url').value;
            const path = document.getElementById('edit-slug').value;
            
            if (!originalURL) {
                showError('Please enter a URL');
                return;
            }
            
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            try {
                const response = await fetch(`/.netlify/functions/api/links/${link.idString || link.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        password,
                        originalURL,
                        path
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update link');
                }
                
                modal.classList.remove('active');
                loadLinks(); // Refresh the list
            } catch (error) {
                showError(`Error: ${error.message}`);
            } finally {
                saveBtn.textContent = 'Save Changes';
                saveBtn.disabled = false;
            }
        };
        
        modal.classList.add('active');
    }
    
    // Show delete confirmation modal
    function showDeleteModal(linkId) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('delete-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'delete-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <h2>Delete Link</h2>
                    <p>Are you sure you want to delete this link? This action cannot be undone.</p>
                    <div class="modal-buttons">
                        <button class="btn-cancel" id="delete-cancel">Cancel</button>
                        <button class="btn-danger" id="delete-confirm">Delete</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Close modal on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
            
            document.getElementById('delete-cancel').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Handle delete
        const deleteBtn = document.getElementById('delete-confirm');
        deleteBtn.onclick = async () => {
            const password = sessionStorage.getItem('password');
            
            deleteBtn.textContent = 'Deleting...';
            deleteBtn.disabled = true;
            
            try {
                const response = await fetch(`/.netlify/functions/api/links/${linkId}?password=${encodeURIComponent(password)}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to delete link');
                }
                
                modal.classList.remove('active');
                loadLinks(); // Refresh the list
            } catch (error) {
                showError(`Error: ${error.message}`);
            } finally {
                deleteBtn.textContent = 'Delete';
                deleteBtn.disabled = false;
            }
        };
        
        modal.classList.add('active');
    }

    // Dark mode functions
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    }

    function initializeTheme() {
        // Check if user has a preference stored
        const savedTheme = localStorage.getItem('darkMode');

        // Check if user has a system preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

        // If the user has explicitly chosen a theme, use that
        if (savedTheme === 'enabled') {
            document.body.classList.add('dark-mode');
        } else if (savedTheme === 'disabled') {
            document.body.classList.remove('dark-mode');
        } else if (prefersDarkScheme.matches) {
            // If no saved preference but system prefers dark mode
            document.body.classList.add('dark-mode');
        }

        // Also listen for system theme changes
        prefersDarkScheme.addEventListener('change', (e) => {
            // Only apply system preference if user hasn't set a preference
            if (!localStorage.getItem('darkMode')) {
                if (e.matches) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        });
    }
});
