import { headers } from 'next/headers';

function normalizeOrigin(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export async function getRequestOrigin() {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_WEB_URL?.trim());

  const headerStore = await headers();
  const forwardedProto = headerStore
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim();
  const forwardedHost = headerStore
    .get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim();
  const host = forwardedHost || headerStore.get('host')?.split(',')[0]?.trim();

  if (host) {
    const protocol =
      forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
    const derivedOrigin = normalizeOrigin(`${protocol}://${host}`);
    if (derivedOrigin) {
      return derivedOrigin;
    }
  }

  return configuredOrigin || 'http://localhost:4000';
}
