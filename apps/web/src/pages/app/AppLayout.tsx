import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Shield, Activity, Users, List, AlertTriangle, Zap } from 'lucide-react';

export default function AppLayout() {
  const navItems = [
    { name: 'Overview', path: '/app', icon: <Activity className="w-4 h-4" /> },
    { name: 'Agents', path: '/app/agents', icon: <Users className="w-4 h-4" /> },
    { name: 'Executions', path: '/app/executions', icon: <List className="w-4 h-4" /> },
    { name: 'Behavior Changes', path: '/app/behavior', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-slate-50 flex flex-col py-4">
        <div className="px-6 mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="text-blue-600 w-5 h-5" />
            Control Plane
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
