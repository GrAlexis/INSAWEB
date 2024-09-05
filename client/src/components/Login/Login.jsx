import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Assurez-vous d'importer le fichier CSS

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  // Vérifiez si l'utilisateur est déjà authentifié
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/home'); // Redirigez immédiatement si l'utilisateur est déjà authentifié
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Stocker le token dans le sessionStorage
      sessionStorage.setItem('token', data.token);

      // Call the function passed from App.js to trigger a state change
      onLoginSuccess();
      
      // Rediriger après l'authentification réussie
      navigate('/home');

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      // Vous pouvez afficher un message d'erreur à l'utilisateur ici
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="sheeeshTag">Sheeesh</h1> {/* Titre principal */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            {/* Champ pour l'adresse email */}
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" 
              required
            />
          </div>
          <div className="input-group">
            {/* Champ pour le mot de passe */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*********" // Placeholder pour le mot de passe masqué
              required
            />
          </div>
          <button type="submit" className="login-button">
            Se connecter / S'inscrire {/* Bouton de connexion */}
          </button>
          <p className="forgot-password" onClick={() => navigate('/forgot-password')}>
            Mot de passe oublié ? {/* Lien pour mot de passe oublié */}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
