import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Browse Providers',
      description: 'Explore active kitchens and gourmet home cooks in your local area',
      icon: '🔍',
      action: () => navigate('/student/providers'),
      color: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      title: 'Active Trials Tracker',
      description: 'View active trials, inspect weekly menus, and submit ratings',
      icon: '⏱️',
      action: () => navigate('/student/trials'),
      color: 'from-yellow-500/10 to-amber-500/10',
    },
    {
      title: 'Subscribe Plan',
      description: 'Start monthly meal packages with provider custom pricing models',
      icon: '📋',
      action: () => navigate('/student/subscribe'),
      color: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      title: 'Manage Subscriptions',
      description: 'View active plans, halt/resume deliveries, and view logs',
      icon: '📦',
      action: () => navigate('/student/subscriptions'),
      color: 'from-purple-500/10 to-pink-500/10',
      highlight: true,
    },
  ];

  return (
    <div className="relative min-h-screen bg-brand-dark pb-16 overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.05] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 rounded-full bg-brand-secondary opacity-[0.04] blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center shadow-glass-glow">
              <span className="text-xl">🍱</span>
            </div>
            <div>
              <h1 className="text-xl font-bold culinary-gradient-text tracking-tight">TiffinTrial</h1>
              <p className="text-[10px] text-brand-textMuted font-semibold tracking-wider uppercase">Student Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right text-xs hidden md:block">
              <p className="text-brand-textMain font-bold">Hello, {user?.name}</p>
              <p className="text-brand-textMuted">🎓 Student Account</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-brand-accent hover:opacity-90 text-white font-bold rounded-xl text-xs transition active:scale-[0.97]"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textMain tracking-tight mb-4">
            Welcome to <span className="culinary-gradient-text">TiffinTrial</span>
          </h2>
          <p className="text-sm text-brand-textMuted leading-relaxed">
            Find home-cooked nutrition with flexible daily subscriptions. Test trial packages risk-free, review dish qualities, and freeze plans when out of town.
          </p>
        </div>

        {/* Dashboard Grid Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className={`group cursor-pointer glass-card rounded-2xl border border-brand-border/40 p-6 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 ${
                item.highlight ? 'ring-1 ring-brand-primary/20 bg-brand-primary/[0.02]' : ''
              }`}
            >
              <div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300 inline-block">{item.icon}</div>
                <h3 className="text-base font-bold text-brand-textMain mb-1.5 group-hover:text-brand-primary transition">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-textMuted leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-brand-border/10 flex justify-end">
                <span className="text-xs font-bold text-brand-primary group-hover:translate-x-1 transition duration-200">
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Informative Steps (How It Works) */}
        <div className="glass-card rounded-3xl border border-brand-border/40 p-8 shadow-glass mb-16">
          <h3 className="text-lg font-bold text-brand-textMain mb-2 flex items-center gap-2">
            <span>🚀</span> How TiffinTrial Protects Your Budget
          </h3>
          <p className="text-xs text-brand-textMuted mb-8 leading-relaxed">Four seamless steps to gourmet daily deliveries:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Find Kitchens', desc: 'Browse menus in your city.', icon: '🏪' },
              { step: '2', title: 'Risk-Free Trial', desc: 'Apply a trial coupon to test meals.', icon: '🎁' },
              { step: '3', title: 'Submit Reviews', desc: 'Rate meal experiences honestly.', icon: '📝' },
              { step: '4', title: 'Flexible SaaS', desc: 'Subscribe and pause plans on-the-go.', icon: '✨' }
            ].map((stepItem, idx) => (
              <div key={idx} className="bg-brand-cardSolid/40 border border-brand-border/20 rounded-2xl p-5 text-center relative">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary flex items-center justify-center font-bold text-xs mx-auto mb-3">
                  {stepItem.step}
                </div>
                <p className="text-2xl mb-1">{stepItem.icon}</p>
                <h4 className="text-xs font-bold text-brand-textMain mb-1">{stepItem.title}</h4>
                <p className="text-[11px] text-brand-textMuted leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-brand-cardSolid/50 border border-brand-border rounded-3xl p-8 text-center max-w-3xl mx-auto shadow-glass relative overflow-hidden">
          <h3 className="text-xl font-bold text-brand-textMain mb-2">Ready to discover culinary kitchen artisans?</h3>
          <p className="text-xs text-brand-textMuted mb-6 max-w-md mx-auto">Explore menus, check rating reviews, and get daily health-centric diets delivered to your doorstep.</p>
          <button
            onClick={() => navigate('/student/providers')}
            className="px-6 py-2.5 culinary-gradient text-white font-bold rounded-xl hover:opacity-95 transition shadow-glass-glow text-sm"
          >
            🔍 Start Exploring Kitchens
          </button>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
