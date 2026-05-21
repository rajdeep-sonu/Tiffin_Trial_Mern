import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ProviderReviews = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/provider/reviews');
      setReviews(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex justify-center items-center animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto mb-6"></div>
          <p className="text-brand-textMuted text-lg">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-textMain font-sans animate-fade-in pb-12">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-brand-textMuted hover:text-brand-primary font-bold text-base md:text-lg flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-black culinary-gradient-text drop-shadow-md">⭐ Customer Reviews</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 animate-slide-up">
        {error && (
          <div className="mb-8 p-6 bg-brand-accent/10 border border-brand-accent/30 text-brand-textMain rounded-2xl text-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Review Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Average Rating Card */}
          <div className="glass-card border border-brand-primary/40 rounded-3xl p-10 text-center shadow-glass-glow transform hover:scale-[1.01] transition duration-300">
            <p className="text-brand-textMuted text-base font-semibold mb-3">⭐ Average Rating</p>
            <p className="text-7xl font-black culinary-gradient-text mb-4">{averageRating}</p>
            <p className="text-2xl text-brand-primary mb-4 tracking-wider">{renderStars(averageRating)}</p>
            <p className="text-brand-textMain text-base font-semibold">Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2 glass-card rounded-3xl p-10 shadow-2xl">
            <h3 className="font-black text-brand-textMain text-2xl mb-8 flex items-center gap-3">
              📊 Rating Distribution
            </h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-4">
                  <span className="w-16 text-base font-bold text-brand-primary">
                    {stars} ⭐
                  </span>
                  <div className="flex-1 bg-brand-dark/60 rounded-full h-8 overflow-hidden border border-brand-border">
                    <div
                      className="culinary-gradient h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-md"
                      style={{
                        width: `${totalReviews > 0 ? (ratingDistribution[stars] / totalReviews) * 100 : 0}%`
                      }}
                    >
                      {ratingDistribution[stars] > 0 && (
                        <span className="text-white font-black text-xs">{ratingDistribution[stars]}</span>
                      )}
                    </div>
                  </div>
                  <span className="w-10 text-right text-base font-bold text-brand-textMuted">
                    {ratingDistribution[stars]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-brand-textMain mb-8">💬 All Reviews</h2>
            {reviews.map(review => (
              <div
                key={review._id}
                className="glass-card rounded-2xl p-8 hover:border-brand-primary/50 transition duration-300 shadow-xl"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-brand-textMain mb-1">
                      👤 {review.studentId?.name || 'Anonymous Student'}
                    </h3>
                    <p className="text-brand-textMuted text-sm font-semibold">{review.studentId?.email || 'No email available'}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-2xl text-brand-primary mb-1.5 tracking-wider">
                      {renderStars(review.rating)}
                    </p>
                    <p className="text-brand-textMuted text-xs font-semibold">
                      📅 {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <div className="bg-brand-dark/40 border border-brand-border border-l-4 border-l-brand-primary rounded-xl p-5 mb-5 backdrop-blur-sm">
                    <p className="text-brand-textMain text-base leading-relaxed italic">"{review.comment}"</p>
                  </div>
                )}

                {review.category && (
                  <div className="flex gap-3">
                    <span className="inline-block px-4 py-1.5 culinary-gradient text-white font-bold rounded-full text-xs shadow-md">
                      🏷️ {review.category}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-16 text-center">
            <p className="text-brand-textMain text-3xl font-black mb-4">📋 No reviews yet</p>
            <p className="text-brand-textMuted text-lg">
              Your reviews will appear here once students complete their trial.
            </p>
            <p className="text-brand-primary text-base font-semibold mt-6">⏳ Keep delivering great meals and reviews will come!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderReviews;
