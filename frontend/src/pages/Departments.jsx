import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');

  const load = async () => { const res = await api.get('/departments'); setDepartments(res.data); };
  useEffect(() => { load(); }, []);

  const reset = () => { setName(''); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editId) await api.put(`/departments/${editId}`, { DepartName: name });
      else await api.post('/departments', { DepartName: name });
      reset(); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEdit = (d) => { setName(d.DepartName); setEditId(d.DepartID); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete this department?')) return; await api.delete(`/departments/${id}`); load(); };

  return (
    <div>
      <div className="action-bar">
        <h4 className="page-title" style={{ border: 'none', padding: 0, margin: 0 }}><i className="bi bi-diagram-3 me-2"></i>Departments</h4>
        <button className="btn btn-primary" onClick={() => { reset(); setShowForm(!showForm); }}>
          <i className={`bi ${showForm ? 'bi-x' : 'bi-plus-lg'} me-1`}></i>{showForm ? 'Cancel' : 'Add Department'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="input-group">
            <input className="form-control" placeholder="Department name" value={name} onChange={e => setName(e.target.value)} required />
            <button className="btn btn-success" type="submit"><i className={`bi ${editId ? 'bi-check2' : 'bi-plus-lg'} me-1`}></i>{editId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}
      <div className="table-responsive">
        <table className="table table-custom">
          <thead><tr><th>#</th><th>Name</th><th>Employees</th><th>Actions</th></tr></thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.DepartID}>
                <td>{d.DepartID}</td><td><strong>{d.DepartName}</strong></td><td>{d.EmpCount}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(d)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.DepartID)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && <tr><td colSpan={4}><div className="empty-state"><i className="bi bi-diagram-3"></i>No departments</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
