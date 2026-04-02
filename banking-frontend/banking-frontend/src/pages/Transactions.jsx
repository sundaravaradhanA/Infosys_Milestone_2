import {fetchWithAuth , API_BASE_URL} from "../services/api";
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
  ArrowLeftRight,
  Download,
  FileSpreadsheet
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
  const [editAmount, setEditAmount] = useState("");
  const [saveAsRule, setSaveAsRule] = useState(false);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id") || 1;
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [txnRes, rulesRes] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/transactions/?user_id=${userId}`, { headers }),
          fetchWithAuth(`${API_BASE_URL}/categories/rules`, { headers })
        ]);

        if (txnRes.ok) setTransactions(await txnRes.json());
        if (rulesRes.ok) setRules(await rulesRes.json());
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAllData();
    
    // Global listener for instant reflex
    const handleRefresh = () => fetchAllData();
    window.addEventListener("app-data-updated", handleRefresh);

    // Periodic live sync (60s)
    const interval = setInterval(fetchAllData, 60000);

    return () => {
      window.removeEventListener("app-data-updated", handleRefresh);
      clearInterval(interval);
    };
  }, []);
 
  const handleExportCSV = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id") || 1;
    window.open(`${API_BASE_URL}/export/transactions?format=csv&user_id=${userId}&token=${token}`);
  };

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
    }).format(amount);
  };

  const handleSelectTransaction = (txn) => {
    setSelectedTxn(txn);
    setEditCategory(txn.category || "");
    setEditAmount(Math.abs(txn.amount_inr || 0).toString());
    setSaveAsRule(false);
  };

  const handleUpdateCategory = async () => {
    if (!selectedTxn) return;
    
    const token = localStorage.getItem("token");
    
    try {
      // Update category
      const categoryResponse = await fetchWithAuth(
        `${API_BASE_URL}/transactions/${selectedTxn.id}/category?save_as_rule=${saveAsRule}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category: editCategory }),
        }
      );
      
      if (categoryResponse.ok) {
        const updatedTxn = await categoryResponse.json();

        // Update amount if changed
        const newAmountInr = parseFloat(editAmount);
        const originalAmountInr = Math.abs(selectedTxn.amount_inr || 0);
        
        if (!isNaN(newAmountInr) && newAmountInr !== originalAmountInr) {
          // Preserve the original sign (Income: positive, Expense: negative)
          const isExpense = (selectedTxn.amount_usd || 0) < 0;
          const signedInr = isExpense ? -Math.abs(newAmountInr) : Math.abs(newAmountInr);
          const signedUsd = signedInr / 84;

          // Update backend for amount change as well
          await fetchWithAuth(`${API_BASE_URL}/transactions/${selectedTxn.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: signedUsd }),
          });

          updatedTxn.amount_inr = signedInr;
          updatedTxn.amount_usd = signedUsd;
        }

        setTransactions(
          transactions.map((t) =>
            t.id === selectedTxn.id ? { ...t, ...updatedTxn } : t
          )
        );
        setSelectedTxn({ ...selectedTxn, ...updatedTxn });
        
        // Refresh rules if saved as rule
        if (saveAsRule) {
          const rulesRes = await fetchWithAuth(`${API_BASE_URL}/categories/rules`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const rulesData = await rulesRes.json();
          setRules(rulesData);
        }
        
        alert("Category updated successfully!");
        // Trigger global live refresh
        window.dispatchEvent(new Event("app-data-updated"));
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
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/rules`, {
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
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/rules/${ruleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setRules(rules.filter(r => r.id !== ruleId));
        alert("Rule deleted successfully!");
        // Trigger global live refresh
        window.dispatchEvent(new Event("app-data-updated"));
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

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-success-500 hover:bg-success-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export Transactions (CSV)
        </button>
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-dark-500">
                        <ShoppingBag className="w-12 h-12 mb-4 text-dark-200" />
                        <p className="text-lg font-medium">No transactions available</p>
                        <p className="text-sm">We couldn't find any transactions for your search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((txn, index) => (
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
                          {formatAmount(txn.amount_inr)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-dark-100 bg-white">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-dark-50 text-dark-600 rounded-lg hover:bg-dark-100 disabled:opacity-50 transition-colors"
                title="Previous Page"
              >
                Previous
              </button>
              <div className="flex gap-1">
                <span className="text-sm font-medium text-dark-500">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 bg-dark-50 text-dark-600 rounded-lg hover:bg-dark-100 disabled:opacity-50 transition-colors"
                title="Next Page"
              >
                Next
              </button>
            </div>
          )}
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
                <p className="text-sm text-dark-500 mb-1">Amount (₹ INR)</p>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${selectedTxn.amount_usd >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {selectedTxn.amount_usd >= 0 ? '+' : '-'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="input-modern flex-1 text-right"
                    placeholder="Amount in ₹"
                  />
                </div>
                <p className="text-xs text-dark-400 mt-1">Edit amount if needed before saving</p>
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

