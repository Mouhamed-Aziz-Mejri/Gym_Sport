import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CalendarDays, Users, Clock, MapPin, Pencil } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse, getCourseEnrollments } from '../../api/courses';
import { getCoaches } from '../../api/coaches';
import { PageHeader, Btn, Modal, Input, Select, Textarea, Badge, Empty } from '../../components/common/Common';
import toast from 'react-hot-toast';


const TYPES  = ['yoga','hiit','pilates','zumba','crossfit','cardio','musculation','boxe','autre'];
const LEVELS = [['tous','Tous niveaux'],['debutant','Débutant'],['intermediaire','Intermédiaire'],['avance','Avancé']];
const EMPTY_FORM = { name:'', course_type:'yoga', level:'tous', coach:'', date:'', start_time:'', end_time:'', max_capacity:15, price:0, location:'Salle principale', description:'' };

const AdminCourses = () => {
  const [courses, setCourses]             = useState([]);
  const [coaches, setCoaches]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [createModal, setCreateModal]     = useState(false);
  const [editModal, setEditModal]         = useState(null); // course object
  const [enrollModal, setEnrollModal]     = useState(null); // { id, name }
  const [enrollments, setEnrollments]     = useState([]);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getCourses(), getCoaches()])
      .then(([c, co]) => { setCourses(c.data); setCoaches(co.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  /* ── Create ─────────────────────────────────────── */
  const handleCreate = async () => {
    setSaving(true);
    try {
      await createCourse(form);
      toast.success('Cours créé!');
      setCreateModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSaving(false); }
  };

  /* ── Edit ───────────────────────────────────────── */
  const openEdit = (c) => {
    setForm({
      name: c.name, course_type: c.course_type, level: c.level,
      coach: c.coach || '', date: c.date,
      start_time: c.start_time?.slice(0,5) || '',
      end_time: c.end_time?.slice(0,5) || '',
      max_capacity: c.max_capacity, price: c.price,
      location: c.location, description: c.description || '',
    });
    setEditModal(c);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await updateCourse(editModal.id, form);
      toast.success('Cours mis à jour!');
      setEditModal(null);
      load();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSaving(false); }
  };

  /* ── Enrollments ────────────────────────────────── */
  const openEnrollments = async (c) => {
    setEnrollModal({ id: c.id, name: c.name });
    setEnrollments([]);
    const r = await getCourseEnrollments(c.id);
    setEnrollments(r.data);
  };

  /* ── Delete ─────────────────────────────────────── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer "${name}"?`)) return;
    try { await deleteCourse(id); toast.success('Supprimé'); load(); }
    catch { toast.error('Erreur'); }
  };

  const CourseForm = () => (
    <>
      <Input label="Nom du cours" required {...f('name')} />
      <div className="form-row">
        <Select label="Type" {...f('course_type')}>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Niveau" {...f('level')}>
          {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </div>
      <Select label="Coach" {...f('coach')}>
        <option value="">Sélectionner un coach</option>
        {coaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
      </Select>
      <div className="form-row">
        <Input label="Date" type="date" required {...f('date')} />
        <Input label="Heure début" type="time" required {...f('start_time')} />
      </div>
      <div className="form-row">
        <Input label="Heure fin" type="time" required {...f('end_time')} />
        <Input label="Capacité max" type="number" min="1" required {...f('max_capacity')} />
      </div>
      <div className="form-row">
        <Input label="Prix (DT)" type="number" min="0" {...f('price')} />
        <Input label="Salle" {...f('location')} />
      </div>
      <Textarea label="Description" rows={3} {...f('description')} />
    </>
  );

  return (
    <div>
      <PageHeader title="COURS" subtitle={`${courses.length} cours actifs`}
        action={<Btn onClick={() => { setForm(EMPTY_FORM); setCreateModal(true); }}><Plus size={16} /> Ajouter un cours</Btn>}
      />

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        courses.length === 0 ? <Empty icon={CalendarDays} message="Aucun cours programmé" /> :
        <div className="courses-grid">
          {courses.map(c => {
            const pct = c.max_capacity ? Math.round((c.enrolled_count / c.max_capacity) * 100) : 0;
            return (
              <div key={c.id} className="course-card">
                <div className="course-header">
                  <div>
                    <div className="course-name">{c.name}</div>
                    <Badge status={c.is_full ? 'cancelled' : 'confirmed'} />
                  </div>
                  <Btn variant="danger" size="sm" onClick={() => handleDelete(c.id, c.name)}><Trash2 size={14} /></Btn>
                </div>
                <div className="course-meta">
                  <span><CalendarDays size={13} />{c.date} • {c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}</span>
                  <span><Users size={13} />{c.coach_name || 'Sans coach'}</span>
                  <span><MapPin size={13} />{c.location}</span>
                </div>
                <div className="course-footer">
                  <span style={{ fontSize:12, color:'var(--sub)' }}>{c.enrolled_count}/{c.max_capacity}</span>
                  <div className="capacity-bar"><div className="capacity-fill" style={{ width:`${pct}%` }} /></div>
                  <span style={{ fontSize:13, fontWeight:700, color:'var(--accent)' }}>{c.price} DT</span>
                </div>
                {/* Action buttons */}
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}>
                    <Pencil size={13} /> Modifier
                  </Btn>
                  <Btn size="sm" variant="secondary" onClick={() => openEnrollments(c)}>
                    <Users size={13} /> Inscrits ({c.enrolled_count})
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      }

      {/* ── Create Modal ─────────────────────────────── */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="NOUVEAU COURS"
        footer={<><Btn variant="secondary" onClick={() => setCreateModal(false)}>Annuler</Btn><Btn loading={saving} onClick={handleCreate}>Créer</Btn></>}
      >
        <CourseForm />
      </Modal>

      {/* ── Edit Modal ───────────────────────────────── */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)}
        title={`MODIFIER — ${editModal?.name}`}
        footer={<><Btn variant="secondary" onClick={() => setEditModal(null)}>Annuler</Btn><Btn loading={saving} onClick={handleEditSave}>Sauvegarder</Btn></>}
      >
        <CourseForm />
      </Modal>

      {/* ── Enrollments Modal ────────────────────────── */}
      <Modal open={!!enrollModal} onClose={() => setEnrollModal(null)}
        title={`INSCRITS — ${enrollModal?.name}`}
        footer={<Btn variant="secondary" onClick={() => setEnrollModal(null)}>Fermer</Btn>}
      >
        {enrollments.length === 0 ? (
          <p style={{ color:'var(--sub)', fontSize:14, textAlign:'center', padding:'16px 0' }}>
            Aucun inscrit pour ce cours.
          </p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
              <span style={{ fontSize:13, color:'var(--sub)' }}>{enrollments.length} inscrit(s)</span>
            </div>
            {enrollments.map((e, i) => (
              <div key={e.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent)', color:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                  {e.client_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{e.client_name}</div>
                  <div style={{ fontSize:12, color:'var(--sub)' }}>
                    Inscrit le {new Date(e.enrolled_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Badge status={e.status} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AdminCourses;
