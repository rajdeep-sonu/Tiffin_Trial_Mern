import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ city: '', vegOnly: false });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.vegOnly) params.append('vegOnly', 'true');

      const response = await apiClient.get(`/student/providers?${params}`);
      setProviders(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-brand-dark text-brand-textMain font-sans overflow-hidden">
      {/* Background culinary glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary opacity-[0.06] blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-secondary opacity-[0.04] blur-[140px] pointer-events-none"></div>

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
              to="/student/dashboard"
              className="text-sm font-semibold text-brand-textMuted hover:text-brand-textMain transition"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/student/subscriptions"
              className="text-sm font-semibold text-brand-textMuted hover:text-brand-textMain transition"
            >
              📅 Subscriptions
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
            Discover <span className="culinary-gradient-text">Local Chefs</span> 👨‍🍳
          </h2>
          <p className="text-brand-textMuted font-medium text-sm md:text-base">
            Try gourmet home-cooked trial meals before committing to a full subscription.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="glass-card rounded-3xl p-6 border border-brand-border/40 shadow-glass mb-8 animate-slide-up">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-brand-primary">
            <span>🔎</span> Filter Culinary Hubs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-2">
                📍 City
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Search by city (e.g., Mumbai, Delhi)..."
                className="w-full bg-brand-dark/40 border border-brand-border rounded-xl px-4 py-3 text-brand-textMain placeholder-brand-textMuted/30 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center p-3 border border-brand-border bg-brand-dark/20 hover:bg-brand-dark/40 rounded-xl cursor-pointer hover:border-brand-primary/40 transition w-full group select-none">
                <input
                  type="checkbox"
                  checked={filters.vegOnly}
                  onChange={(e) => setFilters({ ...filters, vegOnly: e.target.checked })}
                  className="w-4 h-4 text-brand-primary border-brand-border bg-brand-dark/40 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-3 text-sm text-brand-textMain/90 font-bold group-hover:text-brand-primary transition">
                  🌱 Vegetarian Kitchens Only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl animate-pulse text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl mb-4 shadow-glass-glow animate-spin">
              <span className="text-3xl">⏳</span>
            </div>
            <p className="text-brand-textMain font-bold">Querying local kitchens...</p>
            <p className="text-brand-textMuted text-xs mt-1">Sourcing fresh daily trials</p>
          </div>
        )}

        {/* Providers Grid */}
        {!loading && (
          <>
            {providers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {providers.map((provider) => {
                  const ratingAvg = provider.averageRating || 4.8;
                  const reviewCount = provider.numReviews || 12;

                  return (
                    <Link
                      key={provider._id}
                      to={`/student/provider/${provider.userId?._id || provider.userId}`}
                      className="group glass-card rounded-3xl overflow-hidden border border-brand-border/40 shadow-glass hover:border-brand-primary/30 transition duration-300 flex flex-col justify-between"
                    >
                      {/* Card Header Illustration */}
                      <div className="relative h-28 bg-gradient-to-br from-brand-dark to-brand-card flex items-center justify-center border-b border-brand-border/30">
                        <div className="text-5xl transform group-hover:scale-110 transition duration-300">🍳</div>
                        {provider.vegetarian && (
                          <span className="absolute top-3 right-3 bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/35 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full shadow-glass backdrop-blur-md">
                            🌱 Pure Veg
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold tracking-tight text-brand-textMain group-hover:text-brand-primary transition">
                              {provider.kitchenName}
                            </h3>
                            {/* Star Badge */}
                            <div className="flex items-center gap-1 bg-brand-primary/10 border border-brand-primary/25 rounded-lg px-2 py-0.5 text-xs text-brand-primary font-bold">
                              <span>⭐</span>
                              <span>{ratingAvg.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-brand-textMuted text-xs font-semibold mb-4">by {provider.ownerName}</p>

                          <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2.5 text-xs text-brand-textMain/80 font-medium">
                              <span className="text-sm">📍</span>
                              <span>{provider.city}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-brand-textMuted font-medium">
                              <span className="text-sm">📞</span>
                              <span>{provider.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs text-brand-textMuted/70 border-t border-brand-border/30 pt-4 mb-4 font-semibold">
                            <span>💬 {reviewCount} reviews</span>
                            <span className="text-brand-primary hover:underline">View Menu</span>
                          </div>

                          <button className="w-full py-3 bg-brand-dark/40 hover:bg-brand-primary border border-brand-border hover:border-brand-primary hover:text-white font-bold rounded-xl transition duration-300 text-xs shadow-glass-glow flex items-center justify-center gap-1.5 active:scale-[0.98]">
                            View Kitchen Details <span>→</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 glass-card border border-brand-border/40 rounded-3xl p-12">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-brand-textMain text-xl font-bold mb-1">No kitchen hubs found</p>
                <p className="text-brand-textMuted text-sm">
                  Try clearing your search query or looking for other cities.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Providers;
