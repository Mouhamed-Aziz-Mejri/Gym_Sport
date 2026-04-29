import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLeft from './AuthLeft';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Bonjour, ${user.first_name} !`);
      if (user.role === 'admin')      navigate('/admin');
      else if (user.role === 'coach') navigate('/coach');
      else                            navigate('/client');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Email ou mot de passe incorrect. Veuillez réessayer.');
      } else if (status === 400) {
        setError('Veuillez remplir tous les champs correctement.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (error) setError(''); // clear error when user starts typing
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
              <input
                className={`auth-input ${error ? 'auth-input-error' : ''}`}
                type="email"
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={handleChange('email')}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input
                className={`auth-input ${error ? 'auth-input-error' : ''}`}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                required
              />
            </div>

            {/* Inline error message */}
            {error && (
              <div className="auth-error-box">
                <span className="auth-error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Se connecter'}
            </button>

          </form>

          <p className="auth-footer-link">
            Pas de compte ? <Link to="/register">Créer un compte</Link>
          </p>

          

        </div>
      </div>
    </div>
  );
};

export default Login;