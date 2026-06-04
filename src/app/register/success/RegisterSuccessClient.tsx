'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function RegisterSuccessClient() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'active' | 'pending'>('checking');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('pending');
      return;
    }
    const check = () =>
      api.me(token).then((user) => {
        setStatus(user.subscriptionActive ? 'active' : 'pending');
      });

    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, [params]);

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        {status === 'checking' && (
          <>
            <h1 className="text-2xl font-semibold">Confirming payment...</h1>
            <p className="mt-4 text-slate-400">Please wait while we activate your subscription.</p>
          </>
        )}
        {status === 'active' && (
          <>
            <h1 className="text-2xl font-semibold">Subscription active!</h1>
            <p className="mt-4 text-slate-400">
              Check your email for login credentials and the app download link.
            </p>
          </>
        )}
        {status === 'pending' && (
          <>
            <h1 className="text-2xl font-semibold">Payment pending</h1>
            <p className="mt-4 text-slate-400">
              If you completed payment, it may take a moment. Otherwise complete checkout below.
            </p>
            <Link
              href="/billing"
              className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-medium hover:bg-orange-400"
            >
              Go to billing
            </Link>
          </>
        )}
        <Link href="/login" className="mt-4 block text-orange-400 hover:underline">
          Go to login
        </Link>
      </div>
    </div>
  );
}
