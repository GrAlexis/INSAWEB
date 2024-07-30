import React from 'react'
import Home from "./components/Home/Home"
import Sheesh from "./components/Sheesh/Sheesh"
import Login from './components/Login/Login'
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
                <Route path="/sheesh/:challengeId" element={<Sheesh />} />
                <Route path="/login" element={<Login/>} />
              </Routes>
              <Navbar />
          </BrowserRouter>
      </div>
    </UserProvider>
  )
}

export default App
