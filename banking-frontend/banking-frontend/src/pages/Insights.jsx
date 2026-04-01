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
  Download,
  FileDown,
  Loader2,
  Calendar
} from "lucide-react";

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
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
        setTopMerchants(await merchantsRes.json());
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
  const totalExpense = cashflow.total_expense * USD_TO_INR;
  const totalIncome = cashflow.total_income * USD_TO_INR;
  const netBalance = totalIncome - totalExpense;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
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
          <p className="text-dark-500 text-sm mt-1">Track your spending patterns and financial insights</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              const userId = localStorage.getItem("user_id") || 1;
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
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
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

        {/* Top Merchants List */}
        <div className="card p-6 flex flex-col h-[420px]">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-dark-800">
              Top Merchants
            </h2>
            <p className="text-dark-500 text-sm">Where you spend most often</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {topMerchants.length === 0 ? (
              <div className="flex items-center justify-center h-full text-dark-500 italic">No data available</div>
            ) : (
            <div className="space-y-4">
              {topMerchants.map((merchant, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                      {merchant.merchant[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-800 group-hover:text-brand-600 transition-colors">
                        {merchant.merchant}
                      </h4>
                      <p className="text-dark-500 text-xs">{merchant.count} transaction{merchant.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className="font-bold text-dark-700">
                    {formatAmount(merchant.total * USD_TO_INR)}
                  </span>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Burn Rate */}
        <div className="card p-6 flex flex-col justify-center h-[420px]">
          <h2 className="text-xl font-display font-bold text-dark-800 mb-4">Budget Burn Rate</h2>
          {burnRate && burnRate.total_budget > 0 ? (
            <div className="space-y-4 text-center">
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center rounded-full border-8 border-dark-100">
                <div 
                  className="absolute inset-0 rounded-full border-8 border-brand-500"
                  style={{ 
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, 
                    transform: `rotate(${(burnRate.used_percent / 100) * 360}deg)`,
                    borderColor: burnRate.used_percent > 100 ? '#ef4444' : '#3b82f6'
                  }}
                ></div>
                <div className="z-10 bg-white w-24 h-24 rounded-full flex items-center justify-center flex-col shadow-inner">
                  <span className="text-2xl font-bold font-display">{Math.round(burnRate.used_percent)}%</span>
                  <span className="text-xs text-dark-400">Used</span>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <p className="text-dark-600">Total Budget: <span className="font-bold">{formatAmount(burnRate.total_budget * USD_TO_INR)}</span></p>
                <div className="w-full bg-dark-100 rounded-full h-2.5 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${burnRate.used_percent > 100 ? 'bg-danger-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(burnRate.used_percent, 100)}%` }}
                  ></div>
                </div>
                <p className="text-dark-600 mt-2">Spent: <span className="font-bold text-danger-600">{formatAmount(burnRate.total_spent * USD_TO_INR)}</span></p>
                <p className="mt-2 text-sm text-dark-500">Projected Monthly: {formatAmount(burnRate.projected_monthly * USD_TO_INR)}</p>
              </div>
            </div>
          ) : (
             <p className="text-dark-500 text-sm py-4 text-center italic">No active budget matching selected criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Insights;

