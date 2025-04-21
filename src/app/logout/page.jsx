'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function LogoutPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const logoutUser = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch('/api/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: session.user.id }),
          });

          if (!res.ok) {
            console.error('Logout API failed:', await res.json());
          }
        } catch (err) {
          console.error('Logout API error:', err);
        }
      }

      await signOut({ callbackUrl: '/login' });
    };

    logoutUser();
  }, [session, status]);

  return <p>Logging you out...</p>;
}