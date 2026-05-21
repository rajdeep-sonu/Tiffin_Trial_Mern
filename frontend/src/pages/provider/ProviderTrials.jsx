import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ProviderTrials = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTrials();
  }, []);

  const fetchTrials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/provider/trials');
      setTrials(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trials');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (trialId, action) => {
    try {
      const response = await apiClient.patch(`/provider/trial/${trialId}`, {
        status: action
      });
      // Refresh trials after update
      fetchTrials();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} trial`);
    }
  };

  const handleDeleteTrial = async (trialId) => {
    if (!window.confirm('Are you sure you want to delete this trial application? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/provider/trial/${trialId}`);
      // Refresh trials after deletion
      fetchTrials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete trial');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredTrials = filterStatus === 'all'
    ? trials
    : trials.filter(t => t.status === filterStatus);

  const stats = {
    pending: trials.filter(t => t.status === 'pending').length,
    approved: trials.filter(t => t.status === 'approved').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex justify-center items-center animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full mb-6 animate-spin shadow-glass-glow">
            <div className="w-16 h-16 bg-brand-dark rounded-full"></div>
          </div>
          <p className="text-brand-textMain font-black text-2xl drop-shadow-lg">Loading trial applications...</p>
          <p className="text-brand-textMuted mt-2 font-semibold">Just a moment ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-textMain font-sans animate-fade-in pb-12">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="px-4 py-2 hover:bg-brand-dark/60 rounded-xl transition text-brand-textMuted hover:text-brand-primary font-bold"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-dark/50 border border-brand-border rounded-full shadow-lg">
              <span className="text-xl">⏱️</span>
            </div>
            <h1 className="text-2xl font-black culinary-gradient-text drop-shadow-md">Trial Applications</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-sm animate-delay-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 animate-slide-up">
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-brand-textMain mb-3">Trial Applications 📊</h2>
          <p className="text-lg md:text-xl text-brand-textMuted font-semibold">Manage and respond to student trial requests</p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-brand-accent/10 border border-brand-accent/30 text-brand-textMain rounded-2xl flex items-center gap-3 shadow-lg">
            <span className="text-3xl">❌</span>
            <div><p className="font-bold text-lg">Error loading trials</p><p className="text-sm text-brand-textMuted">{error}</p></div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6 text-center max-w-sm border border-brand-border">
            <p className="text-brand-textMuted text-xs font-black uppercase tracking-wider">🎯 Active Trial Total</p>
            <p className="text-4xl font-black mt-1 culinary-gradient-text">{trials.length}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="glass-card rounded-2xl p-6 mb-12 shadow-lg border border-brand-border">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            <p className="text-xl font-black text-brand-textMain">Filter Applications</p>
          </div>
          
          <button
            onClick={() => setFilterStatus('all')}
            className="px-6 py-3 rounded-xl font-black text-base uppercase transition-all duration-300 transform bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:scale-105 active:scale-95"
          >
            📊 All ({trials.length})
          </button>

          {/* Current Filter Display */}
          <div className="mt-4 p-3 bg-brand-dark/40 rounded-xl border border-brand-border">
            <p className="text-brand-textMain font-bold text-sm">
              Currently showing: 
              <span className="text-brand-primary font-black ml-2">
                📊 All Applications
              </span>
            </p>
          </div>
        </div>

        {/* Trials List */}
        {filteredTrials.length > 0 ? (
          <div className="space-y-6">
            {filteredTrials.map(trial => (
              <div
                key={trial._id}
                className="group relative cursor-default"
              >
                {/* Subtle colorful shadow glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-10 group-hover:opacity-20 blur-xl transition duration-500 -z-10 bg-gradient-to-r ${
                  trial.status === 'pending'
                    ? 'from-amber-500 to-orange-600'
                    : trial.status === 'approved'
                    ? 'from-emerald-500 to-green-600'
                    : trial.status === 'rejected'
                    ? 'from-brand-accent to-red-600'
                    : 'from-blue-500 to-indigo-600'
                }`}></div>

                <div className="glass-card rounded-2xl overflow-hidden transform transition-all duration-300 hover:border-brand-primary/40 p-8 shadow-xl border border-brand-border">
                  {/* Header with Student Name */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-8 border-b border-brand-border">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-brand-dark/50 border border-brand-border rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-brand-textMain mb-1">
                          {trial.studentName || trial.studentEmail}
                        </h3>
                        <p className="text-brand-textMuted text-sm font-semibold">{trial.studentEmail}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black capitalize shadow-md transform transition-all border ${
                      trial.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      trial.status === 'approved' ? 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30' :
                      trial.status === 'rejected' ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/30' :
                      'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}>
                      {trial.status === 'pending' && '⏳ Pending'}
                      {trial.status === 'approved' && '✅ Approved'}
                      {trial.status === 'rejected' && '❌ Rejected'}
                      {trial.status === 'completed' && '🎯 Completed'}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-brand-dark/40 border border-brand-border/60 rounded-xl p-5 hover:bg-brand-dark/50 transition">
                      <p className="text-brand-textMuted text-xs font-bold uppercase mb-1">📅 Applied Date</p>
                      <p className="text-xl font-black text-brand-textMain">{new Date(trial.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-brand-dark/40 border border-brand-border/60 rounded-xl p-5 hover:bg-brand-dark/50 transition">
                      <p className="text-brand-textMuted text-xs font-bold uppercase mb-1">🗓️ Start Date</p>
                      <p className="text-xl font-black text-brand-textMain">{new Date(trial.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-brand-dark/40 border border-brand-border/60 rounded-xl p-5 hover:bg-brand-dark/50 transition">
                      <p className="text-brand-textMuted text-xs font-bold uppercase mb-1">📆 End Date</p>
                      <p className="text-xl font-black text-brand-textMain">
                        {new Date(trial.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Coupon Code - if exists */}
                  {trial.couponCode && (
                    <div className="mb-8">
                      <div className="bg-brand-dark/40 border border-brand-border/60 rounded-xl p-5 hover:bg-brand-dark/50 transition">
                        <p className="text-brand-textMuted text-xs font-bold uppercase mb-1">🎟️ Coupon Code</p>
                        <p className="text-xl font-black text-brand-primary font-mono tracking-wider">{trial.couponCode}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions for Pending Trials */}
                  {trial.status === 'pending' && (
                    <div className="flex gap-4 pt-4 pb-4 border-b border-brand-border">
                      <button
                        onClick={() => handleApproveReject(trial._id, 'approved')}
                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black rounded-xl transition duration-300 transform hover:scale-[1.01] active:scale-95 shadow-md uppercase tracking-wider text-sm"
                      >
                        ✅ Approve Trial
                      </button>
                      <button
                        onClick={() => handleApproveReject(trial._id, 'rejected')}
                        className="flex-1 px-6 py-3.5 bg-brand-accent/15 hover:bg-brand-accent/25 text-brand-accent border border-brand-accent/30 font-black rounded-xl transition duration-300 transform hover:scale-[1.01] active:scale-95 shadow-md uppercase tracking-wider text-sm"
                      >
                        ❌ Reject Trial
                      </button>
                    </div>
                  )}

                  {/* Delete Button - Always Available */}
                  <div className="pt-4">
                    <button
                      onClick={() => handleDeleteTrial(trial._id)}
                      className="w-full px-6 py-3 bg-brand-accent/10 border border-brand-accent/30 hover:bg-brand-accent hover:text-white text-brand-accent font-bold rounded-xl transition duration-300 transform hover:scale-[1.01] active:scale-95 shadow-lg flex items-center justify-center gap-2 text-sm"
                    >
                      🗑️ Delete Trial Application
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card border border-brand-border shadow-2xl p-16 text-center rounded-3xl">
            <div className="text-8xl mb-6">📭</div>
            <p className="text-brand-textMain text-3xl font-black mb-4">
              No Applications
            </p>
            <div className="bg-brand-dark/40 border border-brand-border rounded-xl p-5 inline-block">
              <p className="text-brand-primary text-base font-bold">
                💡 No student trial applications yet
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderTrials;
