import React, { useState } from 'react';
import './ForgotPasswordPopup.css';

const ForgotPasswordPopup = ({ onSubmit, onClose }) => {
  const [secretAnswer, setSecretAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(secretAnswer); // Valide la réponse à la question secrète
  };

  return (
    <div className="popup-container">
      <div className="popup-box">
        <h2>Réinitialiser le mot de passe</h2>
        <form onSubmit={handleSubmit}>
          <p>Quelle est votre couleur préférée ?</p> {/* La question secrète récupérée du backend */}
          <input
            type="text"
            placeholder="Entrez votre réponse"
            value={secretAnswer}
            onChange={(e) => setSecretAnswer(e.target.value)}
            required
          />
          <button className="buttonPasswordPopup" type="submit">Valider</button>
        </form>
        <button className="buttonPasswordPopup" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default ForgotPasswordPopup;
