import React, { useState, useEffect } from 'react';
import config from '../../config';
import Icon from '@mdi/react'
import {mdiCloseCircle} from '@mdi/js'
import './Login.css'; 
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginBouton from './LoginGoogle'

const Login = ({ showNavBar }) => {
  const [isSignIn, setIsSignIn] = useState(true); 
  const [fade, setFade] = useState(true); // Gérer l'animation de transition
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [classYear, setClassYear] = useState("3TC");
  const [isApprentice, setIsApprentice] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsText, setTermsText] = useState('');
  const [acceptConfidential, setAcceptConfidential] = useState(false);
  const [showConfidentialTerms, setShowConfidentialTerms] = useState(false);
  const [confidentialText, setConfidentialText] = useState('');
  const [mdpVerification, setMdpVerification] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Fetch the terms of use when the modal is opened
  useEffect(() => {
    if (showTermsModal) {
      fetch('./terms.txt')
        .then((response) => response.text())
        .then((data) => {
          setTermsText(data);
        })
        .catch((error) => {
          console.error('Error fetching terms:', error);
        });
    }
  }, [showTermsModal]);

  const  verify_token = async (token) => {
    try {
      const response = await fetch(config.backendAPI+'/api/user/decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Verify token failed');
      }

      const data = await response.json();
      
      if (data?.email !== localStorage.getItem('email')){
        console.log("Tentative d\'usurpation de token", "email token", data.email, "email cookies", localStorage.getItem('email'))
        return false
      }
      else{
        return true
      }
    }
    catch (error) {
      console.log('Erreur lors de la vérification du token', error)
    }
  } 
  
  useEffect(() => {
    if (showConfidentialTerms) {
      fetch('./confidential.txt')
        .then((response) => response.text())
        .then((data) => {
          setConfidentialText(data);
        })
        .catch((error) => {
          console.error('Error fetching terms:', error);
        });
    }
  }, [showConfidentialTerms]);

  const navigate = useNavigate(); 
  //this is to open/close terms of use pop up
  const handleShowTerms = () => {
    setShowTermsModal(true);
  };

  const handleCloseTerms = () => {
    setShowTermsModal(false);
  };

  const handleShowConfidential = () => {
    setShowConfidentialTerms(true);
  };

  const handleCloseConfidential = () => {
    setShowConfidentialTerms(false);
  };

  // Vérifiez si l'utilisateur est déjà authentifié
  useEffect(() => {
    const token = localStorage.getItem('token') ;
    if (token) {
      if (verify_token(token))
      {navigate('/home')}; // Redirigez immédiatement si l'utilisateur est déjà authentifié
    }
  }, [navigate]);

  const toggleForm = () => {
    setFade(false); // Démarrer l'effet de fondu
    setTimeout(() => {
      setIsSignIn(!isSignIn); // Bascule entre Sign In et Sign Up après la transition
      setFade(true); // Réactive l'opacité après la transition
    }, 300); // Temps de la transition en millisecondes
  };



  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule.");
    }
    if (!/\d/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre.");
    }
    if (!/[\W_]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
    }
  
    setPasswordErrors(errors);
    return errors.length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSignIn && !validatePassword(password)) {
      return; // Ne pas soumettre le formulaire si les règles du mot de passe ne sont pas respectées
    }
    
    const emailDomain = "@insa-lyon.fr";
    if (!email.endsWith(emailDomain)) {
      alert(`L'adresse email doit se terminer par ${emailDomain}`);
      return;
    }
    
    console.log(isSignIn ? "Sign In" : "Sign Up");
    
    if (isSignIn) {
      try {
        const response = await fetch(config.backendAPI+'/api/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
  
        if (!response.ok) {
          setMdpVerification(true)
          throw new Error('Login failed');
        }
  
        const data = await response.json();
  
        // Stocker le token dans le localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
  
        // Call the function passed from App.js to trigger a state change
        showNavBar();
        
        // Rediriger après l'authentification réussie
        navigate('/home');
  
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        // Vous pouvez afficher un message d'erreur à l'utilisateur ici
      }
    } else {
      if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas !");
        return;
      }
  
      const year = `${classYear}${isApprentice ? 'A' : ''}`;
  
      const payload = {
        name,
        password,
        lastName,
        email,
        isAdmin: false,
        classYear: year,
      };
  
      try {
        const response = await axios.post(config.backendAPI + "/api/user/registerGlobal", payload);
        console.log("Signup success:", response.data);
        // Log the user in after successful signup
        
        // Call the function passed from App.js to trigger a state change
        showNavBar();
  
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
                placeholder="Jean"
                required
              />
            </div>

            <div className="input-group">
            <label htmlFor="name">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Valjean"
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

              {mdpVerification && isSignIn ? 
                <div className='error-message'>
                  <Icon path={mdiCloseCircle} size={1} className='error-icon'/>
                  <p className='error-text'>{errorMessage}</p>
                </div> : <></>}
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
            {passwordErrors.length > 0 && (
              <div className="password-error-messages">
               {passwordErrors.map((error, index) => (
                <p key={index} className="password-error">{error}</p>
               ))}
               </div>
              )}

            <div className="input-group checkbox">
            <label htmlFor="name">Afficher le mot de passe</label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              
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
            <label className="terms" htmlFor="name" onClick={handleShowTerms} >Accepter les conditions d'utilisations *</label>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            </div>

            <div className="input-group checkbox">
            <label className="terms" htmlFor="name" onClick={handleShowConfidential} >Accepter notre politique de confidentialité *</label>
            <input
              type="checkbox"
              checked={acceptConfidential}
              onChange={(e) => setAcceptConfidential(e.target.checked)}
              required
            />
            </div>
            </>
          )}
          
          <button type="submit" className="login-button">
            {isSignIn ? 'je veux je veux' : 'Prêt à sheeesh ??'}
          </button>
          <div className="google-login">
            <h3>Ou connectez-vous avec Google :</h3>
            <GoogleLoginBouton/>
          </div>
          {isSignIn &&( 
          <p className="forgot-password">
            <a className="linkPassword" href='/forgot-password'>Mot de passe oublié ?</a>
          </p>
        )}

        </form>
      </div>
      {/* Terms of Use Modal */}
      {showTermsModal && (
        <div className={`terms-modal ${showTermsModal ? 'show' : ''}`}>
          <div className="terms-modal-content">
            <h2>Conditions d'utilisation</h2>
            {/* Split the text by new lines and render each line */}
            {termsText.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            <button onClick={handleCloseTerms} className="close-modal-button">
              Fermer
            </button>
          </div>
        </div>
      )}

      {showConfidentialTerms && (
          <div className={`terms-modal ${showConfidentialTerms ? 'show' : ''}`}>
            <div className="terms-modal-content">
              <h2>Politique de confidentialité et conformité RGPD</h2>
              {/* Split the text by new lines and render each line */}
              {confidentialText.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
              <button onClick={handleCloseConfidential} className="close-modal-button">
                Fermer
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

export default Login;
