import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { XCircle, Clock, Star } from 'lucide-react';
import { getMyReservations, cancelReservation } from '../../api/reservations';
import { getMyReviews, createReview } from '../../api/reviews';
import { PageHeader, Badge, Btn, Empty, Modal, Textarea } from '../../components/common/Common';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


/* ── Interactive star picker ─────────────────────────────── */
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-pick-btn ${n <= (hover || value) ? 'lit' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
      <span className="star-pick-label">
        {value ? ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent !'][value] : 'Sélectionnez une note'}
      </span>
    </div>
  );
};

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [myReviews, setMyReviews]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('');
  const [acting, setActing]             = useState(null);
  const [rateModal, setRateModal]       = useState(null); // { coachId, coachName }
  const [rating, setRating]             = useState(0);
  const [comment, setComment]           = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([
      getMyReservations(filter ? { status: filter } : {}),
      getMyReviews(),
    ]).then(([r, rev]) => {
      setReservations(r.data);
      setMyReviews(rev.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  // Set of coach IDs already reviewed
  const reviewedCoachIds = new Set(myReviews.map(r => r.coach));

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation?')) return;
    setActing(id);
    try {
      await cancelReservation(id);
      toast.success('Réservation annulée.');
      load();
    } catch { toast.error('Erreur'); }
    finally { setActing(null); }
  };

  const openRateModal = (coachId, coachName) => {
    setRating(0);
    setComment('');
    setRateModal({ coachId, coachName });
  };

  const handleSubmitReview = async () => {
    if (!rating) { toast.error('Veuillez sélectionner une note.'); return; }
    setSubmitting(true);
    try {
      await createReview({ coach: rateModal.coachId, rating, comment });
      toast.success('Avis envoyé ! Merci 🙏');
      setRateModal(null);
      load();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSubmitting(false); }
  };

  const STATUS_FILTERS = [
    { value: '', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'cancelled', label: 'Annulées' },
  ];

  // Past confirmed reservations (date already passed)
  const today = new Date().toISOString().split('T')[0];
  const isPast = (date) => date < today;

  return (
    <div>
      <PageHeader
        title="MES RÉSERVATIONS"
        subtitle="Historique de vos séances"
        action={<Btn onClick={() => navigate('/client/coaches')}>+ Nouvelle réservation</Btn>}
      />

      <div className="filter-bar" style={{ marginBottom: 20 }}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: '1px solid',
              borderColor: filter === s.value ? 'var(--accent)' : 'var(--border)',
              background: filter === s.value ? 'rgba(245,166,35,0.15)' : 'transparent',
              color: filter === s.value ? 'var(--accent)' : 'var(--sub)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        reservations.length === 0 ? (
          <Empty message="Aucune réservation trouvée. Réservez votre premier coach!" />
        ) : (
          <div className="res-list">
            {reservations.map(r => {
              const d     = new Date(r.date);
              const day   = d.getDate();
              const month = d.toLocaleDateString('fr-FR', { month: 'short' });
              const canRate = r.status === 'confirmed'
                && isPast(r.date)
                && !reviewedCoachIds.has(r.coach);
              const alreadyRated = r.status === 'confirmed'
                && isPast(r.date)
                && reviewedCoachIds.has(r.coach);

              return (
                <div key={r.id} className={`res-card ${r.status}`}>
                  <div className="res-date-block">
                    <div className="res-day">{day}</div>
                    <div className="res-month">{month}</div>
                  </div>

                  <div className="res-info">
                    <div className="res-coach">{r.coach_name}</div>
                    {r.coach_speciality && <div className="res-spec">{r.coach_speciality}</div>}
                    <div className="res-time">
                      <Clock size={13} />
                      {r.start_time?.slice(0,5)} – {r.end_time?.slice(0,5)}
                      {r.notes && <span style={{ marginLeft: 8, color: 'var(--sub)' }}>• {r.notes}</span>}
                    </div>
                    {r.refusal_reason && (
                      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--red)' }}>
                        Raison : {r.refusal_reason}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <Badge status={r.status} />

                    {/* Cancel button */}
                    {['pending','confirmed'].includes(r.status) && !isPast(r.date) && (
                      <Btn variant="danger" size="sm" loading={acting === r.id} onClick={() => handleCancel(r.id)}>
                        <XCircle size={13} /> Annuler
                      </Btn>
                    )}

                    {/* Rate button — only for past confirmed sessions not yet rated */}
                    {canRate && (
                      <Btn size="sm" variant="secondary" onClick={() => openRateModal(r.coach, r.coach_name)}>
                        <Star size={13} /> Noter le coach
                      </Btn>
                    )}

                    {/* Already rated badge */}
                    {alreadyRated && (
                      <span style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="var(--accent)" color="var(--accent)" /> Noté
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* ── Rating Modal ─────────────────────────────────── */}
      <Modal
        open={!!rateModal}
        onClose={() => setRateModal(null)}
        title={`NOTER — ${rateModal?.coachName}`}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setRateModal(null)}>Annuler</Btn>
            <Btn loading={submitting} onClick={handleSubmitReview}>
              <Star size={14} /> Envoyer l'avis
            </Btn>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <p style={{ color: 'var(--sub)', fontSize: 14, marginBottom: 16 }}>
            Comment était votre séance avec <b style={{ color: 'var(--text)' }}>{rateModal?.coachName}</b> ?
          </p>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <Textarea
          label="Commentaire (optionnel)"
          placeholder="Partagez votre expérience..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
};

export default MyReservations;
