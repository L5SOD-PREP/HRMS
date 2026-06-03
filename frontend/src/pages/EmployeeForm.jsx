import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, ArrowLeft } from 'lucide-react';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    EmpFirstName:'', EmpLastName:'', EmpGender:'Male', EmpDateOfBirth:'',
    EmpEmail:'', EmpTelephone:'', EmpAddress:'', EmpHireDate:'',
    EmpStatus:'Active', DeptID:'', PosID:'',
  });
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const promises = [
      api.get('/departments'),
      api.get('/positions'),
    ];
    if (isEdit) {
      promises.push(api.get(`/employees/${id}`));
    }
    Promise.all(promises).then(([deptRes, posRes, empRes]) => {
      if (!mountedRef.current) return;
      setDepartments(deptRes.data);
      setPositions(posRes.data);
      if (empRes) {
        const e = empRes.data.employee || empRes.data;
        setForm({
          EmpFirstName:e.EmpFirstName||'', EmpLastName:e.EmpLastName||'',
          EmpGender:e.EmpGender||'Male', EmpDateOfBirth:e.EmpDateOfBirth?.split('T')[0]||'',
          EmpEmail:e.EmpEmail||'', EmpTelephone:e.EmpTelephone||'',
          EmpAddress:e.EmpAddress||'', EmpHireDate:e.EmpHireDate?.split('T')[0]||'',
          EmpStatus:e.EmpStatus||'Active', DeptID:e.DeptID||'', PosID:e.PosID||'',
        });
      }
    }).catch(() => {
      if (mountedRef.current) setError('Failed to load data.');
    }).finally(() => {
      if (mountedRef.current) setInitialLoading(false);
    });
    return () => { mountedRef.current = false; };
  }, [id]);

  const handleChange = (e) => setForm({...form,[e.target.name]:e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.EmpFirstName || !form.EmpLastName || !form.EmpEmail) {
      setError('First name, last name, and email are required'); return;
    }
    if (/\d/.test(form.EmpFirstName) || /\d/.test(form.EmpLastName)) {
      setError('Name cannot contain numbers.'); return;
    }
    if (form.EmpEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.EmpEmail)) {
      setError('Invalid email format.'); return;
    }
    if (form.EmpDateOfBirth) {
      const dob = new Date(form.EmpDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) { setError('Employee must be at least 18 years old.'); return; }
    }
    if (form.EmpHireDate && new Date(form.EmpHireDate) > new Date()) {
      setError('Hire date cannot be in the future.'); return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, form);
      } else {
        await api.post('/employees', form);
      }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/employees')} style={{borderRadius:'0.5rem'}}>
          <ArrowLeft size={16} />
        </button>
        <h5 style={{margin:0,fontWeight:600}}>{isEdit ? 'Edit Employee' : 'Add Employee'}</h5>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">First Name *</label>
              <input type="text" name="EmpFirstName" className="form-control" value={form.EmpFirstName} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Last Name *</label>
              <input type="text" name="EmpLastName" className="form-control" value={form.EmpLastName} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select name="EmpGender" className="form-select" value={form.EmpGender} onChange={handleChange}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="EmpDateOfBirth" className="form-control" value={form.EmpDateOfBirth} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email *</label>
              <input type="email" name="EmpEmail" className="form-control" value={form.EmpEmail} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Telephone</label>
              <input type="text" name="EmpTelephone" className="form-control" value={form.EmpTelephone} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Address</label>
              <textarea name="EmpAddress" className="form-control" rows="2" value={form.EmpAddress} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Hire Date</label>
              <input type="date" name="EmpHireDate" className="form-control" value={form.EmpHireDate} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select name="EmpStatus" className="form-select" value={form.EmpStatus} onChange={handleChange}>
                {['Active','On leave','Left','Blacklisted','Deceased','On mission'].map(s =>
                  <option key={s}>{s}</option>
                )}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <select name="DeptID" className="form-select" value={form.DeptID} onChange={handleChange}>
                <option value="">-- Select --</option>
                {departments.map(d => <option key={d.DeptID} value={d.DeptID}>{d.DepartName}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Position</label>
              <select name="PosID" className="form-select" value={form.PosID} onChange={handleChange}>
                <option value="">-- Select --</option>
                {positions.map(p => <option key={p.PosID} value={p.PosID}>{p.PosName}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn" disabled={loading} style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,padding:'0.55rem 1.5rem',display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <Save size={16} />}
              {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
