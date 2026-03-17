import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { ClipboardList, CalendarDays, Clock, CheckCircle } from 'lucide-react';
import { getMyReservations } from '../../api/reservations';
import { getMyEnrollments } from '../../api/courses';
import { StatCard, PageHeader, Card, Badge, Empty } from '../../components/common/Common';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyReservations(),
      getMyEnrollments(),
    ]).then(([r, e]) => {
      setReservations(r.data);
      setEnrollments(e.data);
    }).catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = reservations.filter(r => r.status === 'confirmed').length;
  const pending   = reservations.filter(r => r.status === 'pending').length;

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <PageHeader title="ACCUEIL" subtitle={`Bonjour, ${user?.first_name} 👋 Prêt à vous entraîner?`} />

      <div className="stats-grid">
        <StatCard icon={ClipboardList} label="Réservations"      value={reservations.length} color="blue"   />
        <StatCard icon={CheckCircle}   label="Confirmées"         value={confirmed}           color="green"  />
        <StatCard icon={Clock}         label="En attente"         value={pending}             color="accent" />
        <StatCard icon={CalendarDays}  label="Cours inscrits"     value={enrollments.length}  color="blue"   />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="section-title">Mes prochaines séances</h3>
            <button className="text-link" onClick={() => navigate('/client/reservations')}>Voir tout</button>
          </div>
          {reservations.filter(r => ['pending','confirmed'].includes(r.status)).slice(0, 4).length === 0
            ? <Empty message="Aucune séance à venir" />
            : reservations.filter(r => ['pending','confirmed'].includes(r.status)).slice(0, 4).map(r => (
              <div key={r.id} className="mini-res-item">
                <div>
                  <div className="mini-res-coach">{r.coach_name}</div>
                  <div className="mini-res-date">{r.date} • {r.start_time?.slice(0,5)}</div>
                </div>
                <Badge status={r.status} />
              </div>
            ))
          }
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="section-title">Mes cours inscrits</h3>
            <button className="text-link" onClick={() => navigate('/client/courses')}>Voir tout</button>
          </div>
          {enrollments.slice(0, 4).length === 0
            ? <Empty message="Aucun cours inscrit" />
            : enrollments.slice(0, 4).map(e => (
              <div key={e.id} className="mini-res-item">
                <div>
                  <div className="mini-res-coach">{e.course_name}</div>
                  <div className="mini-res-date">{e.course_date} • {e.course_time?.slice(0,5)}</div>
                </div>
                <Badge status={e.status} />
              </div>
            ))
          }
        </Card>
      </div>

      <div className="quick-actions">
        <button className="quick-btn" onClick={() => navigate('/client/coaches')}>
          <span className="quick-icon">🏋️</span>
          <span className="quick-label">Réserver un coach</span>
        </button>
        <button className="quick-btn" onClick={() => navigate('/client/courses')}>
          <span className="quick-icon">📅</span>
          <span className="quick-label">Voir les cours</span>
        </button>
        <button className="quick-btn" onClick={() => navigate('/client/reservations')}>
          <span className="quick-icon">📋</span>
          <span className="quick-label">Mes réservations</span>
        </button>
      </div>
    </div>
  );
};

export default ClientDashboard;
