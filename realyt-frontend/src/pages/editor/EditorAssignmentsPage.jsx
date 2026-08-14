import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/auth.js';
import { 
  Users, User, Mail, Phone, Calendar, MapPin, Send, CheckCircle2 
} from 'lucide-react';

export default function EditorAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deliveryLinks, setDeliveryLinks] = useState({});

  useEffect(() => {
    const editorObj = JSON.parse(localStorage.getItem('realyt_editor_user') || '{}');
    fetchAssignments(editorObj.email);
  }, []);

  const fetchAssignments = async (emailStr) => {
    setLoading(true);
    try {
      const res = await api.get('/orders/editor/assignments', { params: { email: emailStr || '' } });
      setAssignments(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch {
      /* ignore */
    }
    setAssignments((prev) =>
      prev.map((item) => (item.id === orderId ? { ...item, status: newStatus } : item))
    );
    toast.success(`Order #${orderId} status updated to ${newStatus}!`);
  };

  const handleSubmitDelivery = (orderId) => {
    const link = deliveryLinks[orderId];
    if (!link || !link.trim()) {
      toast.error('Please enter a valid Google Drive / Dropbox video delivery link.');
      return;
    }
    handleUpdateStatus(orderId, 'COMPLETED');
    toast.success(`Final edited video delivery link submitted for Order #${orderId}!`);
  };

  const filteredAssignments = assignments.filter((item) => {
    const nameMatch = String(item.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const occasionMatch = String(item.occasionType || '').toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = String(item.id).includes(searchQuery);
    const matchesSearch = nameMatch || occasionMatch || idMatch;

    const matchesStatus = statusFilter === 'ALL' || String(item.status).toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '32px 36px', color: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: '#FFF' }}>
          Assigned Clients & Shoot Projects
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
          Manage client contacts, review shoot requirements, and submit finished video edit links.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by client name, occasion, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#FFF', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Assigned / Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>Loading client assignments…</div>
      ) : filteredAssignments.length === 0 ? (
        <div style={{ background: '#1E293B', border: '1px border-dashed rgba(255,255,255,0.12)', borderRadius: '20px', padding: '48px', textAlign: 'center' }}>
          <Users size={36} color="#64748B" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', margin: '0 0 6px', color: '#CBD5E1' }}>No Client Assignments Found</h4>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
            No assigned client projects match your current filter query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredAssignments.map((project) => {
            const totalAmount = Number(project.price || (project.quotedAmount ? project.quotedAmount / 100.0 : 1200)) || 1200;
            const editorPayout = Math.round(totalAmount * 0.85);
            const statusStr = String(project.status || 'CONFIRMED').toUpperCase();

            return (
              <div
                key={project.id}
                style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '4px 12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                      #{project.id}
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>
                        {project.occasionType || project.occasion || 'Celebration Shoot'}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                        Booked on {project.createdAt?.split('T')[0] || 'Recently'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>YOUR PAYOUT EARNINGS</span>
                      <strong style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F59E0B' }}>
                        ₹{editorPayout.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '6px 14px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: statusStr === 'COMPLETED' ? 'rgba(52, 211, 153, 0.2)' : statusStr === 'IN_PROGRESS' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: statusStr === 'COMPLETED' ? '#34D399' : statusStr === 'IN_PROGRESS' ? '#60A5FA' : '#F59E0B',
                        border: `1px solid ${statusStr === 'COMPLETED' ? 'rgba(52, 211, 153, 0.4)' : statusStr === 'IN_PROGRESS' ? 'rgba(96, 165, 250, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                      }}
                    >
                      ● {statusStr}
                    </span>
                  </div>
                </div>

                {/* Contact Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                      👤 CLIENT CONTACT INFO
                    </span>
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#FFF', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={15} color="#94A3B8" /> {project.clientName || project.name || 'Client Name'}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#CBD5E1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={15} color="#94A3B8" /> {project.clientEmail || project.email || 'Email not provided'}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={15} color="#34D399" /> {project.clientPhone || project.phone || 'Phone not provided'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                      📍 SHOOT VENUE & DATE
                    </span>
                    <div style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color="#F59E0B" /> {project.bookingDate || 'Selected Date'}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} color="#94A3B8" /> {project.venue || 'Location specified by client'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                      🎥 REEL SPECS & NOTES
                    </span>
                    <div style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 600, marginBottom: '4px' }}>
                      {project.reelCount || 1} Reel(s) Required
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0, fontStyle: 'italic' }}>
                      {project.description || project.notes || 'No special editing instructions.'}
                    </p>
                  </div>
                </div>

                {/* Video Delivery Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '10px' }}>
                    <input
                      type="url"
                      placeholder="Paste Google Drive / Dropbox video delivery URL here..."
                      value={deliveryLinks[project.id] || ''}
                      onChange={(e) => setDeliveryLinks({ ...deliveryLinks, [project.id]: e.target.value })}
                      style={{ flex: 1, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#FFF', fontSize: '0.86rem', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmitDelivery(project.id)}
                      style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', color: '#FFF', fontWeight: 700, fontSize: '0.86rem', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} /> Submit Delivery
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {statusStr !== 'IN_PROGRESS' && statusStr !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(project.id, 'IN_PROGRESS')}
                        style={{ background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)', color: '#60A5FA', fontWeight: 600, fontSize: '0.85rem', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}
                      >
                        Mark In Progress
                      </button>
                    )}
                    {statusStr !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(project.id, 'COMPLETED')}
                        style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34D399', fontWeight: 600, fontSize: '0.85rem', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CheckCircle2 size={14} /> Complete Project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
