# odooxamalthea---expense_management
# Smart Expense Management System

## Short description
A scalable, role-based expense management system that automates multi-level approvals using configurable rules, OCR-based receipt ingestion, and shared departmental queues for finance. Designed to match corporate hierarchies and enterprise workflows.
---

## Table of contents
1. Company Hierarchy Overview  
2. System Purpose  
3. Roles & Permissions  
4. Approval Rules & Thresholds  
5. Data Flow Explanation  
6. Wireframe & UI Flow  
7. Database design (summary)  
8. API & Integration points  
9. Advantages  
10. How to run / Admin checklist  
11. Final summary

---

## 1. Company Hierarchy Overview
Board of Directors
└── CEO
 ├── CFO → Finance Department (Shared Queue)
 │ └── Managers
 │  └── Employees
 ├── COO → Operations Department
 │ └── Managers
 │  └── Employees
 ├── CTO → Technology Department
 │ └── Managers
 │  └── Employees
 ├── CMO → Marketing Department
 │ └── Managers
 │  └── Employees
 └── CHRO → Human Resources Department
  └── Managers
   └── Employees


*Roles explained*
- *Board of Directors*: Strategic owners. Rarely approve routine expenses.
- *CEO*: Top-level executive. Final approver for strategic/very large expenses.
- *CFO*: Financial controller. Final sign-off for large or budget-critical expenses. Auto-approve trigger for specific rules.
- *COO / CTO / CMO / CHRO*: Department heads overseeing departmental budgets and policies.
- *Finance Department*: Team of users that handle finance-level approvals and reimbursements. Shared queue model.
- *Managers (Mgrs)*: Direct approvers for their team members.
- *Employees*: Submit expense requests.

Reporting/approval chain: Employee → Manager → Department (Finance as required) → Director/CEO/CFO (as required).

---
## 2. System Purpose
Replace manual, email/paper-based reimbursement with:
- Automated routing based on hierarchy and role.
- Multi-level sequential approvals.
- Conditional rules (percentage approvals or specific approver overrides).
- OCR receipt ingestion for faster entry.
- Currency auto-detection and conversion.
- Audit-ready logs.

---

## 3. Roles and Permissions

| Role     | Description |
|----------|-------------|
| Admin    | Creates company, manages users and hierarchy, sets approval rules, overrides approvals, views all expenses. |
| Employee | Submits expenses, edits drafts, views own expense history and statuses. |
| Manager  | Approves/rejects subordinate expenses, adds comments, escalates. |
| Finance  | Reviews finance-level requests in a shared queue, approves/rejects, marks for reimbursement. |
| CFO      | Approves high-value or strategic expenses. Can auto-approve when rule applies. |
| Director/CEO | Final approval for very large or strategic requests. |

---

## 4. Approval Rules & Thresholds

*Approval logic table*

| Expense Range (₹) | Required Approval                 | Type        |
|-------------------:|----------------------------------|-------------|
| 0 – 5,000          | Department Manager                | Single      |
| 5,001 – 50,000     | Manager → Finance                 | Sequential  |
| 50,001 – 2,00,000  | Manager → Finance → Director      | Multi-level |
| > 2,00,000         | CFO or 60% approvers              | Hybrid      |

*Rule details*
- *Percentage Rule*: If there are multiple approvers at a given stage (e.g., 5 approvers), and at least 60% approve, mark as approved and proceed/finish.
- *Specific Approver Rule*: If a s## 5. Data Flow Explanation

*Step-by-step flow*
1. *Employee Submission*
   - Employee submits an expense with: amount, currency, category, date, description, receipt (file/image/pdf).
   - OCR (Gemini API or chosen OCR) extracts amount, date, vendor, items and pre-fills fields.
   - System converts to company currency using exchange-rate API.

2. *Manager Review*
   - Expense status = PENDING_STEP_1 and appears for employee's manager.
   - Manager approves/rejects with comments.
   - If rejected → status REJECTED_BY_MANAGER and stops.

3. *Finance/CFO Review*
   - If approved and next step is Finance, expense enters Finance shared queue.
   - Any finance user can handle. If multiple finance approvers exist, apply percentage rule if configured.

