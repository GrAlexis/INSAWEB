import React, { useState, useEffect } from 'react';
import config from "./config";
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
import { UniverseProvider } from './hooks/commonHooks/UniverseContext';
import './App.css';
import EventPage from './components/Events/EventPage'
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ResetPassword from './components/ForgotPassword/ResetPassword';
import HomePage from './components/HomePage/HomePage'
import ContactPage from './components/ContactPage/ContactPage'
import UniverseSelectionPage from './components/UniverseSelectionPage/UniverseSelectionPage'
import BadgeCarrousel from './components/InfoBar/BadgeCarrousel'



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

  const refreshPath = () => {
    setIsLoggedIn(true);
    setPath(window.location.pathname); // Update the path state after login
  };
  const isComponentWithNavbar = ['/home', '/sheesh', '/ranking', '/profil'].some(p =>
    path.startsWith(p)
  );

  return (
    
      <div className="app-container">
          <BrowserRouter>
              <Routes>
                <Route index element={<Login showNavBar={refreshPath} />} />
                <Route path="/home" element={<UniverseProvider><UserProvider><Home showNavBar={refreshPath}/></UserProvider></UniverseProvider>} />
                <Route path="/sheesh" element={<UniverseProvider><UserProvider><Sheesh showNavBar={refreshPath}/></UserProvider></UniverseProvider>} />
                <Route path="/ranking" element={<UniverseProvider><UserProvider><Ranking showNavBar={refreshPath}/></UserProvider></UniverseProvider>} />
                <Route path="/sheesh/:challengeId" element={<UniverseProvider><UserProvider><Sheesh showNavBar={refreshPath}/></UserProvider></UniverseProvider>} />
                <Route path="/register" element={<UniverseProvider><UserProvider><ProtectedRoute adminOnly={true}><Register showNavBar={refreshPath}/></ProtectedRoute></UserProvider></UniverseProvider>} />
                <Route path="/login" element={<Login showNavBar={refreshPath} />} />
                <Route path="/first" element={<HomePage showNavBar={refreshPath} />} />
                <Route path="/contact" element={<ContactPage showNavBar={refreshPath} />} />
                <Route path="/events" element={<UserProvider><EventPage/></UserProvider>} />
                <Route path="/badges" element={<UserProvider><BadgeCarrousel/></UserProvider>} />
                <Route path="/select-universe" element={<UniverseProvider><UserProvider><UniverseSelectionPage showNavBar={refreshPath}/></UserProvider></UniverseProvider>} />

                <Route
                  path="/admin"
                  element={<UniverseProvider><UserProvider>
                    <ProtectedRoute adminOnly={true}>
                      <AdminPage showNavBar={refreshPath}/>
                    </ProtectedRoute></UserProvider></UniverseProvider>
                  }
                /><Route
                path="/profil"
                element={<UniverseProvider><UserProvider>
                  <ProtectedRoute  >
                    <Profil showNavBar={refreshPath}/>
                  </ProtectedRoute></UserProvider></UniverseProvider>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword showNavBar={refreshPath} />} />
              <Route path="/reset-password/:token" element={<ResetPassword showNavBar={refreshPath} />} />
              </Routes>
          {(isComponentWithNavbar || isLoggedIn) && <UniverseProvider><UserProvider><Navbar /></UserProvider></UniverseProvider>}
          </BrowserRouter>
      </div>
  )
}

export default App

