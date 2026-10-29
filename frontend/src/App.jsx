import React, { useState } from 'react';
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

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialCalculatorConfig, setInitialCalculatorConfig] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [testModalOpen, setTestModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // Navigate helper
  const handleNavigate = (tab, targetId = null) => {
    setCurrentTab(tab);
    if (targetId) {
      setSelectedOrderId(targetId);
    }
  };

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
        setCurrentTab={setCurrentTab} 
        onOpenTestModal={() => setTestModalOpen(true)}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {/* Customer Views */}
        {!isAdmin && (
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
        )}

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
