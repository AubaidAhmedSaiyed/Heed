import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { HeedFlowBackground, Input, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.user, data.workspaces);
      
      const from = (location.state as any)?.from?.pathname || "/app";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg text-fg px-4">
      <HeedFlowBackground intensity="auth" density="compact" />

      <div className="w-full max-w-md p-8 sm:p-10 bg-surface/90 border border-line rounded-2xl shadow-xl z-10 backdrop-blur-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-fg font-mono tracking-wider font-bold mb-6 hover:opacity-85 transition-opacity"
          >
            <Shield className="w-5 h-5 text-accent" />
            <span>HEED</span>
          </Link>
          <h1 className="text-2xl font-medium text-fg tracking-tight font-sans">
            Welcome back.
          </h1>
          <p className="text-xs text-muted font-mono mt-1.5">
            Continue to your HEED control plane.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md font-mono">{error}</div>}
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@heed.dev"
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-muted">
                Password
              </label>
              <a href="#" className="text-[11px] font-mono text-accent hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-elevated border border-line rounded-md text-fg placeholder:text-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button type="submit" variant="solid" className="w-full" isLoading={loading}>
              Sign in
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-muted font-mono">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-accent hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
