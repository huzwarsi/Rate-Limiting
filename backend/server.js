const express = require('express');
const cors = require('cors');
const limit = require('./middleware/rateLimiter');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Next.js frontend (localhost:3000)
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After']
}));


// Enable JSON body parsing
app.use(express.json());

// Enable IP trust if behind proxies
app.set('trust proxy', 1);

// Health check endpoint (Un-limited)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Express backend is running cleanly!',
    timestamp: new Date().toISOString()
  });
});

// Protected Form Submission endpoint (Applies rateLimiter middleware)
app.post('/api/submit', limit, (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and Email are required fields.'
    });
  }

  // Simulate successful form processing
  console.log(`[Form Submitted] Name: ${name}, Email: ${email}`);

  res.status(200).json({
    success: true,
    message: `Form successfully submitted for ${name}!`,
    receivedData: {
      name,
      email,
      message: message || 'No message provided'
    },
    timestamp: new Date().toISOString()
  });
});

// Fast Ping / Test API endpoint (Applies rateLimiter middleware for rapid testing)
app.get('/api/ping', limit, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pong! Request allowed through rate limiter.',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`👉 Form POST Endpoint: http://localhost:${PORT}/api/submit`);
  console.log(`👉 Fast Ping Endpoint: http://localhost:${PORT}/api/ping`);
  console.log(`=================================`);
});
