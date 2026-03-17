import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../../api/coaches';
import { updateMe } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Card, Input, Select, Textarea, Btn } from '../../components/common/Common';
import toast from 'react-hot-toast';


const SPECIALITIES = [
  ['musculation','Musculation'],['cardio','Cardio'],['crossfit','CrossFit'],
  ['yoga','Yoga'],['pilates','Pilates'],['boxe','Boxe'],
  ['natation','Natation'],['nutrition','Nutrition'],['autre','Autre'],
];

// Maps Django field names to French labels
const FIELD_LABELS = {
  first_name: 'Prénom',
  last_name: 'Nom',
  email: 'Email',
  phone: 'Téléphone',
  price_per_session: 'Prix / séance',
  experience_years: "Années d'expérience",
  speciality: 'Spécialité',
  bio: 'Bio',
  non_field_errors: 'Erreur',
};

const showErrors = (data) => {
  Object.entries(data).forEach(([field, msgs]) => {
    const label = FIELD_LABELS[field] || field;
    const message = [].concat(msgs).join(' ');
    toast.error(`${label}: ${message}`);
  });
};

const CoachProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    speciality: 'musculation', bio: '',
    price_per_session: '', experience_years: '',
  });
  const [personal, setPersonal] = useState({
    first_name: '', last_name: '', phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    if (user) {
      setPersonal({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    // Basic front-end validation
    if (!personal.first_name.trim()) { toast.error('Prénom est obligatoire'); return; }
    if (!personal.last_name.trim())  { toast.error('Nom est obligatoire'); return; }
    if (!profile.price_per_session)  { toast.error('Prix / séance est obligatoire'); return; }

    setSaving(true);
    let hasError = false;

    // Save personal info
    try {
      await updateMe(personal);
      updateUser(personal);
    } catch (err) {
      hasError = true;
      if (err.response?.data) showErrors(err.response.data);
      else toast.error('Erreur lors de la mise à jour des infos personnelles');
    }

    // Save coach profile
    try {
      await updateMyProfile(profile);
    } catch (err) {
      hasError = true;
      if (err.response?.data) showErrors(err.response.data);
      else toast.error('Erreur lors de la mise à jour du profil coach');
    }

    setSaving(false);
    if (!hasError) toast.success('Profil mis à jour avec succès!');
  };

  const fp = k => ({ value: profile[k] ?? '', onChange: e => setProfile({ ...profile, [k]: e.target.value }) });
  const fi = k => ({ value: personal[k] ?? '', onChange: e => setPersonal({ ...personal, [k]: e.target.value }) });

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <PageHeader
        title="MON PROFIL"
        subtitle="Gérez vos informations personnelles et professionnelles"
        action={<Btn loading={saving} onClick={handleSave}><Save size={16} /> Sauvegarder</Btn>}
      />

      <div className="grid-2" style={{ gap: 20 }}>
        <Card>
          <h3 className="chart-title" style={{ marginBottom: 20 }}>Informations personnelles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-row">
              <Input label="Prénom *" {...fi('first_name')} />
              <Input label="Nom *"    {...fi('last_name')} />
            </div>
            <Input label="Téléphone" {...fi('phone')} />
            <div className="form-field">
              <label className="form-label">Email (non modifiable)</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="chart-title" style={{ marginBottom: 20 }}>Profil professionnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select label="Spécialité *" {...fp('speciality')}>
              {SPECIALITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <div className="form-row">
              <Input label="Prix / séance (DT) *" type="number" min="0" {...fp('price_per_session')} />
              <Input label="Années d'expérience"  type="number" min="0" {...fp('experience_years')} />
            </div>
            <Textarea
              label="Bio / Description"
              placeholder="Décrivez votre approche, certifications..."
              rows={5}
              {...fp('bio')}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CoachProfile;
