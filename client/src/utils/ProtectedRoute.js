import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/commonHooks/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
