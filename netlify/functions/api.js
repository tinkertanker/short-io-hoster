// Serverless function for our API endpoints
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');

const app = express();
const router = express.Router();

// Simple password - set via environment variable
// Check both environment variables for flexibility
const SIMPLE_PASSWORD = process.env.PASSWORD || process.env.PASSWORD_HASH || 'IMDACFF2025!';
console.log('Environment variables loaded:');
console.log('- PASSWORD:', process.env.PASSWORD);
console.log('- PASSWORD_HASH:', process.env.PASSWORD_HASH);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'application/json' }));
app.use(express.json());

// Routes
router.post('/authenticate', (req, res) => {
  console.log('Authentication request received:', req.body);
  console.log('Authentication request body type:', typeof req.body);
  console.log('Expected password:', SIMPLE_PASSWORD);

  // Handle potential Buffer object in req.body
  let password;
  if (Buffer.isBuffer(req.body)) {
    try {
      const bodyJson = JSON.parse(req.body.toString());
      password = bodyJson.password;
      console.log('Parsed Buffer body:', bodyJson);
    } catch (e) {
      console.log('Error parsing Buffer body:', e.message);
    }
  } else {
    password = req.body.password;
  }

  console.log('Extracted password:', password);

  if (!password) {
    console.log('No password provided in request');
    return res.status(400).json({ error: 'Password is required' });
  }

  // Simple password comparison
  if (password !== SIMPLE_PASSWORD) {
    console.log('Password mismatch. Received:', password);
    return res.status(401).json({ error: 'Invalid password' });
  }

  console.log('Authentication successful');
  res.json({ success: true });
});

router.post('/shorten', async (req, res) => {
  console.log('Shorten request received:', req.body);
  console.log('Shorten request body type:', typeof req.body);
  console.log('Expected password:', SIMPLE_PASSWORD);

  // Handle potential Buffer object in req.body
  let password, url, slug;
  if (Buffer.isBuffer(req.body)) {
    try {
      const bodyJson = JSON.parse(req.body.toString());
      password = bodyJson.password;
      url = bodyJson.url;
      slug = bodyJson.slug;
      console.log('Parsed Buffer body:', bodyJson);
    } catch (e) {
      console.log('Error parsing Buffer body:', e.message);
    }
  } else {
    password = req.body.password;
    url = req.body.url;
    slug = req.body.slug;
  }

  console.log('Extracted password:', password);
  console.log('Extracted url:', url);
  console.log('Extracted slug:', slug);

  // Authenticate first
  if (!password) {
    console.log('No password provided in shorten request');
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== SIMPLE_PASSWORD) {
    console.log('Password mismatch in shorten request. Received:', password);
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Validate URL
  if (!url) {
    console.log('No URL provided');
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.post('https://api.short.io/links', {
      domain: process.env.SHORT_DOMAIN,
      originalURL: url,
      ...(slug && { path: slug })
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.SHORT_IO_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error shortening URL:', error.response?.data || error.message);

    const errorMessage = error.response?.data?.error || 'Failed to shorten URL';
    res.status(500).json({ error: errorMessage });
  }
});

// Apply routes
app.use('/.netlify/functions/api', router);

// Export handler
module.exports.handler = serverless(app);