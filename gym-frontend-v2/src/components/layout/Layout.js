import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

const Layout = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="layout">
      <Sidebar open={open} onToggle={() => setOpen(!open)} />
      <div className="layout-main">
        <Topbar onMenuClick={() => setOpen(!open)} />
        <main className="layout-content"><Outlet /></main>
      </div>
    </div>
  );
};

export default Layout;
