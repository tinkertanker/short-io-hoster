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

    // Event Listeners
    passwordSubmit.addEventListener('click', validatePassword);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') validatePassword();
    });
    shortenButton.addEventListener('click', shortenUrl);
    copyButton.addEventListener('click', copyToClipboard);

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
            
            const response = await fetch('/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();
            
            if (response.ok) {
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
            
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
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
});