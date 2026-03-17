import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
import Accounts from "./Accounts";
import Transactions from "./Transactions";
import Analytics from "./Analytics";
import Budget from "./Budget";
import KYC from "./KYC";
import Notifications from "./Notifications";
import Rewards from "./Rewards";
import Profile from "./Profile";
import Bills from "./Bills";

function Dashboard() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://127.0.0.1:8000/alerts/unread-count?user_id=1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unread_count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Accounts", path: "/dashboard/accounts" },
    { name: "Transactions", path: "/dashboard/transactions" },
    { name: "Analytics", path: "/dashboard/analytics" },
    { name: "Budget", path: "/dashboard/budget" },
    { name: "KYC", path: "/dashboard/kyc" },
    { name: "Notifications", path: "/dashboard/notifications", badge: unreadCount },
    { name: "Rewards", path: "/dashboard/rewards" },
    { name: "Bills", path: "/dashboard/bills" },
    { name: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 p-6 flex flex-col text-white">
        <h1 className="text-2xl font-bold mb-10">Bank Pro</h1>
        <nav className="flex flex-col space-y-4 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition duration-200 flex items-center justify-between ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-blue-500 hover:text-white"
                }`
              }
            >
              <span>{item.name}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition">
          Sign out
        </button>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-8 py-4">
          <h2 className="text-lg font-semibold text-black">Welcome to Digital Banking</h2>
        </header>
        <main className="p-10 flex-1">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="budget" element={<Budget />} />
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
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/accounts/?user_id=1", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [token]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleTransfer = () => {
    if (!selectedAccount || !amount) {
      alert("Please select an account and enter an amount");
      return;
    }
    alert(`Transferred Rs${amount}`);
    setAmount("");
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amt);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-black">Total Balance: {formatCurrency(totalBalance)}</h1>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 w-[500px]">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Transfer Money</h3>
        <div className="flex gap-4 items-center">
          <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="border p-2 rounded-md w-40">
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.bank_name}
              </option>
            ))}
          </select>
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2 rounded-md w-40" />
          <button onClick={handleTransfer} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Transfer
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Your Accounts</h3>
        {accounts.length > 0 ? (
          accounts.map((acc) => (
            <div key={acc.id} className="flex justify-between items-center p-3 border-b">
              <div>
                <p className="font-semibold">{acc.bank_name}</p>
                <p className="text-sm text-gray-500">{acc.account_type}</p>
              </div>
              <p className="font-bold text-blue-600">{formatCurrency(acc.balance)}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No accounts yet.</p>
        )}
      </div>
    </div>
  );
}

