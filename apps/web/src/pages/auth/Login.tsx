import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { HeedFlowBackground, Input, Button } from '../../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/app');
    }, 400);
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

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/app')}
            >
              Continue with GitHub
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
