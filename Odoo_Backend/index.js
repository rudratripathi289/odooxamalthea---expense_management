// Core Module
const path = require('path');

// External Modules
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = require('./config/database');
console.log('Database connected');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Import routes
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');
const userRoute = require('./routes/users');
const departmentRoute = require('./routes/departments');
app.use('/api', registerRoute);
app.use('/api', loginRoute);
app.use('/api', userRoute);
app.use('/api', departmentRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export the pool if needed by other files
module.exports = pool;
