// Serverless function for our API endpoints
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

// Middleware
app.use(express.json());

// Routes
router.post('/authenticate', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  // Using bcrypt to compare passwords
  const isValid = bcrypt.compareSync(password, process.env.PASSWORD_HASH);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  res.json({ success: true });
});

router.post('/shorten', async (req, res) => {
  const { password, url, slug } = req.body;
  
  // Authenticate first
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  const isValid = bcrypt.compareSync(password, process.env.PASSWORD_HASH);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  // Validate URL
  if (!url) {
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