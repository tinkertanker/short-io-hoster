# CFF URL Shortener

URL shortener with password protection, using short.io API and Netlify serverless functions.

## Features

- Password protection
- Custom slug support
- QR code generation
- Link history with search
- Fullscreen QR display
- Download as PNG or PPTX
- Dark mode support

## Setup

1. **Clone & install:**
   ```bash
   git clone <repo>
   npm install
   ```

2. **Create `.env`:**
   ```
   PASSWORD=your_password
   SHORT_IO_API_KEY=your_api_key
   SHORT_DOMAIN=your_domain.com
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

## Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tinkertanker/short-io-hoster)

After deployment, set environment variables in Netlify dashboard.

## Security

- Password stored as environment variable
- API key server-side only
- Password validation server-side
