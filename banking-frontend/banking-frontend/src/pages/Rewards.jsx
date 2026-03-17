import React, { useState, useEffect } from "react";
import { 
  Gift, 
  Star, 
  Trophy, 
  Crown, 
  Sparkles,
  ChevronRight,
  Clock,
  Zap,
  Loader2
} from "lucide-react";

function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const tiers = [
    {
      name: "Bronze",
      icon: Star,
      color: "from-amber-600 to-amber-800",
      points: "0 - 500",
      benefits: ["1% cashback", "Birthday reward"]
    },
    {
      name: "Silver",
      icon: Trophy,
      color: "from-gray-300 to-gray-500",
      points: "501 - 2000",
      benefits: ["2% cashback", "Priority support", "Exclusive offers"]
    },
    {
      name: "Gold",
      icon: Crown,
      color: "from-yellow-400 to-yellow-600",
      points: "2001 - 5000",
      benefits: ["3% cashback", "Free transactions", "Lounge access"]
    },
    {
      name: "Platinum",
      icon: Sparkles,
      color: "from-brand-400 to-brand-600",
      points: "5000+",
      benefits: ["5% cashback", "Concierge service", "Premium rewards"]
    }
  ];

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const [rewardsRes, totalRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/rewards/?user_id=1", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://127.0.0.1:8000/api/rewards/total-points?user_id=1", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        if (rewardsRes.ok) {
          const data = await rewardsRes.json();
          setRewards(data);
        }
        if (totalRes.ok) {
          const data = await totalRes.json();
          setTotalPoints(data.total_points || 0);
        }
      } catch (err) {
        setError("Failed to fetch rewards");
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="card-gradient p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Your Rewards</h2>
              <p className="text-brand-100 text-sm">Unlock exclusive benefits with Bank Pro</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-brand-100 text-sm">Total Points</p>
            <p className="text-4xl font-display font-bold">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-bold text-dark-800 mb-4">Reward Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, index) => (
            <div 
              key={tier.name}
              className="relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer group"
              style={{ 
                borderColor: index === 1 ? '#0EA5E9' : '#E2E8F0',
                background: index === 1 ? 'linear-gradient(to bottom, #F0F9FF, white)' : 'white'
              }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3 shadow-lg`}>
                <tier.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-dark-800 mb-1">{tier.name}</h4>
              <p className="text-xs text-dark-500 mb-3">{tier.points} points</p>
              <ul className="space-y-1">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="text-xs text-dark-600 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-brand-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-dark-300 group-hover:text-brand-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-dark-100">
          <h3 className="text-lg font-display font-bold text-dark-800">Available Rewards</h3>
          <p className="text-sm text-dark-500">Grab these exciting offers before they expire</p>
        </div>
        
        <div className="divide-y divide-dark-100">
          {rewards.map((reward, index) => (
            <div 
              key={reward.id}
              className="p-5 hover:bg-dark-50 transition-all duration-200 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${reward.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {reward.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-dark-800">{reward.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reward.bgColor} text-dark-700`}>
                      {reward.category}
                    </span>
                  </div>
                  <p className="text-sm text-dark-500 mb-2">{reward.description}</p>
                  <div className="flex items-center gap-1 text-xs text-dark-400">
                    <Clock className="w-3 h-3" />
                    Expires: {reward.expires}
                  </div>
                </div>
                
                {/* Action */}
                <button className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 font-medium text-sm hover:bg-brand-100 transition-colors group-hover:scale-105">
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-bold text-dark-800 mb-4">How to Earn More Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Use Bank Card", desc: "Earn 1 point per ₹100 spent", icon: "💳" },
            { title: "Refer Friends", desc: "Get 500 points per referral", icon: "👥" },
            { title: "Pay Bills", desc: "Earn 2x points on bill payments", icon: "📄" }
          ].map((item, index) => (
            <div key={index} className="p-4 bg-dark-50 rounded-xl hover:bg-dark-100 transition-colors">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="font-semibold text-dark-800 mb-1">{item.title}</h4>
              <p className="text-sm text-dark-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rewards;

