# Smart Expense Management System

A comprehensive expense management system built with React frontend and Node.js backend, featuring role-based access control, department management, and automated expense processing.

## 🚀 Project Overview

This system allows companies to manage employee expenses through a structured approval workflow with different user roles: Admin, Employee, Manager, CFO, and CEO.

## 📋 Features Implemented

### ✅ Frontend (React + Vite + Tailwind CSS)

#### *Landing Page*
- *Login/Register Forms* with comprehensive validation
- *Company Registration* with 4-letter company code
- *Role-based Login* (Admin, Employee, Manager, CFO, CEO)
- *Country Selection* with India as default
- *Blue-White Gradient Theme* for professional appearance

#### *Admin Dashboard*
- *User Management*: Add, edit, delete users with credentials
- *Department Management*: Create departments with budget allocation
- *Budget Overview*: View and edit department budgets
- *Real-time Updates*: Live data from database
- *Form Validation*: Comprehensive input validation

#### *Employee Dashboard*
- *Expense Submission*: Detailed transaction forms
- *Receipt Scanning*: OCR integration with Gemini API
- *Transaction History*: View all submitted expenses
- *Auto-fill Functionality*: AI-powered field population

#### *Manager Dashboard*
- *Transaction Approval*: Approve/reject employee expenses
- *CSV Reports*: Download expense reports
- *Budget Tracking*: Monitor department spending
- *Statistics*: Total expenses and approvals

#### *CFO Dashboard*
- *Cross-department Oversight*: Manage all managers
- *Approval Logic*: 60% threshold for automatic approval
- *Override Authority*: Can approve rejected transactions
- *Financial Analytics*: Company-wide expense tracking

#### *CEO Dashboard*
- *High-value Approvals*: Transactions >30% of department budget
- *Company Overview*: Total budget and spending
- *Executive Controls*: Final approval authority

### ✅ Backend (Node.js + Express + MySQL)

#### *Authentication System*
- *JWT-based Authentication* (prepared for implementation)
- *Password Hashing* with bcrypt
- *Role-based Access Control*
- *Company Isolation* for multi-tenant support

#### *Database Schema*
sql
-- Core Tables
companies (id, name, company_code, country)
users (id, company_code, user_id, name, email, password_hash, role, department_id, manager_id, status)
departments (id, company_code, name, dept_code, budget)
expenses (id, user_id, company_code, department_code, expense_date, category, description, amount, currency, ocr_data, attachment, status)
approvals (id, expense_id, approver_id, status, comments, approved_at)

#### *API Endpoints*

*Authentication:*
- POST /api/register - Company registration
- POST /api/login - User login

*User Management:*
- GET /api/users - Get all users
- POST /api/users - Create user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

*Department Management:*
- GET /api/departments - Get all departments
- POST /api/departments - Create department
- PUT /api/departments/:id/budget - Update budget
- DELETE /api/departments/:id - Delete department

#### *Key Features*
- *Input Validation* with Joi schemas
- *Database Transactions* for data integrity
- *Error Handling* with proper HTTP status codes
- *Company Code Isolation* for multi-tenant support
- *Auto-generated IDs* (EMP-XXXX, DEPT-XXXX)

## 🛠 Technology Stack

### Frontend
- *React 18* with functional components and hooks
- *Vite* for fast development and building
- *Tailwind CSS* for styling
- *Axios* for API communication
- *React Router* for navigation


### Backend
- *Node.js* with Express.js
- *MySQL* with mysql2/promise
- *Joi* for input validation
- *bcrypt* for password hashing
- *CORS* for cross-origin requests

### External Services
- *Gemini API* for OCR and receipt processing
- *MySQL Database* for data persistence
- 
## 📁 Project Structure

