// middleware/auth.js
const pool = require('../config/database');

// Middleware to extract company_code from user session/token
const extractCompanyCode = async (req, res, next) => {
  try {
    // For now, we'll get company_code from query params or body
    // In a real app, this would come from JWT token or session
    const company_code = req.query.company_code || req.body.company_code;
    
    if (!company_code) {
      return res.status(400).json({ error: 'Company code is required' });
    }

    // Verify company exists
    const [company] = await pool.execute(
      'SELECT company_code FROM companies WHERE company_code = ?',
      [company_code]
    );

    if (company.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Attach company_code to request
    req.company_code = company_code;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Server error in authentication' });
  }
};

module.exports = { extractCompanyCode };
