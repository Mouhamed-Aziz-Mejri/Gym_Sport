import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { XCircle, Filter } from 'lucide-react';
import { getAllReservations, adminCancelReservation } from '../../api/reservations';
import { PageHeader, Badge, Btn, Select, Empty } from '../../components/common/Common';
import toast from 'react-hot-toast';


const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    getAllReservations(filter ? { status: filter } : {})
      .then(r => setReservations(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation?')) return;
    try { await adminCancelReservation(id); toast.success('Annulée'); load(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <PageHeader title="RÉSERVATIONS" subtitle={`${reservations.length} réservations`} />
      <div className="filter-bar">
        <Select value={filter} onChange={e => setFilter(e.target.value)} label="">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="cancelled">Annulées</option>
          <option value="completed">Terminées</option>
        </Select>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        reservations.length === 0 ? <Empty message="Aucune réservation" /> :
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th><th>Coach</th><th>Date</th>
                  <th>Horaire</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td><b>{r.client_name}</b></td>
                    <td>{r.coach_name}</td>
                    <td>{r.date}</td>
                    <td>{r.start_time?.slice(0,5)} – {r.end_time?.slice(0,5)}</td>
                    <td><Badge status={r.status} /></td>
                    <td>
                      {['pending','confirmed'].includes(r.status) && (
                        <Btn variant="danger" size="sm" onClick={() => handleCancel(r.id)}>
                          <XCircle size={14} /> Annuler
                        </Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  );
};

export default AdminReservations;
