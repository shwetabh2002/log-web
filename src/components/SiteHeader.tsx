'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { isAdminRole, roleLabel } from '@/lib/is-admin';

export function SiteHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060912]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="logo-mark">LH</div>
          <span className="text-lg font-semibold tracking-tight">
            Logistics<span className="text-sky-400">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <Link href="/#features" className="transition hover:text-white">Features</Link>
          <Link href="/#how-it-works" className="transition hover:text-white">How it works</Link>
          <Link href="/submit-shipment" className="transition hover:text-white">Post a load</Link>
          <Link href="/join" className="transition hover:text-white">Become shipper/carrier</Link>
          {user && !isAdminRole(user.role) && (
            <Link href="/account" className="transition hover:text-white">My account</Link>
          )}
          {user && isAdminRole(user.role) && (
            <Link href="/admin" className="transition hover:text-white">Admin dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-white/5" />
          ) : user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">
                  {roleLabel(user.role)}
                  {!isAdminRole(user.role) && (
                    <>
                      {' · '}
                      {user.subscriptionActive ? (
                        <span className="text-emerald-400">Active</span>
                      ) : (
                        <span className="text-amber-400">Payment pending</span>
                      )}
                    </>
                  )}
                </p>
              </div>
              {!user.subscriptionActive && !isAdminRole(user.role) && (
                <Link href="/billing" className="btn-primary px-4 py-2 text-sm">
                  Activate
                </Link>
              )}
              <Link
                href={isAdminRole(user.role) ? '/admin' : '/account'}
                className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:text-white sm:block"
              >
                {isAdminRole(user.role) ? 'Dashboard' : 'Account'}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm text-slate-300 transition hover:text-white sm:block">
                Login
              </Link>
              <Link href="/register" className="btn-primary px-5 py-2.5 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
