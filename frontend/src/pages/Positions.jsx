import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Plus, Pencil, Trash2, Briefcase, X, Check } from 'lucide-react';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPos, setEditPos] = useState(null);
  const [name, setName] = useState('');
  const [qual, setQual] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    api.get('/positions').then(r => { if (mountedRef.current) setPositions(r.data); }).catch(() => {}).finally(() => { if (mountedRef.current) setFetching(false); });
    return () => { mountedRef.current = false; };
  }, []);

  const fetch = () => api.get('/positions').then(r => { if (mountedRef.current) setPositions(r.data); });

  const openAdd = () => { setEditPos(null); setName(''); setQual(''); setShowModal(true); };
  const openEdit = (p) => { setEditPos(p); setName(p.PosName); setQual(p.RequiredQualification||''); setShowModal(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const body = { PosName: name, RequiredQualification: qual };
      if (editPos) {
        await api.put(`/positions/${editPos.PosID}`, body);
      } else {
        await api.post('/positions', body);
      }
      setShowModal(false); fetch();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this position?')) return;
    try { await api.delete(`/positions/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{margin:0,fontWeight:600}}>Positions</h5>
        <button className="btn" style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',fontWeight:500,fontSize:'0.9rem',padding:'0.5rem 1rem',display:'flex',alignItems:'center',gap:'0.4rem'}} onClick={openAdd}>
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="card-dash" style={{overflow:'hidden'}}>
        {positions.length === 0 ? (
          <div className="text-center text-muted py-4">No positions yet.</div>
        ) : (
          <table className="table table-dash">
            <thead>
              <tr>
                <th style={{width:'60px'}}>#</th>
                <th>Position Title</th>
                <th>Required Qualification</th>
                <th style={{width:'90px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p, i) => (
                <tr key={p.PosID}>
                  <td className="text-muted">{i + 1}</td>
                  <td><Briefcase size={14} style={{color:'#64748b',marginRight:'0.5rem',verticalAlign:'middle'}} />{p.PosName}</td>
                  <td className="text-muted">{p.RequiredQualification || '-'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn-action edit" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                      <button className="btn-action delete" onClick={() => handleDelete(p.PosID)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1050}} onClick={() => setShowModal(false)}>
          <div style={{background:'#fff',borderRadius:'1rem',padding:'1.5rem',width:'100%',maxWidth:'420px',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)'}} onClick={e => e.stopPropagation()}>
            <h6 style={{fontWeight:600,marginBottom:'1rem'}}>{editPos ? 'Edit Position' : 'Add Position'}</h6>
            <div className="mb-3">
              <label className="form-label">Position Title</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div className="mb-2">
              <label className="form-label">Required Qualification</label>
              <input type="text" className="form-control" value={qual} onChange={e => setQual(e.target.value)} />
            </div>
            <div className="d-flex gap-2 mt-3 justify-content-end">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)} style={{borderRadius:'0.5rem',display:'flex',alignItems:'center',gap:'0.25rem'}}><X size={14} /> Cancel</button>
              <button className="btn btn-sm" disabled={loading} onClick={handleSave} style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : <Check size={14} />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
