import React, { useState } from "react";
import config from '../../config';
import axios from "axios";
import { useNavigate } from 'react-router-dom'; 
import { UserProvider, useUser } from '../../hooks/commonHooks/UserContext';

function SignupPage({ showNavBar }) {
  const [name, setFirstName] = useState("");
  const [email, setEmail] = useState("@insa-lyon.fr")
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [classYear, setClassYear] = useState("3TC");
  const [isApprentice, setIsApprentice] = useState(false);
  const { user, setUser, updateUserTeamName } = useUser();
  const navigate = useNavigate(); 

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    const year = `${classYear}${isApprentice ? 'A' : ''}`;
    
    const payload = {
      name,
      lastName,
      password,
      isAdmin,
      classYear: year,
      email
    };

    try {
      const response = await axios.post(config.backendAPI+"/api/user/registerAdminUser", payload);
      console.log("Signup success:", response.data);
      
      // Call the function passed from App.js to trigger a state change
      showNavBar();

      // Redirect to the home page after signup
      navigate('/home');
      
    } catch (error) {
      console.error("Signup failed:", error);
      alert('Creation du compte non réussie')
      // Handle signup error
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Inscription</h2>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Prénom:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setFirstName(e.target.value)}
          
        />
      </div>
      <div>
        <label >Nom:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={styles.input}
        />
      </div><div style={styles.inputGroup}>
        <label style={styles.label}>Email INSA</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
      </div>
      <div >
        <label >Mot de passe:</label>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          
        />
      </div>
      <div >
        <label >Confirmer le mot de passe:</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          
        />
      </div>
      <div >
        <label >
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            
          />
          Afficher le mot de passe
        </label>
      </div>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>Année de classe:</label>
        <select
          value={classYear}
          onChange={(e) => setClassYear(e.target.value)}
          
        >
          <option value="3TC">3TC</option>
          <option value="4TC">4TC</option>
          <option value="5TC">5TC</option>
        </select>
      </div>
      <div >
        <label >
          <input
            type="checkbox"
            checked={isApprentice}
            onChange={(e) => setIsApprentice(e.target.checked)}
            
          />
          En apprentissage
        </label>
      </div>
      <div>
        <button onClick={handleSignup} >
          S'inscrire
        </button>
        <button onClick={() => navigate('/login')}>
      Ou se connecter
    </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  inputGroupCheckbox: {
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "16px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  checkbox: {
    marginRight: "10px",
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#007BFF",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default SignupPage;
