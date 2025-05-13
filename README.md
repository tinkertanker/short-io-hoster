# Simple URL Shortener with Short.io

This is a simple URL shortener application that uses the short.io API. It includes a basic password protection screen before allowing users to shorten URLs.

## Features

- Basic password protection
- URL shortening using short.io API
- Optional custom slug support
- Copy-to-clipboard functionality
- Responsive design
- API key storage (server-side only)
- Netlify serverless functions (no spin-down time)

## Local Development Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PASSWORD=your_password
   SHORT_IO_API_KEY=your_short_io_api_key
   SHORT_DOMAIN=your_short_domain.example.com
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser to http://localhost:8888

## Deploying to Netlify

1. Make sure your GitHub repository is up to date
2. Log in to Netlify and click "New site from Git"
3. Connect your GitHub repository
4. Configuration settings will be automatically applied from the netlify.toml file
5. Add the following environment variables in the Netlify Dashboard:
   - `PASSWORD`: Your desired password
   - `SHORT_IO_API_KEY`: Your short.io API key
   - `SHORT_DOMAIN`: Your short domain (e.g., "short.example.com")
6. Click "Deploy site"

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tinkertanker/short-io-hoster)

## Security Notes

This implementation uses a simple approach:

1. The password is stored as an environment variable
2. The short.io API key is stored server-side and never exposed to the client
3. Password validation happens server-side
4. Leverages Netlify's serverless functions (which don't have spin-down time like Render's free tier)

This is suitable for basic access control, but not for securing highly sensitive information.

## Usage

1. Open the website and enter the password
2. Enter the URL you want to shorten
3. (Optional) Enter a custom slug
4. Click "Shorten URL"
5. Copy the shortened URL using the "Copy" button