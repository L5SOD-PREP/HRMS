import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight,
  Clock, UserX, AlertTriangle, Skull, MapPin, UserCheck
} from 'lucide-react';

const statusIcons = {
  'Active': UserCheck, 'On leave': Clock, 'Left': UserX,
  'Blacklisted': AlertTriangle, 'Deceased': Skull, 'On mission': MapPin,
};
const statusColors = {
  'Active': '#10b981', 'On leave': '#f59e0b', 'Left': '#ef4444',
  'Blacklisted': '#ec4899', 'Deceased': '#64748b', 'On mission': '#3b82f6',
};
const statusBgs = {
  'Active': '#d1fae5', 'On leave': '#fef3c7', 'Left': '#fee2e2',
  'Blacklisted': '#fce7f3', 'Deceased': '#e2e8f0', 'On mission': '#dbeafe',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (deptFilter) params.set('departID', deptFilter);
    api.get(`/employees?${params}`)
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data.employees || [];
        setEmployees(data);
        setTotal(data.length);
      }).catch(() => {});
  }, [search, statusFilter, deptFilter, page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.EmpID !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div style={{position:'relative',maxWidth:'280px',flex:1,minWidth:'160px'}}>
          <Search size={16} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}} />
          <input
            type="text" className="form-control" placeholder="Search employees..."
            style={{paddingLeft:'32px',borderRadius:'0.5rem',border:'1.5px solid #e2e8f0',fontSize:'0.9rem'}}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select" style={{width:'auto',borderRadius:'0.5rem',border:'1.5px solid #e2e8f0',fontSize:'0.85rem',padding:'0.45rem 2rem 0.45rem 0.75rem'}}
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['Active','On leave','Left','Blacklisted','Deceased','On mission'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="form-select" style={{width:'auto',borderRadius:'0.5rem',border:'1.5px solid #e2e8f0',fontSize:'0.85rem',padding:'0.45rem 2rem 0.45rem 0.75rem'}}
          value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.DeptID} value={d.DeptID}>{d.DepartName}</option>
          ))}
        </select>
        <Link to="/employees/new" className="btn" style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.9rem',padding:'0.5rem 1rem',display:'flex',alignItems:'center',gap:'0.4rem',marginLeft:'auto'}}>
          <Plus size={16} /> Add Employee
        </Link>
      </div>

      <div className="card-dash" style={{overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table className="table table-dash">
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th style={{width:'90px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">No employees found.</td></tr>
              )}
              {employees.map(emp => {
                const Icon = statusIcons[emp.EmpStatus] || UserCheck;
                const sColor = statusColors[emp.EmpStatus] || '#64748b';
                const sBg = statusBgs[emp.EmpStatus] || '#e2e8f0';
                return (
                  <tr key={emp.EmpID}>
                    <td style={{fontWeight:500}}>{emp.EmpFirstName} {emp.EmpLastName}</td>
                    <td>{emp.EmpGender}</td>
                    <td>{emp.EmpEmail}</td>
                    <td>{emp.EmpTelephone || '-'}</td>
                    <td>
                      <span className="badge-status" style={{background:sBg,color:sColor,display:'inline-flex',alignItems:'center',gap:'0.25rem'}}>
                        <Icon size={11} /> {emp.EmpStatus}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/employees/${emp.EmpID}`} className="btn-action edit"><Pencil size={14} /></Link>
                        <button className="btn-action delete" onClick={() => handleDelete(emp.EmpID)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{borderTop:'1px solid #e2e8f0'}}>
            <small className="text-muted">Page {page} of {totalPages}</small>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
