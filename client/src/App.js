import React from 'react'
import Home from "./components/Feed/Feed"
import Sheesh from "./components/Sheesh/Sheesh"
import Profil from "./components/Profil/Profil"


import Register from './components/Register/Register'
import Ranking from './components/Ranking/Ranking'
import AdminPage from './components/AdminPage/AdminPage';
import ProtectedRoute from './utils/ProtectedRoute'
import { BrowserRouter, Routes, Route} from "react-router-dom"
import Navbar from './components/Common/Navbar/Navbar'
import { UserProvider } from './hooks/commonHooks/UserContext';
import './App.css';
import Login from './components/Login/Login'


function App() {
  return (
    <UserProvider>
      <div className="app-container">
          <BrowserRouter>
              <Routes>
                <Route index element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/sheesh" element={<Sheesh />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/sheesh/:challengeId" element={<Sheesh />} />
                <Route path="/register" element={<Register/>} />
                <Route path="/login" element={<Login/>} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true} >
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />   <Route
                path="/profil"
                element={
                  <ProtectedRoute  >
                    <Profil />
                  </ProtectedRoute>
                }
              />            
              </Routes>
              <Navbar />
          </BrowserRouter>
      </div>
    </UserProvider>
  )
}

export default App
