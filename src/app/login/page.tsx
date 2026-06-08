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
    <PageShell hideFooter>
      <div className="hero-glow grid-pattern relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="badge-live">Live marketplace</span>
            <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
              Move freight with{' '}
              <span className="gradient-text">confidence</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-400">
              Sign in to manage shipments, browse loads, and connect with verified partners across the US.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                ['500+', 'Active loads'],
                ['2 min', 'Avg. match'],
                ['$19', 'Per month'],
              ].map(([val, label]) => (
                <div key={label} className="glass-panel rounded-2xl p-4 text-center">
                  <div className="text-xl font-bold text-white">{val}</div>
                  <div className="mt-1 text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 hidden rounded-2xl border border-white/5 bg-[#131b2e]/50 p-6 lg:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Demo accounts</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-sky-500/10 p-3">
                  <p className="text-xs text-sky-300">Carrier</p>
                  <p className="mt-1 font-medium text-white">carrier@test.com</p>
                </div>
                <div className="rounded-xl bg-indigo-500/10 p-3">
                  <p className="text-xs text-indigo-300">Shipper</p>
                  <p className="mt-1 font-medium text-white">shipper@test.com</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Password: test1234 · Admin: admin@example.com / admin123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Account access</p>
            <h2 className="mt-3 text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Enter your email and password to continue</p>

            <label className="mt-8 block text-sm font-medium text-slate-300">
              Email
              <input
                className="input-field mt-2"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="mt-5 block text-sm font-medium text-slate-300">
              Password
              <input
                className="input-field mt-2"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-8 w-full py-3.5">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="mt-6 text-center text-sm text-slate-400">
              No account?{' '}
              <Link href="/register" className="font-medium text-sky-400 hover:underline">
                Subscribe now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
