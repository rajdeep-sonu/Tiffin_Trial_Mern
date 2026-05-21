import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const TrialStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastActivatedTrial, setLastActivatedTrial] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if just redirected from payment
    if (location.state?.success) {
      setSuccessMessage(location.state.message || '🎉 Trial activated successfully!');
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    // Check for stored trial info
    const stored = localStorage.getItem('lastActivatedTrial');
    if (stored) {
      try {
        setLastActivatedTrial(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored trial:', e);
      }
    }
    fetchTrials();
  }, []);

  const fetchTrials = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all active trials for the student
      const response = await apiClient.get('/student/trials');
      
      if (response.data && response.data.trials) {
        setTrials(response.data.trials);
      } else if (response.data && response.data.data) {
        setTrials(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTrials(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trials');
      console.error('Trial fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedTrial) return;

    setSubmitting(true);
    setError('');

    try {
      await apiClient.post('/student/review', {
        providerId: selectedTrial.provider._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      // Refresh trials
      fetchTrials();
      setReviewModal(false);
      setSelectedTrial(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrial = async (trialId) => {
    if (!window.confirm('Are you sure you want to delete this trial? This action cannot be undone.')) {
      return;
    }

    setError('');
    try {
      await apiClient.delete(`/student/trials/${trialId}`);
      setSuccessMessage('✅ Trial deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Refresh trials
      fetchTrials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trial');
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
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <span className="text-xl">⏱️</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black culinary-gradient-text drop-shadow-md">TiffinTrial</h1>
              <p className="text-brand-textMuted text-[10px] uppercase font-bold tracking-wider mt-0.5">Track Your Trials</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate('/student/providers')}
              className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-xs md:text-sm"
            >
              🔍 Browse
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-xs md:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-brand-textMain mb-2 flex items-center gap-2">
            <span>📊</span> My Active Trials
          </h2>
          <p className="text-brand-textMuted text-sm">Track your tiffin trial progress, apply discount codes, and submit kitchen feedback</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-brand-secondary/10 border border-brand-secondary/30 text-brand-textMain rounded-2xl backdrop-blur animate-pulse flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-base">{successMessage}</p>
              {lastActivatedTrial && (
                <p className="text-xs text-brand-textMuted mt-1 flex items-center gap-1.5">
                  <span>🎟️</span>
                  <span>Trial for <strong className="text-brand-textMain">{lastActivatedTrial.name}</strong> is now active!</span>
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/30 text-brand-textMain rounded-2xl backdrop-blur animate-pulse flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-xs text-brand-textMuted">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-xl mb-4 animate-spin">
                <div className="w-8 h-8 bg-brand-dark rounded-lg"></div>
              </div>
              <p className="text-brand-textMuted font-bold text-sm">Loading your active trials...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {trials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trials.map((trial) => (
                  <div
                    key={trial._id}
                    className="glass-card rounded-3xl p-8 border border-brand-border hover:border-brand-borderHover hover:-translate-y-1 transition transform duration-300 flex flex-col justify-between group"
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-brand-textMain group-hover:text-brand-primary transition">
                          {trial.provider?.kitchenName}
                        </h3>
                        <p className="text-[10px] text-brand-textMuted mt-1 uppercase font-semibold tracking-wider">
                          by {trial.provider?.ownerName}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
                          trial.status === 'active'
                            ? 'bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30'
                            : trial.status === 'completed'
                            ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30'
                            : 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30'
                        }`}
                      >
                        {trial.status === 'active' && '🟢 '}
                        {trial.status === 'completed' && '✅ '}
                        {trial.status === 'canceled' && '⛔ '}
                        {trial.status}
                      </span>
                    </div>

                    {/* Trial Details */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-brand-border">
                      <div className="flex items-center gap-3 bg-brand-dark/30 p-3 rounded-xl border border-brand-border">
                        <span className="text-lg">📅</span>
                        <div>
                          <p className="text-brand-textMuted text-[10px] uppercase font-bold tracking-wider">Started</p>
                          <p className="text-brand-textMain font-bold text-sm">{new Date(trial.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-brand-dark/30 p-3 rounded-xl border border-brand-border">
                        <span className="text-lg">⏰</span>
                        <div>
                          <p className="text-brand-textMuted text-[10px] uppercase font-bold tracking-wider">Ends</p>
                          <p className="text-brand-textMain font-bold text-sm">{new Date(trial.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {trial.couponCode && (
                        <div className="flex items-center gap-3 bg-brand-dark/30 p-3 rounded-xl border border-brand-border">
                          <span className="text-lg">🎟️</span>
                          <div>
                            <p className="text-brand-textMuted text-[10px] uppercase font-bold tracking-wider">Coupon Applied</p>
                            <p className="text-brand-primary font-mono font-bold text-sm">{trial.couponCode}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Days Remaining Progress */}
                    <div className="mb-6">
                      {(() => {
                        const today = new Date();
                        const endDate = new Date(trial.endDate);
                        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                        const totalDays = Math.ceil((endDate - new Date(trial.startDate)) / (1000 * 60 * 60 * 24));
                        const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));

                        return (
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-brand-textMain text-xs font-bold">
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                              </span>
                              <span className="text-brand-textMuted text-[10px] font-bold">{Math.round(progress)}% Complete</span>
                            </div>
                            <div className="w-full bg-brand-dark/50 rounded-full h-2 overflow-hidden border border-brand-border/40">
                              <div
                                className="bg-gradient-to-r from-brand-primary to-brand-accent h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5">
                      {trial.status === 'completed' && !trial.reviewed ? (
                        <button
                          onClick={() => {
                            setSelectedTrial(trial);
                            setReviewForm({ rating: 5, comment: '' });
                            setReviewModal(true);
                          }}
                          className="w-full px-4 py-3 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl transition duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm shadow-md hover-glow"
                        >
                          ⭐ Submit Review
                        </button>
                      ) : trial.reviewed ? (
                        <div className="w-full px-4 py-3 bg-brand-secondary/10 text-brand-secondary font-bold rounded-xl text-center border border-brand-secondary/20 flex items-center justify-center gap-2 text-sm">
                          ✅ Review Submitted
                        </div>
                      ) : null}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTrial(trial._id)}
                        className="w-full px-4 py-3 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm"
                      >
                        🗑️ Delete Trial Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-16 text-center border border-brand-border">
                <div className="text-6xl mb-6">📭</div>
                <h3 className="text-2xl font-black text-brand-textMain mb-2">No Active Trials</h3>
                <p className="text-brand-textMuted text-sm mb-8 max-w-md mx-auto">Explore tiffin providers in your city, request a meal trial, and monitor application approvals here.</p>
                <button
                  onClick={() => navigate('/student/providers')}
                  className="px-6 py-3.5 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl transition duration-200 hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2 text-sm shadow-lg hover-glow"
                >
                  🔍 Browse Providers & Apply
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Review Modal */}
      {reviewModal && selectedTrial && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full border border-brand-border shadow-2xl relative overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-xl flex items-center justify-center text-2xl">⭐</div>
              <div>
                <h3 className="text-xl font-black text-brand-textMain">
                  Review Your Experience
                </h3>
                <p className="text-xs text-brand-textMuted">{selectedTrial.provider?.kitchenName}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview}>
              {/* Rating Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-brand-textMuted mb-3 uppercase tracking-wider">How would you rate this tiffin provider?</label>
                <div className="flex gap-2.5 justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                      className={`w-12 h-12 rounded-xl font-black text-lg transition duration-200 hover:scale-105 active:scale-95 ${
                        reviewForm.rating === num
                          ? 'culinary-gradient text-white shadow-lg shadow-brand-primary/10 ring-2 ring-brand-primary'
                          : 'bg-brand-dark/50 border border-brand-border text-brand-textMuted hover:text-brand-textMain'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-brand-primary mt-3 uppercase tracking-wider">
                  {reviewForm.rating === 1 && '😞 Poor'}
                  {reviewForm.rating === 2 && '😕 Fair'}
                  {reviewForm.rating === 3 && '😐 Good'}
                  {reviewForm.rating === 4 && '😊 Very Good'}
                  {reviewForm.rating === 5 && '😍 Excellent'}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-brand-textMuted mb-2 uppercase tracking-wider">
                  💬 Your Feedback
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows="4"
                  className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-4 py-3 text-brand-textMain placeholder-brand-textMuted/30 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition resize-none text-sm"
                  placeholder="Tell us about the meal quality, hygiene, and delivery experience..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-3 culinary-gradient text-white font-bold rounded-xl transition duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md hover-glow"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReviewModal(false);
                    setSelectedTrial(null);
                  }}
                  className="flex-1 px-5 py-3 bg-brand-dark/50 hover:bg-brand-dark/80 text-brand-textMuted hover:text-brand-textMain font-bold rounded-xl transition duration-200 border border-brand-border text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialStatus;
