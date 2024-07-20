import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/login';
  };

  return (
    <div style={styles.container}>
      <h1>Login</h1>
      <button onClick={handleLogin} style={styles.button}>Login with CAS</button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0'
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px'
  }
};

export default Login;
