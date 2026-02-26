'use client';

import { useState } from 'react';
import { Button } from '@herk/ui/base/button';
import { cn } from '@herk/utils';

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors and continue redirect to ensure the user exits the app shell.
    } finally {
      window.location.assign('/');
    }
  };

  return (
    <Button
      className={cn(className)}
      type="button"
      variant="ghost"
      onClick={onLogout}
      disabled={loading}
    >
      {loading ? 'Logging out…' : 'Log out'}
    </Button>
  );
}
