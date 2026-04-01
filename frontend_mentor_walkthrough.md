# 🏦 Digital Banking Dashboard — Frontend Walkthrough
### For Infosys Mentor Presentation

---

**Project Stack:** React (Vite) + Tailwind CSS + Recharts + Lucide Icons
**Frontend Root:** `d:\Infosys_Milestone_2\banking-frontend\banking-frontend\`
**All pages live in:** `src/pages/`   |   **API service:** `src/services/api.js`

---

## 📁 Project File Map

| File | Purpose |
|------|---------|
| `src/App.jsx` | Root router — Login / Register / Dashboard |
| `src/services/api.js` | Authenticated HTTP helper (`fetchWithAuth`) |
| `src/pages/Dashboard.jsx` | Shell layout: sidebar nav + nested routes |
| `src/pages/Analytics.jsx` | **Insights Dashboard** (charts, cashflow, merchants, burn rate) |
| `src/pages/Notifications.jsx` | **Alerts Center** (list, mark-as-read, auto-refresh) |
| `src/pages/Transactions.jsx` | Transaction list + **CSV Export** |
| `src/pages/Budget.jsx` | Budget tracking with progress bars + calendar |
| `src/pages/Bills.jsx` | Upcoming bills and payment tracking |
| `src/pages/Accounts.jsx` | Bank accounts overview |

---

## ✅ Task 1 — Insights Dashboard UI (Analytics.jsx)

### Where is it?
**File:** `src/pages/Analytics.jsx`
**Route:** `/dashboard/analytics` (registered in `Dashboard.jsx` line 173)

### What You See on Screen
A full analytics page with:
- **3 Summary Cards** — Total Income | Total Expense | Net Balance
- **Spending by Category Chart** — switchable Pie Chart / Bar Chart
- **Category Breakdown Table** — amounts + visual progress bar per category
- **Top Merchants widget** — top 5 merchants by spend
- **Budget Burn Rate widget** — circular dial showing % of budget used

### How It Works — Line by Line

**Step 1: State Variables (lines 46–52)**
```js
const [monthlySummary, setMonthlySummary] = useState({ total_income: 0, total_expense: 0 });
const [categoryData, setCategoryData]     = useState([]);
const [topMerchants, setTopMerchants]     = useState([]);
const [burnRate, setBurnRate]             = useState(null);
const [selectedMonth, setSelectedMonth]   = useState(new Date().toISOString().slice(0, 7));
const [loading, setLoading]               = useState(true);
```
Each state variable holds data for one specific widget on the page. `selectedMonth` drives the month filter at the top right.

**Step 2: Data Fetching (lines 54–97)**
```js
useEffect(() => {
  fetchData();
}, [selectedMonth]);  // Re-runs every time the month picker changes
```
Inside `fetchData()`, **4 API calls run in parallel** using `Promise.all`:

1. `/insights/spending-by-category` for the Pie/Bar Chart
2. `/insights/top-merchants` for the Top Merchants card
3. `/insights/burn-rate` for the Burn Rate dial
4. `/insights/monthly-summary` for the Summary cards

`Promise.all` means all 4 requests go out simultaneously — the page loads faster.

**Step 3: Charts (lines 273–320) — Recharts library**
The toggle buttons (Pie / Bar) change the `chartType` state, which switches what Recharts renders. The same data (`categoryData`) feeds both chart types automatically.

**Step 4: Empty State (lines 321–328)**
If there's no data, a friendly message is shown instead of an empty chart.

---

## ✅ Task 2 — Dynamic Data in Charts (All pages)

### Where is it?
The pattern is **repeated across every page**. Here is the exact pattern from `Analytics.jsx`:

```js
// 1. Declare state
const [categoryData, setCategoryData] = useState([]);
const [loading, setLoading] = useState(true);

// 2. Trigger fetch on mount / when dependency changes
useEffect(() => {
  fetchData();
}, [selectedMonth]);

// 3. Inside fetchData: call API, store in state
const response = await fetchWithAuth(`http://127.0.0.1:8000/insights/...`);
const data = await response.json();
setCategoryData(data);  // This triggers React to re-render the chart

// 4. Show spinner while loading
if (loading) return <Loader2 className="animate-spin" />;
```

### The fetchWithAuth Helper (src/services/api.js)
This is the **single point of authentication** for all API calls globally:
```js
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",  // JWT injected automatically
  };
  // ... Handles 401 Unauthorized globally by logging out ...
