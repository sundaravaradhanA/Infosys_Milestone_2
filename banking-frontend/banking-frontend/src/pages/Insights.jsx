import {fetchWithAuth , API_BASE_URL} from "../services/api";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon,
  ArrowUpRight, 
  ArrowDownRight,
  FileDown,
  Loader2,
  Calendar,
  Store,
  Flame
} from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

const USD_TO_INR = 84;

function Insights() {
  const [cashflow, setCashflow] = useState({ total_income: 0, total_expense: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [burnRate, setBurnRate] = useState(null);
  const [chartType, setChartType] = useState("pie");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id") || 1;

    try {
      const [categoryRes, merchantsRes, burnRateRes, summaryRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/insights/category-spend?user_id=${userId}&month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetchWithAuth(`${API_BASE_URL}/insights/top-merchants?user_id=${userId}&month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetchWithAuth(`${API_BASE_URL}/insights/burn-rate?user_id=${userId}&month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetchWithAuth(`${API_BASE_URL}/insights/cashflow?user_id=${userId}&month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (categoryRes.ok) {
        const catData = await categoryRes.json();
        const formattedData = catData.map((item, index) => ({
          ...item,
          amount: item.amount * USD_TO_INR,
          color: COLORS[index % COLORS.length],
        }));
        setCategoryData(formattedData);
      }

      if (merchantsRes.ok) {
        const merchantData = await merchantsRes.json();
        setTopMerchants(Array.isArray(merchantData) ? merchantData : []);
      }

      if (burnRateRes.ok) {
        setBurnRate(await burnRateRes.json());
      }

      if (summaryRes.ok) {
        setCashflow(await summaryRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals (INR)
  const totalExpense = (cashflow.total_expense || 0) * USD_TO_INR;
  const totalIncome = (cashflow.total_income || 0) * USD_TO_INR;
  const netBalance = totalIncome - totalExpense;

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Safely get merchant amount - handle different API field names and ensure it's a number
  const getMerchantAmount = (merchant) => {
    const raw = merchant.total_spent ?? merchant.total ?? merchant.amount ?? 0;
    const num = parseFloat(raw);
    return isNaN(num) ? 0 : num * USD_TO_INR;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-dark-100">
          <p className="font-semibold text-dark-800">{payload[0].name}</p>
          <p className="text-brand-600 font-bold text-lg">
            {formatAmount(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

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
          <h2 className="text-2xl font-display font-bold text-dark-800">Insights</h2>
          <p className="text-dark-500 text-sm mt-1">Deep dive into your spending habits and budget health</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              window.open(`${API_BASE_URL}/export/insights?format=pdf&month=${selectedMonth}&token=${token}`);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <FileDown className="w-5 h-5 text-brand-600" />
            Download Insights Report (PDF)
          </button>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-dark-100 shadow-sm">
            <Calendar className="w-5 h-5 text-dark-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-dark-700 w-32"
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Chart */}
        <div className="card p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-dark-800">
              Cash Flow
            </h2>
            <p className="text-dark-500 text-sm">Income vs Expense for {selectedMonth}</p>
          </div>
          <div style={{ width: "100%", height: 320, flex: 1 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={[{ name: 'Income', amount: totalIncome, fill: '#10B981' }, { name: 'Expense', amount: totalExpense, fill: '#EF4444' }]} margin={{ top: 20, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={80}>
                  {[{ name: 'Income', fill: '#10B981' }, { name: 'Expense', fill: '#EF4444' }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Chart */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-dark-800">
                Spending by Category
              </h2>
              <p className="text-dark-500 text-sm">Where your money goes</p>
            </div>
            <div className="flex bg-dark-50 p-1 rounded-xl">
              <button
                onClick={() => setChartType("pie")}
                className={`p-2 rounded-lg transition-all ${
                  chartType === "pie"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-dark-400 hover:text-dark-600"
                }`}
              >
                <PieChartIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`p-2 rounded-lg transition-all ${
                  chartType === "bar"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-dark-400 hover:text-dark-600"
                }`}
              >
                <BarChartIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div style={{ width: "100%", height: 320, flex: 1 }}>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-dark-500 italic">No data available</div>
            ) : (
            <ResponsiveContainer width="100%" height={320}>
              {chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                </PieChart>
              ) : (
                <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Merchants List — moved here from Analytics */}
        <div className="card p-6 flex flex-col h-[420px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-dark-800">
                Top Merchants
              </h2>
              <p className="text-dark-500 text-sm">Where you spend most often</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {topMerchants.length === 0 ? (
              <div className="flex items-center justify-center h-full text-dark-500 italic">No merchant data for this month</div>
            ) : (
            <div className="space-y-3">
              {topMerchants.map((merchant, index) => {
                const merchantName = merchant.merchant || merchant.name || "Unknown";
                const spentAmt = getMerchantAmount(merchant);
                const txnCount = merchant.count || merchant.transaction_count || 0;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
                        {merchantName[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-800 group-hover:text-brand-600 transition-colors">
                          {merchantName}
                        </h4>
                        {txnCount > 0 && (
                          <p className="text-dark-500 text-xs">{txnCount} transaction{txnCount !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-danger-600">
                      {formatAmount(spentAmt)}
                    </span>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>

        {/* Budget Burn Rate — moved here from Analytics */}
        <div className="card p-6 flex flex-col justify-center h-[420px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-dark-800">Budget Burn Rate</h2>
              <p className="text-dark-500 text-sm">How fast you're burning your budget</p>
            </div>
          </div>
          {burnRate && burnRate.total_budget > 0 ? (
            <div className="space-y-4 text-center">
              {/* Circular progress */}
              <div className="flex justify-center">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={burnRate.used_percent > 100 ? '#ef4444' : burnRate.used_percent > 70 ? '#f59e0b' : '#3b82f6'}
                      strokeWidth="10"
                      strokeDasharray={`${Math.min(burnRate.used_percent, 100) * 2.51} 251`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${burnRate.used_percent > 100 ? 'text-danger-600' : burnRate.used_percent > 70 ? 'text-warning-600' : 'text-brand-600'}`}>
                      {Math.round(burnRate.used_percent)}%
                    </span>
                    <span className="text-xs text-dark-400">Used</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-3 bg-dark-50 rounded-xl">
                  <span className="text-dark-600 text-sm font-medium">Total Budget</span>
                  <span className="font-bold text-dark-800">{formatAmount(burnRate.total_budget * USD_TO_INR)}</span>
                </div>
                <div className="w-full bg-dark-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${burnRate.used_percent > 100 ? 'bg-danger-500' : burnRate.used_percent > 70 ? 'bg-warning-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(burnRate.used_percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-danger-50 rounded-xl">
                  <span className="text-dark-600 text-sm font-medium">Spent</span>
                  <span className="font-bold text-danger-600">{formatAmount(burnRate.total_spent * USD_TO_INR)}</span>
                </div>
                <p className="text-sm text-dark-500 text-center">
                  Projected Monthly: <span className="font-semibold text-dark-700">{formatAmount(burnRate.projected_monthly * USD_TO_INR)}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Flame className="w-16 h-16 text-dark-200 mx-auto mb-4" />
              <p className="text-dark-500 text-sm italic">No active budget for this period.</p>
              <p className="text-dark-400 text-xs mt-1">Create budgets in the Budget menu to see burn rate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Insights;
