DELIMITER $$

-- Automatically generates a human-readable user_code (e.g., 'ACME-001') before a new user is inserted.
CREATE TRIGGER trg_before_user_insert_generate_code
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE next_id INT;

    -- Find the highest existing number for this company and add 1.
    SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(user_code, '-', -1) AS UNSIGNED)), 0) + 1 INTO next_id
    FROM users
    WHERE company_code = NEW.company_code;

    -- Combine the company code and the new number, padded with zeros.
    SET NEW.user_code = CONCAT(NEW.company_code, '-', LPAD(next_id, 3, '0'));
END$$


-- Prevents a user from approving their own expense claim.
CREATE TRIGGER trg_prevent_self_approval
BEFORE INSERT ON approvals
FOR EACH ROW
BEGIN
    DECLARE v_submitter_id INT;

    SELECT user_id INTO v_submitter_id
    FROM expenses
    WHERE id = NEW.expense_id;

    IF NEW.approver_id = v_submitter_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Users cannot approve their own expenses.';
    END IF;
END$$

DELIMITER ;