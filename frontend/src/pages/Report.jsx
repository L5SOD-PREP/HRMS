import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Report() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/employees-on-leave').then(res => {
      setReport(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Loading report...</p></div>;

  return (
    <div>
      <div className="action-bar">
        <h4 className="page-title" style={{ border: 'none', padding: 0, margin: 0 }}><i className="bi bi-file-earmark-text me-2"></i>Employee Status Report — On Leave</h4>
        <button className="btn btn-outline-secondary" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i>Print
        </button>
      </div>

      <div className="alert alert-info d-flex align-items-center gap-2 py-2">
        <i className="bi bi-info-circle"></i>
        <strong>Total employees on leave: {report?.total || 0}</strong>
      </div>

      {report && Object.keys(report.departments).length === 0 && (
        <div className="alert alert-warning"><i className="bi bi-exclamation-triangle me-2"></i>No employees are currently on leave.</div>
      )}

      {report && Object.entries(report.departments).map(([dept, employees]) => (
        <div className="card mb-3" key={dept}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <span><i className="bi bi-diagram-3 me-2"></i>{dept}</span>
            <span className="badge bg-primary rounded-pill">{employees.length}</span>
          </div>
          <div className="card-body p-0">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>#</th><th>First Name</th><th>Last Name</th><th>Gender</th><th>Email</th><th>Phone</th><th>Position</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.EmpID}>
                    <td>{e.EmpID}</td>
                    <td>{e.EmpFirstName}</td>
                    <td>{e.EmpLastName}</td>
                    <td>{e.EmpGender}</td>
                    <td>{e.EmpEmail}</td>
                    <td>{e.EmpTelephone}</td>
                    <td>{e.PosName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
