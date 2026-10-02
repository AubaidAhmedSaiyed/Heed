import React from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import DocsLayout from './pages/docs/DocsLayout';
import QuickstartDoc from './pages/docs/QuickstartDoc';
import SDKDoc from './pages/docs/SDKDoc';
import ConceptsDoc from './pages/docs/ConceptsDoc';
import ConnectorsDoc from './pages/docs/ConnectorsDoc';
import SecurityDoc from './pages/docs/SecurityDoc';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

import AppLayout from './pages/app/AppLayout';
import Onboarding from './pages/app/Onboarding';
import Overview from './pages/app/Overview';
import ExecutionsList from './pages/app/ExecutionsList';
import ExecutionDetail from './pages/app/ExecutionDetail';
import AgentsList from './pages/app/AgentsList';
import AgentDetail from './pages/app/AgentDetail';
import Policies from './pages/app/Policies';
import PolicyDetail from './pages/app/PolicyDetail';
import Provenance from './pages/app/Provenance';
import Approvals from './pages/app/Approvals';
import Connectors from './pages/app/Connectors';
import Audit from './pages/app/Audit';
import Security from './pages/app/Security';
import Settings from './pages/app/Settings';

function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col heed-app-root">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<QuickstartDoc />} />
          <Route path="quickstart" element={<QuickstartDoc />} />
          <Route path="sdk" element={<SDKDoc />} />
          <Route path="concepts" element={<ConceptsDoc />} />
          <Route path="connectors" element={<ConnectorsDoc />} />
          <Route path="security" element={<SecurityDoc />} />
        </Route>
      </Route>

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="executions" element={<ExecutionsList />} />
        <Route path="executions/:id" element={<ExecutionDetail />} />
        <Route path="policies" element={<Policies />} />
        <Route path="policies/:id" element={<PolicyDetail />} />
        <Route path="provenance" element={<Provenance />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="agents" element={<AgentsList />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="connectors" element={<Connectors />} />
        <Route path="audit" element={<Audit />} />
        <Route path="security" element={<Security />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
    </AuthProvider>
  );
}
