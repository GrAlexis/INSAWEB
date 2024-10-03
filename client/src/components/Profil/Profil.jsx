import React from 'react';
import config from '../../config';
import './Profil.css';
import Animation from '../Animation';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';


function Profil() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [message, setMessage] = useState('');
  const [updatingMdp, setUpdatingMdp] = useState(false)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const email = sessionStorage.getItem('email');
  const token = sessionStorage.getItem('token');
  

  const handleLogout = () => {
    // Clear the token from local storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');

    navigate("/login") 
  };

  const enableUpdateMdp = () => {
    if (!updatingMdp){
      setUpdatingMdp(true)
    }
    else{
      setUpdatingMdp(false)
    }
  }
  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page par défaut

    // Vérifier que le nouveau mot de passe et la confirmation correspondent
    if (newPassword !== confirmPassword) {
      console.log("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    // Créer le payload à envoyer à l'endpoint
    const payload = {
      token,
      newMdp:newPassword,
    };

    try {
      // Faire la requête POST à l'endpoint MY_ENDPOINT
      const response = await fetch(config.backendAPI+'/api/user/updateMdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Réponse réussie
        setMessage('Mot de passe changé avec succès !');
        setUpdatingMdp(false)
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // Gérer les erreurs renvoyées par le serveur
        console.log(data || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
  return (
    <Animation>
      <div className="profil">
        <header className="profil-header">
          <h1>Bonjour, {firstName} ton compte est activé !</h1>
          <button className="logout-button" onClick={handleLogout}>
          Se déconnecter
        </button>
        </header>
        <button onClick={enableUpdateMdp}>
            Modifier votre mot de passe
        </button>
      {updatingMdp && <div className="password-change-form">
      <h3>Changer le mot de passe</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nouveau mot de passe:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirmer le nouveau mot de passe:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Changer le mot de passe</button>
      </form>
      
      </div> }<p>{message}</p>
      </div>
    </Animation>
  );
}

export default Profil;
