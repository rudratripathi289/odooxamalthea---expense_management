// controller/loginController.js
const pool = require('../config/database');
const { validateLogin } = require('../model/loginModel');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  // Validate input
  const { error } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Find user by email and role
    const [userRows] = await pool.execute(
      'SELECT u.*, c.name as company_name, c.company_code FROM users u JOIN companies c ON u.company_code = c.company_code WHERE u.email = ? AND u.role = ? AND u.status = TRUE',
      [email, role]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Invalid email, role, or account is inactive' });
    }

    const user = userRows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Remove sensitive data from response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: userWithoutPassword.id,
        user_id: userWithoutPassword.user_id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        company_name: userWithoutPassword.company_name,
        company_code: userWithoutPassword.company_code,
        department_id: userWithoutPassword.department_id,
        manager_id: userWithoutPassword.manager_id,
        status: userWithoutPassword.status
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
