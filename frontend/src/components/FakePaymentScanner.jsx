import { useState, useEffect } from 'react';

const FakePaymentScanner = ({ amount, onSuccess, onCancel }) => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    // Auto-start scanning when component loads
    setTimeout(() => {
      startScanning();
    }, 500);
  }, []);

  const startScanning = () => {
    setScanning(true);
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  const handleConfirm = () => {
    onSuccess();
  };

  const handleCancel = () => {
    setScanning(false);
    setScanProgress(0);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full border border-brand-border shadow-2xl relative overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">📱</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textMain mb-1">Payment Scanner</h2>
          <p className="text-xs text-brand-textMuted">Confirm your trial subscription payment</p>
        </div>

        {/* Amount */}
        <div className="bg-brand-secondary/5 rounded-2xl p-5 mb-6 border border-brand-secondary/20">
          <p className="text-brand-textMuted text-xs text-center font-bold mb-1 uppercase tracking-wider">Amount to Pay</p>
          <div className="text-4xl font-black culinary-gradient-text text-center">₹{amount}</div>
        </div>

        {/* Scanner Animation */}
        <div className="relative mb-6">
          <div className="bg-brand-dark/45 rounded-2xl p-6 border border-brand-border flex flex-col items-center justify-center min-h-[190px]">
            {/* Scanner Frame */}
            <div className="relative w-28 h-28 mb-4">
              {/* Animated Scanning Line */}
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-pulse"
                style={{
                  top: `${scanProgress}%`,
                  transition: 'top 0.3s ease-in',
                }}
              ></div>

              {/* Corner Markers */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-brand-primary rounded-tl-md"></div>
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-brand-primary rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-brand-primary rounded-bl-md"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-brand-primary rounded-br-md"></div>

              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                {scanning ? (
                  <div className="animate-spin">
                    <div className="w-12 h-12 border-2 border-brand-border border-t-brand-primary rounded-full"></div>
                  </div>
                ) : (
                  <span className="text-3xl text-brand-secondary font-black">✓</span>
                )}
              </div>
            </div>

            {/* Progress Text */}
            <p className="text-brand-textMuted text-xs font-bold text-center">
              {scanning ? `Analyzing... ${Math.round(scanProgress)}%` : 'Scan Complete!'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-brand-dark/60 rounded-full h-1.5 overflow-hidden border border-brand-border/40">
            <div
              className="bg-gradient-to-r from-brand-primary to-brand-accent h-full transition-all duration-300"
              style={{ width: `${Math.min(scanProgress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-brand-primary/10 border-l-4 border-brand-primary p-3 rounded-r-lg mb-6">
          <p className="text-[11px] text-brand-textMain leading-relaxed flex items-center gap-2">
            <span>ℹ️</span>
            {scanning
              ? 'Please wait while we verify authentication tokens...'
              : 'Signatures matched! Confirmation ready below.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={scanning}
            className="flex-1 px-4 py-3 culinary-gradient text-white font-bold rounded-xl transition duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover-glow"
          >
            {scanning ? '⏳ Processing...' : '✓ Confirm'}
          </button>
          <button
            onClick={handleCancel}
            disabled={scanning}
            className="flex-1 px-4 py-3 bg-brand-dark/50 hover:bg-brand-dark/80 text-brand-textMuted hover:text-brand-textMain font-bold rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-brand-border"
          >
            Cancel
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-5 text-center text-[10px] text-brand-textMuted/60">
          <p>🔒 Secured Mock Processing - Demo Mode</p>
        </div>
      </div>
    </div>
  );
};

export default FakePaymentScanner;
