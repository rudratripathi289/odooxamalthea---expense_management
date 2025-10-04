// config/database.js
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2005luckymp2408',
  database: process.env.DB_NAME || 'expense_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool (already promise-based)
const pool = mysql.createPool(dbConfig);

module.exports = pool;
