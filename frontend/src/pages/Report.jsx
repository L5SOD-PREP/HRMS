import { useState, useEffect } from 'react';
import api from '../api';
import { FileText, Printer, Users } from 'lucide-react';

export default function Report() {
  const [report, setReport] = useState([]);

  useEffect(() => {
    api.get('/reports/employees-on-leave').then(r => {
      const data = r.data?.departments || {};
      setReport(Object.keys(data).map(name => ({ DepartName: name, employees: data[name] })));
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{margin:0,fontWeight:600}}>Employees on Leave Report</h5>
        <button className="btn" style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.9rem',padding:'0.5rem 1rem',display:'flex',alignItems:'center',gap:'0.4rem'}} onClick={() => window.print()}>
          <Printer size={16} /> Print
        </button>
      </div>

      {report.length === 0 ? (
        <div className="card-dash p-4 text-center text-muted">
          <FileText size={32} style={{marginBottom:'0.5rem',opacity:0.3}} />
          <p className="mb-0">No employees currently on leave.</p>
        </div>
      ) : (
        report.map((dept) => (
          <div key={dept.DepartName} className="card-dash mb-3" style={{overflow:'hidden'}}>
            <div className="px-3 py-2" style={{background:'#fff',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <Users size={16} style={{color:'#3b82f6'}} />
              <span style={{fontWeight:600}}>{dept.DepartName}</span>
              <span className="badge" style={{background:'#dbeafe',color:'#2563eb',marginLeft:'auto'}}>{dept.employees?.length || 0} on leave</span>
            </div>
            {dept.employees?.length > 0 ? (
              <table className="table table-dash">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.employees.map(emp => (
                    <tr key={emp.EmpID}>
                      <td style={{fontWeight:500}}>{emp.EmpFirstName} {emp.EmpLastName}</td>
                      <td>{emp.PosName || '-'}</td>
                      <td>{emp.EmpEmail}</td>
                      <td><span className="badge-status" style={{background:'#fef3c7',color:'#92400e'}}>{emp.EmpStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted small px-3 py-2 mb-0">No employees on leave in this department.</p>
            )}
          </div>
        ))
      )}
    </>
  );
}
