'use client';

import { formatCurrency } from '@/lib/format';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';

interface PendingShipment {
  _id: string;
  itemType: string;
  pickupLocation: string;
  dropLocation: string;
  price: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<PendingShipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeSubscriptions: number;
    pendingShipments: number;
    openShipments: number;
    closedShipments: number;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      router.push('/login');
      return;
    }
    setToken(stored);
    api
      .me(stored)
      .then(async (me) => {
        if (me.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(me);
        const [pendingShipments, allUsers, dashboardStats] = await Promise.all([
          api.getPendingShipments(stored) as Promise<PendingShipment[]>,
          api.getUsers(stored),
          api.getAdminStats(stored),
        ]);
        setPending(pendingShipments);
        setUsers(allUsers);
        setStats(dashboardStats);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  async function handleApprove(id: string) {
    if (!token) return;
    await api.approveShipment(token, id);
    setPending((items) => items.filter((item) => item._id !== id));
  }

  async function handleReject(id: string) {
    if (!token) return;
    await api.rejectShipment(token, id);
    setPending((items) => items.filter((item) => item._id !== id));
  }

  async function toggleSubscription(u: User) {
    if (!token) return;
    try {
      await api.updateUserSubscription(token, u.id, {
        subscriptionActive: !u.subscriptionActive,
        subscriptionPlan: u.subscriptionPlan,
      });
      setUsers((items) =>
        items.map((item) =>
          item.id === u.id
            ? { ...item, subscriptionActive: !item.subscriptionActive }
            : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  if (!user) {
    return <div className="min-h-full bg-[#060912] p-8 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-full bg-[#060912] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="text-slate-400">Welcome, {user.name}</p>
          </div>
          <Link href="/" className="text-sm text-sky-400 hover:underline">
            Home
          </Link>
        </div>

        {error && <p className="mt-4 text-red-400">{error}</p>}

        {stats && (
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Total users', stats.totalUsers],
              ['Active subs', stats.activeSubscriptions],
              ['Pending review', stats.pendingShipments],
              ['Open shipments', stats.openShipments],
              ['Closed shipments', stats.closedShipments],
            ].map(([label, value]) => (
              <div key={label as string} className="card-shine rounded-2xl border border-white/5 p-4">
                <div className="text-2xl font-semibold">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-medium">Pending shipment submissions</h2>
          <div className="mt-4 space-y-4">
            {pending.length === 0 && (
              <p className="text-slate-400">No pending submissions.</p>
            )}
            {pending.map((item) => (
              <div
                key={item._id}
                className="card-shine rounded-2xl border border-white/5 p-5"
              >
                <div className="font-medium">
                  {item.itemType}: {item.pickupLocation} → {item.dropLocation}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {formatCurrency(item.price)} · {item.contactName} · {item.contactPhone} · {item.contactEmail}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(item._id)}
                    className="rounded-full bg-green-600 px-4 py-2 text-sm hover:bg-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(item._id)}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm hover:bg-red-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-medium">Users</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Subscription</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.subscriptionActive ? (
                        <span className="text-green-400">{u.subscriptionPlan ?? 'Active'}</span>
                      ) : (
                        <span className="text-red-400">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.subscriptionExpiresAt
                        ? new Date(u.subscriptionExpiresAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleSubscription(u)}
                          className="rounded-full border border-slate-600 px-3 py-1 text-xs hover:border-slate-400"
                        >
                          {u.subscriptionActive ? 'Revoke' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
