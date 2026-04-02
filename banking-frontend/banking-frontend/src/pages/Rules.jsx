import {fetchWithAuth , API_BASE_URL} from "../services/api";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

const PREDEFINED_CATEGORIES = [
  "Food & Dining", "Shopping", "Transportation", "Entertainment",
  "Bills & Utilities", "Health & Fitness", "Travel", "Income", "Transfer", "Other"
];

function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    keyword_pattern: "",
    merchant_pattern: "",
    priority: 50,
    is_active: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id") || 1;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/rules?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (err) {
      console.error("Failed to fetch rules", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id") || 1;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/rules?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          keyword_pattern: formData.keyword_pattern || null,
          merchant_pattern: formData.merchant_pattern || null,
          priority: parseInt(formData.priority),
          is_active: formData.is_active
        })
      });
      if (response.ok) {
        setShowForm(false);
        setFormData({ category: "", keyword_pattern: "", merchant_pattern: "", priority: 50, is_active: true });
        fetchRules();
        // Trigger global live refresh
        window.dispatchEvent(new Event("app-data-updated"));
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!confirm("Delete this rule?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/categories/rules/${ruleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchRules();
        // Trigger global live refresh
        window.dispatchEvent(new Event("app-data-updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-blue-500"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-dark-800">Category Rules</h2>
          <p className="text-dark-500 text-sm mt-1">Automatically categorize your transactions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-5 h-5"/> Add Rule
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow border mb-6">
          <h3 className="text-lg font-bold mb-4">Create New Rule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full border p-2 rounded">
                  <option value="">Select Category...</option>
                  {PREDEFINED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority (1-100)</label>
                <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full border p-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keyword Match</label>
                <input type="text" name="keyword_pattern" value={formData.keyword_pattern} onChange={handleInputChange} className="w-full border p-2 rounded" placeholder="e.g. STARBUCKS"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Merchant Match</label>
                <input type="text" name="merchant_pattern" value={formData.merchant_pattern} onChange={handleInputChange} className="w-full border p-2 rounded" placeholder="e.g. UBER"/>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Rule</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {rules.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No categorization rules found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pattern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{rule.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.keyword_pattern ? `Keyword: ${rule.keyword_pattern}` : `Merchant: ${rule.merchant_pattern}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(rule.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Rules;
