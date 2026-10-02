import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { HeedFlowBackground, Input, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      login(data.token, data.user, [data.defaultWorkspace]);
      navigate('/app'); // They go to dashboard (which should redirect to onboarding or empty state)
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
            Start building with HEED.
          </h1>
          <p className="text-xs text-muted font-mono mt-1.5">
            Create an account to control agent boundaries.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md font-mono">{error}</div>}
          <Input
            label="Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Operator Name"
          />

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@heed.dev"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="pt-2">
            <Button type="submit" variant="solid" className="w-full" isLoading={loading}>
              Create account
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-muted font-mono">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
