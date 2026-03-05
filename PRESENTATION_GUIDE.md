# Project Presentation Guide - Digital Banking Application

---

## Project Overview
A full-featured Digital Banking Application with frontend (React + Tailwind CSS), backend (FastAPI), and database (PostgreSQL/SQLite). This application provides comprehensive personal finance management including account tracking, transactions, analytics, budgeting, and more.

---

## Frontend Features & Screenshot Locations

### 1. Login Page
**URL:** `http://localhost:5175/`

**Features:**
- Email and password authentication
- JWT token-based authentication
- Link to registration page
- Beautiful background image

**Screenshot Location:** Take screenshot of the login form with blue "Login" button

---

### 2. Registration Page
**URL:** `http://localhost:5175/register`

**Features:**
- Full name input
- Email address input
- Password field
- Phone number input
- Registration to backend API
- Redirect to login after success

**Screenshot Location:** Take screenshot showing all input fields

---

### 3. Dashboard Home
**URL:** `http://localhost:5175/dashboard`

**Features:**
- Total balance display across all accounts
- Quick transfer money section
- Account selection dropdown
- Amount input for transfers
- Sidebar navigation with 9 menu items

**Screenshot Location:** 
- Take screenshot showing total balance and transfer section
- Also screenshot the sidebar showing all navigation options

---

### 4. My Accounts
**URL:** `http://localhost:5175/dashboard/accounts`

**Features:**
- Table displaying all linked bank accounts
- Bank name, account type, and balance columns
- Floating "Add Account" button (bottom right)
- Modal popup for adding new accounts
- Bank name, account type (Savings/Current/Credit), and balance fields

**Screenshot Location:** 
- Show accounts table with sample data
- Show the Add Account modal

---

### 5. Transactions
**URL:** `http://localhost:5175/dashboard/transactions`

**Features:**
- Table showing all transactions with Date, Time, Description, Category, Amount
- Color-coded amounts (green for income, red for expense)
- Right panel for category editing
- Category dropdown with 10 predefined categories
- "Save As Rule" checkbox to automate future categorization
- Active Rules section showing automated category rules
- Delete rule functionality

**Predefined Categories:**
- Food & Dining
- Shopping
- Transportation
- Entertainment
- Bills & Utilities
- Health & Fitness
- Travel
- Income
- Transfer
- Other

**Screenshot Location:** 
- Show transaction table with categorized transactions
- Show the category update panel on the right

---

### 6. Analytics
**URL:** `http://localhost:5175/dashboard/analytics`

**Features:**
- Month filter (date picker)
- Summary cards: Total Income, Total Expense, Balance
- Pie Chart showing spending by category
- Bar Chart alternative view
- Toggle between Pie/Bar charts
- Category Breakdown table with:
  - Category name
  - Amount
  - Percentage of total
  - Visual progress bar

**Screenshot Location:** 
- Show summary cards with values
- Show pie chart with category distribution
- Show category breakdown table

---

### 7. Budget Management
**URL:** `http://localhost:5175/dashboard/budget`

**Features:**
- Two view modes: Budget View and Calendar View
- Toggle button to switch views
- **Budget View:**
  - Summary cards: Total Budget, Total Spent, Remaining
  - List of budget categories with progress bars
  - Progress color coding (green < 70%, yellow 70-99%, red 100%+)
  - Over-budget warnings with excess amount
  - Add Budget button with modal form
  - Edit and Delete functionality
  - Category selection from predefined list
  - Month selection
  
- **Calendar View:**
  - Calendar showing days of month
  - Daily spending displayed under each date
  - Previous/Next month navigation

**Screenshot Location:** 
- Show budget summary cards
- Show budget list with progress bars
- Show the Add Budget modal
- Show calendar view

---

### 8. KYC Verification
**URL:** `http://localhost:5175/dashboard/kyc`

**Features:**
- KYC status display (Currently: Pending)
- Document upload button
- Status indicator

**Screenshot Location:** Show KYC status and upload button

---

