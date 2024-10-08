import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const fetchIsAuthenticated = async () => {
  const token = sessionStorage.getItem('token');
  const isAuthenticated = sessionStorage.getItem('isAuthenticated')
 if (!isAuthenticated) {
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
        sessionStorage.setItem('isAuthenticated', true);
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
}
  else{
    return true
  }
};

const fetchIsAdmin = async () => {
  try {
    const email = sessionStorage.getItem('email');
    const response = await fetch(`http://localhost:5000/api/user/isAdmin/${email}`, {
      method: 'GET',
    });

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erreur lors de la vérification des droits administrateurs', error);
    return false;
  }
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await fetchIsAuthenticated();
      setAuthStatus(isAuthenticated);

      if (isAuthenticated && adminOnly) {
        const adminStatus = await fetchIsAdmin();
        console.log('isAdmin after fetch',adminStatus)
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
    //console.log('Redirecting to login from protocted route')
    return <Navigate to="/login" />;
  }

  if (adminOnly && isAdmin === false) {
    console.log('Isadmin',isAdmin)
    alert("Page réservée aux administrateurs. Connectez-vous avec un compte admin.");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

