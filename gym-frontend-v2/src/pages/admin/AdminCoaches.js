import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, DollarSign, MessageSquare } from 'lucide-react';
import { getCoaches, adminUpdateCoachProfile } from '../../api/coaches';
import { createCoach, deleteUser } from '../../api/auth';
import { getCoachReviews } from '../../api/reviews';
import { deleteReview } from '../../api/reviews';
import { PageHeader, Btn, Modal, Input, Select, Textarea, Empty, Stars } from '../../components/common/Common';
import toast from 'react-hot-toast';


const SPECIALITIES = [
  ['musculation','Musculation'],['cardio','Cardio'],['crossfit','CrossFit'],
  ['yoga','Yoga'],['pilates','Pilates'],['boxe','Boxe'],
  ['natation','Natation'],['nutrition','Nutrition'],['autre','Autre'],
];

const AdminCoaches = () => {
  const [coaches, setCoaches]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]   = useState(null);  // coach object
  const [reviewModal, setReviewModal] = useState(null); // { id, name }
  const [reviews, setReviews]       = useState([]);
  const [form, setForm]             = useState({ email:'', first_name:'', last_name:'', password:'', password2:'', phone:'' });
  const [editForm, setEditForm]     = useState({});
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    getCoaches().then(r => setCoaches(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* ── Create coach ──────────────────────────────── */
  const f = k => ({ value: form[k] || '', onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const handleCreate = async () => {
    if (form.password !== form.password2) { toast.error('Mots de passe différents'); return; }
    setSaving(true);
    try {
      await createCoach({ ...form, role: 'coach' });
      toast.success('Coach créé!');
      setCreateModal(false);
      setForm({ email:'', first_name:'', last_name:'', password:'', password2:'', phone:'' });
      load();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSaving(false); }
  };

  /* ── Edit coach profile ────────────────────────── */
  const openEdit = (c) => {
    setEditForm({
      speciality: c.profile?.speciality || 'musculation',
      price_per_session: c.profile?.price_per_session || '',
      experience_years: c.profile?.experience_years || '',
      bio: c.profile?.bio || '',
    });
    setEditModal(c);
  };

  const ef = k => ({ value: editForm[k] ?? '', onChange: e => setEditForm({ ...editForm, [k]: e.target.value }) });

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await adminUpdateCoachProfile(editModal.id, editForm);
      toast.success('Profil mis à jour!');
      setEditModal(null);
      load();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSaving(false); }
  };

  /* ── Reviews modal ─────────────────────────────── */
  const openReviews = async (c) => {
    setReviewModal({ id: c.id, name: c.full_name });
    setReviews([]);
    const r = await getCoachReviews(c.id);
    setReviews(r.data);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis?')) return;
    try {
      await deleteReview(reviewId);
      toast.success('Avis supprimé');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch { toast.error('Erreur'); }
  };

  /* ── Delete coach ──────────────────────────────── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name}?`)) return;
    try { await deleteUser(id); toast.success('Supprimé'); load(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <PageHeader
        title="COACHS"
        subtitle={`${coaches.length} coachs enregistrés`}
        action={<Btn onClick={() => setCreateModal(true)}><Plus size={16} /> Ajouter un coach</Btn>}
      />

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        coaches.length === 0 ? <Empty message="Aucun coach enregistré" /> :
        <div className="coaches-grid">
          {coaches.map(c => (
            <div key={c.id} className="coach-card">
              <div className="coach-card-header">
                <div className="coach-avatar">{c.full_name?.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="coach-name">{c.full_name}</div>
                  <div className="coach-spec">{c.profile?.speciality || '—'}</div>
                </div>
              </div>
              <div className="coach-meta">
                <span className="meta-item"><DollarSign size={14} />{c.profile?.price_per_session ? `${c.profile.price_per_session} DT/séance` : '—'}</span>
                <span className="meta-item"><Star size={14} />{c.average_rating ? `${c.average_rating}/5 (${c.total_reviews} avis)` : 'Aucun avis'}</span>
              </div>
              <div className="coach-actions">
                {/* Edit profile */}
                <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}><Pencil size={13} /> Modifier</Btn>
                {/* View reviews */}
                <Btn size="sm" variant="secondary" onClick={() => openReviews(c)}>
                  <MessageSquare size={13} /> Avis ({c.total_reviews})
                </Btn>
                {/* Delete */}
                <Btn size="sm" variant="danger" onClick={() => handleDelete(c.id, c.full_name)}><Trash2 size={13} /></Btn>
              </div>
            </div>
          ))}
        </div>
      }

      {/* ── Create Coach Modal ─────────────────────── */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="AJOUTER UN COACH"
        footer={<><Btn variant="secondary" onClick={() => setCreateModal(false)}>Annuler</Btn><Btn loading={saving} onClick={handleCreate}>Créer</Btn></>}
      >
        <div className="form-row">
          <Input label="Prénom" required {...f('first_name')} />
          <Input label="Nom"    required {...f('last_name')} />
        </div>
        <Input label="Email" type="email" required {...f('email')} />
        <Input label="Téléphone" {...f('phone')} />
        <div className="form-row">
          <Input label="Mot de passe" type="password" required {...f('password')} />
          <Input label="Confirmer"    type="password" required {...f('password2')} />
        </div>
      </Modal>

      {/* ── Edit Coach Profile Modal ───────────────── */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)}
        title={`MODIFIER PROFIL — ${editModal?.full_name}`}
        footer={<><Btn variant="secondary" onClick={() => setEditModal(null)}>Annuler</Btn><Btn loading={saving} onClick={handleEditSave}>Sauvegarder</Btn></>}
      >
        <Select label="Spécialité" {...ef('speciality')}>
          {SPECIALITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <div className="form-row">
          <Input label="Prix / séance (DT)" type="number" min="0" {...ef('price_per_session')} />
          <Input label="Années d'expérience" type="number" min="0" {...ef('experience_years')} />
        </div>
        <Textarea label="Bio" rows={4} placeholder="Description du coach..." {...ef('bio')} />
      </Modal>

      {/* ── Reviews Modal ──────────────────────────── */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)}
        title={`AVIS — ${reviewModal?.name}`}
        footer={<Btn variant="secondary" onClick={() => setReviewModal(null)}>Fermer</Btn>}
      >
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--sub)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
            Aucun avis pour ce coach.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
                      {r.client_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{r.client_name}</div>
                      <div style={{ fontSize:11, color:'var(--sub)' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div style={{ display:'flex', gap:2, marginLeft:'auto' }}>
                      {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:14, color: n <= r.rating ? 'var(--accent)' : 'var(--muted)' }}>★</span>)}
                    </div>
                  </div>
                  {r.comment && <p style={{ fontSize:13, color:'var(--sub)', fontStyle:'italic', paddingLeft:42 }}>"{r.comment}"</p>}
                </div>
                <Btn size="sm" variant="danger" onClick={() => handleDeleteReview(r.id)}><Trash2 size={13} /></Btn>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AdminCoaches;
