import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold">L</div>
            <span className="font-semibold">LogisticsHub</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            India&apos;s simplest marketplace to connect shippers with carriers.
            Fixed pricing, instant contact, deals offline.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/register" className="hover:text-orange-400">Subscribe</Link></li>
            <li><Link href="/submit-shipment" className="hover:text-orange-400">Submit shipment</Link></li>
            <li><Link href="/billing" className="hover:text-orange-400">Billing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Support</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/login" className="hover:text-orange-400">Admin login</Link></li>
            <li><a href="mailto:support@logisticshub.local" className="hover:text-orange-400">Contact us</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} LogisticsHub. All rights reserved.
      </div>
    </footer>
  );
}
