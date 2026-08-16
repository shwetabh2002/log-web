'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { isAdminRole } from '@/lib/is-admin';
import { PageShell } from '@/components/PageShell';
import { api } from '@/lib/api';

function roleLabel(role: string) {
  if (role === 'shipper') return 'Shipper';
  if (role === 'carrier') return 'Carrier';
  return role;
}

function formatPlan(plan?: string) {
  if (!plan) return 'Not selected';
  return plan
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, welcomeCredentials, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
      return;
    }
    if (!loading && isAdminRole(user?.role)) {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await api.changePassword(token, {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(result.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loading || !user) {
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
          <Link href="/" className="text-sm text-slate-400 transition hover:text-sky-400">
            ← Back to home
          </Link>

          <h1 className="mt-6 text-4xl font-bold">My account</h1>
          <p className="mt-3 text-slate-400">
            Manage your subscription, password, and app access from here.
          </p>

          <div className="card-shine mt-10 space-y-6 rounded-3xl border border-white/5 p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Profile</p>
              <p className="mt-3 text-2xl font-semibold">{user.name}</p>
              <p className="mt-1 text-slate-400">{user.email}</p>
              <p className="mt-1 text-sm text-slate-500">Username: {user.username}</p>
              {user.phone ? (
                <p className="mt-1 text-sm text-slate-500">Phone: {user.phone}</p>
              ) : null}
              {user.locationLabel ? (
                <p className="mt-1 text-sm text-slate-500">Location: {user.locationLabel}</p>
              ) : null}
              <p className="mt-2 text-sm text-slate-400">Role: {roleLabel(user.role)}</p>
            </div>

            <div className="border-t border-white/5 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Subscription</p>
              {user.subscriptionActive ? (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <p className="font-semibold text-emerald-400">Active</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Plan: {formatPlan(user.subscriptionPlan)}</p>
                  {user.subscriptionExpiresAt && (
                    <p className="mt-1 text-sm text-slate-500">
                      Renews / expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-slate-400">
                    Sign in on the mobile app with your username and password.
                  </p>
                  {welcomeCredentials ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                      <p className="text-slate-300">
                        Username:{' '}
                        <span className="font-mono text-white">{welcomeCredentials.username}</span>
                      </p>
                      <p className="mt-1 text-slate-300">
                        Password:{' '}
                        <span className="font-mono text-white">{welcomeCredentials.password}</span>
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Shown once — update it below after first login.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <p className="font-semibold text-amber-400">Payment pending</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Plan: {formatPlan(user.subscriptionPlan)}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Complete payment to activate your subscription and view app login credentials on this page.
                  </p>
                  <Link href="/billing" className="btn-primary mt-5 inline-block px-6 py-3">
                    Complete payment
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                Change password
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Use your temporary password the first time, then set a new one.
              </p>
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <label className="block text-sm text-slate-300">
                  Current password
                  <input
                    className="input-field mt-2"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  New password
                  <input
                    className="input-field mt-2"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Confirm new password
                  <input
                    className="input-field mt-2"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>
                {passwordError ? <p className="text-sm text-red-400">{passwordError}</p> : null}
                {passwordSuccess ? (
                  <p className="text-sm text-emerald-400">{passwordSuccess}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-white/5 pt-6">
              <Link href="/billing" className="btn-secondary px-5 py-2.5 text-sm">
                Billing
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