### 9. Notifications
**URL:** `http://localhost:5175/dashboard/notifications`

**Features:**
- List of all alerts/notifications
- Unread count badge in sidebar
- "Mark all as read" button
- Individual notification with:
  - Title
  - Message
  - Date/Time
  - Alert type color coding (red for budget exceeded, yellow for warnings, blue for info)
- Mark as read functionality
- Delete notification functionality
- "New" badge for unread notifications

**Alert Types:**
- budget_exceeded (red)
- warning (yellow)
- error (red)
- info (blue)

**Screenshot Location:** 
- Show notifications list with different types
- Show unread/new badges

---

### 10. Rewards
**URL:** `http://localhost:5175/dashboard/rewards`

**Features:**
- List of available rewards:
  - 5% cashback on groceries
  - Free movie ticket
  - Travel discount coupon
- Card-based display

**Screenshot Location:** Show rewards list

---

### 11. Profile
**URL:** `http://localhost:5175/dashboard/profile`

**Features:**
- Email field (editable)
- Phone field (editable)
- Address field (editable)
- Save Changes button

**Screenshot Location:** Show profile form with all fields

---

## Database Schema (Frontend & Database Parts)

### 📊 Database ER Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │    ACCOUNTS    │
├─────────────────┤       ├─────────────────┤
│ PK  id          │◄──────│ FK  user_id    │
│    name         │  1:N  │ PK  id         │
│    email        │       │    bank_name  │
│    password     │       │    account_type│
│    phone        │       │    balance     │
│    kyc_status   │       └────────┬────────┘
└────────┬────────┘                │
         │                        │
         │ 1:N                    │ 1:N
         ▼                        ▼
┌─────────────────┐       ┌─────────────────────┐
│  CATEGORY_RULES │       │    TRANSACTIONS     │
├─────────────────┤       ├─────────────────────┤
│ PK  id          │       │ PK  id              │
│ FK  user_id     │       │ FK  account_id     │
│    category     │       │    description     │
│    keyword_     │       │    category        │
│      pattern    │       │    amount          │
│    priority     │       │    created_at     │
│    is_active    │       └─────────────────────┘
└─────────────────┘

         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│    BUDGETS      │       │    ALERTS       │
├─────────────────┤       ├─────────────────┤
│ PK  id          │       │ PK  id          │
│ FK  user_id     │       │ FK  user_id     │
│    category     │       │    title        │
│    limit_amount │       │    message      │
│    spent_amount │       │    alert_type   │
│    month        │       │    is_read      │
│    is_over_     │       │    created_at   │
│      budget     │       └─────────────────┘
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    REWARDS      │       │    BILLS       │
├─────────────────┤       ├─────────────────┤
│ PK  id          │       │ PK  id          │
│ FK  user_id     │       │ FK  user_id     │
│    reward_name  │       │    bill_name   │
│    reward_type  │       │    amount       │
│    points_      │       │    due_date     │
│      required   │       │    is_paid      │
│    is_claimed   │       └─────────────────┘
└─────────────────┘
```

---

### 📋 Detailed Table Schemas

#### 1. USERS Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ name           │ String(255)  │ NOT NULL    │
│ email          │ String(255)  │ UNIQUE, IDX │
│ password       │ String(255)  │ NOT NULL    │
│ phone          │ String(20)   │             │
│ kyc_status     │ String(50)   │ Default:    │
│                │              │ "Pending"   │
└────────────────┴──────────────┴─────────────┘
```

**Screenshot Tip:** Create an ER diagram showing Users as the central table connected to all other tables

---

