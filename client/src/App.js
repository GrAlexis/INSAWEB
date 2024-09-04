import React, { useState, useEffect } from 'react';
import Home from "./components/Feed/Feed"
import Sheesh from "./components/Sheesh/Sheesh"
import Profil from "./components/Profil/Profil"

import Login from './components/Login/Login'
import Register from './components/Register/Register'
import Ranking from './components/Ranking/Ranking'
import AdminPage from './components/AdminPage/AdminPage';
import ProtectedRoute from './utils/ProtectedRoute'
import { BrowserRouter, Routes, Route} from "react-router-dom"
import Navbar from './components/Common/Navbar/Navbar'
import { UserProvider } from './hooks/commonHooks/UserContext';
import './App.css';
import Login from './components/Login/Login'
import EventPage from './components/Events/EventPage'

function App() {

  const [path, setPath] = useState(window.location.pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handlePathChange = () => setPath(window.location.pathname);

    // Listen for popstate event to detect browser navigation (back/forward)
    window.addEventListener('popstate', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPath(window.location.pathname); // Update the path state after login
  };
  const showNavbar = ['/home', '/sheesh', '/ranking', '/profil'].some(p =>
    path.startsWith(p)
  );

  return (
    <UserProvider>
      <div className="app-container">
          <BrowserRouter>
              <Routes>
                <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/sheesh" element={<ProtectedRoute><Sheesh /></ProtectedRoute>} />
                <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
                <Route path="/sheesh/:challengeId" element={<ProtectedRoute><Sheesh /></ProtectedRoute>} />
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                /><Route
                path="/profil"
                element={
                  <ProtectedRoute  >
                    <Profil />
                  </ProtectedRoute>
                }
              />            
              </Routes>
          {(showNavbar || isLoggedIn) && <Navbar />}
          </BrowserRouter>
      </div>
    </UserProvider>
  )
}

export default App

