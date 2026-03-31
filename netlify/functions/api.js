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

// Helper function to extract password from request
function extractPassword(req) {
  let password;
  if (Buffer.isBuffer(req.body)) {
    try {
      const bodyJson = JSON.parse(req.body.toString());
      password = bodyJson.password;
    } catch (e) {
      console.log('Error parsing Buffer body:', e.message);
    }
  } else {
    password = req.body?.password || req.query?.password;
  }
  return password;
}

// Helper function to validate password
function validatePasswordMiddleware(req, res, next) {
  const password = extractPassword(req);
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== SIMPLE_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  next();
}

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

// Get list of shortened links
router.get('/links', async (req, res) => {
  console.log('Get links request received:', req.query);
  
  const password = req.query.password;
  
  if (!password) {
    console.log('No password provided in get links request');
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== SIMPLE_PASSWORD) {
    console.log('Password mismatch in get links request. Received:', password);
    return res.status(401).json({ error: 'Invalid password' });
  }

  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    // First, get domain details to get the domain_id
    const domainsResponse = await axios.get('https://api.short.io/api/domains', {
      headers: {
        'Authorization': process.env.SHORT_IO_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    // Find the domain that matches our SHORT_DOMAIN
    const domains = domainsResponse.data || [];
    const domain = domains.find(d => d.hostname === process.env.SHORT_DOMAIN || d.hostname.includes(process.env.SHORT_DOMAIN));
    
    if (!domain) {
      console.error('Domain not found:', process.env.SHORT_DOMAIN);
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    const domainId = domain.id;
    
    // Build query parameters for short.io API
    const params = new URLSearchParams();
    params.append('domain_id', domainId);
    params.append('limit', limit);
    params.append('offset', (page - 1) * limit);
    
    if (search) {
      params.append('search', search);
    }

    const response = await axios.get(`https://api.short.io/api/links?${params.toString()}`, {
      headers: {
        'Authorization': process.env.SHORT_IO_API_KEY,
        'Accept': 'application/json'
      }
    });

    res.json({
      links: response.data.links || [],
      total: response.data.total || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching links:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Delete a link
router.delete('/links/:id', async (req, res) => {
  const password = req.query.password;
  const linkId = req.params.id;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== SIMPLE_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  try {
    await axios.delete(`https://api.short.io/links/${linkId}`, {
      headers: {
        'Authorization': process.env.SHORT_IO_API_KEY,
        'Accept': 'application/json'
      }
    });

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// Update a link
router.put('/links/:id', async (req, res) => {
  const linkId = req.params.id;
  let password, originalURL, path;
  
  if (Buffer.isBuffer(req.body)) {
    try {
      const bodyJson = JSON.parse(req.body.toString());
      password = bodyJson.password;
      originalURL = bodyJson.originalURL;
      path = bodyJson.path;
    } catch (e) {
      console.log('Error parsing Buffer body:', e.message);
    }
  } else {
    password = req.body?.password;
    originalURL = req.body?.originalURL;
    path = req.body?.path;
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== SIMPLE_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  try {
    const response = await axios.post(`https://api.short.io/links/${linkId}`, {
      originalURL,
      path
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.SHORT_IO_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error updating link:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to update link' });
  }
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

    // Generate QR code for the newly created link
    const linkId = response.data.idString || response.data.id;
    try {
      const qrResponse = await axios.post(`https://api.short.io/links/qr/${linkId}`, {}, {
        headers: {
          'Authorization': process.env.SHORT_IO_API_KEY
        },
        responseType: 'arraybuffer'
      });
      
      // Convert binary PNG to base64 data URL
      const base64 = Buffer.from(qrResponse.data, 'binary').toString('base64');
      const qrCodeURL = `data:image/png;base64,${base64}`;
      
      // Add QR code URL to the response
      response.data.qrCodeURL = qrCodeURL;
    } catch (qrError) {
      console.error('Error generating QR code:', qrError.response?.data || qrError.message);
      // Don't fail the request if QR generation fails
      response.data.qrCodeURL = null;
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error shortening URL:', error.response?.data || error.message);

    const errorMessage = error.response?.data?.error || 'Failed to shorten URL';
    res.status(500).json({ error: errorMessage });
  }
});

// Get QR code for a link
router.get('/links/:id/qr', async (req, res) => {
  const password = req.query.password;
  const linkId = req.params.id;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== SIMPLE_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  try {
    const response = await axios.post(`https://api.short.io/links/qr/${linkId}`, {}, {
      headers: {
        'Authorization': process.env.SHORT_IO_API_KEY
      },
      responseType: 'arraybuffer'
    });

    // Convert binary PNG to base64 data URL
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const qrCodeURL = `data:image/png;base64,${base64}`;

    res.json({ qrURL: qrCodeURL });
  } catch (error) {
    console.error('Error generating QR code:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});
app.use('/.netlify/functions/api', router);

// Export handler
module.exports.handler = serverless(app);