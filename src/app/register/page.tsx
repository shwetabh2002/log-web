'use client';

import { formatCurrencyMonthly } from '@/lib/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { isAdminRole } from '@/lib/is-admin';
import { PageShell } from '@/components/PageShell';
import { PlaceAutocomplete, PlaceValue } from '@/components/PlaceAutocomplete';
import { api, UserRole } from '@/lib/api';

const PUBLIC_REGISTER_OPEN =
  process.env.NEXT_PUBLIC_ALLOW_PUBLIC_REGISTER === 'true' ||
  (process.env.NEXT_PUBLIC_ALLOW_PUBLIC_REGISTER !== 'false' &&
    process.env.NODE_ENV !== 'production');

const FALLBACK_PLANS = [
  { id: 'shipper-basic', label: 'Shipper', subtitle: 'Post & manage shipments', price: formatCurrencyMonthly(19), role: 'shipper' as UserRole, amountUsd: 19, icon: '📦' },
  { id: 'carrier-basic', label: 'Carrier', subtitle: 'Browse loads & connect', price: formatCurrencyMonthly(19), role: 'carrier' as UserRole, amountUsd: 19, icon: '🚛' },
];

const formInitial = { name: '', username: '', email: '', phone: '' };
const emptyPlace = (): PlaceValue => ({ address: '' });

const FORM_FIELDS: {
  key: keyof typeof formInitial;
  label: string;
  type: string;
  required: boolean;
  hint?: string;
}[] = [
  { key: 'name', label: 'Full name', type: 'text', required: true },
  { key: 'username', label: 'Username', type: 'text', required: true, hint: 'Letters, numbers, underscores only' },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'phone', label: 'Phone (optional, include country code)', type: 'text', required: false },
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, setSession } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [plan, setPlan] = useState(FALLBACK_PLANS[0]);
  const [form, setForm] = useState(formInitial);
  const [location, setLocation] = useState<PlaceValue>(emptyPlace());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const locationReady =
    location.address.trim().length > 0 &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number';

  useEffect(() => {
    if (!PUBLIC_REGISTER_OPEN) {
      router.replace('/join');
    }
  }, [router]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (isAdminRole(user.role)) router.replace('/admin');
    else router.replace('/account');
  }, [user, authLoading, router]);

  useEffect(() => {
    api.getPlans().then((data) => {
      if (data.length) {
        const mapped = data.map((p) => ({
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
    if (!locationReady) {
      setError('Select your home area from address suggestions.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.register({
        name: form.name,
        username: form.username.trim(),
        email: form.email,
        phone: form.phone.trim() || undefined,
        role: plan.role,
        subscriptionPlan: plan.id,
        locationLabel: location.address.trim(),
        locationLat: location.lat!,
        locationLng: location.lng!,
        locationPlaceId: location.placeId,
      });
      setSession(result.accessToken, result.user);
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

  if (!PUBLIC_REGISTER_OPEN) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-6 py-20 text-slate-400">
          Redirecting to access request...
        </div>
      </PageShell>
    );
  }

  if (authLoading || user) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-6 py-20 text-slate-400">
          Loading...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="hero-glow grid-pattern px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm text-slate-400 transition hover:text-sky-400">← Back to home</Link>
          <h1 className="mt-6 text-4xl font-bold">Choose your plan</h1>
          <p className="mt-3 text-slate-400">
            Create your account with your home or operating location — used to match nearby listings in the app.
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
            {FORM_FIELDS.map(({ key, label, type, required, hint }) => (
              <label key={key} className="block text-sm text-slate-300">
                {label}
                <input
                  className="input-field mt-2"
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={required}
                  autoCapitalize={key === 'username' ? 'none' : undefined}
                />
                {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
              </label>
            ))}

            <PlaceAutocomplete
              label={plan.role === 'carrier' ? 'Operating base location' : 'Your location'}
              placeholder="Search city or address"
              value={location}
              onChange={setLocation}
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}
            <p className="text-xs text-slate-500">
              Your app password will be auto-generated and shown once after payment.
            </p>
            <button
              type="submit"
              disabled={loading || !locationReady}
              className="btn-primary w-full py-3.5 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Register & pay ${plan.price}`}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
