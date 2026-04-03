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
          amount: item.amount_inr || (item.amount * 84), // Fallback if backend hasn't refreshed
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

  useEffect(() => {
    fetchData(); // Initial load

    // Listen for global data updates (instant reflex)
    const handleRefresh = () => fetchData();
    window.addEventListener("app-data-updated", handleRefresh);

    // Periodic live sync (60s interval)
    const interval = setInterval(fetchData, 60000);

    return () => {
      window.removeEventListener("app-data-updated", handleRefresh);
      clearInterval(interval);
    };
  }, [selectedMonth]);

  // Calculate totals (INR) using backend fields
  const totalExpense = cashflow.total_expense_inr || ((cashflow.total_expense || 0) * 84);
  const totalIncome = cashflow.total_income_inr || ((cashflow.total_income || 0) * 84);
  const netBalance = cashflow.balance_inr || (totalIncome - totalExpense);

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
    const raw = merchant.total_spent_inr ?? merchant.amount_inr ?? (merchant.total_spent * 84) ?? 0;
    return parseFloat(raw) || 0;
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
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-10">
      {/* --- Refined Header --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-dark-100 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-dark-400 text-xs font-bold uppercase tracking-widest mb-2">
            <PieChartIcon className="w-4 h-4" />
            <span>Financial Analytics</span>
          </nav>
          <h2 className="text-4xl font-display font-black text-dark-800 tracking-tight">
            Insights <span className="text-brand-500">&</span> Trends
          </h2>
          <p className="text-dark-500 text-base mt-2 max-w-lg">
            A comprehensive look at your financial health, identifying patterns to help you save more.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-dark-50/50 p-2 rounded-2xl border border-dark-100">
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              window.open(`${API_BASE_URL}/export/insights?format=pdf&month=${selectedMonth}&token=${token}`);
            }}
            className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl text-dark-700 font-bold shadow-sm hover:shadow-md transition-all border border-dark-100 hover:text-brand-600 group"
          >
            <FileDown className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
            <span>Export Report</span>
          </button>

          <div className="h-10 w-px bg-dark-200 hidden md:block mx-2" />

          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-dark-100 shadow-sm focus-within:ring-2 ring-brand-500/20 transition-all">
            <Calendar className="w-5 h-5 text-dark-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-dark-700 text-sm cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* --- Performance Summary Bar --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
           { label: "Gross Income", value: totalIncome, icon: TrendingUp, color: "brand", bg: "from-brand-500/10 to-transparent" },
           { label: "Total Outflow", value: totalExpense, icon: TrendingDown, color: "danger", bg: "from-danger-500/10 to-transparent" },
           { label: "Net Surplus", value: netBalance, icon: Wallet, color: netBalance >= 0 ? "success" : "danger", bg: netBalance >= 0 ? "from-success-500/10 to-transparent" : "from-danger-500/10 to-transparent" },
           { label: "Savings Rate", value: totalIncome > 0 ? (netBalance / totalIncome * 100).toFixed(1) + '%' : '0%', icon: ArrowUpRight, color: "warning", bg: "from-warning-500/10 to-transparent" }
        ].map((stat, i) => (
          <div key={i} className={`card group overflow-hidden bg-gradient-to-tr ${stat.bg}`}>
             <div className="p-6 relative">
                <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color === 'success' ? 'brand-600' : stat.color === 'danger' ? 'danger-600' : stat.color === 'brand' ? 'brand-600' : 'warning-600'}`} />
                </div>
                <p className="text-dark-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-dark-800 tracking-tight">
                  {typeof stat.value === 'string' ? stat.value : formatAmount(stat.value)}
                </h3>
             </div>
          </div>
        ))}
      </div>

      {/* --- Primary Insight Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Main Charts) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Chart 1: Cash Flow */}
          <div className="card p-8 bg-white border border-dark-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-dark-800">Income vs. Expenses</h3>
                <p className="text-dark-500 text-sm mt-1">Comparison of liquidity for the current period</p>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Inflow', amount: totalIncome }, { name: 'Outflow', amount: totalExpense }]} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={100}>
                    {[{ name: 'Inflow', fill: '#3B82F6' }, { name: 'Outflow', fill: '#F43F5E' }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Breakdown */}
          <div className="card p-8 bg-white border border-dark-100 shadow-sm hover:shadow-lg transition-all">
             <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-dark-800">Categorical Distribution</h3>
                <p className="text-dark-500 text-sm mt-1">High-level view of where capital is allocated</p>
              </div>
              <div className="flex bg-dark-50 p-1.5 rounded-2xl border border-dark-100">
                <button
                  onClick={() => setChartType("pie")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${chartType === "pie" ? "bg-white text-brand-600 shadow-sm" : "text-dark-400 hover:text-dark-600"}`}
                >
                  <PieChartIcon className="w-4 h-4" />
                  <span>Donut</span>
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${chartType === "bar" ? "bg-white text-brand-600 shadow-sm" : "text-dark-400 hover:text-dark-600"}`}
                >
                  <BarChartIcon className="w-4 h-4" />
                  <span>Histogram</span>
                </button>
              </div>
            </div>
            
            <div className="h-[400px]">
              {categoryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-dark-400">
                   <div className="w-16 h-16 bg-dark-50 rounded-full flex items-center justify-center mb-4">
                     <PieChartIcon className="w-8 h-8 opacity-20" />
                   </div>
                   <p className="italic">No categorical data captured for this range</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        innerRadius={100}
                        outerRadius={150}
                        paddingAngle={8}
                        dataKey="amount"
                        nameKey="category"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  ) : (
                    <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        tick={{ fill: '#64748B', fontWeight: 700, fontSize: 13 }}
                        axisLine={false}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                      <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={24}>
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
        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Card: Budget Burn Rate */}
          <div className="card p-0 bg-white border border-dark-100 shadow-sm flex flex-col min-h-[500px]">
            <div className="p-8 pb-4">
               <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-danger-50 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-danger-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-800">Budget Health</h3>
                    <p className="text-dark-500 text-xs font-medium">Real-time depletion tracking</p>
                  </div>
                </div>
              </div>
              
              {burnRate && burnRate.total_budget > 0 ? (
                <div className="space-y-8">
                  {/* Master Gauge */}
                  <div className="flex flex-col items-center bg-dark-50/50 py-8 rounded-3xl border border-dark-100">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="#E2E8F0" strokeWidth="8"/>
                        <circle
                          cx="50" cy="50" r="44" fill="none"
                          stroke={burnRate.used_percent >= 100 ? '#F43F5E' : burnRate.used_percent > 75 ? '#F59E0B' : '#3B82F6'}
                          strokeWidth="8"
                          strokeDasharray={`${Math.min(burnRate.used_percent, 100) * 2.764} 276.4`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-black ${burnRate.used_percent >= 100 ? 'text-danger-600' : 'text-brand-600'}`}>
                          {Math.min(Math.round(burnRate.used_percent), 100)}<span className="text-lg opacity-60">%</span>
                        </span>
                        <span className="text-[10px] text-dark-400 font-black uppercase tracking-widest mt-1">Budget Burn</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mt-6 w-full px-8">
                      <div className="text-center">
                        <p className="text-dark-400 text-[10px] uppercase font-black tracking-widest mb-1">Threshold</p>
                        <p className="text-dark-800 font-bold">{formatAmount(burnRate.total_budget_inr || (burnRate.total_budget * 84))}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-dark-400 text-[10px] uppercase font-black tracking-widest mb-1">Consumption</p>
                        <p className="text-danger-600 font-bold">{formatAmount(burnRate.total_spent_inr || (burnRate.total_spent * 84))}</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Drilldown List */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-dark-100 pb-3">
                      <h4 className="text-sm font-black text-dark-800 uppercase tracking-widest">Category Insight</h4>
                      <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                    </div>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                      {burnRate.categories?.map((cat, idx) => (
                        <div key={idx} className="group">
                          <div className="flex justify-between items-end mb-2">
                            <div>
                               <p className="text-sm font-bold text-dark-800 leading-tight mb-0.5">{cat.category}</p>
                               <p className="text-[10px] text-dark-400 font-bold">{formatAmount(cat.spent_inr || (cat.spent * 84))} of {formatAmount(cat.limit_inr || (cat.limit * 84))}</p>
                            </div>
                            <span className={`text-xs font-black ${cat.used_percent >= 100 ? 'text-danger-600' : 'text-dark-700'}`}>
                              {cat.used_percent}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-dark-50 rounded-full overflow-hidden border border-dark-100">
                             <div 
                                className={`h-full rounded-full transition-all duration-700 ${cat.used_percent >= 100 ? 'bg-danger-500' : cat.used_percent > 75 ? 'bg-warning-500' : 'bg-brand-500'}`}
                                style={{ width: `${Math.min(cat.used_percent, 100)}%` }}
                             />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                   <Flame className="w-12 h-12 text-dark-100 mb-4" />
                   <p className="text-dark-500 font-medium italic">No active budget tracks found for this period.</p>
                   <button className="text-brand-600 font-bold text-sm mt-4 hover:underline">Create a budget now →</button>
                </div>
              )}
            </div>
            
            {/* Projected Info Footer */}
            {burnRate && burnRate.total_budget > 0 && (
              <div className="mt-auto bg-brand-600 p-8 rounded-b-[2rem]">
                 <div className="flex items-center gap-4 text-white">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Monthly Projection</p>
                      <p className="text-xl font-black leading-tight">
                        {formatAmount(burnRate.projected_monthly_inr || (burnRate.projected_monthly * 84))}
                      </p>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Card: Top Merchants */}
          <div className="card p-8 bg-white border border-dark-100 shadow-sm flex flex-col max-h-[550px]">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                 <Store className="w-6 h-6 text-orange-600" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-dark-800">Top Merchants</h3>
                  <p className="text-dark-500 text-xs font-medium">Where your capital congregates</p>
               </div>
            </div>
            
            <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {topMerchants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-dark-300 opacity-50 italic">
                  <p>No merchant activity logged</p>
                </div>
              ) : (
                topMerchants.map((merchant, index) => {
                  const mName = merchant.merchant || merchant.name || "Unknown Entity";
                  const mSpent = getMerchantAmount(merchant);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-brand-50/50 transition-all border border-transparent hover:border-brand-100 group">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-dark-50 text-dark-400 group-hover:bg-brand-500 group-hover:text-white transition-all flex items-center justify-center font-black text-lg">
                          {mName[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                           <h4 className="font-bold text-dark-800 group-hover:text-brand-600 transition-colors truncate">{mName}</h4>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="w-1 h-1 bg-dark-300 rounded-full" />
                              <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest leading-none">Primary Vendor</p>
                           </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                         <span className="font-black text-dark-800 text-base">{formatAmount(mSpent)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Insights;
