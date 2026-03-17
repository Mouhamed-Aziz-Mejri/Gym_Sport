import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { ClipboardList, Star, CheckCircle, Clock, Calendar, MessageSquare, User } from 'lucide-react';
import { getCoachDashboard } from '../../api/dashboard';
import { getCoachReviews } from '../../api/reviews';
import { StatCard, PageHeader, Card, Empty } from '../../components/common/Common';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';


/* ── Star display (read-only) ─────────────────────────────── */
const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} style={{ fontSize: 16, color: n <= rating ? 'var(--accent)' : 'var(--muted)' }}>★</span>
    ))}
  </div>
);

const CoachDashboard = () => {
  const [data, setData]       = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      getCoachDashboard(),
      getCoachReviews(user?.id),
    ])
      .then(([d, r]) => { setData(d.data); setReviews(r.data); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!data) return null;

  return (
    <div>
      <PageHeader title="MON DASHBOARD" subtitle={`Bonjour, ${user?.first_name} 💪`} />

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={CheckCircle}   label="Séances confirmées" value={data.sessions.total_confirmed} color="green"  />
        <StatCard icon={Clock}         label="En attente"          value={data.sessions.pending}         color="accent" />
        <StatCard icon={ClipboardList} label="Ce mois"             value={data.sessions.this_month}      color="blue"   />
        <StatCard icon={Star}          label="Note moyenne"
          value={data.reviews.average_rating ? `${data.reviews.average_rating}/5` : '—'}
          color="accent"
        />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>

        {/* Upcoming sessions */}
        <Card>
          <h3 className="chart-title" style={{ marginBottom: 16 }}>Prochaines séances</h3>
          {data.upcoming_sessions.length === 0 ? (
            <Empty message="Aucune séance à venir." />
          ) : (
            <div className="upcoming-list">
              {data.upcoming_sessions.map(s => (
                <div key={s.id} className="upcoming-item">
                  <div className="upcoming-dot" />
                  <div className="upcoming-body">
                    <span className="upcoming-client">{s.client}</span>
                    <span className="upcoming-time">
                      <Calendar size={13} /> {s.date} &nbsp;
                      <Clock size={13} /> {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Reviews received */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="chart-title">
              <MessageSquare size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Avis reçus ({reviews.length})
            </h3>
            {data.reviews.average_rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stars rating={Math.round(data.reviews.average_rating)} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                  {data.reviews.average_rating}/5
                </span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <Empty icon={Star} message="Aucun avis reçu pour l'instant." />
          ) : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r.id} className="review-item">
                  <div className="review-header">
                    <div className="review-client">
                      <div className="review-avatar">
                        {r.client_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="review-name">{r.client_name}</div>
                        <div className="review-date">
                          {new Date(r.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="review-comment">"{r.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default CoachDashboard;
