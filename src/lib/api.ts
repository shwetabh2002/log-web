const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type UserRole = 'shipper' | 'carrier' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phone?: string;
  role: UserRole;
  subscriptionActive: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  locationLabel?: string;
  locationLat?: number;
  locationLng?: number;
  locationPlaceId?: string;
  hasLocation?: boolean;
  createdAt?: string;
  /** One-time app password returned after subscription activation (no email). */
  welcomePassword?: string;
}

export interface AdminDashboard {
  overview: {
    totalUsers: number;
    shippers: number;
    carriers: number;
    admins: number;
    activeSubscriptions: number;
    inactiveSubscriptions: number;
    usersWithLocation: number;
    expiringSubscriptions: number;
    signupsLast7Days: number;
    pendingShipments: number;
    approvedShipments: number;
    rejectedShipments: number;
    openShipments: number;
    inProgressShipments: number;
    closedShipments: number;
    assignedShipments: number;
    manualSubmissions: number;
    shipmentsLast7Days: number;
    totalShipments: number;
    totalCarrierListings: number;
    activeCarrierListings: number;
    inactiveCarrierListings: number;
    totalInterests: number;
    shipmentInterests: number;
    carrierInterests: number;
    interestsLast7Days: number;
    totalReviews: number;
    averageReviewRating: number;
    pendingRoleRequests: number;
  };
  shipperStats: {
    id: string;
    name: string;
    email: string;
    username: string;
    phone?: string;
    locationLabel?: string;
    subscriptionActive: boolean;
    subscriptionPlan?: string;
    subscriptionExpiresAt?: string;
    createdAt?: string;
    totalListings: number;
    openListings: number;
    inProgressListings: number;
    closedListings: number;
    assignedListings: number;
    reviewsReceived: number;
    averageRating: number;
  }[];
  carrierStats: {
    id: string;
    name: string;
    email: string;
    username: string;
    phone?: string;
    locationLabel?: string;
    bio?: string;
    subscriptionActive: boolean;
    subscriptionPlan?: string;
    subscriptionExpiresAt?: string;
    createdAt?: string;
    totalListings: number;
    activeListings: number;
    interestsSent: number;
    reviewsReceived: number;
    averageRating: number;
  }[];
  recentShipments: Record<string, unknown>[];
  recentCarrierListings: Record<string, unknown>[];
  rejectedShipments: Record<string, unknown>[];
  recentInterests: Record<string, unknown>[];
  recentReviews: Record<string, unknown>[];
  activityFeed: AdminActivityEvent[];
  userSnapshots: AdminUserSnapshot[];
  users: (User & { bio?: string; stripeCustomerId?: string })[];
}

export interface AdminActivityEvent {
  id: string;
  type: string;
  at: string;
  userId: string;
  userName: string;
  userRole: string;
  title: string;
  detail?: string;
  relatedId?: string;
}

export interface AdminUserSnapshot {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  locationLabel?: string;
  subscriptionActive: boolean;
  subscriptionPlan?: string;
  createdAt?: string;
  shipmentsPosted: number;
  openShipments: number;
  inProgressShipments: number;
  assignedShipments: number;
  carrierListings: number;
  activeListings: number;
  interestsSent: number;
  reviewsReceived: number;
  averageRating: number;
  lastActivityAt?: string;
  lastActivityType: string;
  lastActivitySummary: string;
  statusLabel: string;
}

export interface AdminUserActivity {
  user: User & {
    bio?: string;
    profilePhotoUrl?: string;
    stripeCustomerId?: string;
    updatedAt?: string;
  };
  summary: {
    shipmentsPosted: number;
    openShipments: number;
    inProgressShipments: number;
    closedShipments: number;
    assignedAsCarrier: number;
    carrierListings: number;
    activeListings: number;
    interestsSent: number;
    interestsReceived: number;
    reviewsGiven: number;
    reviewsReceived: number;
    averageRatingReceived: number;
    lastActivityAt?: string;
  };
  shipmentsPosted: Record<string, unknown>[];
  assignedShipments: Record<string, unknown>[];
  carrierListings: Record<string, unknown>[];
  interestsSent: Record<string, unknown>[];
  interestsReceived: Record<string, unknown>[];
  reviewsGiven: Record<string, unknown>[];
  reviewsReceived: Record<string, unknown>[];
  timeline: AdminActivityEvent[];
}

