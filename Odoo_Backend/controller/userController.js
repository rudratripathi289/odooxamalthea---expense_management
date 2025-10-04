// controller/userController.js
const pool = require('../config/database');
const { validateCreateUser, validateUpdateUser } = require('../model/userModel');
const bcrypt = require('bcrypt');

// Get all users for a company
exports.getUsers = async (req, res) => {
  try {
    const { company_code } = req.query;
    
    if (!company_code) {
      return res.status(400).json({ error: 'Company code is required' });
    }

    const [users] = await pool.execute(`
      SELECT u.id, u.user_id, u.name, u.email, u.role, u.status, u.created_on,
             d.name as department_name, d.id as department_id,
             m.name as manager_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.company_code = ?
      ORDER BY u.created_on DESC
    `, [company_code]);

    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  const { name, email, password, role, managerId, department } = req.body;

  // Validate input
  const { error } = validateCreateUser(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Get company_code from request (should be set by middleware)
    const company_code = req.company_code || req.body.company_code;
    
    if (!company_code) {
      return res.status(400).json({ error: 'Company code is required' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Get department ID
    const [departmentRows] = await pool.execute(
      'SELECT id FROM departments WHERE name = ? AND company_code = ?',
      [department, company_code]
    );
    
    if (departmentRows.length === 0) {
      return res.status(400).json({ error: 'Department not found' });
    }
    
    const departmentId = departmentRows[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user_id (format: EMP-XXXX)
    const [userCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE company_code = ?',
      [company_code]
    );
    const userNumber = (userCount[0].count + 1).toString().padStart(4, '0');
    const user_id = `EMP-${userNumber}`;

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (company_code, user_id, name, email, password_hash, role, department_id, manager_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [company_code, user_id, name, email, hashedPassword, role, departmentId, managerId || null, true]
    );

    // Get the created user with department info
    const [newUser] = await pool.execute(`
      SELECT u.id, u.user_id, u.name, u.email, u.role, u.status, u.created_on,
             d.name as department_name, d.id as department_id,
             m.name as manager_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.id = ?
    `, [result.insertId]);

    res.status(201).json(newUser[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Server error while creating user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate input
  const { error } = validateUpdateUser(updateData);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Check if user exists
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = existingUser[0];
    const company_code = user.company_code;

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updateData.email, id]
      );
      
      if (emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Get department ID if department is being updated
    let departmentId = user.department_id;
    if (updateData.department) {
      const [departmentRows] = await pool.execute(
        'SELECT id FROM departments WHERE name = ? AND company_code = ?',
        [updateData.department, company_code]
      );
      
      if (departmentRows.length === 0) {
        return res.status(400).json({ error: 'Department not found' });
      }
      
      departmentId = departmentRows[0].id;
    }

    // Prepare update fields
    const updateFields = [];
    const updateValues = [];

    if (updateData.name) {
      updateFields.push('name = ?');
      updateValues.push(updateData.name);
    }
    
    if (updateData.email) {
      updateFields.push('email = ?');
      updateValues.push(updateData.email);
    }
    
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }
    
    if (updateData.role) {
      updateFields.push('role = ?');
      updateValues.push(updateData.role);
    }
    
    if (updateData.department) {
      updateFields.push('department_id = ?');
      updateValues.push(departmentId);
    }
    
    if (updateData.managerId !== undefined) {
      updateFields.push('manager_id = ?');
      updateValues.push(updateData.managerId || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_on = CURRENT_TIMESTAMP');
    updateValues.push(id);

    // Update user
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updatedUser] = await pool.execute(`
      SELECT u.id, u.user_id, u.name, u.email, u.role, u.status, u.created_on,
             d.name as department_name, d.id as department_id,
             m.name as manager_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.id = ?
    `, [id]);

    res.status(200).json(updatedUser[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Server error while updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (CASCADE will handle related records)
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
};
