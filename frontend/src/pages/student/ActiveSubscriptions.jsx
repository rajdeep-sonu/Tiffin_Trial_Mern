import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ActiveSubscriptions = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores subId currently running an action

  useEffect(() => {
    fetchSubscriptions();
    fetchDeliveryLogs();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/student/subscriptions/active');
      setSubscriptions(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryLogs = async () => {
    try {
      const response = await apiClient.get('/student/deliveries/history');
      setDeliveryLogs(response.data.data || []);
    } catch (err) {
      console.error('Error fetching delivery logs:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePause = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to pause this subscription? Today\'s delivery will be halted, and your remaining days will be preserved.')) return;
    setActionLoading(subscriptionId);
    try {
      const response = await apiClient.post(`/student/subscriptions/${subscriptionId}/pause`);
      // Update local state
      setSubscriptions(subscriptions.map(sub => 
        sub._id === subscriptionId ? { ...sub, status: 'paused', pausedAt: response.data.data.pausedAt } : sub
      ));
      alert('Subscription paused successfully. Remaining days have been frozen.');
    } catch (err) {
      alert('Error pausing subscription: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    try {
      const response = await apiClient.post(`/student/subscriptions/${subscriptionId}/resume`);
      // Update local state
      setSubscriptions(subscriptions.map(sub => 
        sub._id === subscriptionId 
          ? { 
              ...sub, 
              status: 'active', 
              endDate: response.data.data.endDate, 
              pausedAt: null, 
              accumulatedPausedTime: response.data.data.accumulatedPausedTime 
            } 
          : sub
      ));
      alert('Subscription resumed! Your plan is active, and your end date has been automatically extended.');
    } catch (err) {
      alert('Error resuming subscription: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (subscriptionId, kitchenName) => {
    if (window.confirm(`Are you sure you want to cancel the subscription for ${kitchenName}? This action is irreversible.`)) {
      try {
        await apiClient.delete(`/student/subscriptions/${subscriptionId}`);
        setSubscriptions(subscriptions.filter(sub => sub._id !== subscriptionId));
        alert('Subscription cancelled successfully.');
      } catch (err) {
        alert('Error cancelling subscription: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const calculateDaysRemaining = (endDate, status, pausedAt, accumulatedPausedTime) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (status === 'paused') {
      // If paused, remaining time is freeze-frame at pausedAt
      const freezeDate = pausedAt ? new Date(pausedAt) : now;
      const diffTime = end.getTime() - freezeDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlanDuration = (plan) => {
    const durations = {
      '7days': '7 Days',
      '30days': '30 Days',
      '60days': '60 Days',
      '90days': '90 Days',
    };
    return durations[plan] || plan;
  };

  return (
    <div className="relative min-h-screen bg-brand-dark pb-16 overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.05] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 rounded-full bg-brand-secondary opacity-[0.04] blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student')}
              className="px-3 py-1.5 bg-brand-card hover:bg-brand-border/40 border border-brand-border text-brand-textMain rounded-xl transition duration-200 text-sm font-semibold flex items-center gap-1.5"
            >
              <span>←</span> Dashboard
            </button>
            <h1 className="text-xl font-bold culinary-gradient-text tracking-tight hidden sm:block">My Subscriptions</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right text-xs hidden md:block">
              <p className="text-brand-textMain font-bold">{user?.name}</p>
              <p className="text-brand-textMuted">🎓 Student Account</p>
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

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-textMain tracking-tight">Active Subscriptions</h2>
            <p className="text-sm text-brand-textMuted mt-1">Manage your active plans, pause deliveries, or view your dispatch history</p>
          </div>
          <button
            onClick={() => navigate('/student/subscribe')}
            className="px-4 py-2 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl text-sm transition shadow-glass-glow"
          >
            + New Plan
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-brand-textMuted text-sm font-medium">Fetching subscriptions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl mb-8">
            <p className="font-bold text-sm">❌ Error Loading Subscriptions</p>
            <p className="text-xs mt-1 text-brand-textMuted">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && subscriptions.length === 0 && !error && (
          <div className="text-center py-16 glass-card rounded-3xl border border-brand-border/40 shadow-glass">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-xl font-bold text-brand-textMain mb-1">No active subscriptions found</p>
            <p className="text-brand-textMuted text-sm mb-6 max-w-sm mx-auto">
              Subscribe to a local tiffin kitchen to get delicious home-cooked meals delivered daily.
            </p>
            <button
              onClick={() => navigate('/student/subscribe')}
              className="px-6 py-2.5 culinary-gradient text-white font-bold rounded-xl hover:opacity-95 transition shadow-glass-glow text-sm"
            >
              Browse Kitchens 🚀
            </button>
          </div>
        )}

        {/* Subscriptions Grid */}
        {!loading && subscriptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => {
              const daysRemaining = calculateDaysRemaining(sub.endDate, sub.status, sub.pausedAt, sub.accumulatedPausedTime);
              const planDaysMap = { '7days': 7, '30days': 30, '60days': 60, '90days': 90 };
              const totalDays = planDaysMap[sub.plan] || 30;
              const progressPercent = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0;
              const isPaused = sub.status === 'paused';

              return (
                <div
                  key={sub._id}
                  className="glass-card rounded-2xl border border-brand-border/40 overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Header Panel */}
                  <div className={`px-6 py-5 ${isPaused ? 'bg-amber-500/10' : 'bg-brand-primary/5'} border-b border-brand-border/40`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-brand-textMain truncate max-w-[70%]">
                        {sub.kitchenName || 'Gourmet Kitchen'}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isPaused 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isPaused ? '⏸️ Paused' : '🟢 Active'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-textMuted flex items-center gap-1">
                      <span>📍</span> {sub.city || 'Local Area'}
                    </p>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 space-y-4 flex-grow">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-brand-textMuted">Meal Duration:</span>
                      <span className="font-semibold text-brand-textMain">
                        {getPlanDuration(sub.plan)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm pb-3 border-b border-brand-border/30">
                      <span className="text-brand-textMuted">Price Paid:</span>
                      <span className="font-bold text-brand-secondary text-base">
                        ₹{sub.finalPrice || sub.price}
                      </span>
                    </div>

                    {/* Dates Display */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-brand-textMuted">Start Date:</span>
                        <span className="text-brand-textMain font-medium">
                          {formatDate(sub.startDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-brand-textMuted">End Date:</span>
                        <span className={`font-semibold ${isPaused ? 'text-amber-300' : 'text-brand-textMain'}`}>
                          {formatDate(sub.endDate)} {isPaused && '*(frozen)'}
                        </span>
                      </div>
                    </div>

                    {/* Remaining Days Progress Panel */}
                    <div className="bg-brand-cardSolid/40 border border-brand-border/20 rounded-xl p-3.5 mt-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-brand-textMuted tracking-wider">DAYS REMAINING</span>
                        <span className="text-lg font-bold text-brand-primary">
                          {daysRemaining} / {totalDays}
                        </span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full h-2 bg-brand-dark/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isPaused ? 'bg-amber-500' : 'bg-gradient-to-r from-brand-primary to-brand-secondary'
                          }`}
                          style={{ width: `${Math.min(Math.max(100 - progressPercent, 0), 100)}%` }}
                        ></div>
                      </div>
                      
                      {isPaused && (
                        <p className="text-[10px] text-amber-300/80 font-medium mt-1.5 text-center leading-relaxed">
                          ⏸️ Frozen: Deliveries paused at {formatDate(sub.pausedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="px-6 py-4 bg-brand-dark/20 border-t border-brand-border/20 grid grid-cols-2 gap-3">
                    {isPaused ? (
                      <button
                        onClick={() => handleResume(sub._id)}
                        disabled={actionLoading !== null}
                        className="col-span-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-glass-glow disabled:opacity-50"
                      >
                        {actionLoading === sub._id ? '⏳ Resuming...' : '▶️ Resume Delivery'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePause(sub._id)}
                        disabled={actionLoading !== null}
                        className="py-2 bg-amber-600/80 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoading === sub._id ? '⏳ Pausing...' : '⏸️ Pause Delivery'}
                      </button>
                    )}
                    
                    {!isPaused && (
                      <button
                        onClick={() => handleDelete(sub._id, sub.kitchenName || 'Kitchen')}
                        disabled={actionLoading !== null}
                        className="py-2 bg-brand-accent/20 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 font-bold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        🚫 Cancel Plan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dispatch Logs History Section */}
        {!loading && subscriptions.length > 0 && (
          <div className="mt-16 glass-card rounded-3xl border border-brand-border/40 p-8 shadow-glass">
            <h3 className="text-xl font-bold text-brand-textMain mb-2 flex items-center gap-2">
              <span>📅</span> Today's Meals & Dispatch History
            </h3>
            <p className="text-xs text-brand-textMuted mb-6">Real-time status updates from tiffin kitchens for your subscriptions</p>

            {deliveryLogs.length === 0 ? (
              <div className="text-center py-8 text-brand-textMuted text-xs">
                No delivery logs recorded yet. Daily meal logs will populate as kitchens dispatch your lunch or dinner.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-textMuted font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Kitchen Name</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Delivery Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40 text-brand-textMain">
                    {deliveryLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-brand-card/25 transition">
                        <td className="py-3 px-4 font-medium">{formatDate(log.date)}</td>
                        <td className="py-3 px-4 text-brand-primary font-bold">
                          {log.providerId?.name || 'Kitchen Provider'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            log.status === 'dispatched' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            log.status === 'skipped' ? 'bg-brand-accent/20 text-brand-accent border-brand-accent/30' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-brand-textMuted italic">
                          {log.notes || 'No specific notes recorded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActiveSubscriptions;
