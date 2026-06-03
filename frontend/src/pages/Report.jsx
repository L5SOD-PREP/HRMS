import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { FileText, Printer, Users, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const allStatuses = ['Active', 'On leave', 'Left', 'Blacklisted', 'Deceased', 'On mission'];

const statusColors = {
  'Active': { bg: '#d1fae5', text: '#065f46' },
  'On leave': { bg: '#fef3c7', text: '#92400e' },
  'Left': { bg: '#fee2e2', text: '#991b1b' },
  'Blacklisted': { bg: '#fce7f3', text: '#9d174d' },
  'Deceased': { bg: '#e2e8f0', text: '#475569' },
  'On mission': { bg: '#dbeafe', text: '#1e40af' },
};

export default function Report() {
  const [report, setReport] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedStatuses, setSelectedStatuses] = useState(['On leave']);
  const [counts, setCounts] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    api.get('/reports/employee-count-by-status').then(r => {
      if (!mountedRef.current) return;
      const m = {}; for (const row of r.data) m[row.EmpStatus] = row.count;
      setCounts(m);
    }).catch(() => {}).finally(() => {
      if (mountedRef.current) setCountsLoading(false);
    });
    return () => { mountedRef.current = false; };
  }, []);

  const fetchReport = () => {
    if (selectedStatuses.length === 0) { setError('Select at least one status.'); return; }
    setError('');
    setReportLoading(true);
    const query = selectedStatuses.join(',');
    api.get(`/reports/employees-on-leave?status=${query}`).then(r => {
      if (!mountedRef.current) return;
      const data = r.data?.departments || {};
      setReport(Object.keys(data).map(name => ({ DepartName: name, employees: data[name] })));
      setTotal(r.data?.total || 0);
    }).catch(() => {
      if (mountedRef.current) setError('Failed to generate report.');
    }).finally(() => {
      if (mountedRef.current) setReportLoading(false);
    });
  };

  useEffect(() => {
    if (!countsLoading) fetchReport();
  }, [countsLoading]);

  const toggleStatus = (s) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    let pageNum = 1;

    const addFooter = () => {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`DAB Enterprise LTD — HRMS Report • Page ${pageNum}`, pageW / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    };

    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text('DAB Enterprise LTD', pageW / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Employee Status Report', pageW / 2, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW / 2, 38, { align: 'center' });
    doc.text(`Statuses: ${selectedStatuses.join(', ')}  |  Total Employees: ${total}`, pageW / 2, 44, { align: 'center' });

    let yPos = 52;
    for (const dept of report) {
      if (yPos > 180) { doc.addPage(); pageNum++; yPos = 20; }

      doc.setFillColor(59, 130, 246);
      doc.rect(14, yPos - 4, pageW - 28, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(dept.DepartName, 18, yPos + 1);
      doc.setFontSize(9);
      doc.text(`${dept.employees.length} employee(s)`, pageW - 18, yPos + 1, { align: 'right' });
      yPos += 10;

      const rows = dept.employees.map((e, i) => [
        i + 1, `${e.EmpFirstName} ${e.EmpLastName}`, e.PosName || '-',
        e.EmpEmail, e.EmpTelephone || '-', e.EmpStatus
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['#', 'Name', 'Position', 'Email', 'Phone', 'Status']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 10 }, 5: { cellWidth: 22 } },
        margin: { left: 14, right: 14 },
        tableWidth: pageW - 28,
      });
      yPos = doc.lastAutoTable.finalY + 8;
    }

    addFooter();
    doc.save('Employee_Status_Report.pdf');
  };

  const totalByStatus = {};
  for (const dept of report) {
    for (const emp of dept.employees) {
      totalByStatus[emp.EmpStatus] = (totalByStatus[emp.EmpStatus] || 0) + 1;
    }
  }

  return (
    <>
      <div className="card-dash p-3 mb-3">
        {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span style={{fontWeight:600,fontSize:'0.9rem',marginRight:'0.5rem'}}>Filter by Status:</span>
          {allStatuses.map(s => {
            const c = statusColors[s] || { bg: '#e2e8f0', text: '#475569' };
            const active = selectedStatuses.includes(s);
            return (
              <button key={s} onClick={() => toggleStatus(s)}
                style={{
                  padding:'0.3rem 0.75rem', borderRadius:'2rem', border: active ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: active ? c.bg : '#fff', color: active ? c.text : '#64748b',
                  fontWeight: active ? 600 : 400, fontSize:'0.8rem', cursor:'pointer', transition:'all .15s'
                }}>
                {s} {counts[s] !== undefined ? `(${counts[s]})` : ''}
              </button>
            );
          })}
          <button className="btn" onClick={fetchReport} disabled={reportLoading}
            style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.85rem',padding:'0.4rem 1rem',marginLeft:'auto'}}>
            {reportLoading ? <span className="spinner-border spinner-border-sm" /> : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 style={{margin:0,fontWeight:600}}>Employee Status Report</h5>
          <p className="text-muted small mb-0 mt-1">
            <FileText size={13} style={{verticalAlign:'middle',marginRight:'0.25rem'}} />
            {total} employee{total !== 1 ? 's' : ''} found • Statuses: {selectedStatuses.join(', ')}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn" onClick={exportPDF}
            style={{background:'#0f172a',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.85rem',padding:'0.45rem 1rem',display:'flex',alignItems:'center',gap:'0.35rem'}}>
            <Download size={15} /> PDF
          </button>
          <button className="btn" onClick={() => window.print()}
            style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.85rem',padding:'0.45rem 1rem',display:'flex',alignItems:'center',gap:'0.35rem'}}>
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {selectedStatuses.length > 0 && (
        <div className="row g-2 mb-3">
          {selectedStatuses.map(s => {
            const c = statusColors[s] || { bg: '#e2e8f0', text: '#475569' };
            const cnt = totalByStatus[s] || 0;
            return (
              <div key={s} className="col-md-2 col-4">
                <div className="card-dash p-2 text-center" style={{borderLeft:`3px solid ${c.text}`}}>
                  <div style={{fontSize:'1.3rem',fontWeight:700,color:c.text}}>{cnt}</div>
                  <div style={{fontSize:'0.7rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.04em'}}>{s}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card-dash p-3 mb-3 d-flex align-items-center gap-2" style={{borderLeft:'4px solid #3b82f6'}}>
        <Users size={18} style={{color:'#3b82f6'}} />
        <span style={{fontWeight:600}}>Total:</span>
        <span style={{fontWeight:700,fontSize:'1.2rem',color:'#3b82f6'}}>{total}</span>
        <span className="text-muted small">employee{total !== 1 ? 's' : ''} across {report.length} department{report.length !== 1 ? 's' : ''}</span>
      </div>

      <div ref={contentRef}>
        {reportLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : report.length === 0 ? (
          <div className="card-dash p-4 text-center text-muted">
            <FileText size={32} style={{marginBottom:'0.5rem',opacity:0.3}} />
            <p className="mb-0">No employees match the selected statuses.</p>
          </div>
        ) : (
          report.map((dept) => (
            <div key={dept.DepartName} className="card-dash mb-3" style={{overflow:'hidden'}}>
              <div className="px-3 py-2" style={{background:'#3b82f6',color:'#fff',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <Users size={16} />
                <span style={{fontWeight:600}}>{dept.DepartName}</span>
                <span className="badge" style={{background:'rgba(255,255,255,0.2)',color:'#fff',marginLeft:'auto'}}>
                  {dept.employees?.length || 0} employee{(dept.employees?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <table className="table table-dash">
                <thead>
                  <tr>
                    <th style={{width:'50px'}}>#</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th style={{width:'110px'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.employees.map((emp, i) => {
                    const c = statusColors[emp.EmpStatus] || { bg: '#e2e8f0', text: '#475569' };
                    return (
                      <tr key={emp.EmpID}>
                        <td className="text-muted">{i + 1}</td>
                        <td style={{fontWeight:500}}>{emp.EmpFirstName} {emp.EmpLastName}</td>
                        <td>{emp.PosName || '-'}</td>
                        <td>{emp.EmpEmail}</td>
                        <td>{emp.EmpTelephone || '-'}</td>
                        <td><span className="badge-status" style={{background:c.bg,color:c.text}}>{emp.EmpStatus}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </>
  );
}
