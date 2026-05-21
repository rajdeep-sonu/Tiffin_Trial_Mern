import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import Providers from './pages/student/Providers';
import ProviderDetails from './pages/student/ProviderDetails';
import TrialStatus from './pages/student/TrialStatus';
import Subscribe from './pages/student/Subscribe';
import SubscriptionPayment from './pages/student/SubscriptionPayment';
import ActiveSubscriptions from './pages/student/ActiveSubscriptions';
import PaymentSuccess from './pages/PaymentSuccess';

// Provider pages
import ProviderProfile from './pages/provider/ProviderProfile';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import CreateMenu from './pages/provider/CreateMenu';
import CreateCoupon from './pages/provider/CreateCoupon';
import SetSubscriptionPricing from './pages/provider/SetSubscriptionPricing';
import ProviderSubscriptions from './pages/provider/ProviderSubscriptions';
import ProviderTrials from './pages/provider/ProviderTrials';
import ProviderReviews from './pages/provider/ProviderReviews';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/providers"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Providers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/provider/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ProviderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/trials"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TrialStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subscribe"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Subscribe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subscription-payment"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SubscriptionPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ActiveSubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

        {/* Provider Routes */}
        <Route
          path="/provider/profile"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/create-menu"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <CreateMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/create-coupon"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <CreateCoupon />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/subscription-pricing"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <SetSubscriptionPricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderSubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/trials"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderTrials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/reviews"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderReviews />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
