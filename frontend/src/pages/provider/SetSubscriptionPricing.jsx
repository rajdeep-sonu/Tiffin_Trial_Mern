import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SetSubscriptionPricing = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [prices, setPrices] = useState({
    '7days': 150,
    '30days': 500,
    '60days': 900,
    '90days': 1200,
  });

  const plans = [
    {
      key: '7days',
      label: '7 Days',
      description: 'Try for one week',
      icon: '📅',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      key: '30days',
      label: '30 Days',
      description: 'One month plan',
      icon: '📊',
      color: 'from-purple-500 to-pink-500',
    },
    {
      key: '60days',
      label: '60 Days',
      description: 'Two months plan',
      icon: '📈',
      color: 'from-orange-500 to-red-500',
    },
    {
      key: '90days',
      label: '90 Days',
      description: 'Quarterly plan',
      icon: '🎯',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const handlePriceChange = (planKey, value) => {
    setPrices({
      ...prices,
      [planKey]: Math.max(0, parseInt(value) || 0),
    });
  };

  const handleSavePrices = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    let hasError = false;
    for (let plan of Object.values(prices)) {
      if (plan <= 0) {
        setErrorMsg('All prices must be greater than ₹0');
        hasError = true;
        break;
      }
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/provider/subscription-prices', {
        prices: prices,
      });

      setSuccessMsg(response.data.message || 'Prices saved successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to save prices. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-textMain font-sans animate-fade-in pb-12">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/provider/dashboard')}
              className="px-3 py-2 text-brand-textMuted hover:text-brand-primary hover:bg-brand-dark/50 rounded-lg transition"
            >
              ← Back
            </button>
            <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-dark/50 border border-brand-border rounded-full shadow-lg">
              <span className="text-xl">💰</span>
            </div>
            <h1 className="text-2xl font-black culinary-gradient-text drop-shadow-md">Set Prices</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-brand-textMain font-bold">👨‍🍳 {user?.name}</p>
              <p className="text-brand-textMuted text-xs">Provider Account</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 animate-slide-up">
        {/* Title */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-brand-textMain mb-3">
            💵 Set Your Subscription Prices
          </h2>
          <p className="text-lg text-brand-textMuted">
            Students will see these prices when they choose to subscribe to your meals.
            You can update them anytime.
          </p>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="mb-8 p-5 bg-brand-secondary/10 border-l-4 border-brand-secondary text-brand-textMain rounded-xl flex items-center gap-3 animate-pulse border border-y-brand-border border-r-brand-border">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm text-brand-textMuted">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 p-5 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl flex items-center gap-3 border border-y-brand-border border-r-brand-border">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold">Error!</p>
              <p className="text-sm text-brand-textMuted">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Pricing Form */}
        <form onSubmit={handleSavePrices} className="space-y-8">
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className="group glass-card rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300"
              >
                {/* Plan Header */}
                <div className="h-24 bg-brand-dark/60 border-b border-brand-border flex items-center justify-center group-hover:bg-brand-dark/40 transition duration-300">
                  <span className="text-5xl drop-shadow-glass-glow">{plan.icon}</span>
                </div>

                {/* Plan Details */}
                <div className="p-6">
                  <h3 className="text-2xl font-black text-brand-textMain mb-1">
                    {plan.label}
                  </h3>
                  <p className="text-brand-textMuted text-sm mb-6">{plan.description}</p>

                  {/* Price Input */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-brand-textMuted mb-2 uppercase tracking-wider">
                      Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xl font-bold text-brand-primary">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={prices[plan.key]}
                        onChange={(e) =>
                          handlePriceChange(plan.key, e.target.value)
                        }
                        className="w-full pl-8 pr-4 py-3 bg-brand-dark/50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition font-bold text-lg text-brand-textMain"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Cost per day */}
                  <div className="bg-brand-dark/50 border border-brand-border p-3 rounded-xl text-center">
                    <p className="text-xs text-brand-textMuted font-semibold">Cost per day</p>
                    <p className="text-xl font-black culinary-gradient-text">
                      ₹{Math.ceil(prices[plan.key] / parseInt(plan.key))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-brand-dark/40 border border-brand-border border-l-4 border-l-brand-primary p-6 rounded-r-2xl">
            <h4 className="font-bold text-brand-textMain mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">ℹ️</span> Important Information
            </h4>
            <ul className="space-y-2 text-brand-textMuted text-sm">
              <li>✓ Your prices will be visible to all students immediately</li>
              <li>✓ Students can only subscribe after completing a trial</li>
              <li>✓ You can update prices anytime, but current subscriptions won't change</li>
              <li>✓ Longer plans (60, 90 days) usually get more student interest</li>
            </ul>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-brand-border/40 disabled:to-brand-border/40 disabled:text-brand-textMuted text-white font-bold rounded-xl transition duration-300 transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving Prices...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Prices
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/provider/dashboard')}
              className="px-6 py-4 bg-brand-dark/40 border border-brand-border hover:bg-brand-dark/60 text-brand-textMain font-bold rounded-xl transition duration-300 transform hover:scale-[1.01] active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Pricing Tips */}
        <div className="mt-12 glass-card rounded-3xl p-8 border border-brand-border shadow-xl">
          <h3 className="text-2xl font-black text-brand-textMain mb-6 flex items-center gap-2">
            <span className="text-3xl">💡</span> Pricing Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Be Competitive',
                desc: 'Check what other providers charge and set fair prices',
                icon: '⚖️',
              },
              {
                title: 'Offer Discounts',
                desc: 'Longer plans should have lower per-day costs',
                icon: '📉',
              },
              {
                title: 'Quality Matters',
                desc: 'Higher quality meals justify higher prices',
                icon: '👨‍🍳',
              },
              {
                title: 'Market Research',
                desc: 'Study demand and adjust prices seasonally',
                icon: '📊',
              },
              {
                title: 'Trial Strategy',
                desc: 'Use free/cheap trials to convert to subscriptions',
                icon: '🎁',
              },
              {
                title: 'Regular Updates',
                desc: 'Review and adjust prices monthly for optimization',
                icon: '📅',
              },
            ].map((tip, index) => (
              <div
                key={index}
                className="bg-brand-dark/40 border border-brand-border border-l-4 border-l-brand-primary p-5 rounded-r-xl shadow-md transition-all duration-300 hover:border-brand-primary/40"
              >
                <div className="flex gap-3 mb-2">
                  <span className="text-2xl">{tip.icon}</span>
                  <h4 className="font-bold text-brand-textMain">{tip.title}</h4>
                </div>
                <p className="text-brand-textMuted text-sm">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-brand-border/60 text-brand-textMuted text-center py-8 mt-12">
        <p className="mb-2">© 2024 TiffinTrial Provider Portal. All rights reserved.</p>
        <p className="text-sm">Setting fair prices helps both providers and students 💰</p>
      </footer>
    </div>
  );
};

export default SetSubscriptionPricing;
