import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Calendar, Clock, User, FileText } from 'lucide-react';
import { getCoachReservations, respondReservation } from '../../api/reservations';
import { PageHeader, Badge, Btn, Select, Modal, Textarea, Empty } from '../../components/common/Common';
import toast from 'react-hot-toast';


const CoachReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [refuseModal, setRefuseModal] = useState(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    getCoachReservations(filter ? { status: filter } : {})
      .then(r => setReservations(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleAccept = async (id) => {
    setActing(true);
    try {
      await respondReservation(id, { status: 'confirmed' });
      toast.success('Réservation confirmée!');
      load();
    } catch { toast.error('Erreur'); }
    finally { setActing(false); }
  };

  const handleRefuse = async () => {
    if (!reason.trim()) { toast.error('Veuillez indiquer une raison.'); return; }
    setActing(true);
    try {
      await respondReservation(refuseModal, { status: 'refused', refusal_reason: reason });
      toast.success('Réservation refusée.');
      setRefuseModal(null);
      setReason('');
      load();
    } catch { toast.error('Erreur'); }
    finally { setActing(false); }
  };

  return (
    <div>
      <PageHeader title="RÉSERVATIONS" subtitle="Gérez les demandes de séances" />

      <div className="filter-bar">
        {['pending','confirmed','cancelled','refused'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`filter-pill ${filter === s ? 'active' : ''}`}
          >
            <Badge status={s} />
          </button>
        ))}
        <button onClick={() => setFilter('')} className={`filter-pill ${filter === '' ? 'active' : ''}`}>
          Tous
        </button>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        reservations.length === 0 ? <Empty message="Aucune réservation" /> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reservations.map(r => (
            <div key={r.id} className={`reservation-card ${r.status}`}>
              <div className="res-header">
                <div>
                  <div className="res-client"><User size={15} style={{ marginRight: 6 }} />{r.client_name}</div>
                </div>
                <Badge status={r.status} />
              </div>
              <div className="res-meta">
                <span><Calendar size={13} />{r.date}</span>
                <span><Clock size={13} />{r.start_time?.slice(0,5)} – {r.end_time?.slice(0,5)}</span>
              </div>
              {r.notes && <div className="res-notes"><FileText size={13} style={{ marginRight: 6 }} />{r.notes}</div>}
              {r.refusal_reason && <div className="res-notes" style={{ borderLeftColor: 'var(--red)' }}>Raison: {r.refusal_reason}</div>}
              {r.status === 'pending' && (
                <div className="res-actions">
                  <Btn size="sm" variant="success" loading={acting} onClick={() => handleAccept(r.id)}>
                    <CheckCircle size={14} /> Accepter
                  </Btn>
                  <Btn size="sm" variant="danger" onClick={() => setRefuseModal(r.id)}>
                    <XCircle size={14} /> Refuser
                  </Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      }

      <Modal
        open={!!refuseModal}
        onClose={() => { setRefuseModal(null); setReason(''); }}
        title="REFUSER LA RÉSERVATION"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setRefuseModal(null)}>Annuler</Btn>
            <Btn variant="danger" loading={acting} onClick={handleRefuse}>Confirmer le refus</Btn>
          </>
        }
      >
        <Textarea
          label="Raison du refus *"
          placeholder="Ex: Indisponible à ce créneau, veuillez choisir un autre horaire..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default CoachReservations;
