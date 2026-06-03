import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusColors = {
  'On mission': 'bg-success',
  'On leave': 'bg-warning text-dark',
  'Left': 'bg-secondary',
  'Blacklisted': 'bg-dark',
  'Deceased': 'bg-danger'
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q = '') => {
    try {
      const res = await api.get('/employees', { params: q ? { search: q } : {} });
      setEmployees(res.data);
    } catch { alert('Failed to load employees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    await api.delete(`/employees/${id}`);
    load(search);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <div className="action-bar">
        <h4 className="page-title" style={{ border: 'none', padding: 0, margin: 0 }}><i className="bi bi-people me-2"></i>Employees</h4>
        <Link to="/employees/new" className="btn btn-primary"><i className="bi bi-person-plus me-1"></i>Add Employee</Link>
      </div>

      <form className="mb-3" onSubmit={e => { e.preventDefault(); load(search); }}>
        <div className="input-group">
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input className="form-control" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-outline-primary" type="submit">Search</button>
          {search && <button className="btn btn-outline-danger" type="button" onClick={() => { setSearch(''); load(); }}>Clear</button>}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-custom">
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Gender</th><th>Email</th><th>Phone</th><th>Status</th><th>Department</th><th>Position</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.EmpID}>
                <td>{e.EmpID}</td>
                <td><strong>{e.EmpFirstName} {e.EmpLastName}</strong></td>
                <td>{e.EmpGender}</td>
                <td>{e.EmpEmail}</td>
                <td>{e.EmpTelephone}</td>
                <td><span className={`badge-status ${statusColors[e.EmpStatus] || 'bg-secondary'}`}>{e.EmpStatus}</span></td>
                <td>{e.DepartName}</td>
                <td>{e.PosName}</td>
                <td>
                  <Link to={`/employees/${e.EmpID}`} className="btn btn-sm btn-warning me-1"><i className="bi bi-pencil"></i></Link>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.EmpID)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={9}><div className="empty-state"><i className="bi bi-people"></i>No employees found</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
