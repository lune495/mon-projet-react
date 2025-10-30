import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import Products from './components/Products/Products'
import Login from './components/Auth/Login'
import UserMenu from './components/UserMenu'
import { fetchCurrentUser, logout } from './api/graphql'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('authToken')) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <Router>
      {loading ? (
        <div className="loading">Chargement...</div>
      ) : !user ? (
        <Routes>
          <Route path="*" element={<Login onLoginSuccess={setUser} />} />
        </Routes>
      ) : (
        <div className="App">
          <svg>
            <defs>
              <filter id="pencil-effect">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3"/>
                <feDisplacementMap in="SourceGraphic" scale="2"/>
              </filter>
            </defs>
          </svg>
          <div className="header">
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  )
}

export default App
