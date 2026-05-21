import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ProviderSubscriptions = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State variables
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' or 'subscribers'
  const [subscriptions, setSubscriptions] = useState([]);
  const [dailyDeliveries, setDailyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingLogId, setUpdatingLogId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchDailyDeliveries();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/provider/subscriptions');
      setSubscriptions(response.data.data || []);
    } catch (err) {
      console.error('[ERROR] fetchSubscriptions:', err);
      setError(err.response?.data?.message || 'Failed to fetch subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyDeliveries = async () => {
    setRosterLoading(true);
    try {
      const response = await apiClient.get('/provider/deliveries/today');
      setDailyDeliveries(response.data.data || []);
    } catch (err) {
      console.error('[ERROR] fetchDailyDeliveries:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (logId, nextStatus) => {
    setUpdatingLogId(logId);
    try {
      const response = await apiClient.patch(`/provider/deliveries/${logId}/status`, {
        status: nextStatus,
      });
      if (response.data.success) {
        setDailyDeliveries(prev => prev.map(log => 
          log._id === logId ? { ...log, status: nextStatus } : log
        ));
      }
    } catch (err) {
      alert('Error updating delivery status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingLogId(null);
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription? This will revoke student meal access.')) {
      return;
    }
    try {
      await apiClient.delete(`/provider/subscriptions/${subscriptionId}`);
      setSubscriptions(prev => prev.filter(sub => sub._id !== subscriptionId));
      fetchDailyDeliveries(); // Refresh roster too
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subscription');
    }
  };

  const getSubscriptionStatus = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    if (end < now) return 'expired';
    
    // Check if ending in 3 days
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3 && daysLeft > 0) return 'ending_soon';
    
    return 'active';
  };

  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filterStatus === 'all') return true;
    const status = getSubscriptionStatus(sub.endDate);
    return status === filterStatus;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => getSubscriptionStatus(s.endDate) === 'active').length,
    expired: subscriptions.filter(s => getSubscriptionStatus(s.endDate) === 'expired').length,
    revenue: subscriptions.reduce((sum, s) => sum + (s.finalPrice || s.price || 0), 0),
  };

  return (
    <div className="relative min-h-screen bg-brand-dark pb-16 overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-secondary opacity-[0.05] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.04] blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/provider/dashboard')}
              className="px-3 py-1.5 bg-brand-card hover:bg-brand-border/40 border border-brand-border text-brand-textMain rounded-xl transition duration-200 text-sm font-semibold flex items-center gap-1.5"
            >
              <span>←</span> Dashboard
            </button>
            <h1 className="text-xl font-bold culinary-gradient-text tracking-tight hidden sm:block">Subscribers & Roster</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => { fetchSubscriptions(); fetchDailyDeliveries(); }}
              className="px-3 py-1.5 bg-brand-card hover:bg-brand-border/40 border border-brand-border text-brand-primary font-bold rounded-xl text-xs transition flex items-center gap-1"
            >
              🔄 Sync
            </button>
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
        
        {/* Page title and Tab Toggles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-textMain tracking-tight">Deliveries & Subscriptions</h2>
            <p className="text-sm text-brand-textMuted mt-1">Manage today's meal dispatches and track student subscription cycles</p>
          </div>
          
          {/* Tab Button Selector */}
          <div className="flex p-1 bg-brand-cardSolid/80 border border-brand-border rounded-xl">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'roster'
                  ? 'bg-brand-primary text-brand-dark shadow-md'
                  : 'text-brand-textMuted hover:text-brand-textMain'
              }`}
            >
              🚚 Today's Roster
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'subscribers'
                  ? 'bg-brand-primary text-brand-dark shadow-md'
                  : 'text-brand-textMuted hover:text-brand-textMain'
              }`}
            >
              👥 All Subscribers
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl text-xs">
            <p className="font-bold">⚠️ Connection Issue</p>
            <p className="mt-0.5 text-brand-textMuted">{error}</p>
          </div>
        )}

        {/* Roster View */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl border border-brand-border/40 p-6 sm:p-8 shadow-glass">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-brand-textMain flex items-center gap-2">
                    <span>🚚</span> Dispatch Desk — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-brand-textMuted mt-1">Update meal courier logs dynamically. Students will instantly see their dispatch states.</p>
                </div>
                <span className="px-3 py-1 bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30 rounded-full text-xs font-bold">
                  Today's Route Active
                </span>
              </div>

              {rosterLoading ? (
                <div className="text-center py-12 text-brand-textMuted text-sm">
                  <span className="animate-spin inline-block text-lg mb-2">⏳</span>
                  <p>Compiling daily roster...</p>
                </div>
              ) : dailyDeliveries.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-4">🍱</p>
                  <p className="text-sm font-bold text-brand-textMain">No active dispatches for today</p>
                  <p className="text-xs text-brand-textMuted mt-1 max-w-xs mx-auto">
                    Only subscriptions that are currently active (not paused by students) will appear in today's roster list.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border text-brand-textMuted font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Dispatch Status</th>
                        <th className="py-3 px-4 text-center">Interactive Control Roster</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30 text-brand-textMain">
                      {dailyDeliveries.map((log) => {
                        const studentName = log.studentId?.name || 'Student';
                        const studentEmail = log.studentId?.email || '';
                        const planText = log.subscriptionId?.plan?.replace('days', ' Days') || 'Custom';
                        
                        return (
                          <tr key={log._id} className="hover:bg-brand-card/20 transition">
                            <td className="py-4 px-4">
                              <p className="font-bold text-brand-textMain">{studentName}</p>
                              <p className="text-[10px] text-brand-textMuted font-mono mt-0.5">{studentEmail}</p>
                            </td>
                            <td className="py-4 px-4 font-semibold text-brand-primary">{planText}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                log.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                log.status === 'dispatched' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                log.status === 'skipped' ? 'bg-brand-accent/20 text-brand-accent border-brand-accent/30' :
                                'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center items-center gap-2">
                                {[
                                  { label: 'Pending', status: 'pending', color: 'hover:bg-amber-500 hover:text-dark border-amber-500/30 text-amber-300' },
                                  { label: 'Dispatched', status: 'dispatched', color: 'hover:bg-blue-500 hover:text-dark border-blue-500/30 text-blue-300' },
                                  { label: 'Delivered', status: 'delivered', color: 'hover:bg-emerald-500 hover:text-dark border-emerald-500/30 text-emerald-300' },
                                  { label: 'Skip', status: 'skipped', color: 'hover:bg-brand-accent hover:text-white border-brand-accent/30 text-brand-accent' },
                                ].map((btn) => (
                                  <button
                                    key={btn.status}
                                    disabled={updatingLogId === log._id}
                                    onClick={() => handleUpdateStatus(log._id, btn.status)}
                                    className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold transition duration-200 uppercase ${
                                      log.status === btn.status
                                        ? 'bg-brand-textMain text-brand-dark border-brand-textMain'
                                        : `${btn.color} bg-brand-dark/20`
                                    } disabled:opacity-50`}
                                  >
                                    {btn.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscribers View */}
        {activeTab === 'subscribers' && (
          <div className="space-y-8">
            {/* Stats Dashboard Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Subscribers', value: stats.total, color: 'text-brand-primary' },
                { label: 'Active Cycle', value: stats.active, color: 'text-brand-secondary' },
                { label: 'Expired Cycle', value: stats.expired, color: 'text-brand-accent' },
                { label: 'Accumulated Recurring', value: `₹${stats.revenue}`, color: 'text-brand-textMain' },
              ].map((stat, idx) => (
                <div key={idx} className="glass-card rounded-2xl border border-brand-border/40 p-5 text-center">
                  <p className="text-[10px] text-brand-textMuted uppercase font-semibold tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex gap-2.5">
              {[
                { label: 'All Subscribers', val: 'all', count: subscriptions.length },
                { label: 'Active', val: 'active', count: stats.active },
                { label: 'Expired', val: 'expired', count: stats.expired },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setFilterStatus(btn.val)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition ${
                    filterStatus === btn.val
                      ? 'bg-brand-primary text-brand-dark border-brand-primary'
                      : 'bg-brand-card hover:bg-brand-border/40 border-brand-border text-brand-textMuted hover:text-brand-textMain'
                  }`}
                >
                  {btn.label} ({btn.count})
                </button>
              ))}
            </div>

            {/* Subscriptions Cards Grid */}
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-3xl border border-brand-border/40 text-brand-textMuted text-sm">
                No subscriptions matching the selected filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSubscriptions.map((sub) => {
                  const status = getSubscriptionStatus(sub.endDate);
                  const daysLeft = getDaysLeft(sub.endDate);
                  const planText = sub.plan.replace('days', ' Days');
                  
                  return (
                    <div
                      key={sub._id}
                      className={`glass-card rounded-2xl border overflow-hidden flex flex-col justify-between transition ${
                        status === 'active' 
                          ? 'border-emerald-500/30' 
                          : status === 'expired' 
                          ? 'border-brand-accent/30' 
                          : 'border-amber-500/30'
                      }`}
                    >
                      {/* Subscriber Name Panel */}
                      <div className={`px-6 py-4 flex justify-between items-start border-b border-brand-border/40 ${
                        status === 'active' ? 'bg-emerald-500/5' : status === 'expired' ? 'bg-brand-accent/5' : 'bg-amber-500/5'
                      }`}>
                        <div>
                          <h4 className="text-base font-bold text-brand-textMain">👤 {sub.studentName || 'Student Name'}</h4>
                          <p className="text-[10px] text-brand-textMuted font-mono mt-0.5">{sub.studentEmail}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          status === 'expired' ? 'bg-brand-accent/20 text-brand-accent border-brand-accent/30' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {status.toUpperCase()}
                        </span>
                      </div>

                      {/* Detail Metrics */}
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-brand-textMuted block">Selected Package:</span>
                            <span className="font-bold text-brand-textMain text-sm">{planText}</span>
                          </div>
                          <div>
                            <span className="text-brand-textMuted block">Daily Delivery Roster:</span>
                            <span className={`font-bold text-sm ${sub.status === 'paused' ? 'text-amber-300' : 'text-emerald-300'}`}>
                              {sub.status === 'paused' ? '⏸️ Paused' : '🟢 Active'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs pb-3 border-b border-brand-border/30">
                          <div>
                            <span className="text-brand-textMuted block">Price Paid:</span>
                            <span className="font-bold text-brand-secondary text-sm">₹{sub.finalPrice || sub.price}</span>
                          </div>
                          <div>
                            <span className="text-brand-textMuted block">Remaining Days:</span>
                            <span className="font-bold text-blue-400 text-sm">{daysLeft} Days 📅</span>
                          </div>
                        </div>

                        {/* Validity Dates */}
                        <div className="flex justify-between items-center text-xs text-brand-textMuted">
                          <span>Validity Cycle:</span>
                          <span className="font-medium text-brand-textMain">
                            {new Date(sub.startDate).toLocaleDateString()} – {new Date(sub.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Cancel/Revoke access action bar */}
                      <div className="px-6 py-3 bg-brand-dark/20 border-t border-brand-border/20">
                        <button
                          onClick={() => handleDeleteSubscription(sub._id)}
                          className="w-full py-1.5 bg-brand-accent/15 border border-brand-accent/30 hover:bg-brand-accent hover:text-white text-brand-accent text-xs font-bold rounded-xl transition duration-200"
                        >
                          🗑️ Cancel Student Access
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderSubscriptions;
