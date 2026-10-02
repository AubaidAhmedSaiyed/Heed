import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Activity,
  List,
  AlertTriangle,
  CheckCircle,
  Search,
  Settings,
  Lock,
  Bell,
  Menu,
  X,
  ExternalLink,
  Users,
  Database
} from 'lucide-react';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import { HeedFlowBackground } from '../../components/ui/HeedFlowBackground';
import { Drawer } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, workspaces, activeWorkspaceId, setActiveWorkspaceId, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Check if we need to onboard
    if (location.pathname !== '/app/onboarding') {
      api.getAgents().then(agents => {
        if (agents.length === 0) {
          navigate('/app/onboarding');
        }
      }).catch(e => console.error(e));
    }
  }, [location.pathname, activeWorkspaceId, navigate]);

  const navItems = [
    { name: 'Overview', path: '/app', icon: <Activity className="w-4 h-4" /> },
    { name: 'Agents', path: '/app/agents', icon: <Users className="w-4 h-4" /> },
    { name: 'Executions', path: '/app/executions', icon: <List className="w-4 h-4" /> },
    { name: 'Policies', path: '/app/policies', icon: <Shield className="w-4 h-4" /> },
    { name: 'Approvals', path: '/app/approvals', icon: <CheckCircle className="w-4 h-4" /> },
    { name: 'Audit', path: '/app/audit', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-fg relative z-0">
      <HeedFlowBackground intensity="dashboard" animated={false} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-line bg-surface/75 backdrop-blur-md flex-col py-6 relative z-10 select-none">
        <div className="px-6 mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-bold flex items-center gap-2.5 font-mono text-fg tracking-wider hover:opacity-85 transition-opacity"
          >
            <Shield className="text-accent w-5 h-5" />
            <span>HEED</span>
          </Link>
          <span className="font-mono text-[9px] uppercase tracking-widest text-faint border border-line px-1.5 py-0.5 rounded">
            v1.0
          </span>
        </div>

        <div className="px-4 mb-6">
          <select 
            value={activeWorkspaceId || ''} 
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="w-full bg-surface-2 border border-line text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-accent"
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-line-strong text-fg font-semibold shadow-sm'
                    : 'text-muted hover:bg-surface-2 hover:text-fg'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 mt-auto space-y-1 pt-4 border-t border-line">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-150 ${
                isActive
                  ? 'bg-line-strong text-fg font-semibold'
                  : 'text-muted hover:bg-surface-2 hover:text-fg'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>

          <Link
            to="/docs"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-md text-faint hover:text-muted hover:bg-surface-2 transition-colors"
          >
            <span>Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-line bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md text-muted hover:text-fg hover:bg-surface-2"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative flex items-center text-muted">
              <Search className="w-4 h-4 absolute left-3 pointer-events-none text-faint" />
              <input
                type="text"
                placeholder="Search runtime events, policies, executions... (Press /)"
                className="bg-surface border border-line pl-9 pr-4 py-1.5 rounded-md text-xs font-mono placeholder:text-faint text-fg w-48 sm:w-80 md:w-96 focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-surface-2 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <ThemeSwitcher />

            <div className="flex items-center gap-2 pl-2 border-l border-line group relative">
              <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-mono font-semibold text-xs select-none cursor-pointer">
                {user?.name?.substring(0, 2).toUpperCase() || 'OP'}
              </div>
              <span className="hidden sm:inline font-mono text-xs text-muted cursor-pointer">{user?.name || user?.email}</span>
              <div className="absolute right-0 top-full mt-2 w-32 bg-surface border border-line rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <button onClick={logout} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-surface-2 rounded-md">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80%] bg-surface border-r border-line p-6 flex flex-col z-10">
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold flex items-center gap-2.5 font-mono text-fg"
              >
                <Shield className="text-accent w-5 h-5" />
                <span>HEED</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-muted hover:text-fg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/app'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-md ${
                      isActive
                        ? 'bg-line-strong text-fg font-semibold'
                        : 'text-muted hover:bg-surface-2 hover:text-fg'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-line">
              <NavLink
                to="/app/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-md text-muted hover:text-fg"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      <Drawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Runtime Notifications"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3.5 border border-line rounded-lg bg-surface-2/40 text-center text-muted">
            No recent notifications.
          </div>
        </div>
      </Drawer>
    </div>
  );
}
