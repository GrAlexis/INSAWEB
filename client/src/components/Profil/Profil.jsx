import './Profil.css';
import Animation from '../Animation'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profil() {
    const [profile, setProfile] = useState({
      nom: '',
      prenom: '',
      classe: '',
      votreArgent: 0,
      isAdmin: false,
      classement: 'Non classé'
    });
  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const email = sessionStorage.getItem('email')
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/user/${email}`);
          const data = response.data;
  
          // Mapper manuellement les champs souhaités
          setProfile({
            nom: data.Nom,
            prenom: data.Prénom,
            classe: data.Classe,
            votreArgent: data.Argent,
            isAdmin: data.isAdmin,
            classement: data.Classement
          });
  
          setLoading(false);
        } catch (error) {
          setError('Erreur lors du chargement des données.');
          setLoading(false);
        }
      };
  
      fetchProfile();
    }, []);
  
    if (loading) {
      return <div>Chargement en cours...</div>;
    }
  
    if (error) {
      return <div>{error}</div>;
    }
  return (
    <Animation>
    <div className="profil">
      <header className="profil-header">
        <h1>Hello, {profile.prenom} ur account is ready!</h1>
      </header>
    </div>
    <div className="profile-container">
      <div className="profile-field">
        <strong>Nom: </strong>
        <span>{profile.nom}</span>
      </div>
      <div className="profile-field">
        <strong>Prénom: </strong>
        <span>{profile.prenom}</span>
      </div>
      <div className="profile-field">
        <strong>Classe: </strong>
        <span>{profile.classe}</span>
      </div>
      <div className="profile-field">
        <strong>Votre Argent: </strong>
        <span>{profile.votreArgent} €</span>
      </div>
      <div className="profile-field">
        <strong>Admin: </strong>
        <span>{profile.isAdmin ? 'Oui' : 'Non'}</span>
      </div>
    </div>
    </Animation>
  );
}

export default Profil;