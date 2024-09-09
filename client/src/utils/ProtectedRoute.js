import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const fetchIsAuthenticated = async () => {
  const token = sessionStorage.getItem('token');
  
  if (token) {
    try {
      const response = await fetch('http://localhost:5000/api/user/decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.email) {
        sessionStorage.setItem('email', data.email);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  } else {
    return false;
  }
};

const fetchIsAdmin = async () => {
  // Function that returns a promise resolved after a certain delay
    function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  try {
    const token = sessionStorage.getItem('token');
    let response = await fetch(`http://localhost:5000/api/user/decode/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    let data = await response.json();
    const email = data.email
    await wait(1000)
    response = await fetch(`http://localhost:5000/api/user/isAdmin/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    data = await response.json()
    return data;

  } catch (error) {
    console.error('Erreur lors de la vérification des droits administrateurs', error);
    return false;
  }
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await fetchIsAuthenticated();
      setAuthStatus(isAuthenticated);

      if (isAuthenticated && adminOnly) {
        const adminStatus = await fetchIsAdmin();
        console.log(adminStatus)
        setIsAdmin(adminStatus);
      }

      setLoading(false);
    };

    checkAuth();
  }, [adminOnly]);

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  if (!authStatus) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    alert("Page réservée aux administrateurs. Connectez-vous avec un compte admin.");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

