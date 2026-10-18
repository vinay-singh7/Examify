import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/react';
import { useAuth } from '../context/AuthContext';

/**
 * ClerkSyncListener automatically synchronizes the active Clerk user session
 * into Examify's MongoDB backend database so user IDs, submissions, and JWT tokens
 * stay 100% compatible with existing exam features.
 */
const ClerkSyncListener = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { syncClerkUser, user: dbUser } = useAuth();
  const syncedUserIdRef = useRef(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const clerkId = user.id;
      const primaryEmail = user.primaryEmailAddress?.emailAddress;
      const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Examify Student';
      const avatarUrl = user.imageUrl || '';

      // Sync only if not already synced for this Clerk user or if DB user is empty
      if (syncedUserIdRef.current !== clerkId || !dbUser) {
        syncedUserIdRef.current = clerkId;
        syncClerkUser({
          clerkId,
          email: primaryEmail,
          name: fullName,
          role: 'student',
          avatar: avatarUrl,
        }).catch((err) => {
          console.error('Auto Clerk sync failed:', err);
        });
      }
    }
  }, [isLoaded, isSignedIn, user, syncClerkUser, dbUser]);

  return null;
};

export default ClerkSyncListener;
