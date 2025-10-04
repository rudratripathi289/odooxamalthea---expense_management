-- Speeds up queries that filter expenses by company and department.
CREATE INDEX idx_expenses_company_dept ON expenses(company_code, department_code);

-- Speeds up finding an employee's manager or direct reports.
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- Speeds up finding all expenses submitted by a specific user.
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- Speeds up dashboard queries that filter expenses by their status.
CREATE INDEX idx_expenses_status ON expenses(status);

-- Speeds up finding all approval actions for a specific expense.
CREATE INDEX idx_approvals_expense_id ON approvals(expense_id);

-- Speeds up finding all expenses a specific user has approved or rejected.
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);

-- Speeds up fetching the login history for a specific user.
CREATE INDEX idx_login_history_user_id ON login_history(user_id);