export interface RoleAccessRequest {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  requestedRole: 'shipper' | 'carrier';
  locationLabel?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt?: string;
  reviewedAt?: string;
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
    username: string;
    name: string;
    phone?: string;
    role: UserRole;
    subscriptionPlan?: string;
    locationLabel: string;
    locationLat: number;
    locationLng: number;
    locationPlaceId?: string;
  }) =>
    request<{
      accessToken: string;
      checkoutRequired: boolean;
      user: User;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { login: string; password: string }) =>
    request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  requestLoginOtp: (email: string) =>
    request<{ ok: boolean; message: string }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyLoginOtp: (body: { email: string; code: string }) =>
    request<{ accessToken: string; user: User }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: (token: string) => request<User>('/auth/me', {}, token),

  updateLocation: (
    token: string,
    body: {
      locationLabel: string;
      locationLat: number;
      locationLng: number;
      locationPlaceId?: string;
    },
  ) =>
    request<User>('/auth/location', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, token),

  changePassword: (
    token: string,
    body: { currentPassword: string; newPassword: string },
  ) =>
    request<{ ok: boolean; message: string }>(
      '/auth/password',
      { method: 'PATCH', body: JSON.stringify(body) },
      token,
    ),

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
    itemName: string;
    itemType: string;
    pickupLocation: string;
    pickupLocationDetails?: string;
    dropLocation: string;
    dropLocationDetails?: string;
    pickupLat: number;
    pickupLng: number;
    dropLat: number;
    dropLng: number;
    pickupPlaceId?: string;
    dropPlaceId?: string;
    price: number;
    notes?: string;
    weightLbs?: number;
    dimensions?: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  }) =>
    request('/shipments/public', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  placesAutocomplete: (input: string, sessionToken?: string) => {
    const params = new URLSearchParams({ input });
    if (sessionToken) params.set('sessionToken', sessionToken);
    return request<
      { placeId: string; description: string; mainText: string; secondaryText?: string }[]
    >(`/places/autocomplete?${params}`);
  },

  placeDetails: (placeId: string, sessionToken?: string) => {
    const params = new URLSearchParams({ placeId });
    if (sessionToken) params.set('sessionToken', sessionToken);
    return request<{
      placeId: string;
      address: string;
      name?: string;
      lat?: number;
      lng?: number;
    }>(`/places/details?${params}`);
  },

  getPendingShipments: (token: string) =>
    request<unknown[]>('/admin/pending-shipments', {}, token),

  approveShipment: (token: string, id: string) =>
    request(`/admin/shipments/${id}/approve`, { method: 'PATCH' }, token),

  rejectShipment: (token: string, id: string) =>
    request(`/admin/shipments/${id}/reject`, { method: 'PATCH' }, token),

  getUsers: (token: string) => request<User[]>('/admin/users', {}, token),

  getAdminDashboard: (token: string) =>
    request<AdminDashboard>('/admin/dashboard', {}, token),

  getUserActivity: (token: string, userId: string) =>
    request<AdminUserActivity>(`/admin/users/${userId}/activity`, {}, token),

  getAdminStats: (token: string) =>
    request<{
      totalUsers: number;
      activeSubscriptions: number;
      pendingShipments: number;
      openShipments: number;
      closedShipments: number;
    }>('/admin/stats', {}, token),

  submitRoleRequest: (body: {
    name: string;
    email: string;
    phone?: string;
    requestedRole: 'shipper' | 'carrier';
    locationLabel?: string;
    message?: string;
  }) =>
    request<{ id: string; status: string; message: string }>('/role-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getRoleRequests: (token: string) =>
    request<RoleAccessRequest[]>('/admin/role-requests', {}, token),

  approveRoleRequest: (
    token: string,
    id: string,
    body?: { adminNote?: string; username?: string; subscriptionActive?: boolean },
  ) =>
    request<{
      request: RoleAccessRequest;
      user: User;
      temporaryPassword: string;
    }>(`/admin/role-requests/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
    }, token),

  rejectRoleRequest: (
    token: string,
    id: string,
    body?: { adminNote?: string },
  ) =>
    request<RoleAccessRequest>(`/admin/role-requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
    }, token),

  createUserByAdmin: (
    token: string,
    body: {
      email: string;
      username: string;
      name: string;
      phone?: string;
      role: 'shipper' | 'carrier';
      locationLabel?: string;
      subscriptionActive?: boolean;
    },
  ) =>
    request<{ user: User; temporaryPassword: string }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(body),
    }, token),

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
