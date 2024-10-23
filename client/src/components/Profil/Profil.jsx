import React, { useEffect, useState } from 'react';
import './Profil.css';
import Animation from '../Animation';
import { useNavigate } from 'react-router-dom';
import HeaderProfil from '../HeaderProfil/HeaderProfil';
import MiniGame from '../MiniGame/MiniGame';
import UserPost from '../UserPost/UserPost';
import UserProfileInfo from '../UserProfilInfo/UserProfileInfo';

function Profil() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, redirect to login page
      navigate('/login');
    }

    const email = localStorage.getItem('email');
    if (email) {
      const firstNameFromEmail = email.split('@')[0].split('.')[0];
      setFirstName(firstNameFromEmail.charAt(0).toUpperCase() + firstNameFromEmail.slice(1));
    }
  }, [navigate]);

  return (
    <Animation>
      <div className="profil">
        <HeaderProfil />
        <UserProfileInfo></UserProfileInfo>
        <h1>Bonjour, {firstName} ton compte est activé !</h1>
        <UserPost />
        <MiniGame />
      </div>
    </Animation>
  );
}

export default Profil;
