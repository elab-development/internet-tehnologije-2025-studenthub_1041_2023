import React, { useState } from 'react';
import axios from 'axios';
import { FaBars, FaTimes, FaHome, FaBook, FaClipboardList, FaUsers, FaCalendar} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { MdVideoLibrary } from "react-icons/md";



const linksByRole = {
  student: [
    { to: '/home', label: 'Početna', icon: <FaHome /> },
    { to: '/predmeti', label: 'Predmeti', icon: <FaBook /> },
    { to: '/prijave', label: 'Prijava ispita', icon: <FaClipboardList /> },
    { to: '/kalendar', label: 'Kalendar i Vreme', icon: <FaCalendar /> },
    {to: '/youtube', label: 'Youtube Edukacija', icon: <MdVideoLibrary/> },
  ],
  sluzbenik: [
    { to: '/sluzbenik/home', label: 'Početna', icon: <FaUsers /> },
    { to: '/sluzbenik/studenti', label: 'Studenti', icon: <FaUsers /> },
    { to: '/sluzbenik/predmeti', label: 'Predmeti', icon: <FaBook /> },
    { to: '/sluzbenik/prijave', label: 'Prijave ispita', icon: <FaClipboardList /> },
  ],
};

function Navigation({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleLogoutClick = async () => {
        try {
        const token = sessionStorage.getItem('access_token');
        await axios.post('http://127.0.0.1:8000/api/logout', {}, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            }
        });

        alert('Uspešno ste se odjavili.');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        onLogout();

        navigate('/', { replace: true }); // programatsko preusmerenje na login stranicu

        } catch (error) {
        alert('Došlo je do greške prilikom odjave.');
        console.error(error);
        }
    };

  const links = linksByRole[user.role] || [];

  return (
    <>
      {/* Top bar sa toggle dugmetom i brandom */}
      <header className="topbar">
        <button className="toggle-button" onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        <span className="brand">Examify</span>
        <div className="user-info">
          Dobrodošli, {user.ime} {user.prezime} ({user.role})
        </div>
        <button className="button logout-button" onClick={handleLogoutClick}>
          Odjavi se
        </button>
      </header>

      {/* Sidebar meni */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {links.map(({ to, label, icon }) => (
          <Link key={to} to={to} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <span className="icon">{icon}</span>
            <span className="label">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Overlay kad je sidebar otvoren (za zatvaranje klikom van) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
}

export default Navigation;
