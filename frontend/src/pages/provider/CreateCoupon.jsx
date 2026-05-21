import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CreateCoupon = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [menuError, setMenuError] = useState('');

  const [formData, setFormData] = useState({
    menuId: '',
    code: '',
    discountType: 'percent',
    discountValue: 10,
    validDays: 7,
    validUntil: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch menus on mount
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        console.log('Fetching weekly menus...');
        const response = await apiClient.get('/provider/menus');
        console.log('Menus fetched:', response.data);
        setMenus(response.data.data || []);
        
        // Auto-select current week's menu
        const today = new Date();
        const currentWeekMenu = response.data.data?.find(menu => {
          const weekStart = new Date(menu.weekStart);
          const weekEnd = new Date(menu.weekEnd);
          return today >= weekStart && today <= weekEnd;
        });
        
        if (currentWeekMenu) {
          setFormData(prev => ({
            ...prev,
            menuId: currentWeekMenu._id
          }));
          console.log('Auto-selected current week menu:', currentWeekMenu._id);
        }
        
        setLoadingMenus(false);
      } catch (err) {
        console.error('Error fetching menus:', err);
        setMenuError(err.response?.data?.message || 'Failed to load menus');
        setLoadingMenus(false);
      }
    };

    fetchMenus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!formData.menuId) {
        setError('❌ Please select a menu');
        setLoading(false);
        return;
      }
      if (!formData.code.trim()) {
        setError('❌ Coupon code is required');
        setLoading(false);
        return;
      }

      if (!formData.discountValue || formData.discountValue <= 0) {
        setError('❌ Discount value must be greater than 0');
        setLoading(false);
        return;
      }

      // Calculate expiry date as validUntil or validDays from now
      let expiryDate = formData.validUntil ? new Date(formData.validUntil) : null;
      if (!expiryDate && formData.validDays) {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(formData.validDays));
      }

      const data = {
        menuId: formData.menuId,
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        validDays: parseInt(formData.validDays) || 7,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
        expiryDate: expiryDate || new Date()
      };

      console.log('Submitting coupon:', data);
      const response = await apiClient.post('/provider/coupon', data);

      console.log('Coupon created:', response.data);
      setSuccessMsg('✅ ' + (response.data.message || 'Coupon created successfully!'));

      setFormData({
        menuId: '',
        code: '',
        discountType: 'percent',
        discountValue: 10,
        validDays: 7,
        validUntil: ''
      });

      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Coupon creation error:', err);
      setError('❌ ' + (err.response?.data?.message || 'Failed to create coupon. Please try again.'));
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
      <header className="glass-nav sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-brand-textMuted hover:text-brand-primary font-semibold flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-black culinary-gradient-text drop-shadow-md flex items-center gap-2">
            🎟️ Create Coupon
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 animate-slide-up">
        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/30 text-brand-textMain rounded-xl shadow-md flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-brand-secondary/10 border border-brand-secondary/30 text-brand-textMain rounded-xl shadow-md flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-black text-brand-textMain mb-2">🏪 Attract Students with Great Offers</h2>
              <p className="text-brand-textMuted mb-8 text-sm md:text-base">Create a discount coupon to bring more students to your tiffin service</p>

              {loadingMenus ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                  <p className="text-brand-textMuted">Loading your menus...</p>
                </div>
              ) : menuError ? (
                <div className="mb-6 p-6 bg-brand-primary/10 border border-brand-primary/30 text-brand-textMain rounded-2xl backdrop-blur">
                  <p className="font-bold mb-2">⚠️ No Menus Found</p>
                  <p className="text-sm mb-4 text-brand-textMuted">Create a weekly menu first before setting up coupons.</p>
                  <button
                    onClick={() => navigate('/provider/create-menu')}
                    className="px-6 py-2.5 culinary-gradient text-white font-bold rounded-xl transition hover:scale-105 active:scale-95 shadow-lg"
                  >
                    📋 Create Menu Now
                  </button>
                </div>
              ) : menus.length === 0 ? (
                <div className="mb-6 p-6 bg-brand-primary/10 border border-brand-primary/30 text-brand-textMain rounded-2xl backdrop-blur">
                  <p className="font-bold mb-2">⚠️ No Menus Found</p>
                  <p className="text-sm mb-4 text-brand-textMuted">You need at least one weekly menu before creating coupons.</p>
                  <button
                    onClick={() => navigate('/provider/create-menu')}
                    className="px-6 py-2.5 culinary-gradient text-white font-bold rounded-xl transition hover:scale-105 active:scale-95 shadow-lg"
                  >
                    📋 Create Menu Now
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Menu Selection - LARGE CARD GRID */}
                  <div>
                    <label className="block text-xl font-black text-brand-textMain mb-6">
                      📅 Select This Week's Menu *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {menus.map(menu => {
                        const weekStart = new Date(menu.weekStart);
                        const weekEnd = new Date(menu.weekEnd);
                        const today = new Date();
                        const isCurrentWeek = today >= weekStart && today <= weekEnd;
                        const isSelected = formData.menuId === menu._id;
                        
                        return (
                          <button
                            key={menu._id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, menuId: menu._id }))}
                            className={`group relative p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] ${
                              isSelected
                                ? 'bg-gradient-to-br from-brand-primary/20 to-brand-accent/15 border-brand-primary shadow-glass-glow'
                                : isCurrentWeek
                                ? 'bg-brand-dark/50 border-brand-primary/45 hover:bg-brand-dark/60'
                                : 'bg-brand-dark/30 border-brand-border hover:bg-brand-dark/40 hover:border-brand-borderHover'
                            }`}
                          >
                            {/* Selected Badge */}
                            {isSelected && (
                              <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-primary text-brand-dark rounded-full flex items-center justify-center font-black shadow-lg">
                                ✓
                              </div>
                            )}

                            {/* Current Week Badge */}
                            {isCurrentWeek && !isSelected && (
                              <div className="absolute -top-3 -right-3 px-3 py-1 bg-brand-secondary text-brand-dark text-xs font-black rounded-full shadow-lg">
                                THIS WEEK
                              </div>
                            )}

                            <div className="text-left">
                              <div className="text-4xl mb-3">📆</div>
                              <div className="mb-2">
                                <p className="text-brand-textMain font-black text-base md:text-lg">
                                  {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              <p className={`text-xs font-semibold ${isSelected ? 'text-brand-primary' : isCurrentWeek ? 'text-brand-primary/70' : 'text-brand-textMuted'}`}>
                                Click to select this menu
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="hidden"
                      name="menuId"
                      value={formData.menuId}
                      required
                    />
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-bold text-brand-textMain mb-3">
                      🔖 Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., WELCOME10 or TRIAL7"
                      maxLength="20"
                      className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border text-brand-textMain placeholder-brand-textMuted/40 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition backdrop-blur"
                    />
                    <p className="text-xs text-brand-textMuted mt-2">💡 Will be converted to uppercase</p>
                  </div>

                  {/* Discount Type & Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-brand-textMain mb-3">
                        💰 Discount Type *
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border text-brand-textMain rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition backdrop-blur"
                        required
                      >
                        <option value="percent" className="bg-brand-dark text-brand-textMain">Percentage (%)</option>
                        <option value="flat" className="bg-brand-dark text-brand-textMain">Flat Amount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-brand-textMain mb-3">
                        📊 Amount *
                      </label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        placeholder={formData.discountType === 'percent' ? '10' : '50'}
                        className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border text-brand-textMain placeholder-brand-textMuted/40 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition backdrop-blur"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* Duration & Expiry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-brand-textMain mb-3">
                        ⏱️ Trial Duration (Days) *
                      </label>
                      <input
                        type="number"
                        name="validDays"
                        value={formData.validDays}
                        onChange={handleChange}
                        placeholder="7"
                        className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border text-brand-textMain placeholder-brand-textMuted/40 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition backdrop-blur"
                        min="1"
                        max="90"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-brand-textMain mb-3">
                        📅 Valid Until (Optional)
                      </label>
                      <input
                        type="date"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border text-brand-textMain rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition backdrop-blur"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 px-6 py-4 culinary-gradient disabled:from-brand-border/40 disabled:to-brand-border/40 disabled:text-brand-textMuted text-white font-bold rounded-2xl transition transform hover:scale-[1.01] hover:shadow-glass-glow active:scale-95 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> Creating Coupon...
                      </span>
                    ) : (
                      '🎟️ Create Coupon'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 animate-fade-in">
              <div className="glass-card border border-brand-primary/40 rounded-3xl p-6 shadow-glass-glow transform hover:scale-[1.02] transition duration-300">
                <h3 className="text-lg font-black culinary-gradient-text mb-4 flex items-center gap-2">
                  👀 Preview
                </h3>
                
                <div className="bg-brand-dark/50 border border-brand-border rounded-2xl p-4 shadow-lg">
                  {/* Coupon Card */}
                  <div className="border-2 border-dashed border-brand-borderHover rounded-xl p-4 bg-brand-dark/30 text-center">
                    <p className="text-brand-textMuted text-xs font-semibold mb-2">COUPON CODE</p>
                    <p className="text-2xl font-black text-brand-textMain mb-3 font-mono tracking-wider">
                      {formData.code.toUpperCase() || 'CODE123'}
                    </p>
                    
                    <div className="culinary-gradient text-white rounded-xl py-3 mb-3 shadow">
                      <p className="text-xs">Save</p>
                      <p className="text-3xl font-black">
                        {formData.discountValue}{formData.discountType === 'percent' ? '%' : '₹'}
                      </p>
                    </div>
                    
                    <p className="text-sm text-brand-textMain font-semibold mb-2">
                      + {formData.validDays || 7} Days Trial Access
                    </p>
                    
                    {formData.validUntil && (
                      <p className="text-xs text-brand-textMuted border-t border-brand-border/60 pt-2 mt-2">
                        Valid until {new Date(formData.validUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-6 space-y-3">
                    <div className="bg-brand-dark/40 border border-brand-border p-3 rounded-xl">
                      <p className="text-xs text-brand-textMuted">Menu Period</p>
                      <p className="font-bold text-brand-textMain text-sm mt-0.5">
                        {formData.menuId ? '✓ Selected' : '○ Not selected'}
                      </p>
                    </div>
                    <div className="bg-brand-dark/40 border border-brand-border p-3 rounded-xl">
                      <p className="text-xs text-brand-textMuted">Offer Value</p>
                      <p className="font-bold text-brand-textMain text-sm mt-0.5">
                        {formData.discountType === 'percent' 
                          ? `${formData.discountValue}% OFF`
                          : `₹${formData.discountValue} OFF`}
                      </p>
                    </div>
                    <div className="bg-brand-dark/40 border border-brand-border p-3 rounded-xl">
                      <p className="text-xs text-brand-textMuted">Trial Days</p>
                      <p className="font-bold text-brand-textMain text-sm mt-0.5">{formData.validDays} Days</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-brand-textMuted mt-4 text-center">
                  This is how your coupon will appear to students 🎉
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCoupon;
