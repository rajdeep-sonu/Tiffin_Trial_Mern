import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, providerId, menuId, selectedCoupon }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("1week");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // Auto-apply selected coupon when modal opens
  useEffect(() => {
    if (isOpen && selectedCoupon) {
      setCouponCode(selectedCoupon.code);
      setCouponApplied(true);
      // Calculate discount based on type
      if (selectedCoupon.discountType === 'percent') {
        setDiscount(selectedCoupon.discountValue);
      } else {
        setDiscount(selectedCoupon.discountValue);
      }
      setCouponError("");
    } else {
      // Reset when modal closes
      setCouponCode("");
      setCouponApplied(false);
      setDiscount(0);
    }
  }, [isOpen, selectedCoupon]);

  const plans = {
    "1week": {
      amount: 9.99,
      displayText: "7 Days Access",
      benefits: ["7 days of meal access", "View food images", "Place orders", "View all menus"],
    },
    "1month": {
      amount: 39.99,
      displayText: "30 Days Access",
      benefits: ["30 days of meal access", "View food images", "Place orders", "View all menus"],
    },
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setCouponError("");
      setCouponApplied(true);
      setDiscount(5);
    } catch (err) {
      setCouponError("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setDiscount(0);
    setCouponError("");
  };

  // Calculate trial days based on plan
  const getTrialDays = () => {
    return selectedPlan === "1week" ? 7 : 30;
  };

  const handlePayment = async () => {
    setError("");
    setShowScanner(true);
    setScanProgress(0);
    
    // Simulate scanner animation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  const handleConfirmPayment = async () => {
    if (!providerId || !menuId || !user) {
      setError("Missing required information (provider, menu, or user)");
      return;
    }

    setConfirmingPayment(true);
    setError("");

    try {
      console.log(`\n[DEBUG] ========== TRIAL/SUBSCRIPTION PAYMENT ==========`);
      console.log(`[DEBUG] Payment request details:`);
      console.log(`[DEBUG]   - providerId: ${providerId}`);
      console.log(`[DEBUG]   - providerIdType: ${typeof providerId}`);
      console.log(`[DEBUG]   - menuId: ${menuId}`);
      console.log(`[DEBUG]   - studentId: ${user._id}`);
      console.log(`[DEBUG]   - studentName: ${user.name}`);
      console.log(`[DEBUG]   - studentEmail: ${user.email}`);
      console.log(`[DEBUG]   - selectedPlan: ${selectedPlan}`);
      console.log(`[DEBUG]   - couponCode: ${couponCode || 'None'}`);
      
      const requestPayload = {
        providerId: providerId,
        menuId: menuId,
        couponCode: couponCode.trim() || null,
        planDuration: getTrialDays(),
      };
      
      console.log(`[DEBUG] About to POST to /student/trial/apply with:`, requestPayload);

      // Call the trial/apply endpoint using configured apiClient
      const response = await apiClient.post("/student/trial/apply", requestPayload);

      console.log(`[DEBUG] ✅ SUCCESS - Trial applied!`);
      console.log(`[DEBUG] Response:`, response.data);

      // Store trial info in localStorage for display on trials page
      if (response.data && response.data.data) {
        const trialData = response.data.data;
        localStorage.setItem("lastActivatedTrial", JSON.stringify({
          name: response.data.providerName || "Tiffin Trial",
          id: trialData._id,
          startDate: trialData.startDate,
          endDate: trialData.endDate,
          plan: selectedPlan,
          providerId: trialData.providerId,
        }));
      }

      console.log(`[DEBUG] ========== END TRIAL PAYMENT ==========\n`);

      // Success - close modal and redirect with success message
      setShowScanner(false);
      onClose();
      onPaymentSuccess?.();
      
      // Redirect to trials page with success notification
      setTimeout(() => {
        navigate("/student/trials", { 
          state: { 
            success: true,
            message: `🎉 ${response.data.message}` 
          }
        });
      }, 500);
    } catch (err) {
      console.error(`[ERROR] Payment failed:`, err);
      console.error(`[ERROR] Response:`, err.response?.data);
      setError(err.response?.data?.message || "Failed to activate trial. Please try again.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (!isOpen) return null;

  // If scanner is open, show it instead
  if (showScanner) {
    const isComplete = scanProgress >= 100;
    
    return (
      <div className="fixed inset-0 bg-brand-dark/95 flex items-center justify-center z-50 backdrop-blur-md overflow-y-auto p-4">
        {/* Decorative blur orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-brand-primary opacity-[0.05] blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-brand-accent opacity-[0.03] blur-[100px] pointer-events-none"></div>

        <style>{`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2); }
            50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.6), 0 0 60px rgba(245, 158, 11, 0.3); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .scanner-glow { animation: glow 2s ease-in-out infinite; }
          .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
          .float-animation { animation: float 3s ease-in-out infinite; }
        `}</style>
        
        <div className="relative max-w-md w-full glass-card rounded-3xl p-8 border border-brand-border/40 shadow-glass animate-slide-up text-center">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight mb-1 text-brand-textMain">
              💳 <span className="culinary-gradient-text">Processing Payment</span>
            </h2>
            <p className="text-brand-textMuted text-xs font-semibold">Secure transaction in progress</p>
          </div>

          {error && (
            <div className="bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl p-4 mb-6 text-xs text-left animate-fade-in">
              <div className="flex gap-2">
                <span>❌</span>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          {/* Enhanced QR Code Scanner with Animations */}
          <div className="mb-8 flex justify-center">
            <div className={`relative w-48 h-48 rounded-2xl overflow-hidden flex items-center justify-center scanner-glow transition-all duration-500 ${
              isComplete ? 'bg-emerald-500/5 border-4 border-emerald-500' : 'bg-brand-dark/60 border-4 border-brand-primary'
            }`}>
              {/* Background animated gradient */}
              <div className={`absolute inset-0 ${isComplete ? 'bg-emerald-500/10' : 'bg-brand-primary/10'}`}></div>
              
              {/* Pulse rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`absolute w-40 h-40 border-2 ${isComplete ? 'border-emerald-500/40' : 'border-brand-primary/40'} rounded-xl pulse-ring`}></div>
                <div className={`absolute w-48 h-48 border-2 ${isComplete ? 'border-emerald-500/20' : 'border-brand-primary/20'} rounded-2xl pulse-ring`} style={{animationDelay: '0.7s'}}></div>
              </div>

              {/* Animated scanning line */}
              <div
                className={`absolute w-full h-0.5 transition-all duration-300 ${
                  isComplete 
                    ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent' 
                    : 'bg-gradient-to-r from-transparent via-brand-primary to-transparent'
                }`}
                style={{
                  top: `${scanProgress}%`,
                  boxShadow: `0 0 15px ${isComplete ? '#10b981' : '#F59E0B'}`,
                  filter: `blur(1px)`,
                }}
              ></div>

              {/* QR Grid Pattern */}
              <svg className="w-40 h-40 relative z-10" viewBox="0 0 100 100" fill="none">
                {/* Corner markers */}
                <g className={isComplete ? 'text-emerald-400' : 'text-brand-primary'}>
                  <rect x="4" y="4" width="22" height="22" fill="currentColor" opacity="0.8" rx="2" />
                  <rect x="6" y="6" width="18" height="18" fill="#080C14" rx="1" />
                  <rect x="8" y="8" width="14" height="14" fill="currentColor" />
                  
                  <rect x="74" y="4" width="22" height="22" fill="currentColor" opacity="0.8" rx="2" />
                  <rect x="76" y="6" width="18" height="18" fill="#080C14" rx="1" />
                  <rect x="78" y="8" width="14" height="14" fill="currentColor" />
                  
                  <rect x="4" y="74" width="22" height="22" fill="currentColor" opacity="0.8" rx="2" />
                  <rect x="6" y="76" width="18" height="18" fill="#080C14" rx="1" />
                  <rect x="8" y="78" width="14" height="14" fill="currentColor" />
                </g>
                
                {/* Enhanced pattern grid */}
                <g className={isComplete ? 'text-emerald-500' : 'text-brand-primary/80'} opacity="0.6">
                  {[...Array(12)].map((_, i) =>
                    [...Array(12)].map((_, j) => (
                      ((i + j) % 2 === 0 || (i > 5 && j > 5)) && (
                        <circle
                          key={`${i}-${j}`}
                          cx={30 + i * 5}
                          cy={30 + j * 5}
                          r="1.5"
                          fill="currentColor"
                        />
                      )
                    ))
                  )}
                </g>
              </svg>

              {/* Center checkmark icon when complete */}
              {isComplete && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-emerald-500 text-white rounded-full p-3.5 float-animation shadow-glass-glow">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-brand-cardSolid/40 border border-brand-border/20 rounded-2xl p-5 mb-6">
            <p className="text-brand-textMuted text-xs font-semibold mb-1">Amount to be charged:</p>
            <p className="text-3xl font-extrabold text-brand-secondary">
              ${selectedPlan === "1week" ? "9.99" : "39.99"}
            </p>
            {couponApplied && (
              <p className="text-[11px] text-emerald-400 mt-2 font-bold flex items-center justify-center gap-1">
                <span>✅ Coupon applied - 5% discount included</span>
              </p>
            )}
          </div>

          {/* Status Progress */}
          <div className="bg-brand-dark/40 border border-brand-border/40 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className={`font-bold text-xs ${
                isComplete ? 'text-emerald-400' : 'text-brand-primary'
              }`}>
                {isComplete ? '🟢 Verified Complete' : '⏳ Scanning Network'}
              </p>
              <span className="text-xs font-mono font-bold text-brand-textMain">{scanProgress}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden border border-brand-border/20">
              <div 
                className={`h-full transition-all duration-300 ${
                  isComplete 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-brand-primary to-brand-accent'
                }`}
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setShowScanner(false);
                setScanProgress(0);
              }}
              disabled={confirmingPayment}
              className="py-2.5 bg-brand-card hover:bg-brand-border/45 border border-brand-border/60 text-brand-textMain font-bold rounded-xl text-xs transition duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={confirmingPayment || scanProgress < 100}
              className={`py-2.5 text-white font-bold rounded-xl text-xs transition duration-200 shadow-glass-glow flex items-center justify-center gap-1.5 ${
                isComplete
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-brand-primary/20 text-brand-textMuted border border-brand-primary/10 cursor-not-allowed'
              }`}
            >
              {confirmingPayment ? '⏳ Processing...' : isComplete ? '✅ Confirm' : 'Wait scanner...'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = plans[selectedPlan].amount;
  const finalPrice = couponApplied ? (currentPrice * (1 - discount / 100)).toFixed(2) : currentPrice;

  return (
    <div className="fixed inset-0 bg-brand-dark/95 flex items-center justify-center z-50 backdrop-blur-md overflow-y-auto p-4">
      {/* Decorative blur backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.05] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 rounded-full bg-brand-secondary opacity-[0.04] blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-xl w-full glass-card rounded-3xl p-8 border border-brand-border/40 shadow-glass animate-slide-up max-h-[90vh] overflow-y-auto">
        
        {/* Header section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl mb-3 shadow-glass-glow">
            <span className="text-2xl">💳</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-1 text-brand-textMain">
            Get <span className="culinary-gradient-text">Kitchen Meal Access</span>
          </h2>
          <p className="text-brand-textMuted text-xs font-semibold">Choose your plan and start accessing gourmet plates today!</p>
        </div>

        {error && (
          <div className="bg-brand-accent/10 border-l-4 border-brand-accent text-brand-textMain rounded-xl p-4 mb-6 text-xs animate-fade-in">
            <div className="flex gap-2">
              <span>❌</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* Plan Selection list */}
        <div className="space-y-3 mb-6">
          {Object.entries(plans).map(([key, plan]) => (
            <label
              key={key}
              className={`block p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedPlan === key
                  ? "border-brand-primary bg-brand-primary/5 text-brand-textMain shadow-glass-glow"
                  : "border-brand-border bg-brand-dark/20 text-brand-textMuted hover:border-brand-borderHover hover:text-brand-textMain"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="plan"
                  value={key}
                  checked={selectedPlan === key}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-4 h-4 mt-1 accent-brand-primary"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-extrabold text-sm flex items-center gap-2">
                      {key === "1week" ? "⏰" : "📅"} {plan.displayText}
                    </p>
                    <span className="text-brand-secondary font-black text-lg">${plan.amount}</span>
                  </div>
                  <ul className="text-[11px] text-brand-textMuted space-y-1 mt-1 border-t border-brand-border/10 pt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                    {plan.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-brand-secondary font-bold">✓</span>
                        <span className="font-medium truncate">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Coupon Code input drawer */}
        <div className="mb-6 p-5 bg-brand-cardSolid/45 border border-brand-border/30 rounded-2xl">
          <label className="block text-xs font-semibold text-brand-textMain/80 mb-3 flex items-center gap-1.5">
            🎟️ Apply Coupon Code
          </label>
          
          {couponApplied ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <span>✅</span> Applied code: <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded">{couponCode}</span>
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-brand-accent hover:underline font-bold"
                >
                  Remove Code
                </button>
              </div>
              <p className="text-[11px] text-brand-textMuted mt-1">
                🎉 Congratulations! {discount}% coupon savings applied successfully.
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                placeholder="PROMO CODE"
                className="flex-1 bg-brand-dark/40 px-4 py-2 border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-textMain placeholder-brand-textMuted/40 text-xs font-semibold uppercase tracking-wider"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="px-5 py-2 secondary-gradient hover:opacity-95 text-white font-bold rounded-xl text-xs transition duration-200 active:scale-[0.97]"
              >
                Apply
              </button>
            </div>
          )}
          
          {couponError && (
            <p className="text-brand-accent text-[11px] mt-2 font-semibold">⚠️ {couponError}</p>
          )}
        </div>

        {/* Price Breakdown Summary */}
        <div className="bg-brand-cardSolid/65 border border-brand-border rounded-2xl p-5 mb-6">
          <div className="flex justify-between mb-2 text-xs">
            <span className="text-brand-textMuted">Original Price:</span>
            <span className="font-bold text-brand-textMain">${currentPrice}</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between mb-2 text-xs text-emerald-400 font-bold">
              <span>Savings ({discount}%):</span>
              <span>-${(currentPrice * discount / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-brand-border/40">
            <span className="font-bold text-brand-textMain text-sm">Total Billing Price:</span>
            <span className="font-black text-xl text-brand-secondary">
              ${finalPrice}
            </span>
          </div>
        </div>

        {/* Footer actions buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="py-2.5 bg-brand-card hover:bg-brand-border/45 border border-brand-border/60 text-brand-textMain font-bold rounded-xl text-xs transition duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="py-2.5 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl text-xs transition duration-200 shadow-glass-glow flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <span className="animate-spin text-sm">⏳</span> Processing...
              </>
            ) : (
              <>
                <span>💳</span> Pay ${finalPrice}
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-brand-textMuted mt-5 text-center flex items-center justify-center gap-1.5 font-medium">
          🔒 Secure 256-Bit SSL Encrypted Payment Portal
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
