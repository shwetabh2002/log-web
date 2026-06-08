import { Suspense } from 'react';
import RegisterSuccessClient from './RegisterSuccessClient';

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-[#060912] p-8 text-white">Loading...</div>}>
      <RegisterSuccessClient />
    </Suspense>
  );
}
