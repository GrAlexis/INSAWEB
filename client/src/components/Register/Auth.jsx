import React, { useState } from 'react';
import './Auth.css'; // Assurez-vous d'importer le fichier CSS

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true); // Gérer l'affichage Sign In / Sign Up
  const [fade, setFade] = useState(true); // Gérer l'animation de transition

  const toggleForm = () => {
    setFade(false); // Démarrer l'effet de fondu
    setTimeout(() => {
      setIsSignIn(!isSignIn); // Bascule entre Sign In et Sign Up après la transition
      setFade(true); // Réactive l'opacité après la transition
    }, 300); // Temps de la transition en millisecondes
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isSignIn ? "Sign In" : "Sign Up");
  };

  return (
    <div className="auth-container">
      <div className={`auth-box ${fade ? 'fade-in' : 'fade-out'}`}>
        <div className="auth-toggle">
          <button
            className={isSignIn ? 'active' : ''}
            onClick={toggleForm}
          >
            SIGN IN
          </button>
          <button
            className={!isSignIn ? 'active' : ''}
            onClick={toggleForm}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Email</label>
            <input
              type="text"
              id="username"
              placeholder={isSignIn ? "Ludwig Holm" : "Enter your username"}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="●●●●●●●●"
              required
            />
          </div>
          {!isSignIn && (
            <div className="input-group">
              <label htmlFor="confirm-password">Confirmez votre mot de passe</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="●●●●●●●●"
                required
              />
            </div>
          )}

          <button type="submit" className="auth-button">
            {isSignIn ? 'SIGN IN' : 'SIGN UP'}
          </button>
          <p className="forgot-password">
            {isSignIn ? 'Forgot password?' : ''}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
