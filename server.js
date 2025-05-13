require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Password validation middleware - simple authentication
const authenticate = (req, res, next) => {
  const { password } = req.body;
  
  // Using bcrypt to compare passwords
  // In production, you would store a hashed password, not compare directly
  const isValid = bcrypt.compareSync(password, process.env.PASSWORD_HASH);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  next();
};

// Routes
app.post('/api/authenticate', (req, res) => {
  const { password } = req.body;
  
  // Using bcrypt to compare passwords
  const isValid = bcrypt.compareSync(password, process.env.PASSWORD_HASH);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  res.json({ success: true });
});

app.post('/api/shorten', authenticate, async (req, res) => {
  try {
    const { url, slug } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
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

// Route to serve the main app on all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});