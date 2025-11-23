const express = require('express');
const rateLimit = require('express-rate-limit');
const outhRouter = require('./src/routers/auth.router');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Rate limiting middleware configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Maximum 100 requests per IP
  message: "Request limit exceeded. Please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

app.use(limiter); // Apply rate limiting to all requests

// Protected routes
app.use('/', outhRouter);


// Start the server
app.listen(3002, () => {
  console.log('Gateway server is running on port 3002');
});