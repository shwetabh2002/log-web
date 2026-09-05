/**
 * Dev-only UI (test logins).
 * Release / `next build` inlines NODE_ENV=production → passwords tree-shake out.
 * Override: NEXT_PUBLIC_ENABLE_DEV_TOOLS=true|false
 */
export function isDevToolsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true') return true;
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

/** null in production builds unless explicitly forced via ENABLE_DEV_TOOLS. */
export const DEV_TEST_ACCOUNTS =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true'
    ? ({
        shipper: { login: 'testshipper', password: 'test1234' },
        carrier: { login: 'testcarrier', password: 'test1234' },
        admin: { login: 'admin', password: 'admin123' },
      } as const)
    : null;
