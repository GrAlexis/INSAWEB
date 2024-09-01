import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [name, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [classYear, setClassYear] = useState("3TC");
  const [isApprentice, setIsApprentice] = useState(false);

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
    };

    try {
      const response = await axios.post("http://localhost:5000/api/user/register", payload);
      console.log("Signup success:", response.data);
      // Handle successful signup
    } catch (error) {
      console.error("Signup failed:", error);
      // Handle signup error
    }
  };

  return (
    <div >
      <h2 >Inscription</h2>
      <div >
        <label >Prénom:</label>
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
      <div >
        <label >
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            
          />
          Admin
        </label>
      </div>
      <div>
        <label >Année de classe:</label>
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

export default SignupPage;
