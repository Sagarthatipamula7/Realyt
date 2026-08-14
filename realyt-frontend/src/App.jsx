import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext.jsx';
import HomePage from './pages/client/HomePage.jsx';
import ClientBookingsPage from './pages/client/ClientBookingsPage.jsx';

import EditorLayout from './pages/editor/components/EditorLayout.jsx';
import EditorDashboardPage from './pages/editor/EditorDashboardPage.jsx';
import EditorAssignmentsPage from './pages/editor/EditorAssignmentsPage.jsx';
import EditorAnalyticsPage from './pages/editor/EditorAnalyticsPage.jsx';
import EditorSettingsPage from './pages/editor/EditorSettingsPage.jsx';

import AdminLoginPage from './admin/pages/AdminLoginPage.jsx';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute.jsx';
import AdminLayout from './admin/pages/AdminLayout.jsx';
import AdminDashboardPage from './admin/pages/AdminDashboardPage.jsx';
import AdminRequestsPage from './admin/pages/AdminRequestsPage.jsx';
import AdminEditorsPage from './admin/pages/AdminEditorsPage.jsx';
import AdminPaymentsPage from './admin/pages/AdminPaymentsPage.jsx';
import AdminAnalyticsPage from './admin/pages/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './admin/pages/AdminSettingsPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Home & Client Bookings */}
          <Route path="/" element={<HomePage />} />
          <Route path="/my-bookings" element={<ClientBookingsPage />} />
          <Route path="/bookings" element={<ClientBookingsPage />} />

          {/* Editor Portal Domain with Left Sidebar Layout */}
          <Route path="/editor" element={<EditorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EditorDashboardPage />} />
            <Route path="clients" element={<EditorAssignmentsPage />} />
            <Route path="assignments" element={<EditorAssignmentsPage />} />
            <Route path="analytics" element={<EditorAnalyticsPage />} />
            <Route path="settings" element={<EditorSettingsPage />} />
          </Route>
          <Route path="/my-assignments" element={<Navigate to="/editor/clients" replace />} />

          {/* Secure Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/app/admin/login" element={<AdminLoginPage />} />

          {/* Convenient Aliases for Admin */}
          <Route path="/admin" element={<Navigate to="/app/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/app/admin/dashboard" replace />} />

          {/* Protected Admin Domain */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/app/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="requests" element={<AdminRequestsPage />} />
              <Route path="applications" element={<AdminRequestsPage />} />
              <Route path="editors" element={<AdminEditorsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#111C31', color: '#E6EDF7', border: '1px solid #263450', borderRadius: '10px', fontSize: '0.9rem' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}

export default App;
