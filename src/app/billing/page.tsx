'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { api, User } from '@/lib/api';

export default function BillingPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) { router.push('/login?redirect=/billing'); return; }
    setToken(stored);
    api.me(stored).then(setUser).catch(() => router.push('/login'));
  }, [router]);

  async function handleCheckout() {
    if (!token || !user?.subscriptionPlan) return;
    setLoading(true);
    setError('');
    try {
      const checkout = await api.createCheckout(token, user.subscriptionPlan);
      if (checkout.url) window.location.href = checkout.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="hero-glow grid-pattern flex flex-1 items-center justify-center px-6 py-20">
        {!user ? (
          <div className="text-slate-400">Loading...</div>
        ) : (
          <div className="card-shine w-full max-w-md rounded-3xl border border-white/5 p-8 shadow-2xl">
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="mt-2 text-slate-400">Hi, {user.name}</p>

            {user.subscriptionActive ? (
              <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <p className="font-semibold text-green-400">Subscription active</p>
                </div>
                <p className="mt-2 text-sm text-slate-400">{user.subscriptionPlan}</p>
                {user.subscriptionExpiresAt && (
                  <p className="mt-1 text-sm text-slate-500">
                    Renews / expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-slate-300">Complete payment to activate your account.</p>
                <p className="mt-2 text-sm text-slate-500">Plan: {user.subscriptionPlan ?? 'Not selected'}</p>
                <button onClick={handleCheckout} disabled={loading || !user.subscriptionPlan} className="btn-primary mt-6 w-full py-3.5">
                  {loading ? 'Redirecting...' : 'Complete payment'}
                </button>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </div>
        )}
      </div>
    </PageShell>
  );
}
