import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ PosName: '', RequiredQualification: '' });

  const load = async () => { const res = await api.get('/positions'); setPositions(res.data); };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm({ PosName: '', RequiredQualification: '' }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.PosName.trim()) return;
    try {
      if (editId) await api.put(`/positions/${editId}`, form);
      else await api.post('/positions', form);
      reset(); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEdit = (p) => { setForm({ PosName: p.PosName, RequiredQualification: p.RequiredQualification || '' }); setEditId(p.PosID); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete this position?')) return; await api.delete(`/positions/${id}`); load(); };

  return (
    <div>
      <div className="action-bar">
        <h4 className="page-title" style={{ border: 'none', padding: 0, margin: 0 }}><i className="bi bi-briefcase me-2"></i>Positions</h4>
        <button className="btn btn-primary" onClick={() => { reset(); setShowForm(!showForm); }}>
          <i className={`bi ${showForm ? 'bi-x' : 'bi-plus-lg'} me-1`}></i>{showForm ? 'Cancel' : 'Add Position'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="row g-2">
            <div className="col-md-5">
              <input className="form-control" placeholder="Position name" value={form.PosName} onChange={e => setForm({ ...form, PosName: e.target.value })} required />
            </div>
            <div className="col-md-5">
              <input className="form-control" placeholder="Required qualification" value={form.RequiredQualification} onChange={e => setForm({ ...form, RequiredQualification: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" type="submit"><i className={`bi ${editId ? 'bi-check2' : 'bi-plus-lg'} me-1`}></i>{editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </form>
      )}
      <div className="table-responsive">
        <table className="table table-custom">
          <thead><tr><th>#</th><th>Name</th><th>Qualification</th><th>Employees</th><th>Actions</th></tr></thead>
          <tbody>
            {positions.map(p => (
              <tr key={p.PosID}>
                <td>{p.PosID}</td><td><strong>{p.PosName}</strong></td><td>{p.RequiredQualification}</td><td>{p.EmpCount}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(p)}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.PosID)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
            {positions.length === 0 && <tr><td colSpan={5}><div className="empty-state"><i className="bi bi-briefcase"></i>No positions</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
