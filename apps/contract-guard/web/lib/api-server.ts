import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4001';

const demoEmail = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL;
const demoName = process.env.NEXT_PUBLIC_DEMO_USER_NAME;

function getDemoHeaders(): Record<string, string> {
  if (!demoEmail || !demoName) {
    return {};
  }

  return {
    'x-user-email': demoEmail,
    'x-user-name': demoName,
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const headers: Record<string, string> = {
    ...getDemoHeaders(),
  };

  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
