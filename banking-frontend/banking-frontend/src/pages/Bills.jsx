import {fetchWithAuth , API_BASE_URL} from "../services/api";
import React, { useState, useEffect } from "react";
import { FileText, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, Calendar, DollarSign, AlertCircle, Loader2 } from "lucide-react";

const formatCurrency = (amtUsd) => {
  const amtInr = (amtUsd || 0) * 84;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amtInr);
};

const getStatusDetails = (status) => {
  if (status === 'paid') return { text: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' };
  if (status === 'overdue') return { text: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' };
  return { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
};

function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ biller_name: '', amount_due: '', due_date: '', auto_pay: false });
  const [submitLoading, setSubmitLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id") || 1;

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      setBills(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills(); // Initial load

    // Global listener for instant reflex
    const handleRefresh = () => fetchBills();
    window.addEventListener("app-data-updated", handleRefresh);

    // Periodic live sync (60s)
    const interval = setInterval(fetchBills, 60000);

    return () => {
      window.removeEventListener("app-data-updated", handleRefresh);
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const body = { 
        biller_name: formData.biller_name, 
        amount_due: parseFloat(formData.amount_due), 
        due_date: formData.due_date,
        auto_pay: formData.auto_pay
      };

      let url = `${API_BASE_URL}/api/bills/`;
      let method = 'POST';
      
      if (editingId) {
        url += `${editingId}`;
        method = 'PUT';
      }

      const response = await fetchWithAuth(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) throw new Error('Failed to save bill');
      
      setShowAddModal(false);
      setEditingId(null);
      setFormData({ biller_name: '', amount_due: '', due_date: '', auto_pay: false });
      fetchBills();
      // Notify all components of the update
      window.dispatchEvent(new Event("app-data-updated"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/bills/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchBills();
      // Notify all components of the update
      window.dispatchEvent(new Event("app-data-updated"));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/bills/${id}/pay`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to mark paid');
      fetchBills();
      // Notify all components of the update
      window.dispatchEvent(new Event("app-data-updated"));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (bill) => {
    setFormData({
      biller_name: bill.biller_name,
      amount_due: bill.amount_due.toString(),
      due_date: bill.due_date.split('T')[0],
      auto_pay: bill.auto_pay || false
    });
    setEditingId(bill.id);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Bills & Subscriptions</h2>
          <p className="text-gray-500 mt-1">Manage and track your upcoming payments seamlessly.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ biller_name: '', amount_due: '', due_date: '', auto_pay: false });
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 opacity-90 hover:opacity-100 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Bill
        </button>
      </div>

      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Bills</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{bills.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Paid</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{bills.filter(b => b.status === "paid").length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{bills.filter(b => b.status !== "paid").length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100/50 bg-gray-50/30">
          <h3 className="text-lg font-bold text-gray-900">Active Bills List</h3>
        </div>
        {bills.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl mx-auto mb-6 flex items-center justify-center transform rotate-3">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">Keep track of your monthly expenses by adding your regular bills here.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto transition-all"
            >
              <Plus className="w-5 h-5" />
              Add First Bill
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Biller Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Due</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Auto Pay</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => {
                  const statusDetails = getStatusDetails(bill.status);
                  return (
                    <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 text-base">{bill.biller_name}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{formatCurrency(bill.amount_due)}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-gray-600 font-medium">
                          {new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${statusDetails.color}`}>
                          {statusDetails.text}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <span className={`text-xs font-bold px-2 py-1 rounded-md ${bill.auto_pay ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                           {bill.auto_pay ? 'ON' : 'OFF'}
                         </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(bill)}
                          className="text-gray-400 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkPaid(bill.id)}
                            className="text-gray-400 hover:text-emerald-600 p-2 rounded-xl hover:bg-emerald-50 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900">
                {editingId ? 'Edit Bill Details' : 'Add New Bill'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Biller Name</label>
                <input
                  type="text"
                  value={formData.biller_name}
                  onChange={(e) => setFormData({...formData, biller_name: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-gray-900 transition-all outline-none"
                  placeholder="e.g. Electricity, Netflix"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount Due ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount_due}
                    onChange={(e) => setFormData({...formData, amount_due: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-gray-900 transition-all outline-none"
                    placeholder="Enter amount in USD"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Displayed in INR (1 USD ≈ ₹84)</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-gray-900 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="auto_pay"
                  checked={formData.auto_pay}
                  onChange={(e) => setFormData({...formData, auto_pay: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 pointer"
                />
                <label htmlFor="auto_pay" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  Enable Auto-Pay
                </label>
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 py-3.5 px-4 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {submitLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Confirm Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bills;
