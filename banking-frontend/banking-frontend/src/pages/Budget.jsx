import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Calendar, 
  BarChart3, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  PiggyBank
} from "lucide-react";

const PREDEFINED_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Health & Fitness",
  "Travel",
  "Income",
  "Transfer",
  "Other"
];

// Calendar component
function CalendarView({ transactions, month }) {
  const [currentDate, setCurrentDate] = useState(new Date(month + "-01"));
  
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Group transactions by day
  const transactionsByDay = {};
  transactions.forEach(txn => {
    const date = new Date(txn.created_at);
    const day = date.getDate();
    if (!transactionsByDay[day]) {
      transactionsByDay[day] = [];
    }
    transactionsByDay[day].push(txn);
  });
  
  const getDaySpending = (day) => {
    if (!transactionsByDay[day]) return 0;
    return transactionsByDay[day]
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-dark-600" />
        </button>
        <div className="text-center">
          <h3 className="text-lg font-display font-bold text-dark-800">
            {monthNames[monthIndex]} {year}
          </h3>
          <p className="text-sm text-dark-500">Daily spending tracker</p>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-dark-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2">
            <span className="text-xs font-semibold text-dark-500 uppercase">{day}</span>
          </div>
        ))}
        
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-[80px] p-2 border rounded-xl transition-all ${
              day 
                ? getDaySpending(day) > 0 
                  ? 'bg-danger-50 border-danger-100 hover:border-danger-200' 
                  : 'bg-dark-50 border-dark-100 hover:border-dark-200'
                : 'bg-transparent border-transparent'
            }`}
          >
            {day && (
              <>
                <div className="text-sm font-semibold text-dark-700 mb-1">{day}</div>
                {transactionsByDay[day] && transactionsByDay[day].length > 0 && (
                  <div className={`text-xs font-medium ${getDaySpending(day) > 0 ? "text-danger-600" : "text-success-600"}`}>
                    {getDaySpending(day) > 0 ? (
                      <span>-₹{getDaySpending(day).toLocaleString()}</span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> No spending
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    limit_amount: "",
    month: new Date().toISOString().slice(0, 7)
  });

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchBudgets();
    fetchTransactions();
  }, [currentMonth]);

  const fetchBudgets = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8000/budgets/?user_id=1&month=${currentMonth}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8000/transactions/?user_id=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Filter transactions for current month
        const filteredTransactions = data.filter(txn => {
          const txnDate = new Date(txn.created_at);
          const txnMonth = txnDate.toISOString().slice(0, 7);
          return txnMonth === currentMonth;
        });
        setTransactions(filteredTransactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const payload = {
      user_id: 1,
      category: formData.category,
      limit_amount: parseFloat(formData.limit_amount),
      month: formData.month
    };

    try {
      let url = "http://127.0.0.1:8000/budgets/";
      let method = "POST";

      if (editingBudget) {
        url = `http://127.0.0.1:8000/budgets/${editingBudget.id}?user_id=1`;
        method = "PUT";
        payload.category = formData.category;
        payload.limit_amount = parseFloat(formData.limit_amount);
        payload.month = formData.month;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchBudgets();
        setShowForm(false);
        setEditingBudget(null);
        setFormData({
          category: "",
          limit_amount: "",
          month: currentMonth
        });
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to save budget");
      }
    } catch (err) {
      console.error("Failed to save budget:", err);
      alert("Failed to save budget");
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit_amount: budget.limit_amount.toString(),
      month: budget.month
    });
    setShowForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8000/budgets/${budgetId}?user_id=1`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchBudgets();
      }
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "from-danger-400 to-danger-600";
    if (percentage >= 70) return "from-warning-400 to-warning-600";
    return "from-success-400 to-success-600";
  };

  const getProgressBgColor = (percentage) => {
    if (percentage >= 100) return "bg-danger-100";
    if (percentage >= 70) return "bg-warning-100";
    return "bg-success-100";
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals from budgets
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-dark-800">Budget</h2>
          <p className="text-dark-500 text-sm mt-1">Manage your monthly spending limits</p>
        </div>
        
        {/* Toggle View Button */}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            showCalendar 
              ? "bg-brand-500 text-white" 
              : "bg-dark-100 text-dark-700 hover:bg-dark-200"
          }`}
        >
          {showCalendar ? (
            <>
              <BarChart3 className="w-5 h-5" />
              Budget View
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Calendar View
            </>
          )}
        </button>
      </div>

      {showCalendar ? (
        // Calendar View
        <CalendarView transactions={transactions} month={currentMonth} />
      ) : (
        // Budget View
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-gradient p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-brand-600" />
                </div>
                <span className="text-sm text-dark-500">Total Budget</span>
              </div>
              <p className="text-2xl font-display font-bold text-dark-800">{formatAmount(totalBudget)}</p>
            </div>
            
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-600" />
                </div>
                <span className="text-sm text-dark-500">Total Spent</span>
              </div>
              <p className="text-2xl font-display font-bold text-danger-600">{formatAmount(totalSpent)}</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                </div>
                <span className="text-sm text-dark-500">Remaining</span>
              </div>
              <p className={`text-2xl font-display font-bold ${totalRemaining >= 0 ? "text-success-600" : "text-danger-600"}`}>
                {formatAmount(totalRemaining)}
              </p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getProgressBgColor(budgetUtilization)}`}>
                  <BarChart3 className={`w-5 h-5 ${budgetUtilization >= 100 ? 'text-danger-600' : budgetUtilization >= 70 ? 'text-warning-600' : 'text-success-600'}`} />
                </div>
                <span className="text-sm text-dark-500">Utilization</span>
              </div>
              <p className={`text-2xl font-display font-bold ${budgetUtilization >= 100 ? "text-danger-600" : budgetUtilization >= 70 ? "text-warning-600" : "text-success-600"}`}>
                {budgetUtilization.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Budget List */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-dark-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-dark-800">
                  Monthly Budgets
                </h3>
                <p className="text-sm text-dark-500">{currentMonth}</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingBudget(null);
                  setFormData({
                    category: "",
                    limit_amount: "",
                    month: currentMonth
                  });
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Budget
              </button>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-100 flex items-center justify-center">
                  <PiggyBank className="w-8 h-8 text-dark-400" />
                </div>
                <h3 className="text-lg font-semibold text-dark-700 mb-2">No budgets set</h3>
                <p className="text-dark-500 text-sm mb-4">Create a budget to start tracking your spending</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Budget
                </button>
              </div>
            ) : (
              <div className="divide-y divide-dark-100">
                {budgets.map((budget, index) => (
                  <div 
                    key={budget.id} 
                    className="p-5 hover:bg-dark-50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-dark-800">{budget.category}</h4>
                          {budget.is_over_budget ? (
                            <span className="badge-danger flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Over Budget
                            </span>
                          ) : (budget.progress_percentage || 0) >= 70 ? (
                            <span className="badge-warning">Warning</span>
                          ) : (
                            <span className="badge-success">On Track</span>
                          )}
                        </div>
                        <p className="text-sm text-dark-500 mb-3">
                          {formatAmount(budget.spent_amount || 0)} spent of {formatAmount(budget.limit_amount || 0)}
                        </p>
                        {/* Progress Bar */}
                        <div className="h-3 bg-dark-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(budget.progress_percentage || 0)} transition-all duration-500`}
                            style={{ width: `${Math.min(budget.progress_percentage || 0, 100)}%` }}
                          />
                        </div>
                        {budget.is_over_budget && (
                          <p className="text-danger-600 text-sm mt-2 font-medium">
                            Over budget by {formatAmount((budget.spent_amount || 0) - (budget.limit_amount || 0))}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-display font-bold ${budget.is_over_budget ? 'text-danger-600' : 'text-dark-800'}`}>
                          {(budget.progress_percentage || 0).toFixed(0)}%
                        </span>
                        <div className="flex gap-1 ml-4">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="p-2 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Budget Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-dark-800">
                {editingBudget ? "Edit Budget" : "Add Budget"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
              >
                <X className="w-5 h-5 text-dark-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="input-modern"
                >
                  <option value="">Select Category</option>
                  {PREDEFINED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Budget Limit (₹)
                </label>
                <input
                  type="number"
                  name="limit_amount"
                  value={formData.limit_amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-modern"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  required
                  className="input-modern"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingBudget ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBudget(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget;

