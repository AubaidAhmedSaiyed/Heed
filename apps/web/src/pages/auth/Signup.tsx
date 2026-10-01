import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { HeedFlowBackground, Input, Button } from '../../components/ui';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
            Start building with HEED.
          </h1>
          <p className="text-xs text-muted font-mono mt-1.5">
            Create an account to control agent boundaries.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
