import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    kitchenName: '',
    ownerName: '',
    city: '',
    address: '',
    phone: '',
    vegOnly: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation with specific messages
      console.log('Form data:', formData);
      
      const kitchenNameTrimmed = formData.kitchenName.trim();
      const ownerNameTrimmed = formData.ownerName.trim();
      const cityTrimmed = formData.city.trim();
      const addressTrimmed = formData.address.trim();
      const phoneTrimmed = formData.phone.trim();
      
      console.log('Validation check:');
      console.log('- kitchenName:', kitchenNameTrimmed, 'valid:', !!kitchenNameTrimmed);
      console.log('- ownerName:', ownerNameTrimmed, 'valid:', !!ownerNameTrimmed);
      console.log('- city:', cityTrimmed, 'valid:', !!cityTrimmed);
      console.log('- address:', addressTrimmed, 'valid:', !!addressTrimmed);
      console.log('- phone:', phoneTrimmed, 'valid:', !!phoneTrimmed);
      
      if (!kitchenNameTrimmed) {
        setError('❌ Kitchen/Provider Name is required');
        setLoading(false);
        return;
      }
      if (!ownerNameTrimmed) {
        setError('❌ Owner Name is required');
        setLoading(false);
        return;
      }
      if (!cityTrimmed) {
        setError('❌ City is required');
        setLoading(false);
        return;
      }
      if (!addressTrimmed) {
        setError('❌ Address is required');
        setLoading(false);
        return;
      }
      if (!phoneTrimmed) {
        setError('❌ Phone Number is required');
        setLoading(false);
        return;
      }

      console.log('Submitting provider profile:', {
        kitchenName: kitchenNameTrimmed,
        ownerName: ownerNameTrimmed,
        city: cityTrimmed,
        address: addressTrimmed,
        phone: phoneTrimmed,
        vegOnly: formData.vegOnly,
      });
      
      const response = await apiClient.post('/provider/profile', {
        kitchenName: kitchenNameTrimmed,
        ownerName: ownerNameTrimmed,
        city: cityTrimmed,
        address: addressTrimmed,
        phone: phoneTrimmed,
        vegOnly: formData.vegOnly,
      });
      
      console.log('Profile created:', response.data);
      setSuccess('✅ Provider profile created successfully!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Profile creation error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to create profile';
      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-textMain font-sans animate-fade-in py-12 px-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-accent/5 rounded-full -ml-36 -mb-36 blur-3xl pointer-events-none"></div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-dark/40 border border-brand-border rounded-full mb-4 shadow-glass-glow">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-4xl font-black text-brand-textMain mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 animate-slide-up">
            Setup Your Kitchen Profile
          </h1>
          <p className="text-lg text-brand-textMuted">Tell us about your tiffin service and start serving students</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-brand-dark/60 border-b border-brand-border px-8 py-8 backdrop-blur-md">
            <h2 className="text-2xl font-black text-brand-textMain">📋 Business Information</h2>
            <p className="text-brand-textMuted text-sm mt-1">Complete these details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain px-6 py-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="bg-brand-secondary/10 border-l-4 border-brand-secondary text-brand-textMain px-6 py-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Provider Name */}
            <div>
              <label className="block text-sm font-bold text-brand-textMain mb-2.5">
                🍽️ Kitchen/Provider Name *
              </label>
              <input
                type="text"
                name="kitchenName"
                value={formData.kitchenName}
                onChange={handleChange}
                placeholder="e.g., Home Cooked Delights"
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-5 py-3 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
                required
              />
              <p className="text-xs text-brand-textMuted mt-1.5">Students will see this as your business name</p>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-bold text-brand-textMain mb-2.5">
                👤 Owner Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-5 py-3 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-brand-textMain mb-2.5">
                📍 Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Main Street, Apartment 4B"
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-5 py-3 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
                required
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-bold text-brand-textMain mb-2.5">
                🏙️ City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Bangalore, Mumbai, Delhi"
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-5 py-3 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-brand-textMain mb-2.5">
                📱 Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your contact number"
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-5 py-3 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
                required
              />
            </div>

            {/* Veg Only Checkbox */}
            <div className="flex items-center bg-brand-secondary/10 p-4 rounded-xl border border-brand-secondary/30">
              <input
                type="checkbox"
                id="vegOnly"
                name="vegOnly"
                checked={formData.vegOnly}
                onChange={handleChange}
                className="h-5 w-5 text-brand-secondary focus:ring-brand-secondary border-brand-border bg-brand-dark rounded cursor-pointer"
              />
              <label htmlFor="vegOnly" className="ml-3 text-sm font-bold text-brand-textMain cursor-pointer select-none">
                🥬 Vegetarian only meals
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full culinary-gradient disabled:from-brand-border/40 disabled:to-brand-border/40 disabled:text-brand-textMuted text-white font-bold py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-glass-glow hover:scale-[1.01] active:scale-95"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Creating Profile...
                </>
              ) : (
                <>
                  <span>✅</span>
                  Create Provider Profile
                </>
              )}
            </button>

            {/* Help Text */}
            <p className="text-center text-sm font-semibold bg-brand-primary/10 border-l-4 border-brand-primary text-brand-textMain p-4 rounded-r-xl border border-y-brand-border border-r-brand-border mt-6">
              🚀 After creating your profile, you'll be able to upload weekly menus and manage your business!
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
