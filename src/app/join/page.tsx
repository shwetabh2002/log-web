'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { api, UserRole } from '@/lib/api';

export default function JoinPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    requestedRole: 'shipper' as 'shipper' | 'carrier',
    locationLabel: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.submitRoleRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        requestedRole: form.requestedRole,
        locationLabel: form.locationLabel.trim() || undefined,
        message: form.message.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="card-shine max-w-md rounded-3xl border border-emerald-500/20 p-10 text-center">
            <div className="text-5xl">✅</div>
            <h1 className="mt-4 text-2xl font-bold">Request submitted</h1>
            <p className="mt-4 text-slate-400">
              An admin will review your request to become a {form.requestedRole}.
              You will receive access credentials once approved.
            </p>
            <Link href="/" className="btn-primary mt-8 inline-block px-8">
              Back to home
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="hero-glow grid-pattern px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm text-slate-400 hover:text-sky-400">
            ← Back to home
          </Link>
          <h1 className="mt-6 text-4xl font-bold">Request platform access</h1>
          <p className="mt-3 text-slate-400">
            Tell us whether you want to ship or carry. An admin reviews every request and
            grants access — works worldwide, no country lock-in.
          </p>

          <form
            onSubmit={handleSubmit}
            className="card-shine mt-10 space-y-5 rounded-3xl border border-white/5 p-8"
          >
            <div>
              <p className="text-sm text-slate-300">I want to be a</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { role: 'shipper' as UserRole, label: 'Shipper', hint: 'Post loads & hire carriers' },
                    { role: 'carrier' as UserRole, label: 'Carrier', hint: 'Browse loads & deliver' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, requestedRole: option.role as 'shipper' | 'carrier' })
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      form.requestedRole === option.role
                        ? 'border-sky-400 bg-sky-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{option.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm text-slate-300">
              Full name
              <input
                className="input-field mt-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              Email
              <input
                className="input-field mt-2"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              Phone (optional)
              <input
                className="input-field mt-2"
                placeholder="Include country code, e.g. +1 555 0100"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="block text-sm text-slate-300">
              Operating area (optional)
              <input
                className="input-field mt-2"
                placeholder="City / region anywhere in the world"
                value={form.locationLabel}
                onChange={(e) => setForm({ ...form, locationLabel: e.target.value })}
              />
            </label>
            <label className="block text-sm text-slate-300">
              Message (optional)
              <textarea
                className="input-field mt-2 min-h-[100px]"
                placeholder="Tell us about your business or fleet"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit access request'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already approved?{' '}
              <Link href="/login" className="text-sky-400 hover:text-sky-300">
                Log in
              </Link>
              {' · '}
              Prefer self-serve signup?{' '}
              <Link href="/register" className="text-sky-400 hover:text-sky-300">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
