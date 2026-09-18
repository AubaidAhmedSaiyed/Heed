import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import DocsLayout from './pages/docs/DocsLayout';
import QuickstartDoc from './pages/docs/QuickstartDoc';
import SDKDoc from './pages/docs/SDKDoc';
import ConceptsDoc from './pages/docs/ConceptsDoc';

import ConnectorsDoc from './pages/docs/ConnectorsDoc';
import SecurityDoc from './pages/docs/SecurityDoc';

import AppLayout from './pages/app/AppLayout';
import Overview from './pages/app/Overview';
import ExecutionsList from './pages/app/ExecutionsList';
import ExecutionDetail from './pages/app/ExecutionDetail';
import AgentsList from './pages/app/AgentsList';
import AgentDetail from './pages/app/AgentDetail';
import BehaviorChanges from './pages/app/BehaviorChanges';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col heed-app-root">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="executions" element={<ExecutionsList />} />
            <Route path="executions/:id" element={<ExecutionDetail />} />
            <Route path="agents" element={<AgentsList />} />
            <Route path="agents/:id" element={<AgentDetail />} />
            <Route path="behavior" element={<BehaviorChanges />} />
          </Route>

          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<QuickstartDoc />} />
            <Route path="quickstart" element={<QuickstartDoc />} />
            <Route path="sdk" element={<SDKDoc />} />
            <Route path="concepts" element={<ConceptsDoc />} />
            <Route path="connectors" element={<ConnectorsDoc />} />
            <Route path="security" element={<SecurityDoc />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
