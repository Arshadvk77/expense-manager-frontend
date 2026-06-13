import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context.jsx';
import { useAuth } from './hooks/useAuth';  // ✅ import useAuth
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import CurrencySetup from './pages/Setup/CurrencySetup.jsx';
import Landing from './pages/Landing.jsx';
import Pricing from './pages/Pricing.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import AdminContactMessages from './pages/AdminContactMessages.jsx';
import Recurring from './pages/Recurring.jsx';
import TransactionForm from './pages/TransactionForm.jsx';
import AdminUsers from './pages/AdminUsers.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // or a spinner
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { dark } = useApp();

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', dark);
    document.body.style.background = dark ? '#1a1213' : '#f3ece1';
  }, [dark]);

  return (
    <Routes>
      <Route path="/" element={<Landing/>} />
      <Route path="/pricing" element={<Pricing />} />
       <Route path="/about" element={<About />} />
       <Route path="/contact" element={<Contact />} /> 
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot" element={<GuestRoute><ForgotPassword /></GuestRoute>} /> 

      <Route path="/setup/currency" element={<ProtectedRoute><CurrencySetup /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />



        <Route path="/recurring" element={<Recurring />} />
        <Route path="/transactions" element={<Transactions />} />

        <Route path="/income"  element={<TransactionForm defaultType="income" />} />
        <Route path="/expense" element={<TransactionForm defaultType="expense" />} />
        <Route path="/transactions/:id/edit" element={<TransactionForm mode="edit" />} />

        {/* Admin only */}
        <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        <Route path="/admin/contact-messages" element={<RequireAdmin><AdminContactMessages /></RequireAdmin>} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}