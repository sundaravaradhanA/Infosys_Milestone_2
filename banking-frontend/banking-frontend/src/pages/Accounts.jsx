import {fetchWithAuth , API_BASE_URL} from "../services/api";
import React, { useEffect, useState } from "react";
import { Plus, Wallet, Building2, CreditCard, Trash2, Edit, X, Check, Loader2 } from "lucide-react";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("Savings");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchAccounts(); // Initial load

    // Global listener for instant reflex
    const handleRefresh = () => fetchAccounts();
    window.addEventListener("app-data-updated", handleRefresh);

    // Periodic live sync (60s)
    const interval = setInterval(fetchAccounts, 60000);

    return () => {
      window.removeEventListener("app-data-updated", handleRefresh);
      clearInterval(interval);
    };
  }, []);

  const fetchAccounts = () => {
    const userId = localStorage.getItem("user_id") || 1;
    setLoading(true);
    fetchWithAuth(`${API_BASE_URL}/accounts/?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAddAccount = async () => {
    if (!bankName || !balance) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/accounts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: parseInt(localStorage.getItem("user_id") || 1),
          bank_name: bankName,
          account_type: accountType,
          balance_usd: parseFloat(balance),  // ✅ Fixed field name
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to add account");
      }

      await response.json();

      setShowModal(false);
      setBankName("");
      setAccountType("Savings");
      setBalance("");
      setSuccessMsg("Account added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchAccounts();
      // Trigger global live refresh
      window.dispatchEvent(new Event("app-data-updated"));
    } catch (error) {
      console.error(error);
      alert(`Error adding account: ${error.message}`);
    }

    setIsSubmitting(false);
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm("Delete this account?")) return;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchAccounts();
        // Trigger global live refresh
        window.dispatchEvent(new Event("app-data-updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'savings': return <Wallet className="w-5 h-5" />;
      case 'current': return <Building2 className="w-5 h-5" />;
      case 'credit': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getAccountGradient = (type) => {
    switch (type.toLowerCase()) {
      case 'savings': return "from-brand-400 to-brand-600";
      case 'current': return "from-success-400 to-success-600";
      case 'credit': return "from-warning-400 to-warning-600";
      default: return "from-brand-400 to-brand-600";
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance_inr || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-dark-800">My Accounts</h2>
          <p className="text-dark-500 text-sm mt-1">Manage all your bank accounts in one place</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="p-3 bg-success-50 border border-success-200 text-success-700 rounded-xl font-medium text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-gradient p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-dark-500 text-sm">Total Balance</p>
          <p className="text-2xl font-display font-bold text-dark-800 mt-1">
            {formatCurrency(totalBalance)}
          </p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-dark-500 text-sm">Active Accounts</p>
          <p className="text-2xl font-display font-bold text-dark-800 mt-1">
            {accounts.length}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-dark-500 text-sm">Account Types</p>
          <p className="text-2xl font-display font-bold text-dark-800 mt-1">
            {new Set(accounts.map(a => a.account_type)).size}
          </p>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-100 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-700 mb-2">No accounts yet</h3>
            <p className="text-dark-500 text-sm mb-4">Add your first bank account to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="pl-6">Bank</th>
                  <th>Type</th>
                  <th>Balance (INR)</th>
                  <th>Balance (USD)</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, index) => (
                  <tr 
                    key={acc.id} 
                    className="group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAccountGradient(acc.account_type)} flex items-center justify-center text-white`}>
                          {getAccountIcon(acc.account_type)}
                        </div>
                        <span className="font-semibold text-dark-800">{acc.bank_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        acc.account_type.toLowerCase() === 'savings' ? 'badge-info' :
                        acc.account_type.toLowerCase() === 'current' ? 'badge-success' :
                        'badge-warning'
                      }`}>
                        {acc.account_type}
                      </span>
                    </td>
                    <td>
                      <span className="font-display font-bold text-brand-600 text-lg">
                        {formatCurrency(acc.balance_inr)}
                      </span>
                    </td>
                    <td>
                      <span className="text-dark-600 font-medium">
                        ${acc.balance_usd?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-2 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors"
                          title="Delete account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-dark-800">
                Add New Account
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
              >
                <X className="w-5 h-5 text-dark-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBI, HDFC, ICICI"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="input-modern"
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Current">Current Account</option>
                  <option value="Credit">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Initial Balance ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="Enter initial balance in USD"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="input-with-icon"
                    min="0"
                  />
                </div>
                <p className="text-xs text-dark-400 mt-1">Amount will be converted to INR for display (1 USD ≈ ₹84)</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                disabled={isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Add Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
