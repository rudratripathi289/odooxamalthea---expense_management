// controller/departmentController.js
const pool = require('../config/database');
const { validateCreateDepartment, validateUpdateBudget } = require('../model/departmentModel');

// Get all departments for a company
exports.getDepartments = async (req, res) => {
  try {
    const { company_code } = req.query;
    
    if (!company_code) {
      return res.status(400).json({ error: 'Company code is required' });
    }

    const [departments] = await pool.execute(`
      SELECT d.id, d.name, d.dept_code, d.budget, d.created_at,
             COUNT(u.id) as user_count
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id
      WHERE d.company_code = ?
      GROUP BY d.id, d.name, d.dept_code, d.budget, d.created_at
      ORDER BY d.created_at DESC
    `, [company_code]);

    res.status(200).json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Server error while fetching departments' });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  const { name, budget } = req.body;

  // Validate input
  const { error } = validateCreateDepartment(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Get company_code from request (should be set by middleware)
    const company_code = req.company_code || req.body.company_code;
    
    if (!company_code) {
      return res.status(400).json({ error: 'Company code is required' });
    }

    // Check if department name already exists for this company
    const [existingDept] = await pool.execute(
      'SELECT id FROM departments WHERE name = ? AND company_code = ?',
      [name, company_code]
    );
    
    if (existingDept.length > 0) {
      return res.status(400).json({ error: 'Department name already exists' });
    }

    // Generate department code (format: DEPT-XXXX)
    const [deptCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM departments WHERE company_code = ?',
      [company_code]
    );
    const deptNumber = (deptCount[0].count + 1).toString().padStart(4, '0');
    const dept_code = `DEPT-${deptNumber}`;

    // Insert department
    const [result] = await pool.execute(
      'INSERT INTO departments (company_code, name, dept_code, budget) VALUES (?, ?, ?, ?)',
      [company_code, name, dept_code, budget]
    );

    // Get the created department
    const [newDepartment] = await pool.execute(`
      SELECT d.id, d.name, d.dept_code, d.budget, d.created_at,
             COUNT(u.id) as user_count
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id
      WHERE d.id = ?
      GROUP BY d.id, d.name, d.dept_code, d.budget, d.created_at
    `, [result.insertId]);

    res.status(201).json(newDepartment[0]);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Server error while creating department' });
  }
};

// Update department budget
exports.updateBudget = async (req, res) => {
  const { id } = req.params;
  const { budget } = req.body;

  // Validate input
  const { error } = validateUpdateBudget(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Check if department exists
    const [existingDept] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );
    
    if (existingDept.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Update budget
    await pool.execute(
      'UPDATE departments SET budget = ? WHERE id = ?',
      [budget, id]
    );

    // Get updated department
    const [updatedDept] = await pool.execute(`
      SELECT d.id, d.name, d.dept_code, d.budget, d.created_at,
             COUNT(u.id) as user_count
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id
      WHERE d.id = ?
      GROUP BY d.id, d.name, d.dept_code, d.budget, d.created_at
    `, [id]);

    res.status(200).json(updatedDept[0]);
  } catch (err) {
    console.error('Error updating department budget:', err);
    res.status(500).json({ error: 'Server error while updating department budget' });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if department exists
    const [existingDept] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );
    
    if (existingDept.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if department has users
    const [userCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE department_id = ?',
      [id]
    );
    
    if (userCount[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department with existing users. Please reassign users first.' 
      });
    }

    // Delete department
    await pool.execute('DELETE FROM departments WHERE id = ?', [id]);

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Server error while deleting department' });
  }
};
