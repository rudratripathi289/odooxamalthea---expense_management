// controller/registerController.js
const pool = require('../config/database');
const { validateRegister } = require('../model/registerModel');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { company_name, company_code, country, admin_name, admin_email, password, role } = req.body;

  // Validate input
  const { error } = validateRegister(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Check if company code already exists
    const [companyRows] = await pool.execute(
      'SELECT * FROM companies WHERE company_code = ?',
      [company_code]
    );

    if (companyRows.length > 0) {
      return res.status(400).json({ error: 'Company code already exists' });
    }

    // Check if admin email already exists
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [admin_email]
    );

    if (userRows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Insert company
      const [companyResult] = await pool.execute(
        'INSERT INTO companies (name, company_code, country) VALUES (?, ?, ?)',
        [company_name, company_code, country]
      );

      const companyId = companyResult.insertId;

      // Insert admin user
      await pool.execute(
        'INSERT INTO users (company_code, user_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [company_code, null, admin_name, admin_email, hashedPassword, 'admin', true]
      );

      // Commit transaction
      await pool.query('COMMIT');

      res.status(201).json({
        message: 'Company and admin registered successfully',
        company_code: company_code
      });

    } catch (transactionError) {
      // Rollback transaction if something fails
      await pool.query('ROLLBACK');
      throw transactionError;
    }

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};
