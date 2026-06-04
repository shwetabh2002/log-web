'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { accessToken, user } = await api.login({ email, password });
      localStorage.setItem('token', accessToken);
      if (user.role === 'admin') router.push('/admin');
      else if (!user.subscriptionActive) router.push('/billing');
      else router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="hero-glow grid-pattern flex flex-1 items-center justify-center px-6 py-20">
        <div className="grid w-full max-w-4xl items-center gap-12 lg:grid-cols-2">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Welcome back</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Sign in to manage your logistics
            </h1>
            <p className="mt-4 text-slate-400">
              Access admin dashboard, billing, or your account settings.
            </p>
            <div className="mt-8 rounded-2xl border border-white/5 bg-slate-900/50 p-6 text-sm text-slate-400">
              <p className="font-medium text-white">Test credentials</p>
              <p className="mt-2">Shipper: shipper@test.com</p>
              <p>Carrier: carrier@test.com</p>
              <p>Admin: admin@example.com</p>
              <p className="mt-2 text-orange-400">Password: test1234 / admin123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card-shine rounded-3xl border border-white/5 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="mt-2 text-sm text-slate-400">Enter your email and password</p>

            <label className="mt-8 block text-sm text-slate-300">
              Email
              <input className="input-field mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="mt-4 block text-sm text-slate-300">
              Password
              <input className="input-field mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-8 w-full py-3.5">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="mt-6 text-center text-sm text-slate-400">
              No account?{' '}
              <Link href="/register" className="font-medium text-orange-400 hover:underline">Subscribe</Link>
            </p>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
