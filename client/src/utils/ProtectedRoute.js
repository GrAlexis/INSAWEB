import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/commonHooks/UserContext';

const isAuthenticated = async () => {
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
      
      if (data.username) {
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('isAdmin', data.isAdmin); // Stockez isAdmin dans le sessionStorage
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  }

  return sessionStorage.getItem('isAuthenticated') === 'true';
};

const ProtectedRoute = ({ children, adminOnly=false }) => {
  const { user } = useUser();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  else{
    if (adminOnly){
      const { user } = useUser();
      if (!user || !user.isAdmin){
        alert("Page réservée aux administrateur\nConnectez-vous avec un compte admin.")
        return <Navigate to="/login" />
      }
    }
    return children;
  }

  
};

export default ProtectedRoute;
