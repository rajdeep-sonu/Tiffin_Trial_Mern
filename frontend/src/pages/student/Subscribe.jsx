import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const Subscribe = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: '30days',
    price: 0,
  });
  const [providerPrices, setProviderPrices] = useState({
    '7days': 150,
    '30days': 500,
    '60days': 900,
    '90days': 1200,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const planOptions = [
    { value: '7days', label: '7 Days Plan' },
    { value: '30days', label: '30 Days Plan' },
    { value: '60days', label: '60 Days Plan' },
    { value: '90days', label: '90 Days Plan' },
  ];

  useEffect(() => {
    fetchSubscriptions();
    fetchProviders();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      setSubscriptions([]);
    } catch (err) {
      console.error('Error fetching subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await apiClient.get('/student/providers');
      setProviders(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch providers');
    }
  };

  const handleSelectProvider = async (provider) => {
    setSelectedProvider(provider);
    try {
      const response = await apiClient.get(`/student/provider/${provider._id}/prices`);
      const prices = response.data.prices;
      setProviderPrices(prices);
      setSubscriptionForm({
        plan: '30days',
        price: prices['30days'],
      });
    } catch (err) {
      setProviderPrices({
        '7days': 150,
        '30days': 500,
        '60days': 900,
        '90days': 1200,
      });
      setSubscriptionForm({
        plan: '30days',
        price: 500,
      });
    }
    setShowSubscriptionForm(true);
  };

  const handlePlanChange = (planValue) => {
    setSubscriptionForm({
      plan: planValue,
      price: providerPrices[planValue] || 0,
    });
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const userIdToSend = selectedProvider.userId?._id || selectedProvider._id;
      const payloadData = {
        providerId: userIdToSend,
        kitchenName: selectedProvider.kitchenName,
        plan: subscriptionForm.plan,
        price: subscriptionForm.price,
        discount: 0,
      };
      
      navigate('/student/subscription-payment', {
        state: {
          subscription: payloadData,
        },
      });
    } catch (err) {
      console.error('handleCreateSubscription failed:', err);
      setError('Failed to proceed to payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-brand-dark text-brand-textMain font-sans overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary opacity-[0.06] blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-secondary opacity-[0.04] blur-[140px] pointer-events-none"></div>

      {/* Glass Nav */}
      <header className="glass-nav sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/student/dashboard" className="flex items-center gap-3 group">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl shadow-glass-glow transform group-hover:rotate-12 transition">
              <span className="text-xl">🍽️</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight culinary-gradient-text">TiffinTrial</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/student/providers"
              className="text-sm font-semibold text-brand-textMuted hover:text-brand-textMain transition"
            >
              🔍 Browse Providers
            </Link>
            <Link
              to="/student/dashboard"
              className="text-sm font-semibold text-brand-textMuted hover:text-brand-textMain transition"
            >
              📊 Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-brand-accent/15 border border-brand-accent/25 text-brand-accent hover:bg-brand-accent/25 hover:text-brand-textMain font-bold rounded-xl transition text-xs flex items-center gap-1.5 active:scale-[0.97]"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Page Title */}
        <div className="mb-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Start Your <span className="culinary-gradient-text">Meal Plan</span> 🚀
          </h2>
          <p className="text-brand-textMuted font-medium text-sm md:text-base">
            Choose your kitchen partner and select a duration to begin receiving fresh home-cooked meals.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-brand-secondary/10 border-l-4 border-brand-secondary text-brand-textMain rounded-xl text-sm">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span className="font-semibold">{successMsg}</span>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showSubscriptionForm && selectedProvider ? (
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-brand-border/40 shadow-glass mb-8 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-brand-border/30">
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Subscribe to {selectedProvider.kitchenName} 🍱
                </h3>
                <p className="text-brand-textMuted text-xs font-semibold mt-1">
                  Enjoy authentic meals delivered right to your location.
                </p>
              </div>
              <div className="text-xs bg-brand-dark/50 border border-brand-border px-3.5 py-2 rounded-xl text-brand-textMuted font-mono">
                <p className="font-semibold text-brand-textMain">Kitchen ID:</p>
                <p>{selectedProvider._id.substring(0, 16)}...</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubscription}>
              {/* Plan Cards selection */}
              <div className="mb-8">
                <label className="block text-base font-extrabold text-brand-textMain mb-4">
                  📅 Select Meal Plan Duration
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {planOptions.map((plan) => {
                    const isSelected = subscriptionForm.plan === plan.value;
                    return (
                      <button
                        key={plan.value}
                        type="button"
                        onClick={() => handlePlanChange(plan.value)}
                        className={`p-5 rounded-2xl border transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-center ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/10 shadow-glass-glow'
                            : 'border-brand-border/40 bg-brand-dark/20 hover:border-brand-border'
                        }`}
                      >
                        <div className="font-extrabold text-sm text-brand-textMain mb-1">
                          {plan.label}
                        </div>
                        <div className="text-2xl font-black text-brand-primary">
                          ₹{providerPrices[plan.value]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Billing Overlay */}
              <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-sm font-semibold text-brand-textMuted">
                    Selected Plan Duration: <strong className="text-brand-primary uppercase tracking-wider">{subscriptionForm.plan}</strong>
                  </span>
                  <p className="text-[10px] text-brand-textMuted/70 mt-1 font-semibold">
                    💡 Plan details and dynamic resume features apply immediately upon payment.
                  </p>
                </div>
                <div className="flex items-baseline gap-1 text-right">
                  <span className="text-xs text-brand-textMuted font-bold">Total Bill:</span>
                  <span className="text-3xl font-black culinary-gradient-text">
                    ₹{subscriptionForm.price}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl disabled:opacity-50 transition duration-300 transform active:scale-[0.98] text-sm shadow-glass-glow flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span> Routing to secure portal...
                    </>
                  ) : (
                    '💳 Confirm & Proceed to Payment'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubscriptionForm(false);
                    setSelectedProvider(null);
                  }}
                  className="px-6 py-4 bg-brand-dark/50 hover:bg-brand-dark/80 text-brand-textMain border border-brand-border rounded-xl transition duration-300 font-bold active:scale-[0.98] text-sm sm:w-40"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          !showSubscriptionForm && (
            <>
              {providers.length > 0 ? (
                <>
                  <p className="text-brand-textMuted font-semibold mb-6 text-sm">
                    Select a culinary partner below to activate subscription terms:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {providers.map((provider) => (
                      <div
                        key={provider._id}
                        className="group glass-card rounded-3xl p-6 border border-brand-border/40 shadow-glass hover:border-brand-primary/30 transition duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-20 bg-gradient-to-br from-brand-dark to-brand-card rounded-xl mb-4 flex items-center justify-center border border-brand-border/20">
                            <span className="text-4xl transform group-hover:scale-110 transition duration-300">🍱</span>
                          </div>
                          <h3 className="text-xl font-bold text-brand-textMain mb-1 group-hover:text-brand-primary transition">
                            {provider.kitchenName}
                          </h3>
                          <p className="text-brand-textMuted text-xs font-semibold mb-4">by {provider.ownerName}</p>
                        </div>
                        <button
                          onClick={() => handleSelectProvider(provider)}
                          className="w-full py-3 bg-brand-primary/10 hover:bg-brand-primary border border-brand-primary/30 hover:border-brand-primary hover:text-white font-bold rounded-xl transition duration-300 text-xs shadow-glass-glow flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          Select Kitchen & Plans <span>→</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 glass-card border border-brand-border/40 rounded-3xl p-12 animate-fade-in">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-brand-textMain text-xl font-bold mb-1">
                    No kitchens available for subscription
                  </p>
                  <p className="text-brand-textMuted text-xs mb-6 font-semibold">
                    Complete your first trial with local providers before setting up subscriptions!
                  </p>
                  <button
                    onClick={() => navigate('/student/providers')}
                    className="px-6 py-3 bg-brand-dark/40 hover:bg-brand-primary border border-brand-border hover:border-brand-primary hover:text-white font-bold rounded-xl transition duration-300 text-xs shadow-glass-glow"
                  >
                    🔍 Find Local Kitchens
                  </button>
                </div>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
};

export default Subscribe;
