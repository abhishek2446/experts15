require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// Basic CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Auth test route
app.post('/api/auth/login', (req, res) => {
  console.log('Login route hit:', req.body);
  res.json({ message: 'Login route is working', body: req.body });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test it at: http://localhost:${PORT}/api/test`);
});