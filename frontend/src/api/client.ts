const API_BASE = '/api';

export function getToken(): string | null {
  return sessionStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) sessionStorage.setItem('token', token);
  else sessionStorage.removeItem('token');
}

export function getMfaToken(): string | null {
  return sessionStorage.getItem('mfaToken');
}

export function setMfaToken(token: string | null) {
  if (token) sessionStorage.setItem('mfaToken', token);
  else sessionStorage.removeItem('mfaToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ accessToken: string; mfaRequired: boolean; mfaToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string | null; mfaRequired: boolean; mfaToken: string | null }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  mfaLogin: (body: { mfaToken: string; code: number }) =>
    request<{ accessToken: string }>('/auth/mfa/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  mfaSetup: () => request<{ secret: string; qrCodeUrl: string }>('/auth/mfa/setup', { method: 'POST' }),

  mfaVerify: (code: number) =>
    request<{ message: string }>('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  mfaDisable: (code: number) =>
    request<{ message: string }>('/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  getMyAccounts: () =>
    request<Array<{ id: number; accountHolderName: string; balance: number; maskedAccountNumber: string }>>(
      '/accounts/me'
    ),

  getAccount: (id: number) =>
    request<{ id: number; accountHolderName: string; balance: number; maskedAccountNumber: string }>(
      `/accounts/${id}`
    ),

  createAccount: (body: { accountHolderName: string; balance: number; ssn?: string }) =>
    request<{ id: number }>('/accounts/create', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  transfer: (
    body: { fromAccountId: number; toAccountId: number; amount: number; totpCode?: string },
    idempotencyKey: string
  ) =>
    request<{ message: string; paymentStatus: string; paymentMessage: string; notificationStatus: string }>(
      '/accounts/transfer',
      {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(body),
      }
    ),

  getLedger: (accountId: number) =>
    request<
      Array<{
        id: number;
        transactionType: string;
        amount: number;
        balanceAfter: number;
        maskedAccountNumber: string;
        createdAt: string;
        createdBy: string;
        reference: string;
      }>
    >(`/accounts/${accountId}/ledger`),

  getRevisions: (accountId: number) =>
    request<
      Array<{
        accountId: number;
        revisionNumber: number;
        revisionType: string;
        balance: number;
        revisionTimestamp: string;
      }>
    >(`/accounts/${accountId}/revisions`),

  getResilienceStatus: () => request<{ simulateFailure: boolean }>('/admin/resilience/status'),

  setResilienceStatus: (enabled: boolean) =>
    request<{ simulateFailure: boolean }>('/admin/resilience/simulate-failure', {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),
};
