'use client';

import { formatCurrencyMonthly } from '@/lib/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { api, UserRole } from '@/lib/api';

const FALLBACK_PLANS = [
  { id: 'shipper-basic', label: 'Shipper', subtitle: 'Post & manage shipments', price: formatCurrencyMonthly(19), role: 'shipper' as UserRole, amountUsd: 19, icon: '📦' },
  { id: 'carrier-basic', label: 'Carrier', subtitle: 'Browse loads & connect', price: formatCurrencyMonthly(19), role: 'carrier' as UserRole, amountUsd: 19, icon: '🚛' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [plan, setPlan] = useState(FALLBACK_PLANS[0]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getPlans().then((data) => {
      if (data.length) {
        const mapped = data.map((p, i) => ({
          id: p.id,
          label: p.role === 'shipper' ? 'Shipper' : 'Carrier',
          subtitle: p.role === 'shipper' ? 'Post & manage shipments' : 'Browse loads & connect',
          price: formatCurrencyMonthly(p.amountUsd),
          role: p.role,
          amountUsd: p.amountUsd,
          icon: p.role === 'shipper' ? '📦' : '🚛',
        }));
        setPlans(mapped);
        setPlan(mapped[0]);
      }
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.register({ ...form, role: plan.role, subscriptionPlan: plan.id });
      localStorage.setItem('token', result.accessToken);
      if (result.checkoutRequired) {
        const checkout = await api.createCheckout(result.accessToken, plan.id);
        if (checkout.url) { window.location.href = checkout.url; return; }
      }
      router.push('/register/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="hero-glow grid-pattern px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm text-slate-400 transition hover:text-sky-400">← Back to home</Link>
          <h1 className="mt-6 text-4xl font-bold">Choose your plan</h1>
          <p className="mt-3 text-slate-400">
            Create your account, complete payment, and receive app credentials by email.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {plans.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlan(item)}
                className={`card-shine rounded-2xl border p-6 text-left transition ${
                  plan.id === item.id
                    ? 'border-sky-500 shadow-lg shadow-sky-500/10'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-3xl">{item.icon}</div>
                <div className="mt-3 text-lg font-semibold">{item.label}</div>
                <div className="text-sm text-slate-400">{item.subtitle}</div>
                <div className="mt-3 text-2xl font-bold text-sky-400">{item.price}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card-shine mt-10 space-y-5 rounded-3xl border border-white/5 p-8">
            <h2 className="text-lg font-semibold">Your details</h2>
            {(['name', 'email', 'phone', 'password'] as const).map((field) => (
              <label key={field} className="block text-sm text-slate-300 capitalize">
                {field}
                <input
                  className="input-field mt-2"
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  required
                />
              </label>
            ))}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Processing...' : `Register & pay ${plan.price}`}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