#### 2. ACCOUNTS Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ user_id        │ Integer      │ FK → Users │
│ bank_name      │ String(100)  │ NOT NULL   │
│ account_type   │ String(50)   │ NOT NULL   │
│                │              │ (Savings,  │
│                │              │ Current,   │
│                │              │ Credit)    │
│ balance        │ Numeric(12,2)│ NOT NULL   │
└────────────────┴──────────────┴─────────────┘
```

**Screenshot Tip:** Show account types diagram (Savings, Current, Credit cards)

---

#### 3. TRANSACTIONS Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ account_id     │ Integer      │ FK → Accts │
│ description    │ String(500)  │ NOT NULL   │
│ category       │ String(100)  │ Nullable,   │
│                │              │ Indexed    │
│ amount         │ Numeric(12,2)│ NOT NULL   │
│                │              │ (+)Income  │
│                │              │ (-)Expense │
│ created_at     │ DateTime     │ Indexed,   │
│                │              │ Auto now   │
└────────────────┴──────────────┴─────────────┘
```

**Transaction Flow Diagram:**
```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│   ACCOUNT    │────►│  TRANSACTION  │────►│  CATEGORY    │
│              │     │               │     │  (Optional)  │
│ - Savings    │     │ +5000 (Credit)│     │ - Food       │
│ - Current    │     │ -250 (Debit)  │     │ - Shopping   │
│ - Credit     │     │               │     │ - Bills      │
└──────────────┘     └───────────────┘     └──────────────┘
```

---

#### 4. BUDGETS Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ user_id        │ Integer      │ FK → Users │
│ category       │ String(100)  │ NOT NULL   │
│ limit_amount   │ Numeric(12,2)│ NOT NULL   │
│ spent_amount   │ Numeric(12,2)│ Default: 0 │
│ month          │ String(7)    │ NOT NULL   │
│                │              │ (YYYY-MM)  │
│ is_over_budget │ Boolean      │ Default:F  │
└────────────────┴──────────────┴─────────────┘
```

**Budget Tracking Diagram:**
```
┌─────────────────────────────────────────────┐
│              BUDGET TRACKING                 │
├─────────────────────────────────────────────┤
│ Category: Food & Dining                      │
│                                             │
│ Limit: ₹10,000  ████████████░░░░  Spent:₹8,000│
│                                             │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░ 80% Used                 │
│ (Green: <70%, Yellow: 70-99%, Red: >100%)    │
└─────────────────────────────────────────────┘
```

---

#### 5. ALERTS Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ user_id        │ Integer      │ FK → Users │
│ title          │ String(200)  │ NOT NULL   │
│ message        │ Text         │ NOT NULL   │
│ alert_type     │ String(50)   │ NOT NULL   │
│                │              │ (budget_,  │
│                │              │ warning,   │
│                │              │ error,info)│
│ is_read        │ Boolean      │ Default:F  │
│ created_at     │ DateTime     │ Auto now   │
└────────────────┴──────────────┴─────────────┘
```

**Alert Types Visual:**
```
┌────────────────────────────────────────────┐
│  🔴 BUDGET_EXCEEDED (Red)                  │
│     "You've exceeded your Food budget!"   │
├────────────────────────────────────────────┤
│  🟡 WARNING (Yellow)                       │
│     "70% of budget used"                   │
├────────────────────────────────────────────┤
│  🔵 INFO (Blue)                            │
│     "New transaction detected"             │
├────────────────────────────────────────────┤
│  🔴 ERROR (Red)                            │
│     "Authentication failed"                │
└────────────────────────────────────────────┘
```

---

#### 6. REWARDS Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ user_id        │ Integer      │ FK → Users │
│ reward_name    │ String(200)  │ NOT NULL   │
│ reward_type    │ String(50)   │ NOT NULL   │
│ points_required│ Numeric(10,0)│ NOT NULL   │
│ is_claimed     │ Boolean      │ Default:F  │
└────────────────┴──────────────┴─────────────┘
```

---

#### 7. BILLS Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ user_id        │ Integer      │ FK → Users │
│ bill_name      │ String(200)  │ NOT NULL   │
│ amount         │ Numeric(12,2)│ NOT NULL   │
│ due_date       │ Date         │ NOT NULL   │
│ is_paid        │ Boolean      │ Default:F  │
└────────────────┴──────────────┴─────────────┘
```

---

