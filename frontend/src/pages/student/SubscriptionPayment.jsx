import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import FakePaymentScanner from '../../components/FakePaymentScanner';

const SubscriptionPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Get subscription details from location state
  const subscription = location.state?.subscription || {};
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePayNow = () => {
    setError('');
    setShowScanner(true);
  };

  const handleScannerSuccess = async () => {
    setProcessing(true);
    setError('');
    setShowScanner(false);

    try {
      console.log('[DEBUG] ========== PAYMENT SUBMISSION ==========');
      console.log('[DEBUG] Received from location.state:', location.state);
      console.log('[DEBUG] Subscription object:', subscription);
      console.log('[DEBUG] Current user:', user);
      
      const requestPayload = {
        providerId: subscription.providerId,
        plan: subscription.plan,
        price: subscription.price,
        kitchenName: subscription.kitchenName,
      };
      
      console.log('[DEBUG] About to POST request with payload:', requestPayload);
      console.log('[DEBUG] providerId VALUE:', subscription.providerId);
      console.log('[DEBUG] providerId TYPE:', typeof subscription.providerId);
      console.log('[DEBUG] ========== END DEBUG ==========');

      // Create subscription after payment confirmation
      const response = await apiClient.post('/student/subscribe', requestPayload);

      console.log('[DEBUG] SUCCESS - Subscription created:', response.data);
      console.log('[DEBUG] Backend response subscription object:', response.data.subscription);

      setSuccessMsg('🎉 Payment successful! Subscription activated!');
      
      // Redirect to subscriptions page after 2 seconds
      setTimeout(() => {
        navigate('/student/subscriptions');
      }, 2000);
    } catch (err) {
      console.error('[ERROR] Payment failed:', err);
      console.error('[ERROR] Error response:', err.response?.data);
      setError(
        err.response?.data?.message ||
          'Failed to create subscription. Please try again.'
      );
      setShowScanner(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleScannerCancel = () => {
    setShowScanner(false);
  };

  const handleGoBack = () => {
    navigate('/student/subscribe');
  };

  const planDays = {
    '7days': 7,
    '30days': 30,
    '60days': 60,
    '90days': 90,
  }[subscription.plan] || 0;

  return (
    <div className="min-h-screen bg-brand-dark text-brand-textMain font-sans animate-fade-in pb-12">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="text-brand-textMuted hover:text-brand-primary font-bold flex items-center gap-2 transition hover:scale-105 active:scale-95 text-sm"
            >
              ← Back
            </button>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <span className="text-xl">💳</span>
            </div>
            <h1 className="text-2xl font-black culinary-gradient-text drop-shadow-md">Payment</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 animate-slide-up">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/30 text-brand-textMain rounded-xl shadow-md flex items-center gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-bold">Payment Error</p>
              <p className="text-sm text-brand-textMuted">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 bg-brand-secondary/10 border border-brand-secondary/30 text-brand-textMain rounded-xl shadow-md flex items-center gap-3 animate-pulse">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm text-brand-textMuted">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-8 border border-brand-border">
              <h2 className="text-2xl font-black text-brand-textMain mb-6 flex items-center gap-2">
                <span>📋</span> Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-5 mb-8">
                {/* Kitchen Name */}
                <div className="flex justify-between items-center pb-5 border-b border-brand-border">
                  <div>
                    <p className="text-brand-textMuted text-xs font-semibold uppercase tracking-wider">Provider</p>
                    <p className="text-lg font-bold text-brand-textMain mt-1">
                      {subscription.kitchenName || 'Kitchen'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-lg">👨‍🍳</div>
                </div>

                {/* Plan Details */}
                <div className="flex justify-between items-center pb-5 border-b border-brand-border">
                  <div>
                    <p className="text-brand-textMuted text-xs font-semibold uppercase tracking-wider">Meal Plan</p>
                    <p className="text-lg font-bold text-brand-textMain mt-1">
                      {subscription.plan?.replace('days', ' Days') || 'Plan'}
                    </p>
                    <p className="text-xs text-brand-textMuted mt-0.5">
                      {planDays} days of meal access
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-lg">🍽️</div>
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center pb-5 border-b border-brand-border">
                  <div>
                    <p className="text-brand-textMuted text-xs font-semibold uppercase tracking-wider">Base Price</p>
                    <p className="text-lg font-bold text-brand-textMain mt-1">
                      ₹{subscription.price || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-lg">💰</div>
                </div>

                {/* Discount (if any) */}
                {subscription.discount > 0 && (
                  <div className="flex justify-between items-center pb-4 pt-4 border-b border-brand-border bg-brand-secondary/5 px-4 rounded-xl border border-brand-secondary/10">
                    <div>
                      <p className="text-brand-secondary text-xs font-semibold uppercase tracking-wider">Discount</p>
                      <p className="text-lg font-bold text-brand-secondary mt-1">
                        -₹{subscription.discount}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-lg">🎉</div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-brand-secondary/5 rounded-2xl p-6 border border-brand-secondary/20">
                <div className="flex justify-between items-center">
                  <p className="text-brand-textMain font-bold text-base">TOTAL AMOUNT</p>
                  <div className="text-right">
                    <p className="text-3xl font-black text-brand-secondary">₹{subscription.price || 0}</p>
                    <p className="text-xs text-brand-textMuted mt-0.5">Including all taxes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-card rounded-3xl p-8 border border-brand-border">
              <h3 className="text-xl font-black text-brand-textMain mb-5 flex items-center gap-2">
                <span>💳</span> Payment Method
              </h3>
              
              <div className="bg-brand-primary/5 rounded-2xl border border-brand-primary/20 p-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <p className="font-bold text-brand-textMain">Fake Payment Gateway</p>
                    <p className="text-xs text-brand-textMuted">Demo payment environment (testing only)</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-brand-primary/10 border-l-4 border-brand-primary p-4 rounded-r-xl mb-6">
                <p className="text-xs text-brand-textMain leading-relaxed">
                  ℹ️ This is a simulated demo payment gateway. No actual monetary transactions occur. 
                  Clicking "Pay Now" will initialize the interactive mock scanner tool.
                </p>
              </div>

              {/* Pay Now Button */}
              <button
                onClick={handlePayNow}
                disabled={processing}
                className="w-full px-6 py-4 culinary-gradient text-white font-bold rounded-xl transition duration-200 hover:scale-[1.02] active:scale-95 text-lg shadow-lg hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? '⏳ Processing...' : '💳 Pay Now - ₹' + (subscription.price || 0)}
              </button>
            </div>
          </div>

          {/* Security & Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 sticky top-24 space-y-5 border border-brand-border">
              {/* Security Info */}
              <div className="bg-brand-secondary/5 border border-brand-secondary/15 rounded-2xl p-4">
                <p className="text-2xl mb-2">🔒</p>
                <p className="font-bold text-brand-textMain mb-1 text-sm">Secure Checkout</p>
                <p className="text-[11px] text-brand-textMuted leading-relaxed">
                  Your mock credentials and payment signals are fully protected
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-2xl p-4">
                <p className="text-2xl mb-2">✨</p>
                <p className="font-bold text-brand-textMain mb-2 text-sm">Subscription Benefits</p>
                <ul className="text-[11px] text-brand-textMuted space-y-1.5">
                  <li className="flex items-center gap-1.5">✓ <span className="text-brand-textMain font-semibold">{planDays} days</span> premium meals</li>
                  <li className="flex items-center gap-1.5">✓ Fresh hygienic kitchen prep</li>
                  <li className="flex items-center gap-1.5">✓ Rotating daily menu schedules</li>
                  <li className="flex items-center gap-1.5">✓ Easy cancel and swap options</li>
                </ul>
              </div>

              {/* Duration */}
              <div className="bg-brand-dark/40 border border-brand-border rounded-2xl p-4">
                <p className="text-2xl mb-2">📅</p>
                <p className="font-bold text-brand-textMain mb-1 text-sm">Validation Range</p>
                <p className="text-[11px] text-brand-textMuted">
                  Valid for exactly {planDays} consecutive calendar days upon activation.
                </p>
              </div>

              {/* Cancellation Info */}
              <div className="bg-brand-dark/20 border border-brand-border/40 rounded-2xl p-4">
                <p className="font-bold text-brand-textMain mb-1 text-xs">📋 Subscription Terms</p>
                <p className="text-[10px] text-brand-textMuted leading-relaxed">
                  Trial subscriptions are non-refundable. Contact kitchen hosts directly for scheduling holds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Scanner Modal */}
      {showScanner && (
        <FakePaymentScanner
          amount={subscription.price}
          onSuccess={handleScannerSuccess}
          onCancel={handleScannerCancel}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-12">
        <p className="mb-2">© 2024 TiffinTrial. All rights reserved.</p>
        <p className="text-gray-400 text-sm">Secure payment processing 🔒</p>
      </footer>
    </div>
  );
};

export default SubscriptionPayment;
