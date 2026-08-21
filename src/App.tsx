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
import { SignupPage } from './pages/SignupPage';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [services, setServices] = useState<Service[]>([]);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string; type?: 'info' | 'success' | 'alert' } | null>(null);

  const fetchServices = async () => setServices(await db.getServices());

  useEffect(() => {
    fetchServices();
    const unsub = subscribeToEvent('notification', (payload) => setToastMessage({
      title: payload.title || 'Clothes Spa Notification',
      body: payload.message || payload.body,
      type: payload.type || 'info',
    }));
    return () => unsub();
  }, []);

  const openAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSetTab = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    handleSetTab('tracking');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <HomePage services={services} setCurrentTab={handleSetTab} onOpenAuth={() => openAuth('signin')} />;
      case 'signup': return <SignupPage setCurrentTab={handleSetTab} />;
      case 'services': return <ServicesPage services={services} setCurrentTab={handleSetTab} />;
      case 'about': return <AboutPage setCurrentTab={handleSetTab} />;
      case 'contact': return <ContactPage />;
      case 'book': return <BookPage services={services} setCurrentTab={handleSetTab} onViewOrder={handleTrackOrder} />;
      case 'tracking': return <TrackingPage initialOrderId={trackingOrderId} setCurrentTab={handleSetTab} />;
      case 'orders':
      case 'customer-orders': return <CustomerOrders setCurrentTab={handleSetTab} onTrackOrder={handleTrackOrder} />;
      case 'addresses':
      case 'customer-addresses': return <CustomerAddresses />;
      case 'driver':
      case 'driver-dashboard': return <DriverDashboard />;
      case 'admin':
      case 'admin-dashboard': return <AdminDashboard services={services} onRefreshServices={fetchServices} />;
      case 'privacy': return <PrivacyPage setCurrentTab={handleSetTab} />;
      case 'terms': return <TermsPage setCurrentTab={handleSetTab} />;
      default: return <NotFoundPage setCurrentTab={handleSetTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white font-sans antialiased">
      {toastMessage && <NotificationToast title={toastMessage.title} message={toastMessage.body} type={toastMessage.type} onClose={() => setToastMessage(null)} />}
      <Navbar currentTab={currentTab} setCurrentTab={handleSetTab} onOpenAuth={() => openAuth('signin')} />
      {!user && currentTab !== 'signup' && (
        <div className="bg-white border-b border-slate-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-500">New to Clothes Spa?</span>
            <button id="public-signup-trigger" type="button" onClick={() => handleSetTab('signup')} className="font-bold text-sky-700 hover:text-sky-800 underline underline-offset-2">Create an Account</button>
          </div>
        </div>
      )}
      <main className="flex-1">{renderContent()}</main>
      <Footer setCurrentTab={handleSetTab} />
      <AuthModal isOpen={isAuthModalOpen} initialMode={authMode} onClose={() => setIsAuthModalOpen(false)} onOpenForgot={() => { setIsAuthModalOpen(false); setIsForgotPasswordOpen(true); }} />
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} onBackToLogin={() => { setIsForgotPasswordOpen(false); openAuth('signin'); }} />
    </div>
  );
};

export default function App() {
  return <AuthProvider><MainAppContent /></AuthProvider>;
}
