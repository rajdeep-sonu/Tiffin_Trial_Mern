import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../../components/PaymentModal';

const getValidImageUrl = (imageData) => {
  if (!imageData) return null;
  if (typeof imageData === 'string' && imageData.includes('http')) {
    return imageData;
  }
  if (typeof imageData === 'object' && imageData?.url) {
    if (typeof imageData.url === 'string' && imageData.url.includes('http')) {
      return imageData.url;
    }
  }
  return null;
};

const hasValidImage = (imageData) => {
  return getValidImageUrl(imageData) !== null;
};

const ProviderDetails = () => {
  const { id: providerId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [provider, setProvider] = useState(null);
  const [menu, setMenu] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchProviderMenu();
    fetchAvailableCoupons();
  }, [providerId]);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await apiClient.get(`/student/provider-coupons/${providerId}`);
      setCoupons(response.data.data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  const fetchProviderMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/student/provider-menu/${providerId}`);
      const menus = response.data.data || [];
      if (menus.length > 0) {
        const latestMenu = menus[0];
        setMenu(latestMenu);
        if (latestMenu.providerProfile) {
          setProvider(latestMenu.providerProfile);
        } else if (response.data.provider) {
          setProvider(response.data.provider);
        }
      } else {
        setMenu(null);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err.response?.data?.message || 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessClick = () => {
    setShowPaymentModal(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-brand-dark flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.08] blur-[120px] pointer-events-none"></div>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl mb-4 shadow-glass-glow animate-spin">
          <span className="text-3xl">⏳</span>
        </div>
        <p className="text-brand-textMain font-bold">Retrieving menu details...</p>
        <p className="text-brand-textMuted text-xs mt-1">Sourcing fresh culinary rosters</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-dark text-brand-textMain font-sans overflow-hidden">
      {/* Dynamic culinary glow bubbles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.06] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-brand-secondary opacity-[0.04] blur-[120px] pointer-events-none"></div>

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
              🔍 Providers
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
        {/* Back Link */}
        <button
          onClick={() => navigate('/student/providers')}
          className="text-brand-textMuted hover:text-brand-primary mb-6 text-sm font-bold flex items-center gap-1.5 transition"
        >
          <span>←</span> Back to Kitchens
        </button>

        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* Kitchen Identity & Summary Header */}
        {provider && (
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-brand-border/40 shadow-glass mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    {provider.kitchenName}
                  </h1>
                  {provider.vegetarian && (
                    <span className="bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/35 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full shadow-glass backdrop-blur-md">
                      🌱 100% Veg Kitchen
                    </span>
                  )}
                </div>
                <p className="text-brand-textMuted text-sm font-semibold">
                  Kitchen Managed by: <span className="text-brand-textMain">{provider.ownerName || provider.owner}</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 mt-4 text-xs font-semibold text-brand-textMuted">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{provider.address || provider.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{provider.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:w-64">
                <button
                  onClick={handleAccessClick}
                  className="w-full py-3.5 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl transition duration-300 transform active:scale-[0.98] text-sm shadow-glass-glow flex items-center justify-center gap-1.5"
                >
                  <span>💳</span> Subscribe & Try Now
                </button>
                <p className="text-[10px] text-brand-textMuted font-bold text-center">
                  Check available coupons below for a free trial!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Available Coupons offering Section */}
        {coupons.length > 0 && (
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-brand-primary/20 shadow-glass mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2.5">
              <span className="text-brand-primary">🎟️</span> Kitchen Coupons & Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => {
                const discount = coupon.discountType === 'percent' 
                  ? `${coupon.discountValue}% OFF` 
                  : `₹${coupon.discountValue} OFF`;
                const isSelected = selectedCoupon?.code === coupon.code;
                
                return (
                  <button
                    key={coupon._id}
                    onClick={() => setSelectedCoupon(isSelected ? null : coupon)}
                    className={`p-5 rounded-2xl border transition duration-300 transform active:scale-[0.98] text-left relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-secondary bg-brand-secondary/15 shadow-glass-glow shadow-brand-secondary/10'
                        : 'border-brand-border/40 bg-brand-dark/20 hover:border-brand-primary/40 hover:bg-brand-dark/40'
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-brand-border/20">
                        <span className="font-mono font-bold text-lg text-brand-textMain uppercase tracking-wider">{coupon.code}</span>
                        <span className="text-lg font-black text-brand-primary">
                          {discount}
                        </span>
                      </div>
                      <p className="text-xs text-brand-textMuted font-semibold mb-1">
                        Free {coupon.validDays}-day test trial access
                      </p>
                      <p className="text-[10px] text-brand-textMuted/60 font-medium">
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="absolute bottom-3 right-3 text-xs bg-brand-secondary/20 text-brand-secondary font-bold px-2 py-0.5 rounded-lg border border-brand-secondary/35">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-brand-textMuted mt-4 flex items-center gap-1.5 font-semibold">
              <span>💡</span> Select a coupon card before subscribing to apply the active discount or free trial.
            </p>
          </div>
        )}

        {/* Food Gallery Section */}
        {menu && menu.images && menu.images.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🍽️</span> Gourmet Gallery
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Active Image */}
              <div className="lg:col-span-2 relative h-[380px] rounded-3xl overflow-hidden border border-brand-border/40 shadow-glass">
                <img
                  src={menu.images[selectedImageIdx]?.url || menu.images[selectedImageIdx]}
                  alt={`Kitchen dish representation`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails list */}
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 h-fit">
                {menu.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`h-20 lg:h-24 rounded-2xl overflow-hidden border-2 transition duration-300 transform active:scale-[0.97] ${
                      selectedImageIdx === idx
                        ? 'border-brand-primary shadow-glass-glow'
                        : 'border-brand-border/40 hover:border-brand-border'
                    }`}
                  >
                    <img
                      src={img?.url || img}
                      alt={`Menu thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Menu Display */}
        {menu && menu.menu ? (
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-brand-border/40 shadow-glass animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-brand-border/30 pb-4">
              <h2 className="text-2xl font-extrabold tracking-tight">
                📅 This Week's Culinary Menu
              </h2>
              <span className="text-xs bg-brand-dark/50 border border-brand-border px-3 py-1.5 rounded-xl font-bold text-brand-textMuted">
                Active: {new Date(menu.weekStart).toLocaleDateString()} - {new Date(menu.weekEnd).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (day) => {
                  const dayMenu = menu.menu?.[day];
                  return (
                    <div
                      key={day}
                      className="p-5 border border-brand-border/40 bg-brand-dark/20 hover:border-brand-primary/25 rounded-2xl transition duration-300 flex flex-col justify-between"
                    >
                      <h3 className="font-extrabold text-brand-textMain mb-4 text-base tracking-tight border-b border-brand-border/20 pb-2">
                        {day}
                      </h3>
                      <div className="space-y-4 flex-grow">
                        {dayMenu && (dayMenu.breakfast || dayMenu.lunch || dayMenu.dinner) ? (
                          <>
                            {dayMenu.breakfast && (
                              <div>
                                <p className="text-[10px] text-brand-primary uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1">
                                  <span>🌅</span> Breakfast
                                </p>
                                {hasValidImage(dayMenu.breakfast_image) && (
                                  <img
                                    src={getValidImageUrl(dayMenu.breakfast_image)}
                                    alt="Breakfast option"
                                    className="w-full h-24 object-cover rounded-xl my-2 border border-brand-border/30 shadow-glass"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                )}
                                <p className="text-xs font-semibold text-brand-textMain/90 leading-relaxed">
                                  {dayMenu.breakfast}
                                </p>
                              </div>
                            )}
                            {dayMenu.lunch && (
                              <div>
                                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1">
                                  <span>🍽️</span> Lunch
                                </p>
                                {hasValidImage(dayMenu.lunch_image) && (
                                  <img
                                    src={getValidImageUrl(dayMenu.lunch_image)}
                                    alt="Lunch option"
                                    className="w-full h-24 object-cover rounded-xl my-2 border border-brand-border/30 shadow-glass"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                )}
                                <p className="text-xs font-semibold text-brand-textMain/90 leading-relaxed">
                                  {dayMenu.lunch}
                                </p>
                              </div>
                            )}
                            {dayMenu.dinner && (
                              <div>
                                <p className="text-[10px] text-brand-accent uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1">
                                  <span>🥘</span> Dinner
                                </p>
                                {hasValidImage(dayMenu.dinner_image) && (
                                  <img
                                    src={getValidImageUrl(dayMenu.dinner_image)}
                                    alt="Dinner option"
                                    className="w-full h-24 object-cover rounded-xl my-2 border border-brand-border/30 shadow-glass"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                )}
                                <p className="text-xs font-semibold text-brand-textMain/90 leading-relaxed">
                                  {dayMenu.dinner}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-brand-textMuted/40 text-xs italic py-4">
                            No meals scheduled
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card border border-brand-border/40 rounded-3xl p-12 text-center">
            <p className="text-brand-textMain text-xl font-bold mb-2">
              📋 Menu is empty
            </p>
            <p className="text-brand-textMuted text-sm mb-6">
              This kitchen is currently compiling their premium meal schedule. Check back shortly!
            </p>
            <button
              onClick={handleAccessClick}
              className="px-8 py-3 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl transition duration-300 shadow-glass-glow"
            >
              Get Trial Access Anyway →
            </button>
          </div>
        )}
      </main>

      {/* Payment Checkout Modal Overlay */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={() => setShowPaymentModal(false)}
        providerId={providerId}
        menuId={menu?._id}
        selectedCoupon={selectedCoupon}
      />
    </div>
  );
};

export default ProviderDetails;
