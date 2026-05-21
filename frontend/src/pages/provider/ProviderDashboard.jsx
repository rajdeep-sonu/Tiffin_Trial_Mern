import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/provider/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Setup Kitchen Profile',
      description: 'Complete your kitchen details, city, and bio to get discovered',
      icon: '🏢',
      action: () => navigate('/provider/profile'),
      color: 'from-brand-primary/20 to-brand-accent/20 border-brand-primary/30',
      isImportant: true,
    },
    {
      title: 'Weekly Menu Planner',
      description: 'Design daily culinary plans, set ingredients, and upload gourmand pictures',
      icon: '🍳',
      action: () => navigate('/provider/create-menu'),
      color: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Trial Coupons Creator',
      description: 'Launch promotional vouchers to encourage risk-free student testing',
      icon: '🎟️',
      action: () => navigate('/provider/create-coupon'),
      color: 'from-purple-500/10 to-pink-500/10',
    },
    {
      title: 'Manage Subscriptions & Daily Deliveries',
      description: 'Track active meal plans, pause statuses, and dispatch daily rosters',
      icon: '🚚',
      action: () => navigate('/provider/subscriptions'),
      color: 'from-teal-500/10 to-emerald-500/10',
      highlight: true,
    },
    {
      title: 'Active Trials Tracker',
      description: 'Monitor students currently in active 7-day culinary trial stages',
      icon: '⏱️',
      action: () => navigate('/provider/trials'),
      color: 'from-yellow-500/10 to-amber-500/10',
    },
    {
      title: 'Customer Feedback & Reviews',
      description: 'Analyze student sentiments, rating stars, and kitchen recommendations',
      icon: '⭐',
      action: () => navigate('/provider/reviews'),
      color: 'from-emerald-500/10 to-green-500/10',
    },
  ];

  return (
    <div className="relative min-h-screen bg-brand-dark pb-16 overflow-hidden">
      {/* Dynamic culinary glow bubbles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.05] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-brand-secondary opacity-[0.04] blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center shadow-glass-glow">
              <span className="text-xl">🍳</span>
            </div>
            <div>
              <h1 className="text-xl font-bold culinary-gradient-text tracking-tight">TiffinTrial</h1>
              <p className="text-[10px] text-brand-textMuted font-semibold tracking-wider uppercase">Chef Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs hidden md:block">
              <p className="text-brand-textMain font-bold">Chef {user?.name}</p>
              <p className="text-brand-textMuted">🏪 Kitchen Provider Account</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-brand-accent hover:opacity-90 text-white font-bold rounded-xl text-xs transition active:scale-[0.97]"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Welcome Hero Banner */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textMain tracking-tight">
            Kitchen Dashboard & Analytics
          </h2>
          <p className="text-sm text-brand-textMuted mt-1 leading-relaxed">
            Manage your daily meal operations, monitor active subscriptions, and view real-time revenue analytics.
          </p>
        </div>

        {/* Live Business Analytics Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {[
            { 
              label: '💰 Gross Earnings', 
              value: loading ? '...' : `₹${analytics?.totalRevenue || 0}`, 
              icon: '₹', 
              color: 'text-brand-secondary', 
              bgGlow: 'rgba(16, 185, 129, 0.1)' 
            },
            { 
              label: '🟢 Active Subscriptions', 
              value: loading ? '...' : `${analytics?.activeSubscriptionsCount || 0}`, 
              icon: '📦', 
              color: 'text-brand-primary', 
              bgGlow: 'rgba(245, 158, 11, 0.1)' 
            },
            { 
              label: '⏱️ Active Trials', 
              value: loading ? '...' : `${analytics?.activeTrialsCount || 0}`, 
              icon: '⏳', 
              color: 'text-blue-400', 
              bgGlow: 'rgba(96, 165, 250, 0.1)' 
            },
            { 
              label: '⭐ Average Rating', 
              value: loading ? '...' : `${analytics?.averageRating || 0} (${analytics?.totalReviews || 0})`, 
              icon: '⭐', 
              color: 'text-amber-400', 
              bgGlow: 'rgba(251, 191, 36, 0.1)' 
            },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="glass-card rounded-2xl border border-brand-border/40 p-5 relative overflow-hidden group hover:scale-[1.02] transition-all"
            >
              <div 
                className="absolute -right-4 -bottom-4 text-6xl font-black opacity-[0.03] select-none group-hover:scale-110 transition duration-300"
              >
                {stat.icon}
              </div>
              <p className="text-[10px] sm:text-xs text-brand-textMuted uppercase font-bold tracking-wider mb-2">{stat.label}</p>
              <div className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Operational Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              onClick={item.action}
              className={`group cursor-pointer glass-card rounded-2xl border border-brand-border/40 overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 ${
                item.highlight ? 'md:col-span-2 lg:col-span-1 border-brand-secondary/30 bg-brand-secondary/5' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-3xl">{item.icon}</div>
                  {item.isImportant && (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent border border-brand-accent/30 animate-pulse">
                      Setup Need
                    </span>
                  )}
                  {item.highlight && (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30">
                      Roster Active
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-brand-textMain mb-1.5 group-hover:text-brand-primary transition">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-textMuted leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
              
              <div className="px-6 py-3 bg-brand-dark/20 border-t border-brand-border/10 flex justify-end">
                <span className="text-xs font-bold text-brand-primary group-hover:translate-x-1 transition duration-200">
                  Manage →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Getting Started Tips Block */}
        <div className="glass-card rounded-3xl border border-brand-border/40 p-8 shadow-glass">
          <h3 className="text-lg font-bold text-brand-textMain mb-2 flex items-center gap-2">
            <span>💡</span> Chef's Operational Guidelines
          </h3>
          <p className="text-xs text-brand-textMuted mb-6 leading-relaxed">
            Ensure your business thrives on TiffinTrial by practicing seamless customer operations:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Daily Roster Verification', 
                desc: 'Open "Manage Subscriptions" each morning to dispatch or pause orders based on student pause requests.' 
              },
              { 
                title: 'High-Definition Dishes', 
                desc: 'Freshly upload weekly menus with visually-captivating images. Visually stunning menus boost conversion by 60%.' 
              },
              { 
                title: 'Strategic Trial Coupons', 
                desc: 'Attract students to try your kitchen by publishing active trial coupons for your latest menu packages.' 
              }
            ].map((tip, idx) => (
              <div key={idx} className="bg-brand-cardSolid/40 border border-brand-border/20 rounded-2xl p-4 hover:border-brand-borderHover transition">
                <h4 className="text-xs font-bold text-brand-textMain mb-2">{tip.title}</h4>
                <p className="text-xs text-brand-textMuted leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
