import '../Pages.css';
import React, { useEffect, useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { getUsers, deleteUser, updateUser } from '../../api/auth';
import { PageHeader, Badge, Btn, Select, Input, Modal, Empty } from '../../components/common/Common';
import toast from 'react-hot-toast';


const AdminUsers = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [editModal, setEditModal]   = useState(null);
  const [form, setForm]             = useState({});
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    getUsers(roleFilter ? { role: roleFilter } : {})
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [roleFilter]);

  const openEdit = (u) => {
    setForm({ first_name: u.first_name, last_name: u.last_name, phone: u.phone || '', email: u.email });
    setEditModal(u);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(editModal.id, form);
      toast.success('Utilisateur mis à jour!');
      setEditModal(null);
      load();
    } catch (err) {
      const e = err.response?.data;
      if (e) Object.entries(e).forEach(([field, msgs]) => toast.error(`${field}: ${[].concat(msgs).join(' ')}`));
      else toast.error('Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name}?`)) return;
    try { await deleteUser(id); toast.success('Supprimé'); load(); }
    catch { toast.error('Erreur'); }
  };

  const f = k => ({ value: form[k] ?? '', onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div>
      <PageHeader title="UTILISATEURS" subtitle={`${users.length} comptes`} />
      <div className="filter-bar">
        <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="coach">Coachs</option>
          <option value="admin">Admins</option>
        </Select>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        users.length === 0 ? <Empty message="Aucun utilisateur" /> :
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Téléphone</th><th>Inscription</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><b>{u.first_name} {u.last_name}</b></td>
                    <td style={{ color: 'var(--sub)' }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'coach' ? 'warning' : 'success'}`}>{u.role}</span></td>
                    <td style={{ color: 'var(--sub)' }}>{u.phone || '—'}</td>
                    <td style={{ color: 'var(--sub)' }}>{new Date(u.date_joined).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.role !== 'admin' && (
                          <Btn size="sm" variant="secondary" onClick={() => openEdit(u)}><Pencil size={13} /></Btn>
                        )}
                        {u.role !== 'admin' && (
                          <Btn size="sm" variant="danger" onClick={() => handleDelete(u.id, `${u.first_name} ${u.last_name}`)}><Trash2 size={13} /></Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }

      <Modal open={!!editModal} onClose={() => setEditModal(null)}
        title={`MODIFIER — ${editModal?.first_name} ${editModal?.last_name}`}
        footer={<><Btn variant="secondary" onClick={() => setEditModal(null)}>Annuler</Btn><Btn loading={saving} onClick={handleSave}>Sauvegarder</Btn></>}
      >
        <div className="form-row">
          <Input label="Prénom" {...f('first_name')} />
          <Input label="Nom"    {...f('last_name')} />
        </div>
        <Input label="Email" type="email" {...f('email')} />
        <Input label="Téléphone" {...f('phone')} />
        <div style={{ background:'var(--dark)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--sub)' }}>
          💡 Le mot de passe ne peut pas être modifié ici.
        </div>
      </Modal>
    </div>
  );
};
export default AdminUsers;
