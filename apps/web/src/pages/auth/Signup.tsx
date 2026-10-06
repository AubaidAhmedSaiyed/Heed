import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import { Input, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:4000/api/v1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data.error === 'object' && data.error?.message ? data.error.message : (typeof data.error === 'string' ? data.error : data.message || 'Signup failed');
        throw new Error(msg);
      }
      
      login(data.token, data.user, data.workspaces || [data.defaultWorkspace]);
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg text-fg px-4">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 bg-surface border border-line rounded-2xl shadow-xl z-10">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-fg font-heading tracking-tight font-bold text-xl mb-6 hover:opacity-85 transition-opacity"
          >
            <span className="w-7 h-7 rounded-lg bg-deep flex items-center justify-center shrink-0">
              <svg viewBox="0 0 26 26" width="22" height="22" aria-hidden="true">
                <rect x="6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                <rect x="16.6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                <rect x="6" y="11.6" width="14" height="2.8" rx="1.2" fill="#8CC9AE" />
              </svg>
            </span>
            <span>HEED</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-fg tracking-tight">
            Start building with HEED.
          </h1>
          <p className="text-sm text-muted mt-2 font-sans">
            Create an account to control agent boundaries.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-xs text-block bg-block-muted border border-block/20 rounded-lg font-mono">
              {error}
            </div>
          )}
          
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@heed.dev"
          />

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-elevated border border-line rounded-lg text-fg placeholder:text-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="solid" className="w-full" isLoading={loading}>
              Create account
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-muted font-sans">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-fg font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
