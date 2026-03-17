import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Dumbbell, CalendarDays,
  ClipboardList, Clock, UserCircle, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';

const NAV = {
  admin: [
    { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',      end: true },
    { to: '/admin/coaches',      icon: Dumbbell,        label: 'Coachs' },
    { to: '/admin/courses',      icon: CalendarDays,    label: 'Cours' },
    { to: '/admin/reservations', icon: ClipboardList,   label: 'Réservations' },
    { to: '/admin/users',        icon: Users,           label: 'Utilisateurs' },
  ],
  coach: [
    { to: '/coach',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
    { to: '/coach/reservations', icon: ClipboardList,   label: 'Réservations' },
    { to: '/coach/availability', icon: Clock,           label: 'Disponibilités' },
    { to: '/coach/profile',      icon: UserCircle,      label: 'Mon Profil' },
  ],
  client: [
    { to: '/client',              icon: LayoutDashboard, label: 'Accueil',       end: true },
    { to: '/client/coaches',      icon: Dumbbell,        label: 'Coachs' },
    { to: '/client/courses',      icon: CalendarDays,    label: 'Cours' },
    { to: '/client/reservations', icon: ClipboardList,   label: 'Réservations' },
    { to: '/client/profile',      icon: UserCircle,      label: 'Mon Profil' },
  ],
};

const Sidebar = ({ open, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-logo-wrap">
        {open && <div className="sidebar-logo">Gym<span>Sport</span></div>}
        <button className="toggle-btn" onClick={onToggle}>
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} className="nav-icon" />
            {open && <span className="nav-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {open && (
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div className="user-name">{user?.first_name} {user?.last_name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }} title="Déconnexion">
          <LogOut size={14} />
          {open && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
