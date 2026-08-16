export function isAdminRole(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function roleLabel(role: string) {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  if (role === 'shipper') return 'Shipper';
  if (role === 'carrier') return 'Carrier';
  return role;
}
