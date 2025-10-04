-- Create database
CREATE DATABASE IF NOT EXISTS expense_management_system;
USE expense_management_system;

-- Table: companies
-- Note: Removed 'default_currency', added 'company_code'.
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_code VARCHAR(4) NOT NULL UNIQUE, -- Strict 4 characters, must be unique
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: users
-- Note: Uses 'company_code' for FK, renamed columns.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_code VARCHAR(4) NOT NULL,
    department_id INT, -- Can be NULL if a user isn't in a department
    user_id varchar(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('employee','manager','admin','super_admin') NOT NULL,
    manager_id INT DEFAULT NULL,
    status BOOLEAN DEFAULT TRUE, --  TRUE-> ACTIVE , FALSE-> INACTIVE
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- TIMESTAMP AT UPDATE
    FOREIGN KEY (company_code) REFERENCES companies(company_code) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: departments (NEW)
-- Note: New table as requested.
-- Table: departments
-- NOTE: Changed company_id to company_code for consistency and to allow for a composite foreign key from expenses.
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_code VARCHAR(4) NOT NULL,
    name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(20) NOT NULL,
    budget DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_code) REFERENCES companies(company_code) ON DELETE CASCADE,
    UNIQUE (company_code, dept_code) -- This composite key is essential!
);

-- Table: expenses
-- NOTE: 'name' column is removed. 'department' is now 'department_code' with a composite foreign key.
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_code VARCHAR(4) NOT NULL,
    department_code VARCHAR(20) NOT NULL, -- Changed from department
    expense_date DATE NOT NULL,
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL,
    ocr_data LONGTEXT,
    attachment VARCHAR(255),
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- This is a COMPOSITE FOREIGN KEY. It ensures the department exists within that specific company.
    FOREIGN KEY (company_code, department_code) REFERENCES departments(company_code, dept_code) ON DELETE CASCADE
);

-- Remember to create an index for performance
CREATE INDEX idx_expenses_company_dept ON expenses(company_code, department_code);

-- Table: approval_rules
-- Note: Simplified to store only the JSON rules.
CREATE TABLE approval_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    rules_json JSON, -- Stores the approval sequence and conditions
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Table: approvals
-- Note: Removed 'step_no' column.
CREATE TABLE approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    approver_id INT NOT NULL,
    role_at_approval ENUM('employee','manager','admin','CFO','director') NOT NULL,
    action ENUM('approved','rejected') NOT NULL,
    comments TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: login_history
-- Note: Removed 'device_info' column.
CREATE TABLE login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: audit_logs
-- Note: No changes as requested.
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action ENUM('create','update','delete') NOT NULL,
    performed_by INT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);


DELIMITER $$

CREATE TRIGGER trg_before_user_insert_generate_code
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    -- Variable to hold the next numeric part of the ID
    DECLARE next_id INT;

    -- 1. Find the highest existing number for the new user's specific company_code.
    --    For example, if the last user was 'ACME-005', this will find '5'.
    --    We then add 1 to get the next number (6).
    --    IFNULL handles the very first user for a company, starting them at 1.
    SELECT
        IFNULL(MAX(CAST(SUBSTRING_INDEX(user_id, '-', -1) AS UNSIGNED)), 0) + 1 INTO next_id
    FROM
        users
    WHERE
        company_code = NEW.company_code;

    -- 2. Combine the company_code and the new number, padding it with leading zeros.
    --    Example: 'ACME' + '-' + LPAD(6, 3, '0')  -->  'ACME-006'
    SET NEW.user_id = CONCAT(NEW.company_code, '-', LPAD(next_id, 3, '0'));

END$$

DELIMITER ;



select * from users;