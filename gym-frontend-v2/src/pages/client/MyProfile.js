import '../Pages.css';
import React, { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import { updateMe, changePassword } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Card, Input, Btn } from '../../components/common/Common';
import toast from 'react-hot-toast';


const MyProfile = () => {
  const { user, updateUser } = useAuth();
  const [personal, setPersonal] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' });
  const [savingP, setSavingP] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleSavePersonal = async () => {
    setSavingP(true);
    try {
      await updateMe(personal);
      updateUser(personal);
      toast.success('Profil mis à jour!');
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSavingP(false); }
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    setSavingPwd(true);
    try {
      await changePassword({ old_password: passwords.old_password, new_password: passwords.new_password });
      toast.success('Mot de passe modifié!');
      setPasswords({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSavingPwd(false); }
  };

  const fp = k => ({ value: personal[k], onChange: e => setPersonal({ ...personal, [k]: e.target.value }) });
  const fw = k => ({ value: passwords[k], onChange: e => setPasswords({ ...passwords, [k]: e.target.value }) });

  return (
    <div>
      <PageHeader title="MON PROFIL" subtitle="Gérez vos informations personnelles" />

      <div className="grid-2" style={{ gap: 20 }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div className="profile-avatar-big">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{user?.first_name} {user?.last_name}</span>
            <span style={{ fontSize: 12, color: 'var(--sub)', textTransform: 'uppercase', marginTop: 4 }}>{user?.role}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-row">
              <Input label="Prénom" {...fp('first_name')} />
              <Input label="Nom"    {...fp('last_name')} />
            </div>
            <Input label="Téléphone" {...fp('phone')} />
            <div className="form-field">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
            </div>
            <Btn loading={savingP} onClick={handleSavePersonal} className="full-width">
              <Save size={15} /> Sauvegarder
            </Btn>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16} /> CHANGER LE MOT DE PASSE
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Mot de passe actuel" type="password" {...fw('old_password')} />
            <Input label="Nouveau mot de passe" type="password" {...fw('new_password')} />
            <Input label="Confirmer" type="password" {...fw('confirm')} />
            <Btn loading={savingPwd} onClick={handleChangePassword}>
              <Lock size={15} /> Modifier
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
