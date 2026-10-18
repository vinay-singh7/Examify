import React from 'react';
import { SignUp } from '@clerk/react';
import './Auth.css';

const Register = () => {
  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 20px' }}>
      <SignUp 
        routing="path" 
        path="/register" 
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
};

export default Register;
