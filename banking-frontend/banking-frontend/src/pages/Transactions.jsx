import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Tag, 
  Check, 
  X, 
  Plus, 
  Trash2,
  Loader2,
  Clock,
  ShoppingBag,
  Utensils,
  Car,
  Film,
  Home,
  Heart,
  Plane,
  DollarSign,
  ArrowLeftRight
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

// Category icon mapping
const getCategoryIcon = (category) => {
  const icons = {
    "Food & Dining": Utensils,
    "Shopping": ShoppingBag,
    "Transportation": Car,
    "Entertainment": Film,
    "Bills & Utilities": Home,
    "Health & Fitness": Heart,
    "Travel": Plane,
    "Income": DollarSign,
    "Transfer": ArrowLeftRight,
  };
  const Icon = icons[category] || Tag;
  return Icon;
};

const getCategoryColor = (category) => {
  const colors = {
    "Food & Dining": "from-orange-400 to-orange-600",
    "Shopping": "from-pink-400 to-pink-600",
    "Transportation": "from-blue-400 to-blue-600",
    "Entertainment": "from-purple-400 to-purple-600",
    "Bills & Utilities": "from-gray-400 to-gray-600",
    "Health & Fitness": "from-green-400 to-green-600",
    "Travel": "from-cyan-400 to-cyan-600",
    "Income": "from-success-400 to-success-600",
    "Transfer": "from-brand-400 to-brand-600",
    "Other": "from-dark-400 to-dark-600",
  };
  return colors[category] || "from-brand-400 to-brand-600";
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [saveAsRule, setSaveAsRule] = useState(false);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/transactions/?user_id=1", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    fetch("http://127.0.0.1:8000/categories/rules", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRules(data))
      .catch((err) => console.error(err));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handleSelectTransaction = (txn) => {
    setSelectedTxn(txn);
    setEditCategory(txn.category || "");
    setSaveAsRule(false);
  };

  const handleUpdateCategory = async () => {
    if (!selectedTxn) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/transactions/${selectedTxn.id}/category?save_as_rule=${saveAsRule}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category: editCategory }),
        }
      );
      
      if (response.ok) {
        const updatedTxn = await response.json();
        setTransactions(
          transactions.map((t) =>
            t.id === selectedTxn.id ? updatedTxn : t
          )
        );
        setSelectedTxn(updatedTxn);
        
        // Refresh rules if saved as rule
        if (saveAsRule) {
          const rulesRes = await fetch("http://127.0.0.1:8000/categories/rules", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const rulesData = await rulesRes.json();
          setRules(rulesData);
        }
        
        alert("Category updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update category");
    }
  };

  const handleCreateRule = async () => {
    if (!selectedTxn) return;
    
    const token = localStorage.getItem("token");
    const keyword = selectedTxn?.description?.split(" ")[0] || "";
    
    try {
      const response = await fetch("http://127.0.0.1:8000/categories/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: editCategory,
          keyword_pattern: keyword,
          priority: 1,
          is_active: true,
        }),
      });
      
      if (response.ok) {
        const newRule = await response.json();
        setRules([...rules, newRule]);
        alert("Rule created successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create rule");
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8000/categories/rules/${ruleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setRules(rules.filter(r => r.id !== ruleId));
        alert("Rule deleted successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete rule");
    }
  };

  const filteredTransactions = transactions.filter(txn =>
    txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

const totalIncome = transactions.filter(t => t.amount_usd > 0).reduce((sum, t) => sum + t.amount_inr, 0);
  const totalExpense = transactions.filter(t => t.amount_usd < 0).reduce((sum, t) => sum + Math.abs(t.amount_inr), 0);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-dark-800">Transactions</h2>
          <p className="text-dark-500 text-sm mt-1">View and manage all your transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-dark-500 text-sm">Total Income</p>
              <p className="text-xl font-display font-bold text-success-600">{formatAmount(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-dark-500 text-sm">Total Expense</p>
              <p className="text-xl font-display font-bold text-danger-600">{formatAmount(totalExpense)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-dark-500 text-sm">Total Transactions</p>
              <p className="text-xl font-display font-bold text-dark-800">{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Transactions Table */}
        <div className="flex-1 card overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-dark-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-with-icon pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="table-modern">
              <thead className="sticky top-0 bg-dark-50 z-10">
                <tr>
                  <th className="pl-4">Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-dark-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn, index) => (
                    <tr
                      key={txn.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedTxn?.id === txn.id 
                          ? "bg-brand-50 border-l-4 border-l-brand-500" 
                          : "hover:bg-dark-50"
                      }`}
                      onClick={() => handleSelectTransaction(txn)}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-dark-400" />
                          <span className="text-sm">{formatDate(txn.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-dark-800">{txn.description}</span>
                      </td>
                      <td>
                        {txn.category ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(txn.category)}`}>
                            {React.createElement(getCategoryIcon(txn.category), { className: "w-3.5 h-3.5" })}
                            {txn.category}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-dark-200 text-dark-600">
                            <Tag className="w-3.5 h-3.5" />
                            Uncategorized
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right">
<span className={`font-display font-bold text-lg ${
                          txn.amount_usd >= 0 ? "text-success-600" : "text-danger-600"
                        }`}>
                          {txn.amount_usd >= 0 ? '+' : '-'}₹{formatAmount(txn.amount_inr)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Category Editor */}
        <div className="w-80 card p-5 h-fit sticky top-6">
          <h3 className="text-lg font-display font-bold text-dark-800 mb-4">
            Update Category
          </h3>

          {selectedTxn ? (
            <div className="space-y-4">
              {/* Transaction Details */}
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Description</p>
                <p className="font-semibold text-dark-800 mb-3">{selectedTxn.description}</p>
                <p className="text-sm text-dark-500 mb-1">Amount</p>
<p className={`font-display font-bold text-xl ${
                  selectedTxn.amount_usd >= 0 ? "text-success-600" : "text-danger-600"
                }`}>
                  {selectedTxn.amount_usd >= 0 ? '+' : '-'}₹{Math.abs(selectedTxn.amount_inr)}
                </p>
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Select Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PREDEFINED_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEditCategory(cat)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        editCategory === cat
                          ? "bg-brand-500 text-white"
                          : "bg-dark-100 text-dark-600 hover:bg-dark-200"
                      }`}
                    >
                      {React.createElement(getCategoryIcon(cat), { className: "w-4 h-4" })}
                      {cat.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save as Rule Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveAsRule"
                  checked={saveAsRule}
                  onChange={(e) => setSaveAsRule(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-dark-300 focus:ring-brand-500"
                />
                <label htmlFor="saveAsRule" className="text-sm text-dark-700">
                  Save as rule for future
                </label>
              </div>

              {/* Update Button */}
              <button
                onClick={handleUpdateCategory}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Update Category
              </button>

              {/* Show Create Rule button separately */}
              {saveAsRule && (
                <button
                  onClick={handleCreateRule}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Rule
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-100 flex items-center justify-center">
                <Tag className="w-6 h-6 text-dark-400" />
              </div>
              <p className="text-dark-500 text-sm">
                Select a transaction to update its category
              </p>
            </div>
          )}

          {/* Category Rules Section */}
          <div className="mt-6 pt-5 border-t border-dark-100">
            <h4 className="font-semibold text-dark-800 mb-3">Active Rules</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 bg-dark-50 rounded-lg flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${getCategoryColor(rule.category)}`} />
                      <div>
                        <span className="text-sm font-medium text-dark-700">{rule.category}</span>
                        <span className="text-xs text-dark-400 block">"{rule.keyword_pattern}"</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-dark-400 text-xs text-center py-4">No rules created yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;

