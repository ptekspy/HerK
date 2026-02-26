const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4001';

const demoEmail = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL;
const demoName = process.env.NEXT_PUBLIC_DEMO_USER_NAME;

const DEMO_HEADERS: HeadersInit =
  demoEmail && demoName
    ? {
        'x-user-email': demoEmail,
        'x-user-name': demoName,
      }
    : {};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: DEMO_HEADERS,
    cache: 'no-store',
    credentials: 'include',
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
    credentials: 'include',
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
    credentials: 'include',
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
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`PUT ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: DEMO_HEADERS,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`DELETE ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