Odoo_Frontend/
├── my-project/                 
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── ManagerDashboard.jsx
│   │   │   ├── CFODashboard.jsx
│   │   │   └── CEODashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Odoo_Backend/              
│   ├── config/
│   │   └── database.js
│   ├── controller/
│   │   ├── registerController.js
│   │   ├── loginController.js
│   │   ├── userController.js
│   │   └── departmentController.js
│   ├── model/
│   │   ├── registerModel.js
│   │   ├── loginModel.js
│   │   ├── userModel.js
│   │   └── departmentModel.js
│   ├── routes/
│   │   ├── register.js
│   │   ├── login.js
│   │   ├── users.js
│   │   └── departments.js
│   ├── middleware/
│   │   └── auth.js
│   ├── database/              
│   │   ├── 1_schema.sql        
│   │   ├── 2_indexes.sql      
│   │   ├── 3_views.sql         
│   │   ├── 4_routines.sql      
│   │   └── 5_triggers.sql      
│   ├── index.js
│   └── package.json
└── README.md


## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. *Clone the repository*
bash
git clone <repository-url>
cd Odoo_Frontend


2. *Setup Backend*
bash
cd Odoo_Backend
npm install


3. *Setup Frontend*
bash
cd ../my-project
npm install


4. *Database Setup*
sql
-- Create database
CREATE DATABASE expense_management_system;

-- Run the SQL schema (odoo_sql.sql)
-- This creates all necessary tables with proper relationships


5. *Environment Configuration*
bash
# Copy environment template
cp Odoo_Backend/env-template.txt Odoo_Backend/.env

# Update .env with your database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_management_system



### Running the Application

1. *Start Backend Server*
bash
cd Odoo_Backend
npm start
# Server runs on http://localhost:3000


2. *Start Frontend Development Server*
bash
cd my-project
npm run dev
# Frontend runs on http://localhost:5173


3. *Initialize Dummy Data (Optional)*
bash
cd Odoo_Backend
node init-dummy-data.js

## 🎯 User Workflows

### 1. Company Registration
1. Admin registers company with unique 4-letter code
2. System creates company and admin user
3. Admin can login and access dashboard

### 2. Department Management
1. Admin creates departments with budget allocation
2. Departments appear in user creation dropdown
3. Budget can be edited in real-time

### 3. User Management
1. Admin creates users with credentials
2. Users are assigned to departments
3. Users can login with provided credentials

### 4. Expense Management
1. Employees submit expense requests
2. Receipt scanning with AI-powered field extraction
3. Manager approval workflow
4. CFO oversight and final approval
5. CEO approval for high-value transactions

## 🔧 Key Features

### Security
- *Password Hashing* with bcrypt
- *Input Validation* on all endpoints
- *SQL Injection Protection* with parameterized queries
- *Company Data Isolation* for multi-tenant security

### Performance
- *Database Connection Pooling* for optimal performance
- *Async/Await* for non-blocking operations
- *Optimized Queries* with proper indexing
- *Frontend State Management* for smooth UX

### Scalability
- *Modular Architecture* for easy maintenance
- *RESTful API Design* for standard integration
- *Database Normalization* for efficient storage
- *Role-based Access Control* for flexible permissions

## 📊 Database Schema Highlights

- *Multi-tenant Support* with company_code isolation
- *Hierarchical User Structure* with manager relationships
- *Flexible Department System* with budget tracking
- *Comprehensive Expense Tracking* with approval workflow
- *Audit Trail* with timestamps and status tracking

## 🎨 UI/UX Features

- *Responsive Design* for all screen sizes
- *Professional Blue-White Theme* for corporate feel
- *Intuitive Navigation* with role-based dashboards
- *Real-time Updates* with live data
- *Comprehensive Validation* with user-friendly error messages

## 🔮 Future Enhancements

- *JWT Authentication* for secure sessions
- *Email Notifications* for approval workflows
- *Advanced Reporting* with charts and analytics
- *Mobile App* for on-the-go expense submission
- *Integration APIs* for accounting software

## 📝 Development Notes

- *Clean Code Architecture* with separation of concerns
- *Comprehensive Error Handling* throughout the application
- *Database Transactions* for data consistency
- *Input Validation* on both frontend and backend
- *Responsive Design* with Tailwind CSS

## 🤝 Contributing

This project follows standard development practices with:
- Modular component structure
- RESTful API design
- Comprehensive error handling
- Input validation and sanitization
- Database best practices

---

*Built with ❤ for efficient expense management*
