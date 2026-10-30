import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import NotificationCenterDrawer from './components/NotificationCenterDrawer';
import VerificationSuiteModal from './components/VerificationSuiteModal';

// Customer Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import OrderCheckoutPage from './pages/OrderCheckoutPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import CustomerRequestsPage from './pages/CustomerRequestsPage';
import CustomerPreferencesPage from './pages/CustomerPreferencesPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminAnnouncementsPage from './pages/AdminAnnouncementsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminServicesPage from './pages/AdminServicesPage';


function AuthenticationScreen({
  mode,
  onSuccess,
  onChangeMode
}) {

  const { login, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    let result;

    if (isRegister) {

      result = await register({
        name,
        email,
        password
      });

    } else {

      result = await login(email, password);

    }

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed');
      return;
    }

    onSuccess(result.user);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 bg-slate-100">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {isRegister ? 'Create Customer Account' : 'Sign In'}
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          Sri Ramu Digital
        </p>

        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border rounded-lg p-3 mb-4"
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg p-3 mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border rounded-lg p-3 mb-4"
        />

        {error && (
          <p className="text-sm text-red-600 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold p-3 rounded-lg disabled:opacity-50"
        >
          {loading
            ? 'Please wait...'
            : isRegister
              ? 'Create Account'
              : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => onChangeMode(
            isRegister ? 'login' : 'register'
          )}
          className="w-full mt-4 text-sky-600 text-sm font-medium"
        >
          {isRegister
            ? 'Already have an account? Sign in'
            : 'New customer? Create account'}
        </button>

      </form>

    </div>
  );
}
function AppContent() {
  const {
  user,
  authLoading,
  authExpired
} = useAuth();
  const [currentTab, setCurrentTab] = useState('home');

const [selectedProduct, setSelectedProduct] = useState(null);
const [initialCalculatorConfig, setInitialCalculatorConfig] = useState(null);
const [selectedOrderId, setSelectedOrderId] = useState(null);
const [testModalOpen, setTestModalOpen] = useState(false);

const [authMode, setAuthMode] = useState('login');
const [pendingTab, setPendingTab] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

const ADMIN_TABS = [
  'admin-dashboard',
  'admin-orders',
  'admin-payments',
  'admin-requests',
  'admin-services',
  'admin-announcements',
  'admin-analytics',
  'admin-settings',
  'admin-notifications'
];

const CUSTOMER_PRIVATE_TABS = [
  'checkout',
  'orders',
  'requests',
  'preferences'
];

// Protected navigation
const handleNavigate = (tab, targetId = null) => {

  // Admin-only pages
  if (ADMIN_TABS.includes(tab) && !isAdmin) {
    setCurrentTab(user ? 'home' : 'login');
    return;
  }

  // Customer private pages require login
  if (CUSTOMER_PRIVATE_TABS.includes(tab) && !user) {

    setPendingTab(tab);
    setAuthMode('login');
    setCurrentTab('login');

    return;
  }

  setCurrentTab(tab);

  if (targetId) {
    setSelectedOrderId(targetId);
  }
};
 useEffect(() => {

  if (!authLoading && authExpired) {
    setAuthMode('login');
    setCurrentTab('login');
  }

}, [authLoading, authExpired]); 

  const handleOrderProduct = (product) => {
    setSelectedProduct(product);
    setInitialCalculatorConfig(null);
    setCurrentTab('checkout');
  };

  const handleSelectCalculatorConfig = (config) => {
    setInitialCalculatorConfig(config);
    setSelectedProduct(null);
    setCurrentTab('checkout');
  };

  const handleOrderSuccess = (order) => {
    setSelectedOrderId(order.orderId);
    setCurrentTab('orders');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
  currentTab={currentTab}
  setCurrentTab={handleNavigate}
  onOpenTestModal={() => setTestModalOpen(true)}
  onAuthNavigate={(mode) => {
    setAuthMode(mode);
    setCurrentTab(mode);
  }}
/>

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {authLoading ? (
  <div className="min-h-[60vh] flex items-center justify-center">
    <p className="text-slate-600 font-semibold">
      Validating your session...
    </p>
  </div>
) : (
  <>
    {currentTab === 'login' && (
      <AuthenticationScreen
        mode="login"
        onSuccess={(loggedUser) => {
          setCurrentTab(
            loggedUser.role === 'ADMIN'
              ? 'admin-dashboard'
              : pendingTab || 'orders'
          );
          setPendingTab(null);
        }}
        onChangeMode={setAuthMode}
      />
    )}

    {currentTab === 'register' && (
      <AuthenticationScreen
        mode="register"
        onSuccess={(registeredUser) => {
          setCurrentTab('orders');
          setPendingTab(null);
        }}
        onChangeMode={setAuthMode}
      />
    )}
  </>
)}
        {/* Customer Views */}
        {
          <>
            {currentTab === 'home' && (
              <HomePage 
                onNavigate={handleNavigate} 
                onSelectConfig={handleSelectCalculatorConfig}
              />
            )}
            {currentTab === 'products' && (
              <ProductsPage onOrderProduct={handleOrderProduct} />
            )}
            {currentTab === 'calculator' && (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <HomePage onNavigate={handleNavigate} onSelectConfig={handleSelectCalculatorConfig} />
              </div>
            )}
            {currentTab === 'checkout' && (
              <OrderCheckoutPage
                selectedProduct={selectedProduct}
                initialConfig={initialCalculatorConfig}
                onOrderSuccess={handleOrderSuccess}
                onCancel={() => setCurrentTab('products')}
              />
            )}
            {currentTab === 'orders' && (
              <CustomerOrdersPage 
                selectedOrderId={selectedOrderId}
                onClearSelectedOrder={() => setSelectedOrderId(null)}
              />
            )}
            {currentTab === 'requests' && (
              <CustomerRequestsPage />
            )}
            {currentTab === 'preferences' && (
              <CustomerPreferencesPage />
            )}
          </>
        }

        {/* Admin Views */}
        {isAdmin && (
          <>
            {currentTab === 'admin-dashboard' && (
              <AdminDashboardPage 
                onNavigate={handleNavigate}
                onOpenTestModal={() => setTestModalOpen(true)}
              />
            )}
            {currentTab === 'admin-orders' && (
              <AdminOrdersPage />
            )}
            {currentTab === 'admin-payments' && (
              <AdminPaymentsPage />
            )}
            {currentTab === 'admin-requests' && (
              <AdminRequestsPage />
            )}
            {currentTab === 'admin-services' && (
              <AdminServicesPage />
            )}
            {currentTab === 'admin-announcements' && (
              <AdminAnnouncementsPage />
            )}
            {currentTab === 'admin-analytics' && (
              <AdminAnalyticsPage />
            )}
            {currentTab === 'admin-settings' && (
              <AdminSettingsPage />
            )}
            {currentTab === 'admin-notifications' && (
              <AdminDashboardPage 
                onNavigate={handleNavigate}
                onOpenTestModal={() => setTestModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Notification Center Slide-over Drawer */}
      <NotificationCenterDrawer onNavigate={handleNavigate} />

      {/* 20-Scenario Interactive Verification Suite Modal */}
      <VerificationSuiteModal 
        isOpen={testModalOpen} 
        onClose={() => setTestModalOpen(false)} 
      />

      {/* Persistent Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="font-extrabold text-white">Sri Ramu Digital — Flex &amp; Offset Printing</span>
            <p className="mt-1">Commercial Flex Banners • Star Backlit Lightboards • 350 GSM Visiting Cards • Heidelberg Offset Press</p>
          </div>
          <div className="text-right">
            <div>Centralized Multi-Channel Real-Time Notification &amp; Communication Pipeline</div>
            <p className="mt-0.5 text-slate-500">Channels: In-App Center • Web Push (VAPID) • Brevo Transactional Email • Admin Sound Alerts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
