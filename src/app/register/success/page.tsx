import { Suspense } from 'react';
import RegisterSuccessClient from './RegisterSuccessClient';

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-slate-950 p-8 text-white">Loading...</div>}>
      <RegisterSuccessClient />
    </Suspense>
  );
}
