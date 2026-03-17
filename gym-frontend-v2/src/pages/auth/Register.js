import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import AuthLeft from './AuthLeft';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '',
    password: '', password2: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role: 'client' });
      toast.success('Compte créé ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      const errs = err.response?.data;
      toast.error(errs ? Object.values(errs).flat().join(' ') : "Erreur lors de l'inscription.");
    } finally { setLoading(false); }
  };

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="auth-page">
      <AuthLeft />

      <div className="auth-right">
        <div className="auth-box">

          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-subtitle">Rejoignez notre communauté fitness</p>

          <form onSubmit={handle} className="auth-form">
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">Prénom</label>
                <input className="auth-input" type="text" placeholder="Prénom" required {...f('first_name')} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Nom</label>
                <input className="auth-input" type="text" placeholder="Nom" required {...f('last_name')} />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="vous@exemple.com" required {...f('email')} />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Téléphone <span style={{ color: '#bbb', fontWeight: 400 }}>(optionnel)</span>
              </label>
              <input className="auth-input" type="tel" placeholder="+216 XX XXX XXX" {...f('phone')} />
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">Mot de passe</label>
                <input className="auth-input" type="password" placeholder="Min. 6 caractères" required {...f('password')} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirmer</label>
                <input className="auth-input" type="password" placeholder="Répéter" required {...f('password2')} />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Créer mon compte'}
            </button>
          </form>

          <p className="auth-footer-link">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;