'use client';

import { formatCurrency } from '@/lib/format';
import { isAdminRole, roleLabel } from '@/lib/is-admin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { PageShell } from '@/components/PageShell';
import { AdminDashboard, AdminUserActivity, api, RoleAccessRequest, User } from '@/lib/api';

interface PendingShipment {
  _id: string;
  itemName?: string;
  itemType: string;
  pickupLocation: string;
  pickupLocationDetails?: string;
  dropLocation: string;
  dropLocationDetails?: string;
  price: number;
  notes?: string;
  weightLbs?: number;
  weightKg?: number;
  dimensions?: string;
  fragile?: boolean;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: string;
}

type Tab =
  | 'overview'
  | 'activity'
  | 'shippers'
  | 'carriers'
  | 'shipments'
  | 'listings'
  | 'interests'
  | 'reviews'
  | 'pending'
  | 'rejected'
  | 'requests'
  | 'users';

function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'warn' | 'success' | 'danger';
}) {
  const toneClass =
    tone === 'warn'
      ? 'border-amber-500/30 bg-amber-500/5'
      : tone === 'success'
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : tone === 'danger'
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-white/5';
  return (
    <div className={`card-shine rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: string }) {
  const cls =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-300'
      : tone === 'warn'
        ? 'bg-amber-500/15 text-amber-300'
        : tone === 'danger'
          ? 'bg-red-500/15 text-red-300'
          : tone === 'info'
            ? 'bg-sky-500/15 text-sky-300'
            : 'bg-white/10 text-slate-300';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

function userRef(value: unknown): {
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  role?: string;
} | null {
  if (!value || typeof value !== 'object') return null;
  return value as { name?: string; email?: string; username?: string; phone?: string; role?: string };
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function activityTypeLabel(type: string) {
  switch (type) {
    case 'signup':
      return 'Joined';
    case 'shipment_posted':
      return 'Shipment';
    case 'carrier_assigned':
      return 'Assignment';
    case 'interest_sent':
      return 'Interest';
    case 'interest_received':
      return 'Interest received';
    case 'listing_created':
      return 'Listing';
    case 'review_given':
      return 'Review';
    case 'review_received':
      return 'Review received';
    default:
      return type;
  }
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      className="input-field mb-4 max-w-md"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, token, logout } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [pending, setPending] = useState<PendingShipment[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState<AdminUserActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [roleRequests, setRoleRequests] = useState<RoleAccessRequest[]>([]);
  const [createdCred, setCreatedCred] = useState<{
    name: string;
    email: string;
    username: string;
    password: string;
    role: string;
  } | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    role: 'shipper' as 'shipper' | 'carrier',
    locationLabel: '',
    subscriptionActive: true,
  });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (!isAdminRole(user.role)) {
      router.replace('/account');
      return;
    }

    Promise.all([
      api.getAdminDashboard(token),
      api.getPendingShipments(token),
      api.getRoleRequests(token),
    ])
      .then(([data, pendingShipments, requests]) => {
        setDashboard(data);
        setPending(pendingShipments as PendingShipment[]);
        setRoleRequests(requests);
      })
      .catch(() => router.replace('/login?redirect=/admin'));
  }, [user, token, authLoading, router]);

  const q = search.trim().toLowerCase();
  const match = (text?: string) => !q || (text ?? '').toLowerCase().includes(q);

  const filteredShippers = useMemo(() => {
    if (!dashboard || !q) return dashboard?.shipperStats ?? [];
    return dashboard.shipperStats.filter(
      (s) =>
        match(s.name) ||
        match(s.email) ||
        match(s.username) ||
        match(s.phone) ||
        match(s.locationLabel),
    );
  }, [dashboard, q]);

  const filteredCarriers = useMemo(() => {
    if (!dashboard || !q) return dashboard?.carrierStats ?? [];
    return dashboard.carrierStats.filter(
      (c) =>
        match(c.name) ||
        match(c.email) ||
        match(c.username) ||
        match(c.phone) ||
        match(c.locationLabel),
    );
  }, [dashboard, q]);

  const filteredUsers = useMemo(() => {
    if (!dashboard || !q) return dashboard?.users ?? [];
    return dashboard.users.filter(
      (u) =>
        match(u.name) ||
        match(u.email) ||
        match(u.username) ||
        match(u.phone) ||
        match(u.locationLabel) ||
        match(u.role),
    );
  }, [dashboard, q]);

  const filteredSnapshots = useMemo(() => {
    if (!dashboard || !q) return dashboard?.userSnapshots ?? [];
    return dashboard.userSnapshots.filter(
      (s) =>
        match(s.name) ||
        match(s.email) ||
        match(s.username) ||
        match(s.statusLabel) ||
        match(s.lastActivitySummary) ||
        match(s.role),
    );
  }, [dashboard, q]);

  async function openUserActivity(userId: string) {
    if (!token) return;
    setSelectedUserId(userId);
    setUserActivity(null);
    setActivityLoading(true);
    setError('');
    try {
      const data = await api.getUserActivity(token, userId);
      setUserActivity(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user activity');
      setSelectedUserId(null);
    } finally {
      setActivityLoading(false);
    }
  }

  function closeUserActivity() {
    setSelectedUserId(null);
    setUserActivity(null);
  }

  async function handleApprove(id: string) {
    if (!token || !dashboard) return;
    await api.approveShipment(token, id);
    setPending((items) => items.filter((item) => item._id !== id));
    setDashboard({
      ...dashboard,
      overview: {
        ...dashboard.overview,
        pendingShipments: Math.max(0, dashboard.overview.pendingShipments - 1),
        approvedShipments: dashboard.overview.approvedShipments + 1,
      },
    });
  }

  async function handleReject(id: string) {
    if (!token || !dashboard) return;
    await api.rejectShipment(token, id);
    setPending((items) => items.filter((item) => item._id !== id));
    setDashboard({
      ...dashboard,
      overview: {
        ...dashboard.overview,
        pendingShipments: Math.max(0, dashboard.overview.pendingShipments - 1),
        rejectedShipments: dashboard.overview.rejectedShipments + 1,
      },
    });
  }

  async function toggleSubscription(u: User) {
    if (!token || isAdminRole(u.role)) return;
    setError('');
    try {
      await api.updateUserSubscription(token, u.id, {
        subscriptionActive: !u.subscriptionActive,
        subscriptionPlan: u.subscriptionPlan,
      });
      setDashboard((current) => {
        if (!current) return current;
        const flipUser = <T extends { id: string; subscriptionActive: boolean }>(item: T): T =>
          item.id === u.id ? { ...item, subscriptionActive: !item.subscriptionActive } : item;
        return {
          ...current,
          users: current.users.map(flipUser),
          shipperStats: current.shipperStats.map(flipUser),
          carrierStats: current.carrierStats.map(flipUser),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  function requestId(req: RoleAccessRequest) {
    return String(req.id ?? req._id);
  }

  async function handleApproveRequest(req: RoleAccessRequest) {
    if (!token || !dashboard) return;
    setError('');
    try {
      const result = await api.approveRoleRequest(token, requestId(req), {
        subscriptionActive: true,
      });
      setRoleRequests((items) =>
        items.map((item) =>
          requestId(item) === requestId(req)
            ? { ...item, status: 'approved', reviewedAt: new Date().toISOString() }
            : item,
        ),
      );
      setDashboard({
        ...dashboard,
        overview: {
          ...dashboard.overview,
          pendingRoleRequests: Math.max(0, dashboard.overview.pendingRoleRequests - 1),
          totalUsers: dashboard.overview.totalUsers + 1,
          shippers:
            result.user.role === 'shipper'
              ? dashboard.overview.shippers + 1
              : dashboard.overview.shippers,
          carriers:
            result.user.role === 'carrier'
              ? dashboard.overview.carriers + 1
              : dashboard.overview.carriers,
        },
        users: [
          {
            ...result.user,
          },
          ...dashboard.users,
        ],
      });
      setCreatedCred({
        name: result.user.name,
        email: result.user.email,
        username: result.user.username,
        password: result.temporaryPassword,
        role: result.user.role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approve failed');
    }
  }

  async function handleRejectRequest(req: RoleAccessRequest) {
    if (!token || !dashboard) return;
    setError('');
    try {
      await api.rejectRoleRequest(token, requestId(req));
      setRoleRequests((items) =>
        items.map((item) =>
          requestId(item) === requestId(req)
            ? { ...item, status: 'rejected', reviewedAt: new Date().toISOString() }
            : item,
        ),
      );
      setDashboard({
        ...dashboard,
        overview: {
          ...dashboard.overview,
          pendingRoleRequests: Math.max(0, dashboard.overview.pendingRoleRequests - 1),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reject failed');
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !dashboard) return;
    setCreatingUser(true);
    setError('');
    try {
      const result = await api.createUserByAdmin(token, {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        username: createForm.username.trim(),
        phone: createForm.phone.trim() || undefined,
        role: createForm.role,
        locationLabel: createForm.locationLabel.trim() || undefined,
        subscriptionActive: createForm.subscriptionActive,
      });
      setCreatedCred({
        name: result.user.name,
        email: result.user.email,
        username: result.user.username,
        password: result.temporaryPassword,
        role: result.user.role,
      });
      setDashboard({
        ...dashboard,
        overview: {
          ...dashboard.overview,
          totalUsers: dashboard.overview.totalUsers + 1,
          shippers:
            result.user.role === 'shipper'
              ? dashboard.overview.shippers + 1
              : dashboard.overview.shippers,
          carriers:
            result.user.role === 'carrier'
              ? dashboard.overview.carriers + 1
              : dashboard.overview.carriers,
        },
        users: [result.user, ...dashboard.users],
      });
      setCreateForm({
        name: '',
        email: '',
        username: '',
        phone: '',
        role: 'shipper',
        locationLabel: '',
        subscriptionActive: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create user failed');
    } finally {
      setCreatingUser(false);
    }
  }

  const pendingAccessCount = roleRequests.filter((r) => r.status === 'pending').length;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'requests', label: `Access requests (${pendingAccessCount})` },
    { key: 'activity', label: `User activity (${dashboard?.userSnapshots.length ?? 0})` },
    { key: 'shippers', label: `Shippers (${dashboard?.shipperStats.length ?? 0})` },
    { key: 'carriers', label: `Carriers (${dashboard?.carrierStats.length ?? 0})` },
    { key: 'shipments', label: `Shipments (${dashboard?.recentShipments.length ?? 0})` },
    { key: 'listings', label: `Listings (${dashboard?.recentCarrierListings.length ?? 0})` },
    { key: 'interests', label: `Interests (${dashboard?.recentInterests.length ?? 0})` },
    { key: 'reviews', label: `Reviews (${dashboard?.recentReviews.length ?? 0})` },
    { key: 'pending', label: `Pending (${pending.length})` },
    { key: 'rejected', label: `Rejected (${dashboard?.rejectedShipments.length ?? 0})` },
    { key: 'users', label: `All users (${dashboard?.users.length ?? 0})` },
  ];

  if (authLoading || !user || !dashboard) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-6 py-20 text-slate-400">
          Loading admin dashboard...
        </div>
      </PageShell>
    );
  }

  const { overview } = dashboard;

  return (
    <PageShell>
      <div className="px-6 py-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                Platform Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Operations dashboard</h1>
              <p className="mt-1 text-slate-400">
                Signed in as {user.name} · {roleLabel(user.role)}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="btn-secondary px-4 py-2 text-sm">
                Home
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white"
              >
                Log out
              </button>
            </div>
          </div>

          {(overview.pendingShipments > 0 ||
            overview.expiringSubscriptions > 0 ||
            (overview.pendingRoleRequests ?? 0) > 0) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {(overview.pendingRoleRequests ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => setTab('requests')}
                  className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm text-sky-200"
                >
                  {overview.pendingRoleRequests} access request(s) awaiting approval
                </button>
              )}
              {overview.pendingShipments > 0 && (
                <button
                  type="button"
                  onClick={() => setTab('pending')}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200"
                >
                  {overview.pendingShipments} shipment(s) awaiting approval
                </button>
              )}
              {overview.expiringSubscriptions > 0 && (
                <button
                  type="button"
                  onClick={() => setTab('users')}
                  className="rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm text-orange-200"
                >
                  {overview.expiringSubscriptions} subscription(s) expiring within 7 days
                </button>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-red-400">{error}</p>}

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  tab === item.key
                    ? 'bg-sky-500 text-white'
                    : 'border border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <section className="mt-8 space-y-8">
              <div>
                <h2 className="text-lg font-medium">Users & subscriptions</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  <StatCard label="Total users" value={overview.totalUsers} />
                  <StatCard label="Shippers" value={overview.shippers} />
                  <StatCard label="Carriers" value={overview.carriers} />
                  <StatCard label="Admins" value={overview.admins} />
                  <StatCard label="Active subscriptions" value={overview.activeSubscriptions} tone="success" />
                  <StatCard label="Inactive subscriptions" value={overview.inactiveSubscriptions} tone="warn" />
                  <StatCard label="With location set" value={overview.usersWithLocation} />
                  <StatCard label="Expiring in 7 days" value={overview.expiringSubscriptions} tone="warn" />
                  <StatCard label="Signups (7 days)" value={overview.signupsLast7Days} />
                  <StatCard
                    label="Access requests pending"
                    value={overview.pendingRoleRequests ?? 0}
                    tone="warn"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium">Shipments lifecycle</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  <StatCard label="Total shipments" value={overview.totalShipments} />
                  <StatCard label="Pending review" value={overview.pendingShipments} tone="warn" />
                  <StatCard label="Approved" value={overview.approvedShipments} tone="success" />
                  <StatCard label="Rejected" value={overview.rejectedShipments} tone="danger" />
                  <StatCard label="Open" value={overview.openShipments} />
                  <StatCard label="In progress" value={overview.inProgressShipments} />
                  <StatCard label="Closed / completed" value={overview.closedShipments} tone="success" />
                  <StatCard label="Carrier assigned" value={overview.assignedShipments} />
                  <StatCard label="Public web submissions" value={overview.manualSubmissions} />
                  <StatCard label="New shipments (7 days)" value={overview.shipmentsLast7Days} />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium">Marketplace & engagement</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  <StatCard label="Carrier listings" value={overview.totalCarrierListings} />
                  <StatCard label="Active listings" value={overview.activeCarrierListings} tone="success" />
                  <StatCard label="Inactive listings" value={overview.inactiveCarrierListings} />
                  <StatCard label="Total interests" value={overview.totalInterests} />
                  <StatCard label="Shipment interests" value={overview.shipmentInterests} />
                  <StatCard label="Interests (7 days)" value={overview.interestsLast7Days} />
                  <StatCard label="Total reviews" value={overview.totalReviews} />
                  <StatCard
                    label="Avg platform rating"
                    value={overview.averageReviewRating || '—'}
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-medium text-slate-300">Latest interests</h3>
                  <div className="space-y-2">
                    {dashboard.recentInterests.slice(0, 5).map((raw) => {
                      const item = raw as {
                        _id: string;
                        createdAt?: string;
                        interestedUserId?: unknown;
                        listing?: { itemName?: string; pickupLocation?: string; dropLocation?: string };
                      };
                      const carrier = userRef(item.interestedUserId);
                      return (
                        <div key={String(item._id)} className="rounded-xl border border-white/5 p-3 text-sm">
                          <span className="font-medium">{carrier?.name ?? 'User'}</span>
                          <span className="text-slate-500"> expressed interest</span>
                          {item.listing ? (
                            <div className="mt-1 text-slate-400">
                              {item.listing.itemName ?? 'Shipment'}: {item.listing.pickupLocation} →{' '}
                              {item.listing.dropLocation}
                            </div>
                          ) : null}
                          <div className="mt-1 text-xs text-slate-600">{formatDateTime(item.createdAt)}</div>
                        </div>
                      );
                    })}
                    {dashboard.recentInterests.length === 0 && (
                      <p className="text-slate-500">No interests yet.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 font-medium text-slate-300">Latest reviews</h3>
                  <div className="space-y-2">
                    {dashboard.recentReviews.slice(0, 5).map((raw) => {
                      const item = raw as {
                        _id: string;
                        rating: number;
                        comment?: string;
                        createdAt?: string;
                        reviewerId?: unknown;
                        revieweeId?: unknown;
                      };
                      const reviewer = userRef(item.reviewerId);
                      const reviewee = userRef(item.revieweeId);
                      return (
                        <div key={String(item._id)} className="rounded-xl border border-white/5 p-3 text-sm">
                          <span className="font-medium">{reviewer?.name}</span>
                          <span className="text-slate-500"> rated </span>
                          <span className="font-medium">{reviewee?.name}</span>
                          <Badge tone="info">{item.rating}/5</Badge>
                          {item.comment ? (
                            <p className="mt-1 text-slate-400">{item.comment}</p>
                          ) : null}
                          <div className="mt-1 text-xs text-slate-600">{formatDateTime(item.createdAt)}</div>
                        </div>
                      );
                    })}
                    {dashboard.recentReviews.length === 0 && (
                      <p className="text-slate-500">No reviews yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {tab === 'activity' && (
            <section className="mt-8 space-y-8">
              <div>
                <h2 className="text-lg font-medium">Live platform feed</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Everything happening across the marketplace — signups, shipments, interests, reviews.
                </p>
                <div className="mt-4 space-y-2">
                  {dashboard.activityFeed.length === 0 && (
                    <p className="text-slate-500">No activity yet.</p>
                  )}
                  {dashboard.activityFeed.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/5 p-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openUserActivity(event.userId)}
                            className="font-medium text-sky-300 hover:text-sky-200"
                          >
                            {event.userName}
                          </button>
                          <Badge tone="info">{roleLabel(event.userRole as User['role'])}</Badge>
                          <Badge>{activityTypeLabel(event.type)}</Badge>
                          <span className="text-sm text-slate-300">{event.title}</span>
                        </div>
                        {event.detail ? (
                          <p className="mt-1 text-sm text-slate-400">{event.detail}</p>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-600">{formatDateTime(event.at)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium">Per-user status</h2>
                <p className="mt-1 text-sm text-slate-400">
                  What each user is doing right now — click View for full history.
                </p>
                <SearchBar value={search} onChange={setSearch} placeholder="Search users by name, status, activity..." />
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/[0.03] text-slate-400">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Current status</th>
                        <th className="px-4 py-3">Last activity</th>
                        <th className="px-4 py-3">Shipments</th>
                        <th className="px-4 py-3">Interests</th>
                        <th className="px-4 py-3">Listings</th>
                        <th className="px-4 py-3">Reviews</th>
                        <th className="px-4 py-3">Subscription</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSnapshots.map((s) => (
                        <tr key={s.id} className="border-t border-white/5">
                          <td className="px-4 py-3">
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-slate-500">{s.email}</div>
                          </td>
                          <td className="px-4 py-3">{roleLabel(s.role)}</td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <div className="text-slate-300">{s.statusLabel}</div>
                            {s.openShipments > 0 && (
                              <div className="text-xs text-sky-400">{s.openShipments} open</div>
                            )}
                            {s.inProgressShipments > 0 && (
                              <div className="text-xs text-amber-400">{s.inProgressShipments} in progress</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs">{s.lastActivitySummary}</div>
                            <div className="text-xs text-slate-600">{formatDateTime(s.lastActivityAt)}</div>
                          </td>
                          <td className="px-4 py-3">
                            {s.shipmentsPosted > 0 ? (
                              <div>
                                <div>{s.shipmentsPosted} posted</div>
                                {s.assignedShipments > 0 && (
                                  <div className="text-xs text-emerald-400">{s.assignedShipments} assigned</div>
                                )}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {s.interestsSent > 0 ? s.interestsSent : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {s.carrierListings > 0 ? (
                              <div>
                                {s.carrierListings} total
                                <div className="text-xs text-slate-500">{s.activeListings} active</div>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {s.reviewsReceived > 0 ? `${s.averageRating}★ (${s.reviewsReceived})` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {s.subscriptionActive ? (
                              <Badge tone="success">{s.subscriptionPlan ?? 'Active'}</Badge>
                            ) : (
                              <Badge tone="warn">Inactive</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => openUserActivity(s.id)}
                              className="rounded-full border border-sky-500/40 px-3 py-1 text-xs text-sky-300 hover:bg-sky-500/10"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {tab === 'requests' && (
            <section className="mt-8 space-y-4">
              <p className="text-sm text-slate-400">
                People who requested shipper or carrier access. Approve to create their account and
                share the temporary password.
              </p>
              {roleRequests.length === 0 && (
                <p className="text-slate-500">No access requests yet.</p>
              )}
              {roleRequests.map((req) => (
                <div
                  key={requestId(req)}
                  className="card-shine rounded-2xl border border-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{req.name}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {req.email}
                        {req.phone ? ` · ${req.phone}` : ''}
                      </div>
                      {req.locationLabel ? (
                        <div className="mt-1 text-xs text-slate-500">{req.locationLabel}</div>
                      ) : null}
                      {req.message ? (
                        <p className="mt-2 text-sm text-slate-300">{req.message}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="info">{roleLabel(req.requestedRole)}</Badge>
                      <Badge
                        tone={
                          req.status === 'pending'
                            ? 'warn'
                            : req.status === 'approved'
                              ? 'success'
                              : 'danger'
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Submitted {formatDateTime(req.createdAt)}
                  </div>
                  {req.status === 'pending' ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req)}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500"
                      >
                        Approve & create account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req)}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </section>
          )}

          {tab === 'shippers' && (
            <section className="mt-8">
              <SearchBar value={search} onChange={setSearch} placeholder="Search shippers..." />
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Shipper</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Subscription</th>
                      <th className="px-4 py-3">Listings</th>
                      <th className="px-4 py-3">Open</th>
                      <th className="px-4 py-3">In progress</th>
                      <th className="px-4 py-3">Closed</th>
                      <th className="px-4 py-3">Assigned</th>
                      <th className="px-4 py-3">Reviews</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShippers.map((s) => (
                      <tr key={s.id} className="border-t border-white/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-slate-500">@{s.username}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{s.email}</div>
                          <div className="text-xs text-slate-500">{s.phone ?? '—'}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[140px] truncate text-xs text-slate-400">
                          {s.locationLabel ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          {s.subscriptionActive ? (
                            <div>
                              <Badge tone="success">{s.subscriptionPlan ?? 'Active'}</Badge>
                              <div className="mt-1 text-xs text-slate-500">
                                {formatDate(s.subscriptionExpiresAt)}
                              </div>
                            </div>
                          ) : (
                            <Badge tone="warn">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">{s.totalListings}</td>
                        <td className="px-4 py-3">{s.openListings}</td>
                        <td className="px-4 py-3">{s.inProgressListings}</td>
                        <td className="px-4 py-3">{s.closedListings}</td>
                        <td className="px-4 py-3">{s.assignedListings}</td>
                        <td className="px-4 py-3">
                          {s.reviewsReceived > 0 ? `${s.averageRating}★ (${s.reviewsReceived})` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs">{formatDate(s.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openUserActivity(s.id)}
                            className="rounded-full border border-sky-500/40 px-3 py-1 text-xs text-sky-300 hover:bg-sky-500/10"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'carriers' && (
            <section className="mt-8">
              <SearchBar value={search} onChange={setSearch} placeholder="Search carriers..." />
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Carrier</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Subscription</th>
                      <th className="px-4 py-3">Listings</th>
                      <th className="px-4 py-3">Active</th>
                      <th className="px-4 py-3">Interests sent</th>
                      <th className="px-4 py-3">Reviews</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCarriers.map((c) => (
                      <tr key={c.id} className="border-t border-white/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-slate-500">@{c.username}</div>
                          {c.bio ? (
                            <div className="mt-1 max-w-[200px] truncate text-xs text-slate-600">{c.bio}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div>{c.email}</div>
                          <div className="text-xs text-slate-500">{c.phone ?? '—'}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[140px] truncate text-xs text-slate-400">
                          {c.locationLabel ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          {c.subscriptionActive ? (
                            <div>
                              <Badge tone="success">{c.subscriptionPlan ?? 'Active'}</Badge>
                              <div className="mt-1 text-xs text-slate-500">
                                {formatDate(c.subscriptionExpiresAt)}
                              </div>
                            </div>
                          ) : (
                            <Badge tone="warn">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">{c.totalListings}</td>
                        <td className="px-4 py-3">{c.activeListings}</td>
                        <td className="px-4 py-3 font-medium text-sky-300">{c.interestsSent}</td>
                        <td className="px-4 py-3">
                          {c.reviewsReceived > 0 ? `${c.averageRating}★ (${c.reviewsReceived})` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs">{formatDate(c.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openUserActivity(c.id)}
                            className="rounded-full border border-sky-500/40 px-3 py-1 text-xs text-sky-300 hover:bg-sky-500/10"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'shipments' && (
            <section className="mt-8 space-y-4">
              {dashboard.recentShipments.length === 0 && (
                <p className="text-slate-400">No shipments yet.</p>
              )}
              {dashboard.recentShipments.map((item) => {
                const row = item as {
                  _id: string;
                  itemName?: string;
                  itemType: string;
                  pickupLocation: string;
                  pickupLocationDetails?: string;
                  dropLocation: string;
                  dropLocationDetails?: string;
                  price: number;
                  status: string;
                  approvalStatus: string;
                  isManualSubmission?: boolean;
                  fragile?: boolean;
                  weightLbs?: number;
                  weightKg?: number;
                  notes?: string;
                  interestCount?: number;
                  createdAt?: string;
                  shipperId?: unknown;
                  assignedCarrierId?: unknown;
                };
                const shipper = userRef(row.shipperId);
                const assigned = userRef(row.assignedCarrierId);
                return (
                  <div key={row._id} className="card-shine rounded-2xl border border-white/5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium">
                          {row.itemName ?? row.itemType}: {row.pickupLocation} → {row.dropLocation}
                        </div>
                        {row.pickupLocationDetails || row.dropLocationDetails ? (
                          <div className="mt-1 text-xs text-slate-500">
                            {row.pickupLocationDetails ? `Pickup: ${row.pickupLocationDetails}` : ''}
                            {row.dropLocationDetails ? ` · Drop: ${row.dropLocationDetails}` : ''}
                          </div>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge>{row.status}</Badge>
                          <Badge tone={row.approvalStatus === 'approved' ? 'success' : row.approvalStatus === 'pending' ? 'warn' : 'danger'}>
                            {row.approvalStatus}
                          </Badge>
                          {row.isManualSubmission && <Badge tone="info">Web submission</Badge>}
                          {row.fragile && <Badge tone="warn">Fragile</Badge>}
                          {row.interestCount ? (
                            <Badge tone="info">{row.interestCount} interest(s)</Badge>
                          ) : null}
                        </div>
                        <div className="mt-2 text-sm text-slate-400">
                          {formatCurrency(row.price)}
                          {row.weightLbs || row.weightKg
                            ? ` · ${row.weightLbs ?? row.weightKg} lbs`
                            : ''}
                          {row.notes ? ` · ${row.notes}` : ''}
                        </div>
                        {shipper && (
                          <div className="mt-2 text-sm text-slate-500">
                            Shipper: {shipper.name} ({shipper.email})
                          </div>
                        )}
                        {assigned && (
                          <div className="mt-1 text-sm text-emerald-400/80">
                            Assigned carrier: {assigned.name} ({assigned.phone ?? assigned.email})
                          </div>
                        )}
                        <div className="mt-1 text-xs text-slate-600">Posted {formatDateTime(row.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {tab === 'listings' && (
            <section className="mt-8 space-y-4">
              {dashboard.recentCarrierListings.length === 0 && (
                <p className="text-slate-400">No carrier listings yet.</p>
              )}
              {dashboard.recentCarrierListings.map((item) => {
                const row = item as {
                  _id: string;
                  vehicleType: string;
                  serviceArea: string;
                  availability: string;
                  price: number;
                  isActive: boolean;
                  notes?: string;
                  createdAt?: string;
                  carrierId?: unknown;
                };
                const carrier = userRef(row.carrierId);
                return (
                  <div key={row._id} className="card-shine rounded-2xl border border-white/5 p-5">
                    <div className="font-medium">
                      {row.vehicleType} · {row.serviceArea}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={row.isActive ? 'success' : 'default'}>
                        {row.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge>{row.availability}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      {formatCurrency(row.price)}
                      {row.notes ? ` · ${row.notes}` : ''}
                    </div>
                    {carrier && (
                      <div className="mt-2 text-sm text-slate-500">
                        Carrier: {carrier.name} · {carrier.phone ?? carrier.email}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-slate-600">Listed {formatDateTime(row.createdAt)}</div>
                  </div>
                );
              })}
            </section>
          )}

          {tab === 'interests' && (
            <section className="mt-8 space-y-3">
              {dashboard.recentInterests.length === 0 && (
                <p className="text-slate-400">No carrier interests yet.</p>
              )}
              {dashboard.recentInterests.map((raw) => {
                const item = raw as {
                  _id: string;
                  listingType: string;
                  createdAt?: string;
                  interestedUserId?: unknown;
                  listing?: {
                    itemName?: string;
                    itemType?: string;
                    pickupLocation?: string;
                    dropLocation?: string;
                    price?: number;
                    status?: string;
                  };
                };
                const carrier = userRef(item.interestedUserId);
                return (
                  <div key={String(item._id)} className="card-shine rounded-2xl border border-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="font-medium">{carrier?.name ?? 'User'}</span>
                        <span className="text-slate-500"> ({carrier?.role ?? 'carrier'})</span>
                        <div className="text-sm text-slate-400">
                          {carrier?.email} · {carrier?.phone ?? 'no phone'}
                        </div>
                      </div>
                      <div className="text-xs text-slate-600">{formatDateTime(item.createdAt)}</div>
                    </div>
                    {item.listing ? (
                      <div className="mt-3 rounded-xl bg-white/[0.03] p-3 text-sm">
                        <div className="font-medium">
                          {item.listing.itemName ?? item.listing.itemType}
                        </div>
                        <div className="text-slate-400">
                          {item.listing.pickupLocation} → {item.listing.dropLocation}
                        </div>
                        <div className="mt-1 text-slate-500">
                          {item.listing.price != null ? formatCurrency(item.listing.price) : ''}
                          {item.listing.status ? ` · ${item.listing.status}` : ''}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">Listing no longer available</p>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {tab === 'reviews' && (
            <section className="mt-8 space-y-3">
              <div className="mb-4 text-sm text-slate-400">
                Platform average: <strong className="text-white">{overview.averageReviewRating || '—'}★</strong>{' '}
                across {overview.totalReviews} review(s)
              </div>
              {dashboard.recentReviews.length === 0 && (
                <p className="text-slate-400">No reviews yet.</p>
              )}
              {dashboard.recentReviews.map((raw) => {
                const item = raw as {
                  _id: string;
                  rating: number;
                  comment?: string;
                  createdAt?: string;
                  reviewerId?: unknown;
                  revieweeId?: unknown;
                  shipmentId?: { itemName?: string; pickupLocation?: string; dropLocation?: string } | null;
                };
                const reviewer = userRef(item.reviewerId);
                const reviewee = userRef(item.revieweeId);
                return (
                  <div key={String(item._id)} className="card-shine rounded-2xl border border-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{reviewer?.name}</span>
                      <span className="text-slate-500">→</span>
                      <span className="font-medium">{reviewee?.name}</span>
                      <Badge tone="info">{item.rating}/5</Badge>
                      <span className="text-xs text-slate-600">{formatDateTime(item.createdAt)}</span>
                    </div>
                    {item.comment ? <p className="mt-2 text-sm text-slate-300">{item.comment}</p> : null}
                    {item.shipmentId && typeof item.shipmentId === 'object' ? (
                      <div className="mt-2 text-xs text-slate-500">
                        Shipment: {item.shipmentId.itemName ?? '—'} ({item.shipmentId.pickupLocation} →{' '}
                        {item.shipmentId.dropLocation})
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </section>
          )}

          {tab === 'pending' && (
            <section className="mt-8 space-y-4">
              {pending.length === 0 && (
                <p className="text-slate-400">No pending submissions.</p>
              )}
              {pending.map((item) => (
                <div key={item._id} className="card-shine rounded-2xl border border-amber-500/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">
                        {item.itemName ?? item.itemType}: {item.pickupLocation} → {item.dropLocation}
                      </div>
                      {(item.pickupLocationDetails || item.dropLocationDetails) && (
                        <div className="mt-1 text-xs text-slate-500">
                          {item.pickupLocationDetails ? `Pickup detail: ${item.pickupLocationDetails}` : ''}
                          {item.dropLocationDetails ? ` · Drop detail: ${item.dropLocationDetails}` : ''}
                        </div>
                      )}
                    </div>
                    <Badge tone="warn">Pending approval</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                    <div>Price: {formatCurrency(item.price)}</div>
                    {item.weightLbs || item.weightKg ? (
                      <div>Weight: {item.weightLbs ?? item.weightKg} lbs</div>
                    ) : null}
                    {item.dimensions ? <div>Dimensions: {item.dimensions} in</div> : null}
                    {item.fragile ? <div>Fragile: Yes</div> : null}
                    <div>Contact: {item.contactName}</div>
                    <div>Phone: {item.contactPhone}</div>
                    <div>Email: {item.contactEmail}</div>
                    <div>Submitted: {formatDateTime(item.createdAt)}</div>
                  </div>
                  {item.notes ? (
                    <p className="mt-2 text-sm italic text-slate-500">{item.notes}</p>
                  ) : null}
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
            </section>
          )}

          {tab === 'rejected' && (
            <section className="mt-8 space-y-4">
              {dashboard.rejectedShipments.length === 0 && (
                <p className="text-slate-400">No rejected submissions.</p>
              )}
              {dashboard.rejectedShipments.map((raw) => {
                const item = raw as {
                  _id: string;
                  itemName?: string;
                  itemType: string;
                  pickupLocation: string;
                  dropLocation: string;
                  price: number;
                  contactName?: string;
                  contactEmail?: string;
                  updatedAt?: string;
                };
                return (
                  <div key={String(item._id)} className="card-shine rounded-2xl border border-red-500/20 p-5">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {item.itemName ?? item.itemType}: {item.pickupLocation} → {item.dropLocation}
                      </div>
                      <Badge tone="danger">Rejected</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      {formatCurrency(item.price)} · {item.contactName} · {item.contactEmail}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Rejected {formatDateTime(item.updatedAt)}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {tab === 'users' && (
            <section className="mt-8 space-y-8">
              <div className="card-shine rounded-2xl border border-white/5 p-6">
                <h2 className="text-lg font-medium">Create shipper or carrier</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Admin can create accounts directly. Share the temporary password with the user.
                </p>
                <form onSubmit={handleCreateUser} className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-slate-300">
                    Full name
                    <input
                      className="input-field mt-2"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Username
                    <input
                      className="input-field mt-2"
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      required
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Email
                    <input
                      className="input-field mt-2"
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      required
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Phone (include country code)
                    <input
                      className="input-field mt-2"
                      placeholder="+1 555 0100"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Role
                    <select
                      className="input-field mt-2"
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          role: e.target.value as 'shipper' | 'carrier',
                        })
                      }
                    >
                      <option value="shipper">Shipper</option>
                      <option value="carrier">Carrier</option>
                    </select>
                  </label>
                  <label className="block text-sm text-slate-300">
                    Operating area (optional)
                    <input
                      className="input-field mt-2"
                      placeholder="Any city / region worldwide"
                      value={createForm.locationLabel}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, locationLabel: e.target.value })
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={createForm.subscriptionActive}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, subscriptionActive: e.target.checked })
                      }
                    />
                    Activate subscription for 30 days
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
                    >
                      {creatingUser ? 'Creating...' : 'Create account'}
                    </button>
                  </div>
                </form>
              </div>

              <SearchBar value={search} onChange={setSearch} placeholder="Search all users..." />
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Subscription</th>
                      <th className="px-4 py-3">Expires</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-white/5">
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.username}</td>
                        <td className="px-4 py-3">{u.phone ?? '—'}</td>
                        <td className="px-4 py-3">{roleLabel(u.role)}</td>
                        <td className="px-4 py-3 max-w-[120px] truncate text-xs text-slate-400">
                          {u.locationLabel ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          {u.subscriptionActive ? (
                            <Badge tone="success">{u.subscriptionPlan ?? 'Active'}</Badge>
                          ) : (
                            <Badge tone="danger">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {formatDate(u.subscriptionExpiresAt)}
                        </td>
                        <td className="px-4 py-3 text-xs">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openUserActivity(u.id)}
                              className="rounded-full border border-sky-500/40 px-3 py-1 text-xs text-sky-300 hover:bg-sky-500/10"
                            >
                              Activity
                            </button>
                            {!isAdminRole(u.role) && (
                              <button
                                onClick={() => toggleSubscription(u)}
                                className="rounded-full border border-slate-600 px-3 py-1 text-xs hover:border-slate-400"
                              >
                                {u.subscriptionActive ? 'Revoke' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>

      {createdCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-emerald-300">Account ready</h2>
            <p className="mt-2 text-sm text-slate-400">
              Share these credentials with {createdCred.name}. The temporary password is shown once.
            </p>
            <div className="mt-4 space-y-2 rounded-xl bg-white/[0.03] p-4 text-sm">
              <div>Role: <strong>{roleLabel(createdCred.role as User['role'])}</strong></div>
              <div>Email: <strong>{createdCred.email}</strong></div>
              <div>Username: <strong>{createdCred.username}</strong></div>
              <div>Password: <strong className="text-sky-300">{createdCred.password}</strong></div>
            </div>
            <button
              type="button"
              onClick={() => setCreatedCred(null)}
              className="btn-primary mt-6 w-full py-2.5"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
              <div>
                {activityLoading ? (
                  <h2 className="text-xl font-semibold">Loading user activity...</h2>
                ) : userActivity ? (
                  <>
                    <h2 className="text-xl font-semibold">{userActivity.user.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      @{userActivity.user.username} · {roleLabel(userActivity.user.role)} ·{' '}
                      {userActivity.user.email}
                      {userActivity.user.phone ? ` · ${userActivity.user.phone}` : ''}
                    </p>
                  </>
                ) : (
                  <h2 className="text-xl font-semibold">User activity</h2>
                )}
              </div>
              <button
                type="button"
                onClick={closeUserActivity}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            {activityLoading && (
              <div className="p-10 text-center text-slate-400">Fetching full activity history...</div>
            )}

            {userActivity && !activityLoading && (
              <div className="max-h-[75vh] space-y-8 overflow-y-auto p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Shipments posted" value={userActivity.summary.shipmentsPosted} />
                  <StatCard label="Open" value={userActivity.summary.openShipments} />
                  <StatCard label="In progress" value={userActivity.summary.inProgressShipments} tone="warn" />
                  <StatCard label="Closed" value={userActivity.summary.closedShipments} tone="success" />
                  <StatCard label="Assigned as carrier" value={userActivity.summary.assignedAsCarrier} />
                  <StatCard label="Interests sent" value={userActivity.summary.interestsSent} />
                  <StatCard label="Interests received" value={userActivity.summary.interestsReceived} />
                  <StatCard
                    label="Reviews"
                    value={`${userActivity.summary.reviewsReceived} received · ${userActivity.summary.averageRatingReceived}★`}
                  />
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 p-4">
                    <div className="text-slate-400">Location</div>
                    <div className="mt-1">{userActivity.user.locationLabel ?? 'Not set'}</div>
                  </div>
                  <div className="rounded-xl border border-white/5 p-4">
                    <div className="text-slate-400">Subscription</div>
                    <div className="mt-1">
                      {userActivity.user.subscriptionActive ? (
                        <>
                          <Badge tone="success">{userActivity.user.subscriptionPlan ?? 'Active'}</Badge>
                          <span className="ml-2 text-slate-500">
                            expires {formatDate(userActivity.user.subscriptionExpiresAt)}
                          </span>
                        </>
                      ) : (
                        <Badge tone="warn">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  {userActivity.user.bio ? (
                    <div className="rounded-xl border border-white/5 p-4 sm:col-span-2">
                      <div className="text-slate-400">Bio</div>
                      <div className="mt-1 text-slate-300">{userActivity.user.bio}</div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h3 className="font-medium text-slate-200">Activity timeline</h3>
                  <div className="mt-3 space-y-2">
                    {userActivity.timeline.length === 0 && (
                      <p className="text-slate-500">No activity recorded.</p>
                    )}
                    {userActivity.timeline.map((event) => (
                      <div key={event.id} className="rounded-xl border border-white/5 p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{activityTypeLabel(event.type)}</Badge>
                          <span className="font-medium">{event.title}</span>
                          <span className="text-xs text-slate-600">{formatDateTime(event.at)}</span>
                        </div>
                        {event.detail ? (
                          <p className="mt-1 text-slate-400">{event.detail}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {userActivity.shipmentsPosted.length > 0 && (
                  <div>
                    <h3 className="font-medium text-slate-200">
                      Shipments posted ({userActivity.shipmentsPosted.length})
                    </h3>
                    <div className="mt-3 space-y-2">
                      {userActivity.shipmentsPosted.map((raw) => {
                        const row = raw as {
                          _id: string;
                          itemName?: string;
                          itemType: string;
                          pickupLocation: string;
                          dropLocation: string;
                          price: number;
                          status: string;
                          approvalStatus: string;
                          interestCount?: number;
                          assignedCarrierId?: unknown;
                          createdAt?: string;
                        };
                        const assigned = userRef(row.assignedCarrierId);
                        return (
                          <div key={row._id} className="rounded-xl border border-white/5 p-3 text-sm">
                            <div className="font-medium">
                              {row.itemName ?? row.itemType}: {row.pickupLocation} → {row.dropLocation}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <Badge>{row.status}</Badge>
                              <Badge>{row.approvalStatus}</Badge>
                              {(row.interestCount ?? 0) > 0 && (
                                <Badge tone="info">{row.interestCount} interest(s)</Badge>
                              )}
                            </div>
                            <div className="mt-1 text-slate-400">
                              {formatCurrency(row.price)}
                              {assigned ? ` · Assigned: ${assigned.name}` : ''}
                            </div>
                            <div className="text-xs text-slate-600">{formatDateTime(row.createdAt)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {userActivity.assignedShipments.length > 0 && (
                  <div>
                    <h3 className="font-medium text-slate-200">
                      Assigned as carrier ({userActivity.assignedShipments.length})
                    </h3>
                    <div className="mt-3 space-y-2">
                      {userActivity.assignedShipments.map((raw) => {
                        const row = raw as {
                          _id: string;
                          itemName?: string;
                          itemType: string;
                          pickupLocation: string;
                          dropLocation: string;
                          status: string;
                          shipperId?: unknown;
                          updatedAt?: string;
                        };
                        const shipper = userRef(row.shipperId);
                        return (
                          <div key={row._id} className="rounded-xl border border-emerald-500/20 p-3 text-sm">
                            <div className="font-medium">
                              {row.itemName ?? row.itemType}: {row.pickupLocation} → {row.dropLocation}
                            </div>
                            <Badge tone="success">{row.status}</Badge>
                            {shipper && (
                              <div className="mt-1 text-slate-400">Shipper: {shipper.name}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {userActivity.interestsSent.length > 0 && (
                  <div>
                    <h3 className="font-medium text-slate-200">
                      Interests sent ({userActivity.interestsSent.length})
                    </h3>
                    <div className="mt-3 space-y-2">
                      {userActivity.interestsSent.map((raw) => {
                        const item = raw as {
                          _id: string;
                          createdAt?: string;
                          listing?: {
                            itemName?: string;
                            pickupLocation?: string;
                            dropLocation?: string;
                            price?: number;
                            status?: string;
                          } | null;
                        };
                        return (
                          <div key={String(item._id)} className="rounded-xl border border-white/5 p-3 text-sm">
                            {item.listing ? (
                              <>
                                <div className="font-medium">{item.listing.itemName ?? 'Shipment'}</div>
                                <div className="text-slate-400">
                                  {item.listing.pickupLocation} → {item.listing.dropLocation}
                                </div>
                              </>
                            ) : (
                              <div className="text-slate-500">Shipment no longer available</div>
                            )}
                            <div className="text-xs text-slate-600">{formatDateTime(item.createdAt)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {userActivity.interestsReceived.length > 0 && (
                  <div>
                    <h3 className="font-medium text-slate-200">
                      Interests received on listings ({userActivity.interestsReceived.length})
                    </h3>
                    <div className="mt-3 space-y-2">
                      {userActivity.interestsReceived.map((raw) => {
                        const item = raw as {
                          _id: string;
                          createdAt?: string;
                          interestedUserId?: unknown;
                          shipment?: { itemName?: string; pickupLocation?: string; dropLocation?: string };
                        };
                        const carrier = userRef(item.interestedUserId);
                        return (
                          <div key={String(item._id)} className="rounded-xl border border-sky-500/20 p-3 text-sm">
                            <div className="font-medium">{carrier?.name ?? 'Carrier'} expressed interest</div>
                            {item.shipment && (
                              <div className="text-slate-400">
                                {item.shipment.itemName}: {item.shipment.pickupLocation} →{' '}
                                {item.shipment.dropLocation}
                              </div>
                            )}
                            <div className="text-xs text-slate-600">{formatDateTime(item.createdAt)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {userActivity.carrierListings.length > 0 && (
                  <div>
                    <h3 className="font-medium text-slate-200">
                      Carrier listings ({userActivity.carrierListings.length})
                    </h3>
                    <div className="mt-3 space-y-2">
                      {userActivity.carrierListings.map((raw) => {
                        const row = raw as {
                          _id: string;
                          vehicleType: string;
                          serviceArea: string;
                          price: number;
                          isActive: boolean;
                          availability: string;
                        };
                        return (
                          <div key={row._id} className="rounded-xl border border-white/5 p-3 text-sm">
                            <div className="font-medium">
                              {row.vehicleType} · {row.serviceArea}
                            </div>
                            <Badge tone={row.isActive ? 'success' : 'default'}>
                              {row.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="mt-1 text-slate-400">
                              {formatCurrency(row.price)} · {row.availability}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(userActivity.reviewsGiven.length > 0 || userActivity.reviewsReceived.length > 0) && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {userActivity.reviewsGiven.length > 0 && (
                      <div>
                        <h3 className="font-medium text-slate-200">Reviews given</h3>
                        <div className="mt-3 space-y-2">
                          {userActivity.reviewsGiven.map((raw) => {
                            const item = raw as {
                              _id: string;
                              rating: number;
                              comment?: string;
                              revieweeId?: unknown;
                              createdAt?: string;
                            };
                            const reviewee = userRef(item.revieweeId);
                            return (
                              <div key={String(item._id)} className="rounded-xl border border-white/5 p-3 text-sm">
                                <Badge tone="info">{item.rating}/5</Badge> → {reviewee?.name}
                                {item.comment ? <p className="mt-1 text-slate-400">{item.comment}</p> : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {userActivity.reviewsReceived.length > 0 && (
                      <div>
                        <h3 className="font-medium text-slate-200">Reviews received</h3>
                        <div className="mt-3 space-y-2">
                          {userActivity.reviewsReceived.map((raw) => {
                            const item = raw as {
                              _id: string;
                              rating: number;
                              comment?: string;
                              reviewerId?: unknown;
                              createdAt?: string;
                            };
                            const reviewer = userRef(item.reviewerId);
                            return (
                              <div key={String(item._id)} className="rounded-xl border border-white/5 p-3 text-sm">
                                {reviewer?.name} <Badge tone="info">{item.rating}/5</Badge>
                                {item.comment ? <p className="mt-1 text-slate-400">{item.comment}</p> : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
