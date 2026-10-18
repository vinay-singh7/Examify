import React from 'react';
import { SignIn } from '@clerk/react';
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 20px' }}>
      <SignIn 
        routing="path" 
        path="/login" 
        signUpUrl="/register"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
};

export default Login;
