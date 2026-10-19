import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUser } from '@clerk/react';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user: clerkUser } = useUser();
  // If AuthContext or Clerk is initializing, show loading
  if (loading || !isClerkLoaded) {
    return <div className="loading">Loading Examify...</div>;
  }


  // If signed in with Clerk and user profile is loaded, create temporary active user session so user is never blocked
  const activeUser = user || (isClerkSignedIn && clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'Examify User',
    email: clerkUser.primaryEmailAddress?.emailAddress,
    role: localStorage.getItem('pending_signup_role') || 'student',
    isClerkUser: true
  } : null);

  // If not signed in at all, redirect to /login
  if (!activeUser && !isClerkSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roles && activeUser && !roles.includes(activeUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


export default PrivateRoute;
