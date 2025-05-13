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

    // Event Listeners
    passwordSubmit.addEventListener('click', validatePassword);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') validatePassword();
    });
    shortenButton.addEventListener('click', shortenUrl);
    copyButton.addEventListener('click', copyToClipboard);
    darkModeToggle.addEventListener('click', toggleDarkMode);

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