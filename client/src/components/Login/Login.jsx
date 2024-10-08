import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  // Vérifiez si l'utilisateur est déjà authentifié
  useEffect(() => {
    
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/home'); // Redirigez immédiatement si l'utilisateur est déjà authentifié
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
      sessionStorage.setItem('isAuthenticated', true)
      sessionStorage.setItem('email', email)
      
      // Rediriger après l'authentification réussie
      console.log('Redirecting to home')
      navigate('/home');
      navigate('/home');

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Login failed')
      // Vous pouvez afficher un message d'erreur à l'utilisateur ici
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <div className="input-group">
          <label htmlFor="email">Email INSA</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        <button  onClick={() => navigate('/register')} type="submit" className="login-button">S'inscire ? </button>
      </form>
    </div>
  );
};

export default Login;
