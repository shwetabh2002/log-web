const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type UserRole = 'shipper' | 'carrier' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  subscriptionActive: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  reviewerId: { name: string; role: string };
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    const message = Array.isArray(error.message)
      ? error.message[0]
      : error.message;
    throw new Error(message ?? 'Request failed');
  }
  return res.json();
}

export const api = {
  register: (body: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: UserRole;
    subscriptionPlan?: string;
  }) =>
    request<{
      accessToken: string;
      checkoutRequired: boolean;
      user: User;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: (token: string) => request<User>('/auth/me', {}, token),

  getPlans: () =>
    request<
      { id: string; name: string; role: UserRole; amountUsd: number }[]
    >('/payments/plans'),

  createCheckout: (token: string, planId: string) =>
    request<{ url: string; mock?: boolean }>(
      '/payments/checkout',
      { method: 'POST', body: JSON.stringify({ planId }) },
      token,
    ),

  submitPublicShipment: (body: {
    itemType: string;
    pickupLocation: string;
    dropLocation: string;
    price: number;
    notes?: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  }) =>
    request('/shipments/public', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getPendingShipments: (token: string) =>
    request<unknown[]>('/admin/pending-shipments', {}, token),

  approveShipment: (token: string, id: string) =>
    request(`/admin/shipments/${id}/approve`, { method: 'PATCH' }, token),

  rejectShipment: (token: string, id: string) =>
    request(`/admin/shipments/${id}/reject`, { method: 'PATCH' }, token),

  getUsers: (token: string) => request<User[]>('/admin/users', {}, token),

  getAdminStats: (token: string) =>
    request<{
      totalUsers: number;
      activeSubscriptions: number;
      pendingShipments: number;
      openShipments: number;
      closedShipments: number;
    }>('/admin/stats', {}, token),

  updateUserSubscription: (
    token: string,
    userId: string,
    body: { subscriptionActive: boolean; subscriptionPlan?: string },
  ) =>
    request(
      `/admin/users/${userId}/subscription`,
      { method: 'PATCH', body: JSON.stringify(body) },
      token,
    ),

  getUserReviews: (userId: string) =>
    request<Review[]>(`/reviews/user/${userId}`),

  getUserReviewSummary: (userId: string) =>
    request<ReviewSummary>(`/reviews/user/${userId}/summary`),
};
