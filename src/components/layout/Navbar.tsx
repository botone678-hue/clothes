import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, subscribeToEvent } from '../../lib/storage';
import { Notification, UserRole } from '../../types';
import {
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Truck,
  Package,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Database,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, role, signOut, switchUserRole, isSupabaseOnline } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (user) {
      const notifs = await db.getNotifications(user.id);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    }
  };

  useEffect(() => {
    loadNotifications();
    const unsub = subscribeToEvent('notifications', () => {
      loadNotifications();
    });
    return () => unsub();
  }, [user]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services & Pricing' },
    { id: 'book', label: 'Book Laundry', highlight: true },
    { id: 'tracking', label: 'Track Order' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-sky-800 via-indigo-900 to-sky-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sky-200">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Hawaii Area, Eldoret, Kenya
            </span>
            <span className="hidden sm:inline-block text-slate-400">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-200">
              Mon-Sat: 7AM - 8PM | Sun: 9AM - 6PM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:0741775878"
              className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              0741775878
            </a>

            {/* Quick Role Tester Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-[11px]">
              <span className="text-white/70">Role:</span>
              {(['customer', 'driver', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchUserRole(r)}
                  className={`px-2 py-0.5 rounded-full capitalize font-semibold transition ${
                    role === r
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Clothes Spa
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-md uppercase tracking-wider">
                  Laundry
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Garment Care • Eldoret
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => setCurrentTab(link.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === link.id
                    ? 'bg-sky-50 text-sky-700 font-bold shadow-xs'
                    : link.highlight
                    ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Portal Direct Shortcut Links */}
            {role === 'admin' && (
              <button
                id="nav-admin-btn"
                onClick={() => setCurrentTab('admin-dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentTab.startsWith('admin')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Operations
              </button>
            )}

            {role === 'driver' && (
              <button
                id="nav-driver-btn"
                onClick={() => setCurrentTab('driver-dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentTab.startsWith('driver')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Truck className="w-4 h-4" />
                Driver Dispatch
              </button>
            )}

            {role === 'customer' && (
              <button
                id="nav-customer-orders-btn"
                onClick={() => setCurrentTab('customer-orders')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentTab === 'customer-orders'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                My Orders
              </button>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-fade-in">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                    <span className="text-xs text-sky-600 font-medium">{notifications.length} updates</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No new notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-50 transition ${!n.read ? 'bg-sky-50/50' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-sky-100 text-sky-800">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === 'customer' && (
                        <>
                          <button
                            onClick={() => {
                              setCurrentTab('customer-orders');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Package className="w-4 h-4 text-slate-400" />
                            My Laundry Orders
                          </button>
                          <button
                            onClick={() => {
                              setCurrentTab('customer-addresses');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-slate-400" />
                            Saved Addresses
                          </button>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setCurrentTab('admin-dashboard');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          Admin Management
                        </button>
                      )}

                      {user.role === 'driver' && (
                        <button
                          onClick={() => {
                            setCurrentTab('driver-dashboard');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Truck className="w-4 h-4 text-emerald-500" />
                          Driver Jobs Queue
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-trigger-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-xl">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  currentTab === link.id
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">
              Role Portals
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  switchUserRole('customer');
                  setCurrentTab('customer-orders');
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 text-center text-xs font-bold bg-sky-50 text-sky-700 rounded-xl"
              >
                Customer
              </button>
              <button
                onClick={() => {
                  switchUserRole('driver');
                  setCurrentTab('driver-dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 text-center text-xs font-bold bg-emerald-50 text-emerald-700 rounded-xl"
              >
                Driver
              </button>
              <button
                onClick={() => {
                  switchUserRole('admin');
                  setCurrentTab('admin-dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 text-center text-xs font-bold bg-indigo-50 text-indigo-700 rounded-xl"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
