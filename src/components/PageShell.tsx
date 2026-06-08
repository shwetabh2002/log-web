import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export function PageShell({
  children,
  className = '',
  hideFooter = false,
}: {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
}) {
  return (
    <div className={`flex min-h-full flex-col bg-[#060912] text-white ${className}`}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
