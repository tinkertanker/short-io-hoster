# Secure URL Shortener with Short.io

This is a secure URL shortener application that uses the short.io API. It includes a password-protected access screen before allowing users to shorten URLs.

## Features

- Secure server-side password validation
- URL shortening using short.io API
- Optional custom slug support
- Copy-to-clipboard functionality
- Responsive design
- Secure API key storage (server-side only)

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

## Deploying to Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following environment variables in the Render Dashboard:
   - `PASSWORD_HASH`: Your bcrypt-hashed password
   - `SHORT_IO_API_KEY`: Your short.io API key
   - `SHORT_DOMAIN`: Your short domain (e.g., "short.example.com")

## Security Features

This implementation uses proper security practices:

1. The password is stored as a bcrypt hash, not in plain text
2. The Short.io API key is stored server-side and never exposed to the client
3. Server-side validation of all requests

## Usage

1. Open the website and enter the password
2. Enter the URL you want to shorten
3. (Optional) Enter a custom slug
4. Click "Shorten URL"
5. Copy the shortened URL using the "Copy" button