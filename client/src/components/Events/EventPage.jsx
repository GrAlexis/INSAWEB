import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in sessionStorage or localStorage
    const token = sessionStorage.getItem('token'); // or localStorage.getItem('token');

    if (!token) {
      // If no token, redirect to the login page
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      {/* This page is empty and only serves to check for token */}
    </div>
  );
};

export default EmptyPage;