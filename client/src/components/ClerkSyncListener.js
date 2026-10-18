import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/react';
import { useAuth } from '../context/AuthContext';

/**
 * ClerkSyncListener automatically synchronizes the active Clerk user session
 * into Examify's MongoDB backend database so user IDs, roles, and JWT tokens
 * stay 100% compatible with existing exam features.
 */
const ClerkSyncListener = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { syncClerkUser, user: dbUser } = useAuth();
  const syncedUserIdRef = useRef(null);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const clerkId = user.id;
      const primaryEmail = user.primaryEmailAddress?.emailAddress;
      const fullName =
        user.fullName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.username ||
        'Examify User';
      const avatarUrl = user.imageUrl || '';

      // Get user-chosen role from localStorage if selected during registration
      const chosenRole = localStorage.getItem('pending_signup_role') || 'student';

      if (syncedUserIdRef.current !== clerkId || !dbUser) {
        syncedUserIdRef.current = clerkId;
        setSyncError(null);

        syncClerkUser({
          clerkId,
          email: primaryEmail,
          name: fullName,
          role: chosenRole,
          avatar: avatarUrl,
        })
          .then(() => {
            localStorage.removeItem('pending_signup_role');
            setSyncError(null);
          })
          .catch((err) => {
            console.error('Auto Clerk sync failed:', err);
            const msg = err.response?.data?.message || err.message || 'Database connection error';
            setSyncError(msg);
          });
      }
    }
  }, [isLoaded, isSignedIn, user, syncClerkUser, dbUser]);

  if (syncError) {
    return (
      <div style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        background: '#ef4444',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        maxWidth: '90%',
        textAlign: 'center'
      }}>
        <strong>Backend Sync Notice:</strong> {syncError}
      </div>
    );
  }

  return null;
};

export default ClerkSyncListener;
