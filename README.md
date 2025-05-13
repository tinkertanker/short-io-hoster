# Secure URL Shortener with Short.io

This is a secure URL shortener application that uses the short.io API. It includes a password-protected access screen before allowing users to shorten URLs.

## Features

- Secure serverless password validation
- URL shortening using short.io API
- Optional custom slug support
- Copy-to-clipboard functionality
- Responsive design
- Secure API key storage (server-side only)
- Netlify serverless functions (no spin-down time)

## Local Development Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PASSWORD_HASH=your_bcrypt_hashed_password
   SHORT_IO_API_KEY=your_short_io_api_key
   SHORT_DOMAIN=your_short_domain.example.com
   ```
   
   You can generate a bcrypt hash using:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('your-password', 12);
   console.log(hash);
   ```

4. Run the development server:
   ```
   npm run dev
   ```

## Deploying to Netlify

1. Make sure your GitHub repository is up to date
2. Log in to Netlify and click "New site from Git"
3. Connect your GitHub repository
4. Configuration settings will be automatically applied from the netlify.toml file
5. Add the following environment variables in the Netlify Dashboard:
   - `PASSWORD_HASH`: Your bcrypt-hashed password
   - `SHORT_IO_API_KEY`: Your short.io API key
   - `SHORT_DOMAIN`: Your short domain (e.g., "short.example.com")
6. Click "Deploy site"

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tinkertanker/short-io-hoster)

## Security Features

This implementation uses proper security practices:

1. The password is stored as a bcrypt hash, not in plain text
2. The Short.io API key is stored server-side and never exposed to the client
3. Server-side validation of all requests
4. Leverages Netlify's serverless functions (which don't have spin-down time like Render's free tier)

## Usage

1. Open the website and enter the password
2. Enter the URL you want to shorten
3. (Optional) Enter a custom slug
4. Click "Shorten URL"
5. Copy the shortened URL using the "Copy" button