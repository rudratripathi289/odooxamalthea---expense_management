DELIMITER $$

-- A secure procedure to handle the multi-step process of approving an expense.
-- It ensures all steps succeed or fail together.
CREATE PROCEDURE sp_approve_expense(
    IN p_expense_id INT,
    IN p_approver_id INT,
    IN p_comments TEXT
)
BEGIN
    START TRANSACTION;

    UPDATE expenses
    SET status = 'approved'
    WHERE id = p_expense_id AND status = 'pending';

    INSERT INTO approvals (expense_id, approver_id, action, comments, role_at_approval)
    VALUES (p_expense_id, p_approver_id, 'approved', p_comments, (SELECT role FROM users WHERE id = p_approver_id));

    INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, details)
    VALUES ('expense', p_expense_id, 'update', p_approver_id, JSON_OBJECT('status', 'approved', 'comments', p_comments));

    COMMIT;
END$$

-- A simple function to get a user's manager's name by their ID.
CREATE FUNCTION fn_get_user_manager_name(p_user_id INT)
RETURNS VARCHAR(255)
DETERMINISTIC
BEGIN
    DECLARE v_manager_name VARCHAR(255);
    SELECT m.name INTO v_manager_name
    FROM users u
    JOIN users m ON u.manager_id = m.id
    WHERE u.id = p_user_id;
    RETURN v_manager_name;
END$$

DELIMITER ;