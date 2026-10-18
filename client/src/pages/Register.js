import React, { useState } from 'react';
import { SignUp } from '@clerk/react';
import './Auth.css';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState(
    localStorage.getItem('pending_signup_role') || 'student'
  );

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    localStorage.setItem('pending_signup_role', role);
  };

  return (
    <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '30px 20px' }}>
      
      {/* Role Selection Badge Bar */}
      <div style={{
        background: 'rgba(23, 23, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '16px 24px',
        marginBottom: '24px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '11px',
          fontFamily: 'Martian Mono, monospace',
          color: '#ef493c',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          marginBottom: '8px'
        }}>
          SELECT ACCOUNT TYPE
        </div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#f3f4f6', marginBottom: '14px' }}>
          I am registering as:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: selectedRole === 'student' ? '2px solid #ef493c' : '1px solid rgba(255, 255, 255, 0.12)',
              background: selectedRole === 'student' ? 'rgba(239, 73, 60, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedRole === 'student' ? '#fff' : '#9ca3af',
              fontWeight: selectedRole === 'student' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>🎓</span>
            <span style={{ fontSize: '14px' }}>Student</span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Take Quizzes & View Results</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('teacher')}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: selectedRole === 'teacher' ? '2px solid #ef493c' : '1px solid rgba(255, 255, 255, 0.12)',
              background: selectedRole === 'teacher' ? 'rgba(239, 73, 60, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedRole === 'teacher' ? '#fff' : '#9ca3af',
              fontWeight: selectedRole === 'teacher' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>👨‍🏫</span>
            <span style={{ fontSize: '14px' }}>Teacher / Admin</span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Create Quizzes & Analytics</span>
          </button>
        </div>
      </div>

      {/* Official Clerk SignUp Box */}
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
