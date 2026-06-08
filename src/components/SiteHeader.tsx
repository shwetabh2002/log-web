import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060912]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="logo-mark">LH</div>
          <span className="text-lg font-semibold tracking-tight">
            Logistics<span className="text-sky-400">Hub</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <Link href="/#features" className="transition hover:text-white">Features</Link>
          <Link href="/#how-it-works" className="transition hover:text-white">How it works</Link>
          <Link href="/submit-shipment" className="transition hover:text-white">Post a load</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-slate-300 transition hover:text-white sm:block">
            Login
          </Link>
          <Link href="/register" className="btn-primary px-5 py-2.5 text-sm">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
