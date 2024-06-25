import React from 'react'
import Home from "./components/Home/Home"
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
              </Routes>
              <Navbar />
          </BrowserRouter>
      </div>
    </UserProvider>
  )
}

export default App
