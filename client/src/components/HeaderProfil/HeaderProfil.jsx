import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import mdp from '../../assets/buttons/mdp.png';
import deconnexion from '../../assets/buttons/pouvoir.png';
import './HeaderProfil.css';

const Header = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate("/login");
  };

  const handlePasswordChangeClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsClosing(true); // Lance l'animation de fermeture
    setTimeout(() => {
      setIsClosing(false);
      setIsModalOpen(false); // Ferme la modal après l'animation
    }, 400); // Durée de l'animation de fermeture
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    const payload = { token, newMdp: newPassword };

    try {
      const response = await fetch(config.backendAPI + '/api/user/updateMdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.status === 201) {
        setMessage('Mot de passe changé avec succès !');
        setNewPassword('');
        setConfirmPassword('');
        handleCloseModal(); // Ferme la modal après succès
      } else {
        setMessage(data || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      setMessage('Erreur : ' + error.message);
    }
  };

  return (
    <header className="profil-header">
      <img
        src={mdp}
        alt="Modifier mot de passe"
        className="password-icon"
        onClick={handlePasswordChangeClick}
      />
      <img
        src={deconnexion}
        alt="Se déconnecter"
        className="logout-icon"
        onClick={handleLogout}
      />

      {/* Modal pour changer de mot de passe */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ opacity: isClosing ? 0 : 1 }}>
          <div className={`modal-content ${isClosing ? 'slide-down' : 'slide-up'}`}>
            <button className="close-modal" onClick={handleCloseModal}>
              &times;
            </button>
            <h3 className="changer">Changer le mot de passe</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label className="indic">Nouveau mot de passe:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="indic">Confirmer le nouveau mot de passe:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn-submit" type="submit">Changer le mot de passe</button>
              <p>{message}</p>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
