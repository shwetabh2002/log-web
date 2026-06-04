import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

const features = [
  {
    icon: '📦',
    title: 'Post in seconds',
    desc: 'Shippers list goods with pickup, drop, and fixed price. Carriers list vehicle availability.',
  },
  {
    icon: '🔍',
    title: 'Smart discovery',
    desc: 'Filter by location, item type, and distance. Find the right match without endless calls.',
  },
  {
    icon: '🤝',
    title: 'One-tap interest',
    desc: 'No bidding chaos. Tap Interested and get full contact details instantly.',
  },
  {
    icon: '⭐',
    title: 'Trust built in',
    desc: 'Ratings and reviews for shippers and carriers after every completed deal.',
  },
];

const steps = [
  { num: '01', title: 'Subscribe on web', desc: 'Pick shipper or carrier plan, pay, get app credentials by email.' },
  { num: '02', title: 'Download the app', desc: 'Log in on mobile and post or browse listings with fixed pricing.' },
  { num: '03', title: 'Express interest', desc: 'Found a match? Tap Interested — contact details shared immediately.' },
  { num: '04', title: 'Deal offline', desc: 'Negotiate and pay externally. Update shipment status in the app.' },
];

export default function Home() {
  return (
    <div className="min-h-full bg-slate-950 text-white">
      <SiteHeader />

      {/* Hero */}
      <section className="hero-glow grid-pattern relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                Live marketplace · MVP
              </div>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
                Move goods faster with{' '}
                <span className="gradient-text">zero friction</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
                Connect shippers and carriers in minutes. Fixed pricing on every listing,
                instant contact when interest is expressed — payments happen your way, offline.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/register" className="btn-primary px-8 py-3.5">
                  Start free trial — ₹499/mo
                </Link>
                <Link href="/submit-shipment" className="btn-secondary px-8 py-3.5">
                  Post without subscription
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 border-t border-white/5 pt-8">
                {[
                  ['500+', 'Listings'],
                  ['2 min', 'Avg. match'],
                  ['₹499', 'Per month'],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-bold text-white">{val}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="animate-float card-shine absolute -left-4 top-8 z-10 rounded-2xl border border-white/10 p-5 shadow-2xl">
                <div className="text-xs font-medium uppercase tracking-wider text-orange-400">New shipment</div>
                <div className="mt-2 text-lg font-semibold">Fridge · Delhi → Gurgaon</div>
                <div className="mt-1 text-2xl font-bold text-orange-400">₹2,500</div>
                <div className="mt-3 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">Open</div>
              </div>
              <div className="card-shine ml-12 rounded-3xl border border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Carrier nearby</span>
                  <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300">12 km</span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">🚛</div>
                  <div>
                    <div className="font-semibold">Tempo · Delhi NCR</div>
                    <div className="text-sm text-slate-400">Mon–Sat · from ₹1,500</div>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-orange-500 py-3 text-center text-sm font-semibold">
                  Interested → Contact shared
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Features</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Everything you need to move goods</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Built for real-world logistics in India — simple, fast, and designed for shippers and carriers alike.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-shine group rounded-2xl border border-white/5 p-6 transition hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-4 font-semibold text-white group-hover:text-orange-300">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-white/5 bg-slate-900/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-8">
              <div className="text-4xl">📋</div>
              <h3 className="mt-4 text-2xl font-bold">For Shippers</h3>
              <p className="mt-3 text-slate-400">
                Post shipments with item type, route, and fixed price. Manage status from Open to Closed.
                See interested carriers with full contact instantly.
              </p>
              <Link href="/register" className="mt-6 inline-block text-sm font-semibold text-blue-400 hover:underline">
                Subscribe as shipper →
              </Link>
            </div>
            <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-8">
              <div className="text-4xl">🚚</div>
              <h3 className="mt-4 text-2xl font-bold">For Carriers</h3>
              <p className="mt-3 text-slate-400">
                Browse loads near you, filter by distance and type. Post your vehicle availability.
                Tap Interested and connect with shippers immediately.
              </p>
              <Link href="/register" className="mt-6 inline-block text-sm font-semibold text-orange-400 hover:underline">
                Subscribe as carrier →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">How it works</p>
          <h2 className="mt-3 text-3xl font-bold">Four steps to your first deal</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.num} className="relative rounded-2xl border border-white/5 p-6">
                <span className="text-4xl font-bold text-orange-500/30">{s.num}</span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="card-shine rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent p-12 md:p-16">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to move your first load?</h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              Join shippers and carriers already using LogisticsHub. Subscribe today and get the mobile app credentials by email.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-primary px-10 py-4 text-base">
                Subscribe now
              </Link>
              <Link href="/login" className="btn-secondary px-10 py-4 text-base">
                I have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