```
Every single API call in the app goes through this function. This ensures JWT is always sent and expired sessions auto-redirect to login — no code duplication.

---

## ✅ Task 3 — Alerts UI / Alert Center (Notifications.jsx)

### Where is it?
**File:** `src/pages/Notifications.jsx`
**Route:** `/dashboard/notifications`

### What You See on Screen
- A **header card** showing unread count ("You have X unread notifications")
- A **"Mark all as read" button** that appears only when unread alerts exist
- A **list of alert cards**, each with:
  - Colored left border (RED = budget exceeded, YELLOW = warning, BLUE = info)
  - Icon matching alert type
  - Title, message, timestamp
  - "New" badge on unread alerts
  - Check (mark read) and Trash (delete) actions

### How It Works — Line by Line

**Alert Type Color Coding (lines 133–184)**
The color changes automatically based on `alert.alert_type` from the backend:
- `"budget_exceeded"`: RED (`bg-danger-50`, `text-danger-800`)
- `"warning"`: YELLOW (`bg-warning-50`, `border-warning-200`)
- `"info"`: BLUE (`bg-brand-50`, `border-brand-200`)

**Mark as Read (lines 46–66)**
When the user clicks the check button, the alert turns grey **instantly** (optimistic update) via `setAlerts(...)` and the PATCH request is sent to the backend simultaneously.

**Empty State (lines 228–237)**
When 0 notifications exist, it shows a BellOff icon with "You're all caught up!"

---

## ✅ Task 4 — Real-Time Auto Refresh (Notifications.jsx + Dashboard.jsx)

### Two places implement polling:

**Place 1: Alert list auto-refresh — Notifications.jsx lines 21–25**
```js
useEffect(() => {
  fetchAlerts();                                    // Fetch immediately on page load
  const interval = setInterval(fetchAlerts, 30000); // Polling every 30 seconds
  return () => clearInterval(interval);             // Cleanup when user leaves page
}, []);
```

**Place 2: Sidebar badge auto-refresh — Dashboard.jsx lines 22–41**
The sidebar "Notifications" nav item shows a **red badge** with the unread count (Dashboard.jsx line 130), and this number queries the backend every 30 seconds globally via its own interval.

---

## ✅ Task 5 — Export UI: CSV / PDF Downloads

### CSV Export — Transactions.jsx (lines 112–129)
**Where:** The green "Export CSV" button in the top-right of the Transactions page.

```js
const handleExportCSV = async () => {
  const response = await fetchWithAuth(`/export/transactions?format=csv...`);
  const blob = await response.blob();            // Get raw file bytes
  const url = window.URL.createObjectURL(blob);  // Create browser-local URL
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_...csv`;            // Filename
  a.click();                                     // Trigger download dialog
};
```

### PDF Export — Analytics.jsx (lines 99–116) + Dashboard.jsx (lines 72–92)
**Where 1:** The blue "Download PDF" button in the Analytics page header.
**Where 2:** The sidebar "Quick Exports" section at the bottom of every page.

**Key Design Decision:** The frontend never reads or processes the file — it just receives raw bytes (`blob()`) from the backend and forwards them to the browser download dialog. This keeps the frontend fast and lightweight.

---

## ✅ Task 6 — UI Polishing & UX Improvements

**Loading Spinners — Every Page**
```jsx
if (loading) return <div className="..."><Loader2 className="animate-spin ..." /></div>;
```
All pages show a spinning loader while API data is being fetched. No page shows blank/broken content.

**Empty State Messages — Every Page**
- Transactions: "No transactions found" (line 362)
- Analytics: "No categorized transactions for this month" (line 324)
- Budget: "No budgets set — Create a budget to start tracking" (line 457)

**Color-Coded Budget Status Badges (Budget.jsx lines 479–488)**
Displays `<span className="badge-danger">Over Budget</span>` or `Warning` depending on the threshold percentage logic.

**Responsive Grid Layout (Analytics.jsx lines 182–183)**
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
```
Uses `grid-cols-1` on mobile (stacked) and `md:grid-cols-3` on desktop (3 items across). Every card and layout matches this structure.

---

## ✅ Task 7 — Final Integration & Routing

**Authentication Guard (App.jsx lines 7–10)**
```js
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}
```
If no JWT token exists in LocalStorage, the user is **automatically redirected to login**. All dashboard routes (`/dashboard/*`) are wrapped in `<PrivateRoute>`.

**Full Route Table (Dashboard.jsx lines 169–181)**
React Router connects the pages seamlessly: `<Route path="transactions" element={<Transactions />} />` etc.

**Active Nav Link Highlighting (Dashboard.jsx lines 119–135)**
React Router's `NavLink` automatically knows which page is active and highlights it blue in the sidebar based on `({ isActive })`.

---

## 🎯 Final Checklist Completed
- [x] **Insights page** implemented (`Analytics.jsx`)
- [x] **Dynamic Charts** loading via API (`Recharts`)
- [x] **Alerts UI** implemented (`Notifications.jsx`)
- [x] **Auto-Refresh** every 30 seconds
- [x] **Export CSV/PDF** fetching BLOB from backend
- [x] **UI Polish**: Spinners, empty states, responsive grids
- [x] **Integration**: JWT auth guard, global fetch layer, routing
