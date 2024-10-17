/* global google */
import React, { useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ showNavBar }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Créez une balise <script> et ajoutez-la au document
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: "870362726807-4dcvr8vvcq0lkvnrkhh89sgr3plbtuib.apps.googleusercontent.com", // Remplacez par votre client ID Google
          callback: handleGoogleSignIn,
        });

        google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline' } // Personnalisez la taille et le style du bouton ici
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleSignIn = async (response) => {
    const token = response.credential;
    try {
      const verifyResponse = await axios.post(`${config.backendAPI}/api/user/loginGoogle`, { token });
      const { token: userToken, email } = verifyResponse.data;
      console.log(userToken)
      localStorage.setItem('token', userToken);
      localStorage.setItem('email', email);
      navigate('/home');
    } catch (error) {
      console.error('Échec de la connexion via Google', error);
    }
  };

  return <div id="googleSignInButton"></div>;
};

export default GoogleLoginButton;
/*Probleme tah le cors */