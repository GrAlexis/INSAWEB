import React, { useEffect, useState } from 'react';
import './Profil.css';
import Animation from '../Animation';
import { useNavigate } from 'react-router-dom';
import HeaderProfil from '../HeaderProfil/HeaderProfil';
import MiniGame from '../MiniGame/MiniGame';

import UserPost from '../UserPost/UserPost';
import UserProfileInfo from '../UserProfilInfo/UserProfileInfo';

import { useUniverse } from '../../hooks/commonHooks/UniverseContext';

function Profil() {
  const navigate = useNavigate();
  const { selectedUniverse, fetchUniverseById,saveUniverse} = useUniverse();
  const [firstName, setFirstName] = useState('');
  const [message, setMessage] = useState('');
  const [updatingMdp, setUpdatingMdp] = useState(false)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const email = localStorage.getItem('email');
  const token = localStorage.getItem('token');
  const [backgroundColor, setBackgroundColor] = useState('#E8EACC'); 
  

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  }


  useEffect(() => {

    const token = localStorage.getItem('token');
    const fetchStyles = async () => {
      var bgColor = '#E8EACC';
      if (selectedUniverse.styles && selectedUniverse.styles['mainBackgroundColor']) {
        bgColor = selectedUniverse.styles['mainBackgroundColor'];
      }

      setBackgroundColor(bgColor);
    }
    if (selectedUniverse)
    {
      fetchStyles()
    }

    if (!token) {
      // If no token, redirect to login page
      navigate('/login');
    }

    const email = localStorage.getItem('email');
    if (email) {
      const firstNameFromEmail = email.split('@')[0].split('.')[0];
      setFirstName(firstNameFromEmail.charAt(0).toUpperCase() + firstNameFromEmail.slice(1));
    }
  }, [navigate,selectedUniverse]);

  return (
    <Animation>
      <div className="profil" style={{backgroundColor}}>
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
