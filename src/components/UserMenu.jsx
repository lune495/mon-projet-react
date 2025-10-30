import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './UserMenu.css';

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu-container" ref={menuRef}>
      <FaUserCircle className="user-icon" onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="user-dropdown">
          <div className="user-name">{user?.name || 'Utilisateur'}</div>
          <button className="logout-btn" onClick={onLogout}>Déconnexion</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
