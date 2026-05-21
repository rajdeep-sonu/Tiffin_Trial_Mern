import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authRegister(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      setSuccessMsg('Registration successful! Redirecting...');

      // Redirect based on role
      setTimeout(() => {
        if (formData.role === 'student') {
          navigate('/student/dashboard');
        } else {
          navigate('/provider/dashboard');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-brand-dark p-4 overflow-hidden">
      {/* Dynamic culinary glow bubbles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-secondary opacity-[0.08] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-brand-primary opacity-[0.06] blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-lg w-full glass-card rounded-3xl p-8 border border-brand-border/40 shadow-glass animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-2xl mb-4 shadow-glass-glow">
            <span className="text-3xl">🍱</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            <span className="culinary-gradient-text">TiffinTrial</span>
          </h1>
          <p className="text-brand-textMuted text-sm font-medium">Join our daily premium gourmet community</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-5 p-4 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl animate-fade-in text-sm">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 bg-brand-secondary/10 border-l-4 border-brand-secondary text-brand-textMain rounded-xl text-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span className="font-medium">{successMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-brand-textMain/80 mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full bg-brand-dark/40 px-4 py-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-textMain placeholder-brand-textMuted/40 text-sm"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-brand-textMain/80 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="w-full bg-brand-dark/40 px-4 py-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-textMain placeholder-brand-textMuted/40 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-brand-textMain/80 mb-2">
                🔐 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password (6+ chars)"
                className="w-full bg-brand-dark/40 px-4 py-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-textMain placeholder-brand-textMuted/40 text-sm"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-brand-textMain/80 mb-2">
                🔒 Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
                className="w-full bg-brand-dark/40 px-4 py-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-textMain placeholder-brand-textMuted/40 text-sm"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-brand-textMain/80 mb-2">
              👥 I am a:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                formData.role === 'student'
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-textMain'
                  : 'border-brand-border bg-brand-dark/20 text-brand-textMuted hover:border-brand-borderHover hover:text-brand-textMain'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="w-4 h-4 accent-brand-primary"
                />
                <span className="ml-2 font-semibold text-xs">👨‍🎓 Student</span>
              </label>
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                formData.role === 'provider'
                  ? 'border-brand-secondary bg-brand-secondary/5 text-brand-textMain'
                  : 'border-brand-border bg-brand-dark/20 text-brand-textMuted hover:border-brand-borderHover hover:text-brand-textMain'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={formData.role === 'provider'}
                  onChange={handleChange}
                  className="w-4 h-4 accent-brand-secondary"
                />
                <span className="ml-2 font-semibold text-xs">🏢 Provider</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 secondary-gradient hover:opacity-95 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition duration-300 transform active:scale-[0.98] disabled:cursor-not-allowed text-sm shadow-glass-glow flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">⏳</span> Creating Account...
              </>
            ) : (
              'Register Now'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-brand-border"></div>
          <span className="text-xs text-brand-textMuted font-medium">Already have an account?</span>
          <div className="flex-1 h-[1px] bg-brand-border"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-brand-textMuted">
          Already a member?{' '}
          <Link to="/login" className="text-brand-secondary hover:text-brand-secondary/80 font-bold hover:underline transition">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
