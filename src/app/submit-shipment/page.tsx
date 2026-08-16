'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { PlaceAutocomplete, PlaceValue } from '@/components/PlaceAutocomplete';
import { api } from '@/lib/api';

const emptyPlace = (): PlaceValue => ({ address: '' });

const ITEM_TYPE_SUGGESTIONS = [
  'Parcel',
  'Furniture',
  'Appliances',
  'Electronics',
  'Vehicles',
  'Construction',
  'Documents',
  'Other',
];

export default function SubmitShipmentPage() {
  const [form, setForm] = useState({
    itemName: '',
    itemType: 'Parcel',
    pickup: emptyPlace(),
    drop: emptyPlace(),
    price: '',
    notes: '',
    weightLbs: '',
    dimensions: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pickupReady =
    form.pickup.address.trim() &&
    typeof form.pickup.lat === 'number' &&
    typeof form.pickup.lng === 'number';
  const dropReady =
    form.drop.address.trim() &&
    typeof form.drop.lat === 'number' &&
    typeof form.drop.lng === 'number';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pickupReady || !dropReady) {
      setError('Select pickup and drop addresses from the suggestions so coordinates are saved.');
      return;
    }
    if (!form.itemType.trim()) {
      setError('Enter or select an item category.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.submitPublicShipment({
        itemName: form.itemName.trim(),
        itemType: form.itemType.trim(),
        pickupLocation: form.pickup.address.trim(),
        pickupLocationDetails: form.pickup.details?.trim() || undefined,
        dropLocation: form.drop.address.trim(),
        dropLocationDetails: form.drop.details?.trim() || undefined,
        pickupLat: form.pickup.lat!,
        pickupLng: form.pickup.lng!,
        dropLat: form.drop.lat!,
        dropLng: form.drop.lng!,
        pickupPlaceId: form.pickup.placeId,
        dropPlaceId: form.drop.placeId,
        price: Number(form.price),
        notes: form.notes.trim() || undefined,
        weightLbs: form.weightLbs ? Number(form.weightLbs) : undefined,
        dimensions: form.dimensions.trim() || undefined,
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
      });
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
              Your shipment is pending admin approval. Check back later or contact support for updates.
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
          <Link href="/" className="text-sm text-slate-400 hover:text-sky-400">← Back to home</Link>
          <h1 className="mt-6 text-4xl font-bold">Post a shipment</h1>
          <p className="mt-3 text-slate-400">
            No subscription needed. Search pickup and drop addresses — coordinates are saved for nearby carrier matching.
          </p>

          <form onSubmit={handleSubmit} className="card-shine mt-10 space-y-5 rounded-3xl border border-white/5 p-8">
            <label className="block text-sm text-slate-300">
              Item name
              <input
                className="input-field mt-2"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                required
              />
            </label>

            <div>
              <p className="text-sm text-slate-300">Item category</p>
              <p className="mt-1 text-xs text-slate-500">
                Pick a suggestion or type your own category.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ITEM_TYPE_SUGGESTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, itemType: type })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      form.itemType === type
                        ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <input
                className="input-field mt-3"
                placeholder="Custom category / item type"
                value={form.itemType}
                onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                required
              />
            </div>

            <PlaceAutocomplete
              label="Pickup location"
              placeholder="Search pickup address"
              value={form.pickup}
              onChange={(pickup) => setForm({ ...form, pickup })}
              required
            />
            <label className="block text-sm text-slate-300">
              Pickup details (optional)
              <input
                className="input-field mt-2"
                placeholder="Unit, floor, building, landmark, gate code..."
                value={form.pickup.details ?? ''}
                onChange={(e) =>
                  setForm({ ...form, pickup: { ...form.pickup, details: e.target.value } })
                }
              />
            </label>
            <PlaceAutocomplete
              label="Drop location"
              placeholder="Search drop address"
              value={form.drop}
              onChange={(drop) => setForm({ ...form, drop })}
              required
            />
            <label className="block text-sm text-slate-300">
              Drop details (optional)
              <input
                className="input-field mt-2"
                placeholder="Unit, floor, building, landmark, gate code..."
                value={form.drop.details ?? ''}
                onChange={(e) =>
                  setForm({ ...form, drop: { ...form.drop, details: e.target.value } })
                }
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Weight (lbs)
                <input
                  className="input-field mt-2"
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="e.g. 45"
                  value={form.weightLbs}
                  onChange={(e) => setForm({ ...form, weightLbs: e.target.value })}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Dimensions (L × W × H in)
                <input
                  className="input-field mt-2"
                  placeholder="e.g. 48 × 32 × 24"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              Price (USD)
              <input
                className="input-field mt-2"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              Notes (optional)
              <input
                className="input-field mt-2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <label className="block text-sm text-slate-300">
              Your name
              <input
                className="input-field mt-2"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              Phone
              <input
                className="input-field mt-2"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              Email
              <input
                className="input-field mt-2"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                required
              />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !pickupReady || !dropReady}
              className="btn-primary w-full py-3.5 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for review'}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
