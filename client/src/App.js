import React from 'react'
import Home from "./components/Feed/Feed"
import Sheesh from "./components/Sheesh/Sheesh"
import Profil from "./components/Profil/Profil"

import Login from './components/Login/Login'
import Ranking from './components/Ranking/Ranking'
import { BrowserRouter, Routes, Route} from "react-router-dom"
import Navbar from './components/Common/Navbar/Navbar'
import { UserProvider } from './hooks/commonHooks/UserContext';
import './App.css';


function App() {
  return (
    <UserProvider>
      <div className="app-container">
          <BrowserRouter>
              <Routes>
                <Route index element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/sheesh" element={<Sheesh />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/sheesh/:challengeId" element={<Sheesh />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/profil" element={<Profil/>} />
              </Routes>
              <Navbar />
          </BrowserRouter>
      </div>
    </UserProvider>
  )
}

export default App
