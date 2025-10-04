-- A view to get a clean, readable list of all expenses awaiting approval.
CREATE OR REPLACE VIEW vw_pending_expenses AS
SELECT
    e.id AS expense_id,
    e.amount,
    e.currency,
    e.expense_date,
    e.description,
    u.name AS employee_name,
    u.email AS employee_email,
    d.name AS department_name,
    c.name AS company_name
FROM expenses e
JOIN users u ON e.user_id = u.id
JOIN departments d ON e.department_code = d.dept_code AND e.company_code = d.company_code
JOIN companies c ON e.company_code = c.company_code
WHERE e.status = 'pending';

-- A view to get a full profile of a user, including company, department, and manager's name.
CREATE OR REPLACE VIEW vw_user_details AS
SELECT
    u.id,
    u.user_code,
    u.email,
    u.name,
    u.role,
    c.name AS company_name,
    d.name AS department_name,
    manager.name AS manager_name
FROM users u
JOIN companies c ON u.company_code = c.company_code
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN users manager ON u.manager_id = manager.id;