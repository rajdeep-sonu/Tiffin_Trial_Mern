import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      const user = response.user || response.data?.user;

      // Redirect based on role
      if (user?.role === 'student') {
        navigate('/student/dashboard');
      } else if (user?.role === 'provider') {
        navigate('/provider/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-brand-dark p-4 overflow-hidden">
      {/* Dynamic culinary glow bubbles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.08] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-brand-accent opacity-[0.06] blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-md w-full glass-card rounded-3xl p-8 border border-brand-border/40 shadow-glass animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl mb-4 shadow-glass-glow">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            <span className="culinary-gradient-text">TiffinTrial</span>
          </h1>
          <p className="text-brand-textMuted text-sm font-medium">Try gourmet meals before you subscribe</p>
        </div>

        {/* Login Form */}
        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl animate-fade-in text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-textMain/80 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-brand-dark/40 px-4 py-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-textMain placeholder-brand-textMuted/40 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-textMain/80 mb-2">
              🔐 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-brand-dark/40 px-4 py-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-textMain placeholder-brand-textMuted/40 text-sm"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 culinary-gradient hover:opacity-95 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition duration-300 transform active:scale-[0.98] disabled:cursor-not-allowed text-sm shadow-glass-glow flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">⏳</span> Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-brand-border"></div>
          <span className="text-xs text-brand-textMuted font-medium">New to TiffinTrial?</span>
          <div className="flex-1 h-[1px] bg-brand-border"></div>
        </div>

        {/* Register Link */}
        <div className="text-center mb-6">
          <p className="text-sm text-brand-textMuted">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary hover:text-brand-primary/80 font-bold hover:underline transition">
              Create one now
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="p-4 bg-brand-cardSolid/65 border border-brand-border rounded-2xl">
          <p className="font-bold text-brand-primary mb-3 flex items-center gap-2 text-sm">
            <span>💡</span> Quick Demo Credentials
          </p>
          <div className="space-y-3 text-xs text-brand-textMuted">
            <div>
              <p className="text-brand-textMain font-semibold">👨‍🎓 Student Account:</p>
              <p className="font-mono text-brand-primary/90">student@example.com / password123</p>
            </div>
            <div className="pt-1 border-t border-brand-border/40">
              <p className="text-brand-textMain font-semibold">🏢 Provider Account:</p>
              <p className="font-mono text-brand-primary/90">provider@example.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
