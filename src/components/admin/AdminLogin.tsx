'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/admin/admin.store';
import styles from '@/styles/admin.module.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const { login, isAdmin, logout } = useAdminStore();

  // Show login form when clicking on a hidden area (bottom-left corner)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Check if click is in bottom-left corner (last 50px from bottom and left)
      if (e.clientY > window.innerHeight - 50 && e.clientX < 50) {
        setShowLogin(true);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email);
    if (!success) {
      setError('Unauthorized');
    } else {
      setShowLogin(false);
    }
  };

  if (isAdmin) {
    return (
      <div className={styles.adminBar}>
        <button onClick={logout} className={styles.logoutButton} title="Logout">
          ×
        </button>
      </div>
    );
  }

  if (!showLogin) {
    return null;
  }

  return (
    <div className={styles.loginContainer}>
      <button 
        onClick={() => setShowLogin(false)} 
        className={styles.closeButton}
        title="Close"
      >
        ×
      </button>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          className={styles.emailInput}
          required
          autoFocus
        />
        <button type="submit" className={styles.loginButton}>
          Login
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default AdminLogin;
