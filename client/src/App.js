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
                <Route path="/home" element={<UserProvider><Home showNavBar={refreshPath}/></UserProvider>} />
                <Route path="/sheesh" element={<UserProvider><Sheesh showNavBar={refreshPath}/></UserProvider>} />
                <Route path="/ranking" element={<UserProvider><Ranking showNavBar={refreshPath}/></UserProvider>} />
                <Route path="/sheesh/:challengeId" element={<UserProvider><Sheesh showNavBar={refreshPath}/></UserProvider>} />
                <Route path="/register" element={<UserProvider><ProtectedRoute adminOnly={true}><Register showNavBar={refreshPath}/></ProtectedRoute></UserProvider>} />
                <Route path="/login" element={<Login showNavBar={refreshPath} />} />
                <Route path="/events" element={<UserProvider><EventPage/></UserProvider>} />
                <Route
                  path="/admin"
                  element={<UserProvider>
                    <ProtectedRoute adminOnly={true}>
                      <AdminPage showNavBar={refreshPath}/>
                    </ProtectedRoute></UserProvider>
                  }
                /><Route
                path="/profil"
                element={<UserProvider>
                  <ProtectedRoute  >
                    <Profil showNavBar={refreshPath}/>
                  </ProtectedRoute></UserProvider>
                }
              />            
              </Routes>
          {(isComponentWithNavbar || isLoggedIn) && <UserProvider><Navbar /></UserProvider>}
          </BrowserRouter>
      </div>
  )
}

export default App

