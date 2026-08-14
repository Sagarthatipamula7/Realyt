import { useEffect, useState } from 'react';
import { X, UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { fetchEditorsRoster } from '../api/adminApi.js';

export default function AssignEditorModal({ order, onClose, onAssignConfirmed }) {
  const [editors, setEditors] = useState([]);
  const [selectedEditorId, setSelectedEditorId] = useState('');

  useEffect(() => {
    fetchEditorsRoster().then((data) => setEditors(Array.isArray(data) ? data : []));
  }, []);

  if (!order) return null;

  const handleAssign = () => {
    if (!selectedEditorId) return;
    onAssignConfirmed(order.id, selectedEditorId);
  };

  const clientEmail = order.clientEmail || order.email || order.client?.email || 'N/A';
  const clientPhone = order.clientPhone || order.phone || order.mobile || order.client?.mobile || 'N/A';

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ width: '500px' }}>
        <div className="modal-header">
          <h3>Assign Editor to Order #{order.id}</h3>
          <button type="button" className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-subtitle-box" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '14px 16px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#F5EEE4' }}>
              👤 Client: {order.clientName || 'Client'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#C9BCD6' }}>
              <div><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} /> {clientEmail}</div>
              <div><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> {clientPhone}</div>
              <div><Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> Date: {order.bookingDate}</div>
              <div>🎉 Occasion: {order.occasionType}</div>
            </div>
          </div>

          <label className="modal-label" style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#FCD34D' }}>Select Available Editor from Roster:</label>
          <select
            className="admin-select"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: '#111C31', color: '#FFF', border: '1px solid rgba(245, 158, 11, 0.4)', fontSize: '0.92rem', marginBottom: '18px', outline: 'none', cursor: 'pointer' }}
            value={selectedEditorId}
            onChange={(e) => setSelectedEditorId(e.target.value)}
          >
            <option value="">-- Choose an Available Editor --</option>
            {editors.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.name || ed.fullName} ({ed.email || 'Registered'}) — {ed.rating || '5.0 ⭐'}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedEditorId}
            onClick={handleAssign}
          >
            <UserCheck size={16} /> Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
