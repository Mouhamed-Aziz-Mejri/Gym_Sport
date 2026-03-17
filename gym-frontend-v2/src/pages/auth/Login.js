import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLeft from './AuthLeft';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Bonjour, ${user.first_name}`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'coach') navigate('/coach');
      else navigate('/client');
    } catch {
      toast.error('Email ou mot de passe incorrect.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <AuthLeft />

      <div className="auth-right">
        <div className="auth-box">

          <h1 className="auth-title">Connexion</h1>
          <p className="auth-subtitle">Bienvenue, entrez vos identifiants</p>

          <form onSubmit={handle} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="vous@exemple.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input className="auth-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Se connecter'}
            </button>
          </form>

          <p className="auth-footer-link">
            Pas de compte ? <Link to="/register">Créer un compte</Link>
          </p>

          <div className="auth-demo">
            <div className="auth-demo-title">Comptes de test</div>
            {[
              { role: 'Admin',  email: 'admin@gym.com',   pwd: 'admin123' },
              { role: 'Coach',  email: 'karim@gym.com',   pwd: 'coach123' },
              { role: 'Client', email: 'client1@gym.com', pwd: 'client123' },
            ].map(d => (
              <button key={d.role} className="auth-demo-btn"
                onClick={() => setForm({ email: d.email, password: d.pwd })}>
                <span className="auth-demo-role">{d.role}</span>
                <span className="auth-demo-email">{d.email}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;