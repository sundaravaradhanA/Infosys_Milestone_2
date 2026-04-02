import {fetchWithAuth , API_BASE_URL} from "../services/api";
import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
import { DollarSign, Clock, FileText, ChevronRight, RefreshCw, AlertTriangle } from "lucide-react";
import Accounts from "./Accounts";
import Transactions from "./Transactions";
import Analytics from "./Analytics";
import Insights from "./Insights";
import Budget from "./Budget";
import Rules from "./Rules";
import KYC from "./KYC";
import Notifications from "./Notifications";
import Rewards from "./Rewards";
import Profile from "./Profile";
import Bills from "./Bills";

function Dashboard() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "User");
  const userId = localStorage.getItem("user_id") || 1;

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        // Fetch unread count
        const alertRes = await fetchWithAuth(`${API_BASE_URL}/alerts/unread-count?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (alertRes.ok) {
          const data = await alertRes.json();
          setUnreadCount(data.unread_count || 0);
        }

        // Fetch profile to get real user name
        const userRes = await fetchWithAuth(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const users = await userRes.json();
          // Find the current user in the list or fetch by ID if route exists
          const current = users.find(u => u.id == userId);
          if (current) {
            setUserName(current.name);
            localStorage.setItem("user_name", current.name);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchUserData();
    
    const handleRefresh = () => {
      console.log("Global update in shell detected - Refreshing header...");
      fetchUserData();
    };
    window.addEventListener("app-data-updated", handleRefresh);

    const interval = setInterval(fetchUserData, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("app-data-updated", handleRefresh);
    };
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    navigate("/");
  };

  const handleExportCSV = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/export/transactions?format=csv&user_id=${userId}&token=${token}`
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("Failed to export CSV");
    }
  };

  const handleExportPDF = async () => {
    const token = localStorage.getItem("token");
    const month = new Date().toISOString().slice(0, 7);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/export/insights?format=pdf&user_id=${userId}&month=${month}&token=${token}`
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial_report_${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Accounts", path: "/dashboard/accounts" },
    { name: "Transactions", path: "/dashboard/transactions" },
    { name: "Analytics", path: "/dashboard/analytics" },
    { name: "Insights", path: "/dashboard/insights" },
    { name: "Budget", path: "/dashboard/budget" },
    { name: "Rules", path: "/dashboard/rules" },
    { name: "KYC", path: "/dashboard/kyc" },
    { name: "Notifications", path: "/dashboard/notifications", badge: unreadCount },
    { name: "Rewards", path: "/dashboard/rewards" },
    { name: "Bills", path: "/dashboard/bills" },
    { name: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col text-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
            B
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Bank Pro</h1>
        </div>
        <nav className="flex flex-col space-y-2 text-sm font-semibold flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                  isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span>{item.name}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 transform group-hover:scale-110 transition-transform shadow-sm">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Exports</h4>
            <button onClick={handleExportCSV} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2 font-medium w-full text-left">
              📊 Transactions CSV
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium w-full text-left">
              📄 Insights PDF
            </button>
          </div>
          
          <button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 py-3 rounded-xl transition-all font-bold border border-slate-700 hover:border-red-500/30">
            Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{userName}</span> 👋
            </h2>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 border-2 border-white shadow-sm flex items-center justify-center">
                 <span className="text-indigo-800 font-bold">{userName.charAt(0)}</span>
               </div>
            </div>
          </div>
        </header>
        <main className="p-8 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="insights" element={<Insights />} />
            <Route path="budget" element={<Budget />} />
            <Route path="rules" element={<Rules />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="bills" element={<Bills />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

function DashboardHome() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData(); // Initial load
    
    // Global listener for instant reflex
    const handleDataUpdate = () => {
      console.log("Global data update detected - Refetching Dashboard Home...");
      fetchData();
    };
    window.addEventListener("app-data-updated", handleDataUpdate);

    // Periodic live sync (60s)
    const interval = setInterval(fetchData, 60000);

    return () => {
      window.removeEventListener("app-data-updated", handleDataUpdate);
      clearInterval(interval);
    };
  }, [token]);

  const fetchData = () => {
    const userId = localStorage.getItem("user_id") || 1;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetchWithAuth(`${API_BASE_URL}/accounts/?user_id=${userId}`, { headers }).then(r => r.json()).catch(() => []),
      fetchWithAuth(`${API_BASE_URL}/api/bills`, { headers }).then(r => r.json()).catch(() => []),
      fetchWithAuth(`${API_BASE_URL}/currency/currency-rates`, { headers }).then(r => r.json()).catch(() => null)
    ]).then(([accData, billsData, currData]) => {
      if(Array.isArray(accData)) setAccounts(accData);
      
      if(Array.isArray(billsData)) {
        const upcoming = billsData
          .filter(b => b.status === "upcoming")
          .sort((a,b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 3);
        setUpcomingBills(upcoming);
      }
      
      if(currData) setCurrencyRates(currData);
      setIsLoading(false);
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance_inr, 0);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amt);
  };

  const getDaysUntil = (dateStr) => {
    const due = new Date(dateStr);
    const today = new Date();
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return "Due Today";
    if (diff === 1) return "Due Tomorrow";
    if (diff < 0) return "Overdue";
    return `In ${diff} Days`;
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-500 font-semibold animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Section - Balance & Currency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-10 -translate-y-10">
            <DollarSign className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 font-semibold text-lg tracking-wide uppercase mb-2">Total Combined Balance</p>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8">
              {formatCurrency(totalBalance)}
            </h1>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <button 
                onClick={() => navigate("/dashboard/accounts")}
                className="bg-white text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                + Add Money
              </button>
              <button 
                onClick={() => navigate("/dashboard/transactions")}
                className="bg-indigo-800/50 backdrop-blur-md border border-indigo-400/30 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-800 transition-all"
              >
                Send Money
              </button>
            </div>
          </div>
        </div>

        {/* Currency Rates Widget */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Live Exchange</h3>
              <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-emerald-500 transition-colors" />
            </div>
            
            {currencyRates ? (
              <div className="space-y-4">
                {Object.entries(currencyRates).map(([currency, rate]) => {
                  if(currency === 'base_currency' || currency === 'last_updated') return null;
                  const icons = { USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧" };
                  return (
                    <div key={currency} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow-sm">{icons[currency] || "🌍"}</span>
                        <div className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">1 {currency}</div>
                      </div>
                      <div className="font-extrabold text-gray-900 text-lg">₹ {rate}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Rates unavailable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section - Accounts & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Accounts List */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-2xl font-bold text-gray-900">Your Accounts</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{accounts.length} Active</span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((acc, idx) => (
                  <div key={acc.id} className="flex justify-between items-center p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${idx % 2 === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                        {acc.bank_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{acc.bank_name}</p>
                        <p className="text-sm font-semibold text-gray-400 capitalize">{acc.account_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-gray-900 text-lg">{formatCurrency(acc.balance_inr)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center font-medium">No accounts linked yet.</p>
            )}
          </div>
        </div>

        {/* Upcoming Bills Reminder */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
           <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-amber-50/30">
            <div className="flex items-center gap-3">
               <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                 <AlertTriangle className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900">Upcoming Bills</h3>
            </div>
            <a href="/dashboard/bills" className="text-amber-600 hover:text-amber-700 font-bold text-sm flex items-center gap-1">
              Manage All <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-center">
            {upcomingBills.length > 0 ? (
              <div className="space-y-4">
                {upcomingBills.map((bill) => {
                  const daysStr = getDaysUntil(bill.due_date);
                  const isUrgent = daysStr.includes("Today") || daysStr.includes("Tomorrow") || daysStr.includes("Overdue");
                  
                  return (
                    <div key={bill.id} className={`flex justify-between items-center p-5 rounded-2xl border transition-all ${isUrgent ? 'bg-rose-50 border-rose-100 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-white text-gray-400 shadow-sm'}`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className={`font-bold text-lg ${isUrgent ? 'text-gray-900' : 'text-gray-800'}`}>{bill.biller_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500' : 'text-gray-400'}`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${isUrgent ? 'text-rose-600' : 'text-gray-500'}`}>
                              {daysStr}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right pl-4">
                        <p className="font-extrabold text-gray-900 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                          {formatCurrency(bill.amount_due)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-emerald-50 text-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900">All caught up!</h4>
                <p className="text-gray-500 font-medium">No impending bills in the next few days.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
