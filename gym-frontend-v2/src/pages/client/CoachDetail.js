import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, DollarSign, Calendar, Send } from 'lucide-react';
import { getCoach } from '../../api/coaches';
import { getCoachReviews, createReview, getMyReviews } from '../../api/reviews';
import { createReservation } from '../../api/reservations';
import { Btn, Modal, Input, Textarea, Stars, Card, Empty } from '../../components/common/Common';
import toast from 'react-hot-toast';


const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

/* ── Star picker ─────────────────────────────────────────── */
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker">
      {[1,2,3,4,5].map(n => (
        <button
          key={n} type="button"
          className={`star-pick-btn ${n <= (hover || value) ? 'lit' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >★</button>
      ))}
      <span className="star-pick-label">
        {value ? ['','Mauvais','Passable','Bien','Très bien','Excellent !'][value] : 'Sélectionnez une note'}
      </span>
    </div>
  );
};

const CoachDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach]           = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [myReviews, setMyReviews]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [bookModal, setBookModal]   = useState(false);
  const [rateModal, setRateModal]   = useState(false);
  const [booking, setBooking]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ date: '', start_time: '', end_time: '', notes: '' });
  const [rating, setRating]         = useState(0);
  const [comment, setComment]       = useState('');

  const loadReviews = () =>
    Promise.all([getCoachReviews(id), getMyReviews()])
      .then(([r, my]) => { setReviews(r.data); setMyReviews(my.data); });

  useEffect(() => {
    Promise.all([getCoach(id), getCoachReviews(id), getMyReviews()])
      .then(([c, r, my]) => {
        setCoach(c.data);
        setReviews(r.data);
        setMyReviews(my.data);
      })
      .catch(() => toast.error('Coach introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const alreadyReviewed = myReviews.some(r => r.coach === parseInt(id));

  const handleBook = async () => {
    if (!form.date || !form.start_time || !form.end_time) {
      toast.error('Veuillez remplir la date et les horaires.');
      return;
    }
    setBooking(true);
    try {
      await createReservation({ ...form, coach: parseInt(id) });
      toast.success('Demande envoyée! En attente de confirmation du coach.');
      setBookModal(false);
      setForm({ date: '', start_time: '', end_time: '', notes: '' });
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setBooking(false); }
  };

  const handleSubmitReview = async () => {
    if (!rating) { toast.error('Veuillez sélectionner une note.'); return; }
    setSubmitting(true);
    try {
      await createReview({ coach: parseInt(id), rating, comment });
      toast.success('Avis envoyé ! Merci 🙏');
      setRateModal(false);
      setRating(0); setComment('');
      loadReviews();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setSubmitting(false); }
  };

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!coach) return null;

  const profile = coach.profile || {};

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="coach-detail-header">
        <div className="coach-avatar-xl">
          {coach.full_name?.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="coach-detail-info">
          <h2 className="detail-name">{coach.full_name}</h2>
          <span className="detail-spec">{profile.speciality}</span>
          {profile.bio && <p className="detail-bio">{profile.bio}</p>}
          <div className="detail-meta">
            <span><DollarSign size={14} />{profile.price_per_session} DT / séance</span>
            <span><Clock size={14} />{profile.experience_years} ans d'expérience</span>
            {coach.average_rating && (
              <span>
                <Star size={14} fill="var(--accent)" color="var(--accent)" />
                {coach.average_rating}/5 ({coach.total_reviews} avis)
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn onClick={() => setBookModal(true)} size="lg">
            <Calendar size={16} /> Réserver une séance
          </Btn>
          {alreadyReviewed ? (
            <span style={{ textAlign: 'center', fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Star size={13} fill="var(--accent)" color="var(--accent)" /> Vous avez déjà noté ce coach
            </span>
          ) : (
            <Btn variant="secondary" size="lg" onClick={() => setRateModal(true)}>
              <Star size={16} /> Noter ce coach
            </Btn>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20, marginTop: 24 }}>
        <Card>
          <h3 className="section-title" style={{ marginBottom: 16 }}>Disponibilités</h3>
          {!coach.availabilities?.length
            ? <Empty message="Aucune disponibilité renseignée" />
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {coach.availabilities.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--dark)', borderRadius: 8, fontSize: 14 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{DAYS[a.day_of_week]}</span>
                    <span style={{ color: 'var(--sub)' }}>{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</span>
                  </div>
                ))}
              </div>
          }
        </Card>

        <Card>
          <h3 className="section-title" style={{ marginBottom: 16 }}>
            Avis clients ({reviews.length})
          </h3>
          {!reviews.length
            ? <Empty message="Aucun avis pour ce coach" />
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.slice(0, 5).map(r => (
                  <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.client_name}</span>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
          }
        </Card>
      </div>

      {/* ── Book Modal ───────────────────────────────────── */}
      <Modal
        open={bookModal}
        onClose={() => setBookModal(false)}
        title={`RÉSERVER — ${coach.full_name}`}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setBookModal(false)}>Annuler</Btn>
            <Btn loading={booking} onClick={handleBook}><Send size={14} /> Envoyer la demande</Btn>
          </>
        }
      >
        <Input label="Date *" type="date" required min={new Date().toISOString().split('T')[0]} {...f('date')} />
        <div className="form-row">
          <Input label="Heure début *" type="time" required {...f('start_time')} />
          <Input label="Heure fin *"   type="time" required {...f('end_time')} />
        </div>
        <Textarea label="Objectifs / Notes (optionnel)" placeholder="Décrivez vos objectifs..." rows={3} {...f('notes')} />
        <div style={{ background: 'var(--dark)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--sub)' }}>
          💡 Prix estimé: <b style={{ color: 'var(--accent)' }}>{profile.price_per_session} DT</b> — Le coach confirmera sous 24h.
        </div>
      </Modal>

      {/* ── Rate Modal ───────────────────────────────────── */}
      <Modal
        open={rateModal}
        onClose={() => setRateModal(false)}
        title={`NOTER — ${coach.full_name}`}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setRateModal(false)}>Annuler</Btn>
            <Btn loading={submitting} onClick={handleSubmitReview}>
              <Star size={14} /> Envoyer l'avis
            </Btn>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <p style={{ color: 'var(--sub)', fontSize: 14, marginBottom: 16 }}>
            Comment évaluez-vous <b style={{ color: 'var(--text)' }}>{coach.full_name}</b> ?
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

export default CoachDetail;
