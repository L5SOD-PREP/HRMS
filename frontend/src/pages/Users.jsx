import { useState, useEffect } from 'react';
import api from '../api';
import { ShieldCheck, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ EmpID: '', UserName: '', Password: '', securityQuestion: '', securityAnswer: '' });

  const load = async () => {
    const [uRes, eRes] = await Promise.all([api.get('/users'), api.get('/employees')]);
    setUsers(uRes.data);
    setEmployees(eRes.data);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm({ EmpID: '', UserName: '', Password: '', securityQuestion: '', securityAnswer: '' }); setEditId(null); setShowForm(false); };
  const openAdd = () => { reset(); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, EmpID: Number(form.EmpID) };
      if (editId) await api.put(`/users/${editId}`, payload);
      else await api.post('/users', payload);
      reset(); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEdit = (u) => {
    setForm({ EmpID: u.EmpID, UserName: u.UserName, Password: '', securityQuestion: '', securityAnswer: '' });
    setEditId(u.UserID); setShowForm(true);
  };
  const handleDelete = async (id) => { if (!confirm('Delete this user?')) return; try { await api.delete(`/users/${id}`); load(); } catch {} };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{margin:0,fontWeight:600}}>Users</h5>
        <button className="btn" style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.9rem',padding:'0.5rem 1rem',display:'flex',alignItems:'center',gap:'0.4rem'}} onClick={openAdd}>
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <div className="form-card mb-3">
          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-md-3">
                <select className="form-select" value={form.EmpID} onChange={e => setForm({ ...form, EmpID: e.target.value })} required>
                  <option value="">Select Employee</option>
                  {employees.filter(e => editId || !users.find(u => u.EmpID === e.EmpID)).map(e => (
                    <option key={e.EmpID} value={e.EmpID}>{e.EmpFirstName} {e.EmpLastName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <input className="form-control" placeholder="Username" value={form.UserName} onChange={e => setForm({ ...form, UserName: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <input type="password" className="form-control" placeholder={editId ? 'Leave blank' : 'Password'} value={form.Password} onChange={e => setForm({ ...form, Password: e.target.value })} required={!editId} />
              </div>
              <div className="col-md-3">
                <input className="form-control" placeholder="Security question" value={form.securityQuestion} onChange={e => setForm({ ...form, securityQuestion: e.target.value })} />
              </div>
              <div className="col-md-2">
                <input className="form-control" placeholder="Security answer" value={form.securityAnswer} onChange={e => setForm({ ...form, securityAnswer: e.target.value })} />
              </div>
            </div>
            <button className="btn mt-2" type="submit" style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.85rem',padding:'0.4rem 1rem',display:'inline-flex',alignItems:'center',gap:'0.35rem'}}>
              <Check size={14} /> {editId ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="card-dash" style={{overflow:'hidden'}}>
        {users.length === 0 ? (
          <div className="text-center text-muted py-4">No users yet.</div>
        ) : (
          <table className="table table-dash">
            <thead>
              <tr>
                <th style={{width:'60px'}}>#</th>
                <th>Username</th>
                <th>Employee</th>
                <th>Email</th>
                <th style={{width:'90px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.UserID}>
                  <td className="text-muted">{i + 1}</td>
                  <td><ShieldCheck size={14} style={{color:'#3b82f6',marginRight:'0.5rem',verticalAlign:'middle'}} /><strong>{u.UserName}</strong></td>
                  <td>{u.EmpFirstName} {u.EmpLastName}</td>
                  <td className="text-muted">{u.EmpEmail}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn-action edit" onClick={() => handleEdit(u)}><Pencil size={14} /></button>
                      <button className="btn-action delete" onClick={() => handleDelete(u.UserID)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
