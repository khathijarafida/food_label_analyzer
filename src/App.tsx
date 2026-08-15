import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ScanProvider } from '@/context/ScanContext';
import { lazy, Suspense } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';

const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));

const AppLayout = lazy(() => import('@/layouts/AppLayout'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Scan = lazy(() => import('@/pages/Scan'));
const AnalysisResult = lazy(() => import('@/pages/AnalysisResult'));
const ScanHistory = lazy(() => import('@/pages/ScanHistory'));
const Compare = lazy(() => import('@/pages/Compare'));
const Tracker = lazy(() => import('@/pages/Tracker'));
const Search = lazy(() => import('@/pages/Search'));
const Profile = lazy(() => import('@/pages/Profile'));

// ⭐ NEW: Personalization Page
const Personalization = lazy(
  () => import('@/pages/Personalization')
);

const Admin = lazy(() => import('@/pages/Admin'));


function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}


function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}


function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}


function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />


        {/* ================= PROTECTED ROUTES ================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          {/* Default */}
          <Route
            index
            element={
              <Navigate to="/dashboard" replace />
            }
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* Scan */}
          <Route
            path="scan"
            element={<Scan />}
          />

          {/* Analysis */}
          <Route
            path="analysis"
            element={<AnalysisResult />}
          />

          {/* Scan History */}
          <Route
            path="history"
            element={<ScanHistory />}
          />

          {/* Compare */}
          <Route
            path="compare"
            element={<Compare />}
          />

          {/* Tracker */}
          <Route
            path="tracker"
            element={<Tracker />}
          />

          {/* Search */}
          <Route
            path="search"
            element={<Search />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<Profile />}
          />

          {/* ⭐ PERSONALIZATION */}
          <Route
            path="personalization"
            element={<Personalization />}
          />

          {/* Admin */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

        </Route>


        {/* ================= INVALID ROUTE ================= */}

        <Route
          path="*"
          element={
            <Navigate to="/dashboard" replace />
          }
        />

      </Routes>
    </Suspense>
  );
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScanProvider>
          <AppRoutes />
        </ScanProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;