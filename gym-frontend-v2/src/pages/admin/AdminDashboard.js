import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { Users, Dumbbell, ClipboardList, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminDashboard } from '../../api/dashboard';
import { StatCard, PageHeader, Card, Avatar, ProgressBar } from '../../components/common/Common';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!data) return null;

  const statusData = (data.reservations.by_status || []).map(s => ({
    name: { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', refused: 'Refusé' }[s.status] || s.status,
    count: s.count,
    color: { pending: '#BA7517', confirmed: '#639922', cancelled: '#E24B4A', refused: '#888' }[s.status] || '#888',
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      <div className="stats-grid">
        <StatCard label="Clients"        value={data.users.total_clients}         sub={`+${data.users.new_clients_this_month} ce mois`} variant="dark" />
        <StatCard label="Coachs"         value={data.users.total_coaches}          sub="actifs"  variant="green" />
        <StatCard label="Réservations"   value={data.reservations.total}           sub="total"   variant="blue" />
        <StatCard label="En attente"     value={data.reservations.pending}         sub="à traiter" variant="amber" />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Card>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Activité — 7 derniers jours</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={data.daily_stats_last_7_days} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#aaa' }} tickFormatter={d => d.slice(8)} />
              <YAxis tick={{ fontSize: 10, fill: '#aaa' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#f5f5f5' }}
              />
              <Bar dataKey="count" fill="#B5D4F4" radius={[3, 3, 0, 0]}
                onMouseEnter={(_, i, e) => { if (e?.target) e.target.style.fill = '#378ADD'; }}
                onMouseLeave={(_, i, e) => { if (e?.target) e.target.style.fill = '#B5D4F4'; }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Statut des réservations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {statusData.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  {s.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, height: 4, background: '#f0f0f0', borderRadius: 2 }}>
                    <div style={{ width: `${data.reservations.total ? (s.count / data.reservations.total) * 100 : 0}%`, height: '100%', background: s.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#888', minWidth: 16, textAlign: 'right' }}>{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Top coachs</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '28px' }} />
              <col />
              <col style={{ width: '140px' }} />
              <col style={{ width: '80px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ padding: '0 0 10px', textAlign: 'left', fontSize: 11, color: '#aaa', borderBottom: '0.5px solid #f0f0f0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>#</th>
                <th style={{ padding: '0 8px 10px', textAlign: 'left', fontSize: 11, color: '#aaa', borderBottom: '0.5px solid #f0f0f0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Nom</th>
                <th style={{ padding: '0 0 10px', textAlign: 'left', fontSize: 11, color: '#aaa', borderBottom: '0.5px solid #f0f0f0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Séances</th>
                <th style={{ padding: '0 0 10px 16px', textAlign: 'left', fontSize: 11, color: '#aaa', borderBottom: '0.5px solid #f0f0f0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {data.top_coaches.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ padding: '10px 0', borderBottom: '0.5px solid #f0f0f0', color: '#aaa', fontSize: 11 }}>
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td style={{ padding: '10px 8px', borderBottom: '0.5px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={`${c.first_name} ${c.last_name}`} size={26} color={['dark','blue','green'][i % 3]} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.first_name} {c.last_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2 }}>
                        <div style={{ width: `${data.top_coaches[0]?.total_sessions > 0 ? Math.round((c.total_sessions / data.top_coaches[0].total_sessions) * 100) : 0}%`, height: '100%', background: '#1a1a1a', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#888', flexShrink: 0, minWidth: 14, textAlign: 'right' }}>{c.total_sessions}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 0 10px 16px', borderBottom: '0.5px solid #f0f0f0', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {(c.avg_rating != null && c.avg_rating > 0)
                      ? <span style={{ color: '#BA7517', fontWeight: 500 }}>{parseFloat(c.avg_rating).toFixed(1)}<span style={{ color: '#aaa', fontWeight: 400 }}>/5</span></span>
                      : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Résumé</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: "Aujourd'hui", value: data.reservations.today, icon: <ClipboardList size={14} /> },
              { label: 'Ce mois', value: data.reservations.this_month, icon: <Clock size={14} /> },
              { label: 'Cours actifs', value: data.courses.total_active, icon: <Dumbbell size={14} /> },
              { label: 'Inscriptions cours', value: data.courses.total_enrollments, icon: <Users size={14} /> },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                  <span style={{ color: '#aaa' }}>{item.icon}</span>
                  {item.label}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;