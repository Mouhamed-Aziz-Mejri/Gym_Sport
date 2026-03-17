import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllRead, markOneRead } from '../../api/notifications';

const PAGE_TITLES = {
  '/admin': 'Dashboard', '/admin/coaches': 'Coachs', '/admin/courses': 'Cours',
  '/admin/reservations': 'Réservations', '/admin/users': 'Utilisateurs',
  '/coach': 'Dashboard', '/coach/reservations': 'Réservations',
  '/coach/availability': 'Disponibilités', '/coach/profile': 'Mon Profil',
  '/client': 'Accueil', '/client/coaches': 'Coachs', '/client/courses': 'Cours',
  '/client/reservations': 'Mes Réservations', '/client/profile': 'Mon Profil',
};

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const unread = notifs.filter(n => !n.is_read).length;
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  const title = PAGE_TITLES[window.location.pathname] || 'GymSport';

  useEffect(() => {
    getNotifications().then(r => setNotifs(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
  };

  const handleOne = async (id) => {
    await markOneRead(id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick}><Menu size={18} /></button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-right">
        <div className="notif-wrapper" ref={ref}>
          <button className="notif-btn" onClick={() => setOpen(!open)}>
            <Bell size={16} />
            {unread > 0 && <span className="notif-badge" />}
          </button>
          {open && (
            <div className="notif-drop">
              <div className="notif-drop-head">
                Notifications {unread > 0 && `(${unread})`}
                {unread > 0 && <button className="notif-mark-all" onClick={handleMarkAll}>Tout lire</button>}
              </div>
              <div className="notif-list">
                {notifs.length === 0
                  ? <p className="notif-empty">Aucune notification</p>
                  : notifs.slice(0, 8).map(n => (
                    <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => handleOne(n.id)}>
                      <p className="notif-msg">{n.message}</p>
                      <p className="notif-time">{new Date(n.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
        <div className="topbar-avatar">{initials}</div>
      </div>
    </header>
  );
};

export default Topbar;
