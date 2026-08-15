import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Leaf,
  LayoutDashboard,
  ScanLine,
  History,
  GitCompareArrows,
  Dumbbell,
  Search,
  User,
  Shield,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  SlidersHorizontal,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scan Food', icon: ScanLine },
  { to: '/history', label: 'Scan History', icon: History },
  { to: '/compare', label: 'Compare', icon: GitCompareArrows },
  { to: '/tracker', label: 'Daily Tracker', icon: Dumbbell },
  { to: '/search', label: 'Search', icon: Search },

  // ⭐ NEW
  {
    to: '/personalization',
    label: 'Personalization',
    icon: SlidersHorizontal,
  },
];

export default function AppLayout() {
  const { profile, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (to: string) => location.pathname === to;

  const navLinkClass = (to: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
      isActive(to)
        ? 'bg-primary-500 text-white shadow-emerald'
        : 'text-slate-600 hover:bg-primary-50'
    }`;

  return (
    <div className="min-h-screen bg-botanical">

      {/* Decorative blobs */}
      <div className="bg-blob bg-primary-200/30 w-96 h-96 -top-20 -right-20 animate-float-blob" />

      <div
        className="bg-blob bg-mint-200/20 w-80 h-80 bottom-20 left-20 animate-float-blob"
        style={{ animationDelay: '2s' }}
      />

      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col p-4 bg-white/80 backdrop-blur-xl border-r border-primary-100 z-30">

        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-emerald">
            <Leaf className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="font-display font-bold gradient-text leading-tight">
              NutriScan
            </h1>

            <p className="text-xs text-slate-500">
              AI Food Analyzer
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-1 flex-1">

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() => navLinkClass(item.to)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={() => navLinkClass('/admin')}
            >
              <Shield className="h-5 w-5" />
              <span>Admin Panel</span>
            </NavLink>
          )}

        </nav>

        {/* Bottom Sidebar */}
        <div className="border-t border-slate-200 pt-3 flex flex-col gap-1">

          <NavLink
            to="/profile"
            className={() => navLinkClass('/profile')}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </NavLink>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-primary-50 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}

            <span>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-danger-600 hover:bg-danger-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>

        </div>
      </aside>


      {/* ================= MOBILE TOP BAR ================= */}

      <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-primary-100 px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="h-9 w-9 rounded-lg bg-primary-500 flex items-center justify-center shadow-emerald">
            <Leaf className="h-5 w-5 text-white" />
          </div>

          <h1 className="font-display font-bold gradient-text">
            NutriScan
          </h1>

        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-primary-50 text-slate-600"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-primary-50 text-slate-600"
          >
            <Menu className="h-5 w-5" />
          </button>

        </div>
      </header>


      {/* ================= MOBILE DRAWER ================= */}

      <AnimatePresence>
        {mobileOpen && (
          <>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 200,
              }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col p-4 shadow-2xl"
            >

              {/* Drawer Header */}
              <div className="flex items-center justify-between px-2 py-4">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-emerald">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>

                  <h1 className="font-display font-bold gradient-text">
                    NutriScan
                  </h1>

                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-primary-50"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>

              </div>


              {/* Drawer Navigation */}
              <nav
                className="mt-4 flex flex-col gap-1 flex-1"
                onClick={() => setMobileOpen(false)}
              >

                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={() => navLinkClass(item.to)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={() => navLinkClass('/admin')}
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </NavLink>
                )}

              </nav>


              {/* Drawer Bottom */}
              <div
                className="border-t border-slate-200 pt-3 flex flex-col gap-1"
                onClick={() => setMobileOpen(false)}
              >

                <NavLink
                  to="/profile"
                  className={() => navLinkClass('/profile')}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </NavLink>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-danger-600 hover:bg-danger-50 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>

              </div>

            </motion.aside>

          </>
        )}
      </AnimatePresence>


      {/* ================= MAIN CONTENT ================= */}

      <main className="lg:ml-64 min-h-screen">

        <AnimatePresence mode="wait">

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-4 lg:p-8 max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>

        </AnimatePresence>

      </main>


      {/* ================= MOBILE BOTTOM NAV ================= */}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-primary-100 z-30 flex items-center justify-around px-2 py-2">

        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              isActive(item.to)
                ? 'text-primary-600'
                : 'text-slate-400'
            }`}
          >
            <item.icon className="h-5 w-5" />

            <span className="text-[10px] font-medium">
              {item.label.split(' ')[0]}
            </span>
          </NavLink>
        ))}

      </nav>


      <div className="lg:hidden h-16" />

      <div className="hidden">
        {profile?.full_name}
      </div>

    </div>
  );
}