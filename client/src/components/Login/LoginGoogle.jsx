// GoogleLoginButton.js
import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config'
import GoogleButton from 'react-google-button';

// Your Google OAuth client details
const clientId = '870362726807-4dcvr8vvcq0lkvnrkhh89sgr3plbtuib.apps.googleusercontent.com'; // Replace with your client ID
const clientSecret = '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'; // Replace with your client secret (keep it secure)
const redirectUri = "http://localhost:3000/login"; // Adjust based on your setup



function GoogleLoginButton() {
    const navigate = useNavigate(); 
  const location = useLocation();

  useEffect(() => {
    //console.log(location.search)
    const { code } = queryString.parse(location.search);

    // If the 'code' is in the URL, exchange it for an id_token
    if (code) {
        //console.log(code)
      exchangeCodeForToken(code);
    }
    else{
        console.log('No code')
    }
  }, [location]);

  const initiateGoogleLogin = () => {
    const scope = 'openid email profile';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

    // Redirect user to Google's OAuth 2.0 authorization URL
    window.location.href = googleAuthUrl;
  };

  const exchangeCodeForToken = async (authCode) => {
    try {
      // Exchange the authorization code for tokens
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      });

      // Extract 'id_token' from the response
      const  id_token  = response.data['id_token'];
      console.log(id_token)
      // Send the 'id_token' to your backend for verification
      const backendResponse = await axios.post(config.backendAPI+'/api/user/loginGoogle', {
        token: id_token,
      });

      // Handle the response from the backend
      const { token, email } = backendResponse.data;
      /*console.log('JWT Token:', token);
      console.log('User Email:', email);*/

      // Store the token in local storage or cookies for future authenticated requests
      localStorage.setItem('token', token);

      // Redirect or update your app state as needed
      if (token){
        navigate('/home')
      }
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    <div>
      <GoogleButton onClick={initiateGoogleLogin}>
        Login with Google
      </GoogleButton>
    </div>
  );
}

export default GoogleLoginButton;
