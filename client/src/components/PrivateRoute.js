import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUser } from '@clerk/react';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();

  // If AuthContext or Clerk is loading, show loading spinner
  if (loading || !isClerkLoaded) {
    return <div className="loading">Loading...</div>;
  }

  // If signed in with Clerk but DB sync is still pending in background, show syncing
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
