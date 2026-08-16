'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { isAdminRole } from '@/lib/is-admin';

export function HomeHeroActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mt-10 flex flex-wrap gap-4">
        <div className="h-12 w-48 animate-pulse rounded-full bg-white/5" />
        <div className="h-12 w-48 animate-pulse rounded-full bg-white/5" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href={isAdminRole(user.role) ? '/admin' : '/account'} className="btn-primary px-8 py-3.5">
          {isAdminRole(user.role) ? 'Open admin dashboard' : 'My account'}
        </Link>
        {!user.subscriptionActive && !isAdminRole(user.role) ? (
          <Link href="/billing" className="btn-secondary px-8 py-3.5">
            Complete payment
          </Link>
        ) : (
          <Link href="/submit-shipment" className="btn-secondary px-8 py-3.5">
            Post a load
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <Link href="/join" className="btn-primary px-8 py-3.5">
        Request shipper / carrier access
      </Link>
      <Link href="/submit-shipment" className="btn-secondary px-8 py-3.5">
        Post a load
      </Link>
    </div>
  );
}

export function HomeRoleLinks() {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
    <>
      <Link href="/register" className="mt-6 inline-block text-sm font-semibold text-blue-400 hover:underline">
        Subscribe as shipper →
      </Link>
    </>
  );
}

export function HomeCarrierLink() {
  const { user, loading } = useAuth();
  if (loading || user) return null;
  return (
    <Link href="/register" className="mt-6 inline-block text-sm font-semibold text-sky-400 hover:underline">
      Subscribe as carrier →
    </Link>
  );
}

export function HomeBottomCta() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/account" className="btn-primary px-10 py-4 text-base">
          View my subscription
        </Link>
        {!user.subscriptionActive && !isAdminRole(user.role) && (
          <Link href="/billing" className="btn-secondary px-10 py-4 text-base">
            Complete payment
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-4">
      <Link href="/register" className="btn-primary px-10 py-4 text-base">
        Subscribe now
      </Link>
      <Link href="/login" className="btn-secondary px-10 py-4 text-base">
        I have an account
      </Link>
    </div>
  );
}
