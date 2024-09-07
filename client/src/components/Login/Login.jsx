import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Assurez-vous d'importer le fichier CSS
import axios from "axios";


const Login = ({ onLoginSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true); // Gérer l'affichage Sign In / Sign Up
  const [fade, setFade] = useState(true); // Gérer l'animation de transition
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [classYear, setClassYear] = useState("3TC");
  const [isApprentice, setIsApprentice] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false)
  const navigate = useNavigate(); 

  // Vérifiez si l'utilisateur est déjà authentifié
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/home'); // Redirigez immédiatement si l'utilisateur est déjà authentifié
    }
  }, [navigate]);

  const toggleForm = () => {
    setFade(false); // Démarrer l'effet de fondu
    setTimeout(() => {
      setIsSignIn(!isSignIn); // Bascule entre Sign In et Sign Up après la transition
      setFade(true); // Réactive l'opacité après la transition
    }, 300); // Temps de la transition en millisecondes
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(isSignIn ? "Sign In" : "Sign Up");
      if (isSignIn)
      {
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
      } else
      {
        if (password !== confirmPassword) {
          alert("Les mots de passe ne correspondent pas !");
          return;
        }
    
        const year = `${classYear}${isApprentice ? 'A' : ''}`;
        
        const payload = {
          name,
          lastName,
          password,
          isAdmin : false,
          classYear: year,
        };
    
        try {
          const response = await axios.post("http://localhost:5000/api/user/register", payload);
          console.log("Signup success:", response.data);
          // Log the user in after successful signup
          
          // Call the function passed from App.js to trigger a state change
          onLoginSuccess();
    
          // Redirect to the home page after signup
          navigate('/home');
    
        } catch (error) {
          console.error("Signup failed:", error);
          // Handle signup error
        }
      }

  };

  return (
    <div className="login-container">
      <div className={`login-box ${fade ? 'fade-in' : 'fade-out'}`}>
        <h1 className="sheeeshTag">Sheeesh</h1> {/* Titre principal */}
        <div className="logSelect">
          <button
            className={isSignIn ? 'active' : ''}
            onClick={toggleForm}
          >
            Connexion
          </button>
          <button
            className={!isSignIn ? 'active' : ''}
            onClick={toggleForm}
          >
            Inscription
          </button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">

        {!isSignIn && (
          <>
            <div className="input-group">
              <label htmlFor="name">Prénom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Luc à l'envers [:"
                required
              />
            </div>

            <div className="input-group">
            <label htmlFor="name">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nick"
              required
            />
            </div>
            </>
          )}
          

          <div className="input-group">
          <label htmlFor="username">Email</label>
            {/* Champ pour l'adresse email */}
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isSignIn ? "Email" : "Entrer votre email insa :)"}
              required
            />
          </div>
          <div className="input-group">
            {/* Champ pour le mot de passe */}
            <label htmlFor="password">Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              placeholder="●●●●●●●●" // Placeholder pour le mot de passe masqué
              required
            />
          </div>
          {!isSignIn && (
            <>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirmer votre mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                id="confirm-password"
                placeholder="●●●●●●●●"
                required
              />
            </div>

            <div className="input-group checkbox">
            <label htmlFor="name">Afficher le mot de passe</label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              required
            />
            </div>

            <div className="input-group select-group">
            <label htmlFor="name">Année scolaire</label>
            <select
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
            >
              <option value="3TC">3TC</option>
              <option value="4TC">4TC</option>
              <option value="5TC">5TC</option>
            </select>
            </div>

            <div className="input-group checkbox">
            <label htmlFor="name">Alternant</label>
            <input
              type="checkbox"
              checked={isApprentice}
              onChange={(e) => setIsApprentice(e.target.checked)}
            />
            </div>

            <div className="input-group checkbox">
            <label htmlFor="name">Accepter les conditions d'utilisations</label>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            </div>
            </>
          )}
          <button type="submit" className="login-button">
            {isSignIn ? 'je veux je veux' : 'Prêt à sheeesh ??'}
          </button>
          <p className="forgot-password" onClick={() => navigate('/forgot-password')}>
            {isSignIn ? 'Mot de passe oublié ?' : ''}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
