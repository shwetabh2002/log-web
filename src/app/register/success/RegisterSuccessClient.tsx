'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { getStoredToken } from '@/lib/auth-storage';

export default function RegisterSuccessClient() {
  const params = useSearchParams();
  const { refresh, welcomeCredentials } = useAuth();
  const [status, setStatus] = useState<'checking' | 'active' | 'pending'>('checking');
  const [localCredentials, setLocalCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const credentials = localCredentials ?? welcomeCredentials;

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setStatus('pending');
      return;
    }
    const check = () =>
      api.me(token).then(async (user) => {
        if (user.welcomePassword) {
          setLocalCredentials({ username: user.username, password: user.welcomePassword });
        }
        const nextStatus = user.subscriptionActive ? 'active' : 'pending';
        setStatus(nextStatus);
        if (user.subscriptionActive) {
          await refresh();
        }
      });

    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, [params, refresh]);

  return (
    <div className="flex min-h-full items-center justify-center bg-[#060912] px-6 text-white">
      <div className="glass-panel max-w-md rounded-3xl p-8 text-center">
        {status === 'checking' && (
          <>
            <h1 className="text-2xl font-semibold">Confirming payment...</h1>
            <p className="mt-4 text-slate-400">Please wait while we activate your subscription.</p>
          </>
        )}
        {status === 'active' && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-xl font-bold">
              ✓
            </div>
            <h1 className="text-2xl font-semibold">Subscription active!</h1>
            {credentials ? (
              <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 text-left">
                <p className="text-sm font-semibold text-sky-300">Your app login credentials</p>
                <p className="mt-3 text-sm text-slate-300">
                  Username: <span className="font-mono text-white">{credentials.username}</span>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Password: <span className="font-mono text-white">{credentials.password}</span>
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  Save these now — the password is shown once. Use them to sign in on the mobile app.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-slate-400">
                Your subscription is active. Open your account page to view app login credentials if you haven&apos;t saved them yet.
              </p>
            )}
            <Link href="/account" className="btn-primary mt-6 inline-block px-6 py-3">
              Go to my account
            </Link>
          </>
        )}
        {status === 'pending' && (
          <>
            <h1 className="text-2xl font-semibold">Payment pending</h1>
            <p className="mt-4 text-slate-400">
              If you completed payment, it may take a moment. Otherwise complete checkout below.
            </p>
            <Link href="/billing" className="btn-primary mt-6 inline-block px-6 py-3">
              Go to billing
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
