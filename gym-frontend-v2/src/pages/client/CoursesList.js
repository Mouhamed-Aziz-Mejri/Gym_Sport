import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, MapPin, User } from 'lucide-react';
import { getCourses, enrollCourse, unenrollCourse } from '../../api/courses';
import { PageHeader, Badge, Btn, Select, Empty } from '../../components/common/Common';
import toast from 'react-hot-toast';


const TYPES = ['yoga','hiit','pilates','zumba','crossfit','cardio','musculation','boxe','autre'];

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  const load = () => {
    setLoading(true);
    getCourses({ upcoming: 'true', ...(typeFilter ? { type: typeFilter } : {}) })
      .then(r => setCourses(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter]);

  const handleEnroll = async (courseId) => {
    setActing(courseId);
    try {
      await enrollCourse(courseId);
      toast.success('Inscrit au cours!');
      load();
    } catch (err) {
      const e = err.response?.data;
      toast.error(e ? Object.values(e).flat().join(' ') : 'Erreur');
    } finally { setActing(null); }
  };

  const handleUnenroll = async (courseId) => {
    setActing(courseId);
    try {
      await unenrollCourse(courseId);
      toast.success('Désinscrit.');
      load();
    } catch { toast.error('Erreur'); }
    finally { setActing(null); }
  };

  return (
    <div>
      <PageHeader title="COURS COLLECTIFS" subtitle="Inscrivez-vous à nos cours de groupe" />

      <div className="filter-bar">
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        courses.length === 0 ? <Empty icon={Calendar} message="Aucun cours disponible" /> :
        <div className="courses-grid">
          {courses.map(c => {
            const pct = c.max_capacity ? Math.round((c.enrolled_count / c.max_capacity) * 100) : 0;
            return (
              <div key={c.id} className={`course-card ${c.is_full ? 'full' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <span className="course-type-badge">{c.course_type}</span>
                    <div className="course-name" style={{ marginTop: 6 }}>{c.name}</div>
                  </div>
                  <Badge status={c.is_full ? 'cancelled' : 'confirmed'} />
                </div>

                <div className="course-info">
                  <span><Calendar size={13} />{c.date}</span>
                  <span><Clock size={13} />{c.start_time?.slice(0,5)} – {c.end_time?.slice(0,5)}</span>
                  <span><User size={13} />{c.coach_name || 'Sans coach'}</span>
                  <span><MapPin size={13} />{c.location}</span>
                </div>

                <div className="course-capacity">
                  <Users size={13} style={{ color: 'var(--sub)' }} />
                  <span style={{ fontSize: 12, color: 'var(--sub)', minWidth: 60 }}>{c.enrolled_count}/{c.max_capacity}</span>
                  <div className="cap-bar"><div className="cap-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--red)' : 'var(--accent)' }} /></div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{c.price > 0 ? `${c.price} DT` : 'Gratuit'}</span>
                </div>

                {c.is_enrolled ? (
                  <Btn variant="danger" size="sm" loading={acting === c.id} onClick={() => handleUnenroll(c.id)}>
                    Se désinscrire
                  </Btn>
                ) : (
                  <Btn size="sm" disabled={c.is_full} loading={acting === c.id} onClick={() => handleEnroll(c.id)}>
                    {c.is_full ? 'Complet' : 'S\'inscrire'}
                  </Btn>
                )}
              </div>
            );
          })}
        </div>
      }
    </div>
  );
};

export default CoursesList;
