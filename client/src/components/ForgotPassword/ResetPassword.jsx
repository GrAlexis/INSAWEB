import React, { useState } from "react";
import config from '../../config'
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {token} = useParams()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Appel à l'URL d'envoi
      const response = await fetch(`${config.backendAPI}/api/user/updateMdp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newMdp:newPassword }),
      });

      if (response.ok) {
        setMessage("Mot de passe changé avec succes.");
        navigate("/login")
      } else {
        setMessage("Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (error) {
      setMessage("Impossible de contacter le serveur. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div>
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
      
       <p>{message}</p>
      </div>

  );
};

export default ResetPassword;
