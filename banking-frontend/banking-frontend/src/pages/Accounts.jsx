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

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/accounts/?user_id=1")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
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
      const response = await fetch("http://127.0.0.1:8000/accounts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          bank_name: bankName,
          account_type: accountType,
          balance: parseFloat(balance),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add account");
      }

      await response.json();

      // Reset form
      setShowModal(false);
      setBankName("");
      setAccountType("Savings");
      setBalance("");

      // Refresh table
      fetchAccounts();

    } catch (error) {
      console.error(error);
      alert("Error adding account");
    }

    setIsSubmitting(false);
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
      case 'savings':
        return <Wallet className="w-5 h-5" />;
      case 'current':
        return <Building2 className="w-5 h-5" />;
      case 'credit':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getAccountGradient = (type) => {
    switch (type.toLowerCase()) {
      case 'savings':
        return "from-brand-400 to-brand-600";
      case 'current':
        return "from-success-400 to-success-600";
      case 'credit':
        return "from-warning-400 to-warning-600";
      default:
        return "from-brand-400 to-brand-600";
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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
                  <th>Balance</th>
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
                        {formatCurrency(acc.balance)}
                      </span>
                    </td>
                    <td className="pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors">
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
            {/* Modal Header */}
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

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="Enter bank name"
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
                  Initial Balance (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter initial balance"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="input-modern"
                />
              </div>
            </div>

            {/* Actions */}
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

