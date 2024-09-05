import React from 'react';
import './Profil.css';
import Animation from '../Animation';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';


function Profil() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const email = sessionStorage.getItem('email');

  const handleLogout = () => {
    // Clear the token from local storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('isAuthenticated');
    navigate("/login")
    
  };
  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      // If no token, redirect to login page
      navigate('/login');
      return; // Exit useEffect early to prevent further code execution
    }
    

    if (email) {
      // Extract the first name from the email
      const firstNameFromEmail = email.split('@')[0].split('.')[0]; // Split email to get the first name
      setFirstName(firstNameFromEmail.charAt(0).toUpperCase() + firstNameFromEmail.slice(1)); // Capitalize first name
    } else {
      // If there's no email, redirect to the login page
      navigate('/login');
    }
  }, [navigate]);



  return (
    <Animation>
      <div className="profil">
        <header className="profil-header">
          <h1>Bonjour, {firstName} ton compte est activé !</h1>
          <button className="logout-button" onClick={handleLogout}>
          Se déconnecter
        </button>
        </header>
        
      </div>
    </Animation>
  );
}

export default Profil;
