import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-[#060912] text-slate-400">
          Loading...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