4. *Conditional Flow*
   - If hybrid rules or special approver rules apply, evaluate them after each step.
   - Example: If CFO approves at any stage, mark approved.

5. *Finalization*
   - Once final approver approves, expense marked APPROVED.
   - Expense is forwarded to Finance Dept processes (reimbursement execution).
   - All steps logged to Audit table.
pecific approver (CFO) approves, the expense auto-approves regardless of the rest.
- *Hybrid Rule*: (60% OR CFO approval) triggers approval.

Admin can configure sequences and thresholds in UI. Rules are evaluated after each approval action.

---
*Short visual flow*

Employee → Manager → Finance/CFO → Director/CEO → Finance Dept (reimbursement) → Database (logs)

---
## 6. Wireframe & UI Flow
See the wireframe section in the project docs. Key screens:
- Landing, Register, Login
- Admin dashboard (Manage Users, Rules, Hierarchy, View Expenses)
- Employee dashboard (Submit, My Expenses, Charts)
- Manager dashboard (Pending approvals, Team view)
- Finance dashboard (Shared queue, Reimbursements)
- Expense detail modal (all approvers)

UX notes:
- Use role-detection to route users directly to their dashboard.
- Offer a role-picker only if an account has multiple roles.
- Use notifications and email triggers for pending approvals.
- Use pagination and filters for queues.

---
  ## 7. Database design (summary)
Core tables (fields trimmed for clarity):

- *companies*: id, name, country, default_currency, created_at
- *users*: id, company_id, name, email, password_hash, role, manager_id, active
- *expenses*: id, company_id, user_id, original_amount, original_currency, converted_amount, converted_currency, category, date, description, receipt_url, status, current_step, created_at, updated_at
- *approvals*: id, expense_id, approver_id, role_at_approval, step_no, action (approved/rejected), comments, timestamp
- *approval_rules*: id, company_id, min_amount, max_amount, sequence_json, percentage_threshold, specific_approver_role_or_id, created_at
- *audit_logs*: id, entity_type, entity_id, action, performed_by, details, timestamp

Indexes: users.company_id, expenses.company_id, expenses.status, approvals.expense_id

---
## 8. API & Integration points
- *Auth*
  - POST /api/auth/register → create company + admin
  - POST /api/auth/login → returns JWT and role

- *Users*
  - GET /api/users?company_id=...
  - POST /api/users → create user (Admin only)
  - PUT /api/users/:id → update role / manager

- *Expenses*
  - POST /api/expenses → create (accept file upload, OCR trigger)
  - GET /api/expenses → list with filters
  - GET /api/expenses/:id → detail
  - POST /api/expenses/:id/approve → approve action
  - POST /api/expenses/:id/reject → reject action

- *Approval Rules*
  - GET /api/approval-rules
  - POST /api/approval-rules
    
- *Integrations*
  - REST Countries: https://restcountries.com/v3.1/all?fields=name,currencies
  - Exchange rates: https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}
  - OCR/Gemini: trigger when receipt uploaded. Response fills expense fields.
  - 
Security:
- Use JWT with role claims.
- Role-based middleware for endpoints.
- Rate-limit OCR endpoints and file uploads.

---

## 9. Advantages (short)
- Transparent, auditable multi-level approvals.
- Scales using role-based shared queues.
- Hybrid rules combine authority and consensus.
- OCR speeds up entry and reduces human error.
- Easy to maintain as company grows.

---

## 10. How to run / Admin checklist
1. Configure env variables:
   - DB_URL, JWT_SECRET, RESTCOUNTRIES_URL, EXCHANGE_API_KEY, OCR_API_KEY (Gemini)
2. Run DB migrations.
3. Start backend.
4. Start frontend.
5. Register first company via /register to auto-create Admin.
6. Admin should:
   - Add Departments and Managers.
   - Configure approval rules.
   - Invite Finance users.
   - Test OCR flow and currency conversion.
7. Test flows: submit expense (employee) → approve (manager) → finance → final.

---

## 11. Final Summary
This system combines role-based routing and shared departmental queues to be scalable. The approval policy mixes authority (CFO/Director final sign-offs) and consensus (60% rule) for flexible governance. OCR and currency integrations automate data entry and conversions. The model aligns with standard corporate structures for a practical, production-ready expense management solution.
