'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { api } from '@/lib/api';

const fields = [
  ['itemType', 'Item type', 'text', true],
  ['pickupLocation', 'Pickup location', 'text', true],
  ['dropLocation', 'Drop location', 'text', true],
  ['price', 'Price (INR)', 'number', true],
  ['notes', 'Notes (optional)', 'text', false],
  ['contactName', 'Your name', 'text', true],
  ['contactPhone', 'Phone', 'text', true],
  ['contactEmail', 'Email', 'email', true],
] as const;

export default function SubmitShipmentPage() {
  const [form, setForm] = useState({
    itemType: '', pickupLocation: '', dropLocation: '', price: '',
    notes: '', contactName: '', contactPhone: '', contactEmail: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.submitPublicShipment({ ...form, price: Number(form.price) });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="card-shine max-w-md rounded-3xl border border-green-500/20 p-10 text-center">
            <div className="text-5xl">✅</div>
            <h1 className="mt-4 text-2xl font-bold">Submitted!</h1>
            <p className="mt-4 text-slate-400">
              Your shipment is pending admin approval. We&apos;ll email you once it&apos;s live for carriers.
            </p>
            <Link href="/" className="btn-primary mt-8 inline-block px-8">Back to home</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="hero-glow grid-pattern px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm text-slate-400 hover:text-orange-400">← Back to home</Link>
          <h1 className="mt-6 text-4xl font-bold">Post a shipment</h1>
          <p className="mt-3 text-slate-400">
            No subscription needed. Fill in your load details — our team will review and publish it for carriers.
          </p>

          <form onSubmit={handleSubmit} className="card-shine mt-10 space-y-5 rounded-3xl border border-white/5 p-8">
            {fields.map(([field, label, type, required]) => (
              <label key={field} className="block text-sm text-slate-300">
                {label}
                <input
                  className="input-field mt-2"
                  type={type}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  required={required}
                />
              </label>
            ))}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Submitting...' : 'Submit for review'}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
