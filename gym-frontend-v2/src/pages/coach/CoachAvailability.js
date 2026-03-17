import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { getMyAvailabilities, addAvailability, deleteAvailability } from '../../api/coaches';
import { PageHeader, Btn, Modal, Select, Input, Empty, Card } from '../../components/common/Common';
import toast from 'react-hot-toast';


const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

const CoachAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ day_of_week: '0', start_time: '08:00', end_time: '18:00' });

  const load = () => {
    setLoading(true);
    getMyAvailabilities().then(r => setAvailabilities(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const handleAdd = async () => {
    setSaving(true);
    try {
      await addAvailability(form);
      toast.success('Disponibilité ajoutée!');
      setModal(false);
      load();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteAvailability(id); toast.success('Supprimée'); load(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <PageHeader
        title="DISPONIBILITÉS"
        subtitle="Définissez vos créneaux disponibles"
        action={<Btn onClick={() => setModal(true)}><Plus size={16} /> Ajouter</Btn>}
      />

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        availabilities.length === 0 ? (
          <Card>
            <Empty icon={Clock} message="Aucune disponibilité définie. Ajoutez vos créneaux." />
          </Card>
        ) : (
          <div className="avail-grid">
            {availabilities.map(a => (
              <div key={a.id} className="avail-card">
                <div>
                  <div className="avail-day">{DAYS[a.day_of_week]}</div>
                  <div className="avail-time">{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</div>
                </div>
                <Btn variant="danger" size="sm" onClick={() => handleDelete(a.id)}>
                  <Trash2 size={14} />
                </Btn>
              </div>
            ))}
          </div>
        )
      }

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="AJOUTER DISPONIBILITÉ"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>Annuler</Btn>
            <Btn loading={saving} onClick={handleAdd}>Ajouter</Btn>
          </>
        }
      >
        <Select label="Jour de la semaine" {...f('day_of_week')}>
          {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </Select>
        <div className="form-row">
          <Input label="Heure début" type="time" {...f('start_time')} />
          <Input label="Heure fin"   type="time" {...f('end_time')} />
        </div>
      </Modal>
    </div>
  );
};

export default CoachAvailability;
