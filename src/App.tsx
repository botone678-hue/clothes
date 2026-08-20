import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, subscribeToEvent } from './lib/storage';
import { Service } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { NotificationToast } from './components/common/NotificationToast';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { BookPage } from './pages/BookPage';
import { TrackingPage } from './pages/TrackingPage';
import { CustomerOrders } from './pages/CustomerOrders';
import { CustomerAddresses } from './pages/CustomerAddresses';
import { DriverDashboard } from './pages/driver/DriverDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const MainAppContent: React.FC = () => {
  const { user, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [services, setServices] = useState<Service[]>([]);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);

  // Auth Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string; type?: 'info' | 'success' | 'alert' } | null>(null);

  const fetchServices = async () => {
    const list = await db.getServices();
    setServices(list);
  };

  useEffect(() => {
    fetchServices();

    // Listen to real-time notification events
    const unsubNotify = subscribeToEvent('notification', (payload) => {
      setToastMessage({
        title: payload.title || 'Clothes Spa Notification',
        body: payload.message || payload.body,
        type: payload.type || 'info',
      });
    });

    return () => {
      unsubNotify();
    };
  }, []);

  // When tracking an order from customer list or receipt
  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keep navigation smooth
  const handleSetTab = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render the appropriate main view based on currentTab
  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            services={services}
            setCurrentTab={handleSetTab}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        );
      case 'services':
        return <ServicesPage services={services} setCurrentTab={handleSetTab} />;
      case 'about':
        return <AboutPage setCurrentTab={handleSetTab} />;
      case 'contact':
        return <ContactPage />;
      case 'book':
        return (
          <BookPage
            services={services}
            setCurrentTab={handleSetTab}
            onViewOrder={handleTrackOrder}
          />
        );
      case 'tracking':
        return (
          <TrackingPage
            initialOrderId={trackingOrderId}
            setCurrentTab={handleSetTab}
          />
        );
      case 'orders':
      case 'customer-orders':
        return (
          <CustomerOrders
            setCurrentTab={handleSetTab}
            onTrackOrder={handleTrackOrder}
          />
        );
      case 'addresses':
      case 'customer-addresses':
        return <CustomerAddresses />;
      case 'driver':
      case 'driver-dashboard':
        return <DriverDashboard />;
      case 'admin':
      case 'admin-dashboard':
        return (
          <AdminDashboard
            services={services}
            onRefreshServices={fetchServices}
          />
        );
      case 'privacy':
        return <PrivacyPage setCurrentTab={handleSetTab} />;
      case 'terms':
        return <TermsPage setCurrentTab={handleSetTab} />;
      default:
        return <NotFoundPage setCurrentTab={handleSetTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white font-sans antialiased">
      {/* Real-time Push Toast */}
      {toastMessage && (
        <NotificationToast
          title={toastMessage.title}
          message={toastMessage.body}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Global Brand Footer */}
      <Footer setCurrentTab={handleSetTab} />

      {/* Login / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onForgotPassword={() => {
          setIsAuthModalOpen(false);
          setIsForgotPasswordOpen(true);
        }}
      />

      {/* Password Reset Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setIsForgotPasswordOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
