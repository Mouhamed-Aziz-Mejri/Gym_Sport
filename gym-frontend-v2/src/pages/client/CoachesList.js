import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, DollarSign } from 'lucide-react';
import { getCoaches } from '../../api/coaches';
import { PageHeader, Select, Empty } from '../../components/common/Common';


const SPECS = ['musculation','cardio','crossfit','yoga','pilates','boxe','natation','nutrition','autre'];

const CoachesList = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getCoaches(spec ? { speciality: spec } : {})
      .then(r => setCoaches(r.data))
      .finally(() => setLoading(false));
  }, [spec]);

  const filtered = coaches.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="NOS COACHS" subtitle="Trouvez le coach qui vous correspond" />

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--sub)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Rechercher un coach..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={spec} onChange={e => setSpec(e.target.value)}>
          <option value="">Toutes spécialités</option>
          {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        filtered.length === 0 ? <Empty message="Aucun coach trouvé" /> :
        <div className="coaches-grid">
          {filtered.map(c => (
            <div key={c.id} className="coach-card" onClick={() => navigate(`/client/coaches/${c.id}`)}>
              <div className="coach-card-top">
                <div className="coach-avatar-lg">{c.full_name?.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="coach-name">{c.full_name}</div>
                  <div className="coach-spec">{c.profile?.speciality || '—'}</div>
                </div>
              </div>
              {c.profile?.bio && <p className="coach-bio">{c.profile.bio}</p>}
              <div className="coach-footer">
                <span className="coach-price">{c.profile?.price_per_session || '—'} DT</span>
                <span className="coach-rating">
                  <Star size={13} fill="var(--accent)" color="var(--accent)" />
                  {c.average_rating ? `${c.average_rating}/5 (${c.total_reviews})` : 'Pas encore noté'}
                </span>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default CoachesList;
