import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './reusable/Navigation';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import Home from './student/Home';
import HomeSluzbenik from './sluzbenik/HomeSluzbenik';
import './App.css';
import Footer from './reusable/Footer';
import SluzbenikPredmeti from './sluzbenik/SluzbenikPredmeti';
import SluzbenikStudenti from './sluzbenik/SluzbenikStudenti';
import Predmeti from './student/Predmeti';
import Prijave from './student/PrijavaIspita';
import PrijaveSluzbenik from './sluzbenik/SluzbenikPrijavaIspita';
import Kalendar from './student/Kalendar';
import YoutubeEdukacija from './student/YoutubeEdukacija';

//  NOVO:
import ProfesorHome from './profesor/ProfesorHome';
import ProfesorStudenti from './profesor/ProfesorStudenti';

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    const storedUser = sessionStorage.getItem('user');
    if (token && storedUser) {
      setAccessToken(token);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = ({ access_token, user }) => {
    setAccessToken(access_token);
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      {user && <Navigation user={user} onLogout={handleLogout} />}

      <Routes>
        {/* Ako nije ulogovan, šalje na Login */}
        {!user && (
          <>
            <Route path="/" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
          </>
        )}

        {/* Ako je ulogovan student */}
        {user && user.role === 'student' && (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/predmeti" element={<Predmeti />} />
            <Route path="/prijave" element={<Prijave />} />
            <Route path="/kalendar" element={<Kalendar />} />
            <Route path="/youtube" element={<YoutubeEdukacija />} />
          </>
        )}

        {/* Ako je ulogovan službenik */}
        {user && user.role === 'sluzbenik' && (
          <>
            <Route path="/sluzbenik/home" element={<HomeSluzbenik />} />
            <Route path="/sluzbenik/predmeti" element={<SluzbenikPredmeti />} />
            <Route path="/sluzbenik/studenti" element={<SluzbenikStudenti />} />
            <Route path="/sluzbenik/prijave" element={<PrijaveSluzbenik />} />
          </>
        )}

        {/*  Ako je ulogovan profesor */}
        {user && user.role === 'profesor' && (
          <>
            <Route path="/profesor/home" element={<ProfesorHome />} />
            <Route path="/profesor/studenti" element={<ProfesorStudenti />} />
          </>
        )}

        {/*  Fallback redirecti (preporuka) */}
        {user && user.role === 'student' && <Route path="*" element={<Navigate to="/home" />} />}
        {user && user.role === 'sluzbenik' && <Route path="*" element={<Navigate to="/sluzbenik/home" />} />}
        {user && user.role === 'profesor' && <Route path="*" element={<Navigate to="/profesor/home" />} />}
        {!user && <Route path="*" element={<Navigate to="/" />} />}
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;