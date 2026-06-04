import Link from 'next/link';

export default function RegisterCancelPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-semibold">Payment cancelled</h1>
        <p className="mt-4 text-slate-400">
          Your account was created but payment was not completed.
          Log in and complete payment to activate your subscription.
        </p>
        <Link
          href="/billing"
          className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-medium hover:bg-orange-400"
        >
          Complete payment
        </Link>
      </div>
    </div>
  );
}
