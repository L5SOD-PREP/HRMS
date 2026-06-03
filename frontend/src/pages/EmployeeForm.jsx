import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const statuses = ['On mission', 'On leave', 'Left', 'Blacklisted', 'Deceased'];

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState({
    EmpFirstName: '', EmpLastName: '', EmpGender: '', EmpDateOfBirth: '',
    EmpEmail: '', EmpTelephone: '', EmpAddress: '', EmpHireDate: '',
    EmpStatus: 'On mission', DepartID: '', PosID: ''
  });
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/departments'), api.get('/positions')]).then(([dept, pos]) => {
      setDepartments(dept.data);
      setPositions(pos.data);
    });
    if (isEdit) {
      api.get(`/employees/${id}`).then(res => {
        const e = res.data;
        setForm({
          EmpFirstName: e.EmpFirstName || '', EmpLastName: e.EmpLastName || '',
          EmpGender: e.EmpGender || '', EmpDateOfBirth: e.EmpDateOfBirth || '',
          EmpEmail: e.EmpEmail || '', EmpTelephone: e.EmpTelephone || '',
          EmpAddress: e.EmpAddress || '', EmpHireDate: e.EmpHireDate || '',
          EmpStatus: e.EmpStatus || 'On mission', DepartID: e.DepartID || '', PosID: e.PosID || ''
        });
      }).catch(() => navigate('/employees'));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, DepartID: form.DepartID ? Number(form.DepartID) : null, PosID: form.PosID ? Number(form.PosID) : null };
      if (isEdit) await api.put(`/employees/${id}`, payload);
      else await api.post('/employees', payload);
      navigate('/employees');
    } catch (err) { setError(err.response?.data?.error || 'Operation failed'); }
  };

  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h4 className="page-title"><i className={`bi ${isEdit ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>{isEdit ? 'Edit Employee' : 'Add Employee'}</h4>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="card"><div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">First Name <span className="text-danger">*</span></label>
                <input className="form-control" name="EmpFirstName" value={form.EmpFirstName} onChange={h} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name <span className="text-danger">*</span></label>
                <input className="form-control" name="EmpLastName" value={form.EmpLastName} onChange={h} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Gender</label>
                <select className="form-select" name="EmpGender" value={form.EmpGender} onChange={h}>
                  <option value="">Select</option><option>Male</option><option>Female</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" name="EmpDateOfBirth" value={form.EmpDateOfBirth} onChange={h} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Hire Date</label>
                <input type="date" className="form-control" name="EmpHireDate" value={form.EmpHireDate} onChange={h} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="EmpEmail" value={form.EmpEmail} onChange={h} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Telephone</label>
                <input className="form-control" name="EmpTelephone" value={form.EmpTelephone} onChange={h} />
              </div>
              <div className="col-md-12">
                <label className="form-label">Address</label>
                <input className="form-control" name="EmpAddress" value={form.EmpAddress} onChange={h} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select className="form-select" name="EmpStatus" value={form.EmpStatus} onChange={h}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Department</label>
                <select className="form-select" name="DepartID" value={form.DepartID} onChange={h}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d.DepartID} value={d.DepartID}>{d.DepartName}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Position</label>
                <select className="form-select" name="PosID" value={form.PosID} onChange={h}>
                  <option value="">Select</option>
                  {positions.map(p => <option key={p.PosID} value={p.PosID}>{p.PosName}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary"><i className={`bi ${isEdit ? 'bi-check2' : 'bi-person-plus'} me-1`}></i>{isEdit ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/employees')}>Cancel</button>
            </div>
          </form>
        </div></div>
      </div>
    </div>
  );
}
