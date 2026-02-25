const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

const DEMO_HEADERS: HeadersInit = {
  'x-user-email': process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? 'demo@contractguard.local',
  'x-user-name': process.env.NEXT_PUBLIC_DEMO_USER_NAME ?? 'Demo User',
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: DEMO_HEADERS,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...DEMO_HEADERS,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`POST ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      ...DEMO_HEADERS,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PATCH ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      ...DEMO_HEADERS,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PUT ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
