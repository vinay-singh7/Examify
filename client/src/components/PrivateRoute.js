import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUser, useClerk } from '@clerk/react';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [syncTimeout, setSyncTimeout] = useState(false);

  // Set a safety timeout of 6 seconds in case backend DB sync fails
  useEffect(() => {
    let timer;
    if (isClerkSignedIn && !user) {
      timer = setTimeout(() => {
        setSyncTimeout(true);
      }, 6000);
    } else {
      setSyncTimeout(false);
    }
    return () => clearTimeout(timer);
  }, [isClerkSignedIn, user]);

  // If AuthContext or Clerk is initializing, show loading
  if (loading || !isClerkLoaded) {
    return <div className="loading">Loading Examify...</div>;
  }

  // If sync is stuck for more than 6s, show helpful error screen with retry
  if (isClerkSignedIn && !user && syncTimeout) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        textAlign: 'center',
        color: '#f3f4f6'
      }}>
        <div style={{ fontSize: '42px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Backend Database Connection Incomplete</h3>
        <p style={{ maxWidth: '480px', color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          You have successfully logged in via Clerk as <strong>{clerkUser?.primaryEmailAddress?.emailAddress}</strong>, but Vercel cannot connect to MongoDB Atlas because <code>MONGODB_URI</code> is missing or blocked on your Vercel Dashboard.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            Retry Connection
          </button>
          <button
            onClick={() => signOut()}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // If signed in with Clerk and sync is progressing, show connecting
  if (isClerkSignedIn && !user) {
    return <div className="loading">Connecting your session with Examify...</div>;
  }

  // If not signed in at all, redirect to /login
  if (!user && !isClerkSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
