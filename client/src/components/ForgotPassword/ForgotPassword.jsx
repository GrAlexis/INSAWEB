import React, { useState } from "react";
import config from '../../config'

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification basique de l'email
    if (!email) {
      setError("Veuillez entrer votre adresse email.");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    setError(""); // Réinitialise les erreurs

    try {
      // Appel à l'URL d'envoi
      const response = await fetch(`${config.backendAPI}/api/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess("Un lien de réinitialisation de mot de passe a été envoyé à votre adresse email.");
        setEmail("");
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (error) {
      setError("Impossible de contacter le serveur. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Mot de passe oublié</h2>
      <p>Veuillez entrer l'adresse email associée à votre compte pour réinitialiser votre mot de passe.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Adresse email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre adresse email"
          />
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" className="submit-btn">Envoyer</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
