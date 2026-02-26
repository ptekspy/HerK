const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

const demoEmail = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL;
const demoName = process.env.NEXT_PUBLIC_DEMO_USER_NAME;

const DEMO_HEADERS: HeadersInit =
  demoEmail && demoName
    ? {
        'x-user-email': demoEmail,
        'x-user-name': demoName,
      }
    : {};

function buildApiUrl(path: string): string {
  if (typeof window !== 'undefined') {
    return path;
  }

  const base = API_BASE_URL || 'http://localhost:4001';
  return `${base}${path}`;
}

async function buildApiError(response: Response, method: string, path: string): Promise<Error> {
  const fallback = `${method} ${path} failed with status ${response.status}`;

  try {
    const payload = (await response.clone().json()) as
      | { message?: string | string[]; error?: string }
      | null;

    if (payload) {
      if (Array.isArray(payload.message) && payload.message.length > 0) {
        return new Error(payload.message.join('; '));
      }

      if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
        return new Error(payload.message);
      }

      if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
        return new Error(payload.error);
      }
    }
  } catch {
    // fall through to plain text fallback
  }

  try {
    const text = (await response.text()).trim();
    if (text.length > 0) {
      return new Error(text);
    }
  } catch {
    // ignore parse failures
  }

  return new Error(fallback);
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    headers: DEMO_HEADERS,
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    throw await buildApiError(response, 'GET', path);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      ...DEMO_HEADERS,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!response.ok) {
    throw await buildApiError(response, 'POST', path);
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'PATCH',
    headers: {
      ...DEMO_HEADERS,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!response.ok) {
    throw await buildApiError(response, 'PATCH', path);
  }

  return response.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'PUT',
    headers: {
      ...DEMO_HEADERS,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!response.ok) {
    throw await buildApiError(response, 'PUT', path);
  }

  return response.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'DELETE',
    headers: DEMO_HEADERS,
    credentials: 'include',
  });

  if (!response.ok) {
    throw await buildApiError(response, 'DELETE', path);
  }

  return response.json() as Promise<T>;
}
