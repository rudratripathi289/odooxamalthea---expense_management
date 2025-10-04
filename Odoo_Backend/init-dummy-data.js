// init-dummy-data.js - Initialize database with dummy data
const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function initDummyData() {
  try {
    console.log('🌱 Initializing dummy data...');
    
    // Create test company
    const [companyResult] = await pool.execute(
      'INSERT INTO companies (name, company_code, country) VALUES (?, ?, ?)',
      ['Demo Company', 'DEMO', 'India']
    );
    console.log('✅ Demo company created');
    
    // Create dummy departments
    const departments = [
      { name: 'Technology', budget: 500000 },
      { name: 'Marketing', budget: 300000 },
      { name: 'Finance', budget: 200000 }
    ];
    
    for (const dept of departments) {
      const [deptResult] = await pool.execute(
        'INSERT INTO departments (company_code, name, dept_code, budget) VALUES (?, ?, ?, ?)',
        ['DEMO', dept.name, `DEPT-${Math.random().toString(36).substr(2, 4).toUpperCase()}`, dept.budget]
      );
      console.log(`✅ Department ${dept.name} created`);
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminResult] = await pool.execute(
      'INSERT INTO users (company_code, user_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['DEMO', 'ADMIN-0001', 'Admin User', 'admin@demo.com', hashedPassword, 'admin', true]
    );
    console.log('✅ Admin user created');
    
    console.log('\n🎉 Dummy data initialized successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: admin@demo.com');
    console.log('Password: admin123');
    console.log('Company Code: DEMO');
    console.log('\n📋 Available Departments:');
    console.log('- Technology (₹5,00,000)');
    console.log('- Marketing (₹3,00,000)');
    console.log('- Finance (₹2,00,000)');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
  } finally {
    process.exit(0);
  }
}

initDummyData();