#### 8. CATEGORY_RULES Table
```
┌────────────────┬──────────────┬─────────────┐
│   Column       │    Type      │  Constraints│
├────────────────┼──────────────┼─────────────┤
│ id             │ Integer      │ PK, Auto   │
│ user_id        │ Integer      │ FK → Users │
│ category       │ String(100)  │ NOT NULL   │
│ keyword_pattern│ String(100)  │ NOT NULL   │
│ priority       │ Integer      │ Default:1  │
│ is_active      │ Boolean      │ Default:T  │
└────────────────┴──────────────┴─────────────┘
```

**Auto-Categorization Diagram:**
```
┌─────────────────────────────────────────────────┐
│         CATEGORY RULE ENGINE                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Transaction Description: "ZOMATO ORDER"        │
│                        │                        │
│                        ▼                        │
│  ┌─────────────────────────────────────────┐  │
│  │ Check Rules (Keyword Matching)          │  │
│  │                                         │  │
│  │ Rule 1: "ZOMATO" → Food & Dining       │  │
│  │ Rule 2: "UBER"   → Transportation       │  │
│  │ Rule 3: "NETFLIX"→ Entertainment        │  │
│  └─────────────────────────────────────────┘  │
│                        │                        │
│                        ▼                        │
│  ✓ Category: "Food & Dining" Applied!        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 🔗 Table Relationships Summary

```
USERS (1) ──────< (N) ACCOUNTS
   │
   ├────< (N) TRANSACTIONS
   │
   ├────< (N) BUDGETS
   │
   ├────< (N) ALERTS
   │
   ├────< (N) REWARDS
   │
   ├────< (N) BILLS
   │
   └────< (N) CATEGORY_RULES

ACCOUNTS (1) ─────< (N) TRANSACTIONS
```

---

### 📈 Database Model for PPT

**Create these diagrams for your presentation:**

1. **Main ER Diagram** - All 8 tables with relationships
2. **Users Table** - User authentication & KYC
3. **Accounts-Transactions Flow** - Financial data flow
4. **Budget Tracking** - Budget limits and spending
5. **Alert System** - Notification types
6. **Category Rules** - Auto-categorization engine

**Screenshot Instructions:**
- Use a tool like dbdiagram.io, Draw.io, or MySQL Workbench to create ER diagrams
- Export as PNG images for your PPT
- Each table structure can be shown as a visual table diagram

---

## Quick Reference - All URLs

| Page | URL |
|------|-----|
| Login | http://localhost:5175/ |
| Register | http://localhost:5175/register |
| Dashboard Home | http://localhost:5175/dashboard |
| Accounts | http://localhost:5175/dashboard/accounts |
| Transactions | http://localhost:5175/dashboard/transactions |
| Analytics | http://localhost:5175/dashboard/analytics |
| Budget | http://localhost:5175/dashboard/budget |
| KYC | http://localhost:5175/dashboard/kyc |
| Notifications | http://localhost:5175/dashboard/notifications |
| Rewards | http://localhost:5175/dashboard/rewards |
| Profile | http://localhost:5175/dashboard/profile |

---

## Technology Stack

### Frontend
- **Framework:** React 18
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **Charts:** Recharts (for Pie and Bar charts)
- **Build Tool:** Vite

### Backend (Handled by College)
- **Framework:** FastAPI
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** PostgreSQL / SQLite
- **ORM:** SQLAlchemy

---

## How to Run Frontend

1. Navigate to frontend directory:
```bash
cd banking-frontend/banking-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Access at: http://localhost:5175

---

## Presentation Tips

1. **Start with Login/Register** - Show the authentication flow
2. **Dashboard** - Show the overview and navigation
3. **Accounts** - Explain how users can link multiple bank accounts
4. **Transactions** - Demonstrate transaction listing and category management
5. **Analytics** - Show visual charts (Pie/Bar) for spending analysis
6. **Budget** - Show budget setting and tracking with progress bars
7. **Notifications** - Explain automated alerts system
8. **Profile/KYC/Rewards** - Complete the tour with additional features

---

*Document created for project presentation purposes*
*Frontend & Database portions completed*
*Backend handled separately*

