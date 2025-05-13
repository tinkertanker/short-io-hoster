# Simple URL Shortener with Password Protection

This is a simple frontend-only URL shortener that uses the short.io API. It includes a basic password protection screen before allowing access to the URL shortening functionality.

## Features

- Password protected access
- URL shortening using short.io API
- Optional custom slug support
- Copy-to-clipboard functionality
- Responsive design
- GitHub Pages deployment with secure environment variables

## Setup Instructions

### Local Development

1. Clone this repository
2. Edit the `env.js` file with your test values:
   ```js
   window.env = {
     PASSWORD: 'your-password',
     SHORT_IO_API_KEY: 'your-short-io-api-key',
     SHORT_DOMAIN: 'your-short-domain.example.com'
   };
   ```
3. Open `index.html` in your browser

### GitHub Deployment Setup

1. Fork this repository or create a new one from this template
2. Go to your repository settings → Secrets and variables → Actions
3. Add the following repository secrets:
   - `PASSWORD`: The password users will need to enter to access the URL shortener
   - `SHORT_IO_API_KEY`: Your short.io API key
   - `SHORT_DOMAIN`: Your short domain (e.g., "short.example.com")
4. Push to the main branch or manually trigger the "Build and Deploy" workflow
5. GitHub Pages will be automatically set up with your site

## Usage

1. Open the website and enter the password
2. Enter the URL you want to shorten
3. (Optional) Enter a custom slug
4. Click "Shorten URL"
5. Copy the shortened URL using the "Copy" button

## Customization

You can customize the appearance by modifying the `style.css` file.

## Security Considerations

This implementation uses GitHub Secrets to store sensitive information, which are injected into the application during the build process. This approach is more secure than hardcoding values, but keep in mind:

1. The password is still visible in the client-side JavaScript after the page loads
2. This is suitable for basic access control, but not for securing highly sensitive information
3. The short.io API key is also included in the client-side code, which is a security consideration

For more secure protection, consider implementing a proper backend authentication system that doesn't expose secrets to the client.