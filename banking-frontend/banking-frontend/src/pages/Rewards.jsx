import {fetchWithAuth , API_BASE_URL} from "../services/api";
import React, { useState, useEffect } from "react";
import { Gift, Star, Clock, Trophy, RefreshCcw, Loader2, Award } from "lucide-react";

function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth(`${API_BASE_URL}/api/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch rewards");
      const data = await res.json();
      setRewards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [token]);

  const totalPoints = rewards.reduce((sum, r) => sum + r.points_balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-indigo-500 opacity-20 blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Rewards Dashboard</h2>
              <p className="text-indigo-100 font-medium mt-1">Track your loyalty points across all programs</p>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center min-w-[200px]">
            <p className="text-indigo-100 text-sm font-semibold tracking-wider uppercase">Total Points Balance</p>
            <p className="text-5xl font-extrabold mt-2 tracking-tight text-white flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              {totalPoints.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <RefreshCcw className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-red-900">Error loading rewards</h4>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={fetchRewards} className="ml-auto bg-white px-4 py-2 rounded-lg font-semibold shadow-sm text-red-700 hover:bg-red-50 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Rewards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-indigo-500 pl-4 py-1">Active Programs</h3>
          <button onClick={fetchRewards} className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {rewards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reward Programs Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">You haven't been enrolled in any reward programs. Earn points by making transactions with partnering services.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward, index) => {
              // Creating a deterministic distinct color for each card based on index
              const colorSets = [
                { bg: 'bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-100', border: 'border-indigo-100', bar: 'bg-indigo-500' },
                { bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100', border: 'border-rose-100', bar: 'bg-rose-500' },
                { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100', border: 'border-emerald-100', bar: 'bg-emerald-500' },
                { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100', border: 'border-amber-100', bar: 'bg-amber-500' }
              ];
              const theme = colorSets[index % colorSets.length];

              return (
                <div key={reward.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className={`h-2 w-full ${theme.bar}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 ${theme.bg} ${theme.border} border rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <Award className={`w-7 h-7 ${theme.text}`} />
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-gray-200">
                         Active
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 pl-1 text-xl truncate mb-1" title={reward.program_name}>
                      {reward.program_name}
                    </h4>
                    
                    <div className="mt-8 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Available Points</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900">{reward.points_balance.toLocaleString()}</span>
                        <span className="text-sm font-semibold text-gray-400">pts</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-xs font-medium text-gray-400 pl-1">
                      <Clock className="w-4 h-4" />
                      Updated: {new Date(reward.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Rewards;
