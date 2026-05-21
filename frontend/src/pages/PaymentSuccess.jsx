import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        
        if (!sessionId) {
          setStatus("error");
          setMessage("No session ID found");
          return;
        }

        const planType = localStorage.getItem("selectedPlan") || "1week";

        // Verify session with backend
        const response = await apiClient.post("/payment/verify-session", {
          sessionId,
          planType,
        });

        if (response.data.success) {
          setStatus("success");
          setMessage("✅ Payment successful! Your trial access has been activated.");
          localStorage.removeItem("selectedPlan");
          
          setTimeout(() => {
            navigate("/student/trials", {
              state: {
                success: true,
                message: "🎉 Your trial has been activated! Share your feedback after the trial ends."
              }
            });
          }, 3000);
        } else {
          setStatus("error");
          setMessage("Payment verification failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.error || "Payment verification failed. Please contact support."
        );
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-brand-dark p-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-primary opacity-[0.08] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-brand-secondary opacity-[0.06] blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-md w-full glass-card rounded-3xl p-8 border border-brand-border/40 shadow-glass animate-slide-up text-center">
        {status === "loading" && (
          <div className="py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl mb-6 shadow-glass-glow animate-pulse">
              <span className="text-3xl animate-spin">⏳</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-brand-textMain">
              Processing Payment
            </h1>
            <p className="text-brand-textMuted text-sm font-medium">
              Please wait while we verify your transaction status...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-secondary/15 border border-brand-secondary/35 rounded-2xl mb-6 shadow-glass animate-bounce text-5xl">
              ✨
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-brand-secondary">
              Payment Successful!
            </h1>
            <p className="text-brand-textMuted text-sm font-medium mb-6 px-2">
              {message}
            </p>
            <div className="bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl p-4 mb-6">
              <p className="text-xs text-brand-secondary font-bold flex items-center justify-center gap-2">
                <span>🔄</span> Redirecting to trials roster in 3s...
              </p>
            </div>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="w-full px-6 py-3.5 secondary-gradient hover:opacity-95 text-white font-bold rounded-xl transition duration-300 transform active:scale-[0.98] text-sm shadow-glass-glow"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-accent/15 border border-brand-accent/35 rounded-2xl mb-6 shadow-glass text-5xl">
              ⚠️
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-brand-accent">
              Payment Failed
            </h1>
            <p className="text-brand-textMuted text-sm font-medium mb-6 px-2">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/student/providers")}
                className="w-full px-6 py-3.5 culinary-gradient hover:opacity-95 text-white font-bold rounded-xl transition duration-300 transform active:scale-[0.98] text-sm shadow-glass-glow"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/student/dashboard")}
                className="w-full px-6 py-3.5 bg-brand-dark/50 hover:bg-brand-dark/80 text-brand-textMain border border-brand-border rounded-xl transition font-bold duration-300 transform active:scale-[0.98] text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
