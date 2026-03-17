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
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
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

function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [chartType, setChartType] = useState("pie");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const userId = 1;

    try {
      // Fetch transactions
      const txnResponse = await fetch(
        `http://127.0.0.1:8000/transactions/?user_id=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (txnResponse.ok) {
        const txnData = await txnResponse.json();
        setTransactions(txnData);
      }

      // Fetch spending by category with month filter
      const categoryResponse = await fetch(
        `http://127.0.0.1:8000/insights/spending-by-category?user_id=${userId}&month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (categoryResponse.ok) {
        const catData = await categoryResponse.json();
        const formattedData = catData.map((item, index) => ({
          ...item,
          color: COLORS[index % COLORS.length],
        }));
        setCategoryData(formattedData);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalExpense = categoryData.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
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
          <h2 className="text-2xl font-display font-bold text-dark-800">Analytics</h2>
          <p className="text-dark-500 text-sm mt-1">Track your spending patterns and financial insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-dark-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-modern py-2 w-auto"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-gradient p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/20">
              <ArrowDownRight className="w-6 h-6 text-white" />
            </div>
            <span className="badge-success">Income</span>
          </div>
          <p className="text-dark-500 text-sm">Total Income</p>
          <p className="text-2xl font-display font-bold text-dark-800 mt-1">
            {formatAmount(totalIncome)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-success-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>This month</span>
          </div>
        </div>
        
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center shadow-lg shadow-danger-500/20">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <span className="badge-danger">Expense</span>
          </div>
          <p className="text-dark-500 text-sm">Total Expense</p>
          <p className="text-2xl font-display font-bold text-dark-800 mt-1">
            {formatAmount(totalExpense)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-danger-600 text-sm">
            <TrendingDown className="w-4 h-4" />
            <span>This month</span>
          </div>
        </div>

        <div className={`card p-6 hover:shadow-lg transition-shadow ${netBalance >= 0 ? '' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${netBalance >= 0 ? 'bg-gradient-to-br from-brand-400 to-brand-600 shadow-brand-500/20' : 'bg-gradient-to-br from-warning-400 to-warning-600 shadow-warning-500/20'}`}>
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className={netBalance >= 0 ? "badge-info" : "badge-warning"}>
              {netBalance >= 0 ? "Positive" : "Negative"}
            </span>
          </div>
          <p className="text-dark-500 text-sm">Net Balance</p>
          <p className={`text-2xl font-display font-bold mt-1 ${netBalance >= 0 ? "text-brand-600" : "text-warning-600"}`}>
            {formatAmount(netBalance)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${netBalance >= 0 ? "text-brand-600" : "text-warning-600"}`}>
            {netBalance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>Savings rate: {totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Spending by Category Chart */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-dark-800">
              Spending by Category
            </h2>
            <p className="text-dark-500 text-sm">Visual breakdown for {selectedMonth}</p>
          </div>
          <div className="flex gap-2 bg-dark-100 p-1 rounded-xl">
            <button
              onClick={() => setChartType("pie")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                chartType === "pie"
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-dark-600 hover:text-dark-800"
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
              Pie Chart
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                chartType === "bar"
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-dark-600 hover:text-dark-800"
              }`}
            >
              <BarChartIcon className="w-4 h-4" />
              Bar Chart
            </button>
          </div>
        </div>

        {categoryData.length > 0 ? (
          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
              {chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ category, percent }) =>
                      `${category}: ${Math.abs(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-dark-700">{value}</span>}
                  />
                </PieChart>
              ) : (
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-dark-500">
            <PieChartIcon className="w-16 h-16 text-dark-300 mb-4" />
            <p className="text-lg font-medium">No categorized transactions for this month</p>
            <p className="text-sm">Add categories to your transactions to see analytics</p>
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-xl font-display font-bold text-dark-800">
            Category Breakdown
          </h2>
          <p className="text-dark-500 text-sm mt-1">Detailed view of your spending by category</p>
        </div>
        {categoryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="pl-6">Category</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">% of Total</th>
                  <th className="pr-6">Visual</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-dark-800">{item.category}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-display font-bold text-dark-800">
                        {formatAmount(item.amount)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-dark-600">
                        {totalExpense > 0
                          ? Math.abs((item.amount / totalExpense) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </td>
                    <td className="pr-6 w-40">
                      <div className="h-2.5 bg-dark-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                          style={{
                            width: `${totalExpense > 0
                              ? Math.abs((item.amount / totalExpense) * 100)
                              : 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-dark-500">
            <BarChartIcon className="w-12 h-12 mx-auto mb-3 text-dark-300" />
            <p>No data available for this month</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;

