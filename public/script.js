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
    
    // QR Code elements
    const qrContainer = document.getElementById('qr-container');
    const qrCode = document.getElementById('qr-code');
    const fullscreenButton = document.getElementById('fullscreen-button');
    
    // Full-screen modal elements
    const fullscreenModal = document.getElementById('fullscreen-qr-modal');
    const closeFullscreenBtn = document.getElementById('close-fullscreen');
    const fullscreenUrl = document.getElementById('fullscreen-url');
    const fullscreenQr = document.getElementById('fullscreen-qr');
    const fullscreenCopy = document.getElementById('fullscreen-copy');
    const fullscreenVisit = document.getElementById('fullscreen-visit');
    const downloadContent = document.getElementById('download-content');
    const downloadImageBtn = document.getElementById('download-image');
    const downloadPptxBtn = document.getElementById('download-pptx');
    
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
    
    // State
    let currentPage = 1;
    let totalPages = 1;
    let currentSearch = '';
    let allLinks = [];
    let currentQrData = { url: '', qrUrl: '' };

    // Event Listeners
    passwordSubmit.addEventListener('click', validatePassword);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') validatePassword();
    });
    shortenButton.addEventListener('click', shortenUrl);
    copyButton.addEventListener('click', copyToClipboard);
    fullscreenButton.addEventListener('click', () => {
        showFullscreenDisplay(currentQrData.url, currentQrData.qrUrl);
    });
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Full-screen modal listeners
    closeFullscreenBtn.addEventListener('click', hideFullscreenDisplay);
    fullscreenModal.addEventListener('click', (e) => {
        if (e.target === fullscreenModal) {
            hideFullscreenDisplay();
        }
    });
    fullscreenCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(fullscreenUrl.textContent)
            .then(() => {
                fullscreenCopy.textContent = 'Copied!';
                setTimeout(() => {
                    fullscreenCopy.textContent = 'Copy URL';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    });
    
    // Download as Image button
    downloadImageBtn.addEventListener('click', async () => {
        if (typeof html2canvas === 'undefined') {
            alert('Image generation library failed to load. Please refresh the page and try again.');
            return;
        }
        
        try {
            downloadImageBtn.textContent = 'Generating...';
            downloadImageBtn.disabled = true;
            
            // Hide all action buttons before capturing
            const actionsContainer = document.querySelector('.fullscreen-actions.primary-actions');
            const downloadActionsContainer = document.querySelector('.fullscreen-actions.download-actions');
            const instructionText = document.querySelector('.fullscreen-instruction');
            
            if (actionsContainer) actionsContainer.style.display = 'none';
            if (downloadActionsContainer) downloadActionsContainer.style.display = 'none';
            if (instructionText) instructionText.style.display = 'none';
            
            // Also hide the close button
            closeFullscreenBtn.style.display = 'none';
            
            // Wait a moment for the DOM to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(downloadContent, {
                backgroundColor: '#222',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false
            });
            
            // Restore the buttons
            if (actionsContainer) actionsContainer.style.display = '';
            if (downloadActionsContainer) downloadActionsContainer.style.display = '';
            if (instructionText) instructionText.style.display = '';
            closeFullscreenBtn.style.display = '';
            
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            downloadImageBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download as Image
            `;
            downloadImageBtn.disabled = false;
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate image. Please try again.');
            
            // Restore the buttons on error too
            const actionsContainer = document.querySelector('.fullscreen-actions.primary-actions');
            const downloadActionsContainer = document.querySelector('.fullscreen-actions.download-actions');
            const instructionText = document.querySelector('.fullscreen-instruction');
            if (actionsContainer) actionsContainer.style.display = '';
            if (downloadActionsContainer) downloadActionsContainer.style.display = '';
            if (instructionText) instructionText.style.display = '';
            closeFullscreenBtn.style.display = '';
            
            downloadImageBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download as Image
            `;
            downloadImageBtn.disabled = false;
        }
    });
    
    // Download as PPTX button
    downloadPptxBtn.addEventListener('click', async () => {
        if (typeof PptxGenJS === 'undefined') {
            alert('PowerPoint generation library failed to load. Please refresh the page and try again.');
            return;
        }
        
        try {
            downloadPptxBtn.textContent = 'Generating...';
            downloadPptxBtn.disabled = true;
            
            // Create a new presentation
            const pptx = new PptxGenJS();
            
            const slide = pptx.addSlide();
            
            // Add background color
            slide.background = { color: '222222' };
            
            // Add "Link:" label in white
            slide.addText('Link:', {
                x: 0.5, y: 0.5, w: 9, h: 0.5,
                fontSize: 28,
                color: 'FFFFFF',
                align: 'center'
            });
            
            // Add URL in salmon color
            const displayUrl = fullscreenUrl.textContent;
            slide.addText(displayUrl, {
                x: 0.5, y: 1.2, w: 9, h: 1,
                fontSize: 40,
                color: 'FA8072',
                bold: true,
                align: 'center',
                wrap: true
            });
            
            // Get QR code and convert to proper format for PptxGenJS
            const qrImage = fullscreenQr.src;
            if (qrImage && qrImage.startsWith('data:image')) {
                // Extract base64 data from data URL
                const base64Data = qrImage.split(',')[1];
                
                slide.addImage({
                    data: base64Data,
                    x: 2.5, y: 2.8, w: 5, h: 5,
                    sizing: { type: 'contain', w: 5, h: 5 }
                });
            }
            
            // Add instruction text
            slide.addText('Scan QR code or visit the URL above', {
                x: 0.5, y: 7.5, w: 9, h: 0.5,
                fontSize: 20,
                color: '999999',
                align: 'center'
            });
            
            // Save the presentation
            await pptx.writeFile({ fileName: `qr-code-${Date.now()}.pptx` });
            
            downloadPptxBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Download as PPTX
            `;
            downloadPptxBtn.disabled = false;
        } catch (error) {
            console.error('Error generating PPTX:', error);
            alert('Failed to generate PowerPoint. Please try again.');
            downloadPptxBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Download as PPTX
            `;
            downloadPptxBtn.disabled = false;
        }
    });

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
            currentQrData.url = data.shortURL;
            currentQrData.qrUrl = data.qrCodeURL;
            
            // Show QR code if available
            if (data.qrCodeURL) {
                qrCode.src = data.qrCodeURL;
                qrContainer.classList.remove('hidden');
            } else {
                qrContainer.classList.add('hidden');
            }
            
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
    
    // Show link in full-screen display (for history items)
    async function showLinkFullscreen(link) {
        const shortUrl = link.shortURL || link.shortUrl;
        
        // Try to get QR code from API if available, otherwise generate one
        let qrUrl = link.qrCodeURL;
        if (!qrUrl && link.idString) {
            try {
                const response = await fetch(`/.netlify/functions/api/links/${link.idString}/qr?password=${encodeURIComponent(sessionStorage.getItem('password'))}`);
                if (response.ok) {
                    const data = await response.json();
                    qrUrl = data.qrURL || data.url;
                }
            } catch (e) {
                console.error('Failed to fetch QR code:', e);
            }
        }
        
        // If still no QR URL, generate one using a free QR code API
        if (!qrUrl) {
            qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`;
        }
        
        showFullscreenDisplay(shortUrl, qrUrl);
    }
    
    // Show full-screen QR display
    function showFullscreenDisplay(url, qrUrl) {
        // Strip https:// for display
        const displayUrl = url.replace(/^https?:\/\//, '');
        fullscreenUrl.textContent = displayUrl;
        fullscreenQr.src = qrUrl;
        fullscreenVisit.href = url;
        fullscreenModal.classList.add('active');
        
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    // Hide full-screen QR display
    function hideFullscreenDisplay() {
        fullscreenModal.classList.remove('active');
        
        // Re-enable scrolling
        document.body.style.overflow = '';
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
                        <button class="btn-show" data-id="${link.idString || link.id}">Show</button>
                        <button class="btn-copy" data-url="${link.shortURL || link.shortUrl || ''}">Copy</button>
                        <button class="btn-edit" data-id="${link.idString || link.id}">Edit</button>
                        <a href="${link.shortURL || link.shortUrl || ''}" target="_blank" class="btn-visit-mini" title="Go to link">
                            <span class="arrow">→</span>
                        </a>
                        <button class="btn-danger btn-delete" data-id="${link.idString || link.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-show').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const linkId = btn.dataset.id;
                const link = allLinks.find(l => (l.idString || l.id) === linkId);
                if (link) {
                    showLinkFullscreen(link);
                }
            });
        });
        
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
        
        // Add click handler to cards for showing fullscreen display
        document.querySelectorAll('.link-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('a')) {
                    const linkId = card.dataset.id;
                    const link = allLinks.find(l => (l.idString || l.id) === linkId);
                    if (link) {
                        showLinkFullscreen(link);
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
