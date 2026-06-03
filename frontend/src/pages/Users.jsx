import { useState, useEffect } from 'react';
import api from '../api/axios';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, EmpID: Number(form.EmpID) };
      if (editId) await api.put(`/users/${editId}`, payload);
      else await api.post('/users', payload);
      reset(); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEdit = (u) => { setForm({ EmpID: u.EmpID, UserName: u.UserName, Password: '', securityQuestion: '', securityAnswer: '' }); setEditId(u.UserID); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete this user?')) return; await api.delete(`/users/${id}`); load(); };

  return (
    <div>
      <div className="action-bar">
        <h4 className="page-title" style={{ border: 'none', padding: 0, margin: 0 }}><i className="bi bi-person-badge me-2"></i>Users</h4>
        <button className="btn btn-primary" onClick={() => { reset(); setShowForm(!showForm); }}>
          <i className={`bi ${showForm ? 'bi-x' : 'bi-plus-lg'} me-1`}></i>{showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="card"><div className="card-body">
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
            <button className="btn btn-success mt-2" type="submit"><i className={`bi ${editId ? 'bi-check2' : 'bi-plus-lg'} me-1`}></i>{editId ? 'Update' : 'Create'}</button>
          </div></div>
        </form>
      )}
      <div className="table-responsive">
        <table className="table table-custom">
          <thead><tr><th>#</th><th>Username</th><th>Employee</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.UserID}>
                <td>{u.UserID}</td><td><strong>{u.UserName}</strong></td><td>{u.EmpFirstName} {u.EmpLastName}</td><td>{u.EmpEmail}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(u)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.UserID)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5}><div className="empty-state"><i className="bi bi-person-badge"></i>No users</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
