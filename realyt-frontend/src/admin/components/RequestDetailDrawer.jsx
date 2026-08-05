import { X, Calendar, User, Mail, Phone, Link2, Wrench, Clock, CheckCircle } from 'lucide-react';

export default function RequestDetailDrawer({ item, type, onClose, onAssign, onUpdateStatus }) {
  if (!item) return null;

  const isCustomer = type === 'customer';

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="drawer-eyebrow">
              {isCustomer ? `Order #${item.id}` : `Application #${item.id}`}
            </span>
            <h2 className="drawer-title">{isCustomer ? item.clientName : item.name}</h2>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {isCustomer ? (
            <>
              <div className="drawer-section">
                <h3>Request Details</h3>
                <div className="drawer-info-grid">
                  <div className="info-item">
                    <span className="info-label"><Calendar size={14} /> Booking Date</span>
                    <span className="info-value">{item.bookingDate}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Occasion</span>
                    <span className="info-value badge-occasion">{item.occasionType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><Mail size={14} /> Email Address</span>
                    <span className="info-value">{item.clientEmail || item.email || item.client?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><Phone size={14} /> Mobile No</span>
                    <span className="info-value">{item.clientPhone || item.phone || item.mobile || item.client?.mobile || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Reel Count</span>
                    <span className="info-value">{item.reelCount || 1} reels</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Price / Budget</span>
                    <span className="info-value">${item.price || item.budget || '299'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`status-pill status-${item.status?.toLowerCase()?.replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Assigned Editor</span>
                    <span className="info-value">{item.editorName || (item.editor ? item.editor.fullName : 'Not Assigned')}</span>
                  </div>
                </div>
              </div>

              <div className="drawer-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => onAssign?.(item)}
                >
                  <User size={16} /> Assign Editor
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="drawer-section">
                <h3>Applicant Profile</h3>
                <div className="drawer-info-grid">
                  <div className="info-item">
                    <span className="info-label"><Mail size={14} /> Email</span>
                    <span className="info-value">{item.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><Phone size={14} /> Mobile</span>
                    <span className="info-value">{item.mobile || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><Clock size={14} /> Applied Date</span>
                    <span className="info-value">{item.appliedDate || 'Recent'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Experience</span>
                    <span className="info-value">{item.experienceLevel}</span>
                  </div>
                  <div className="info-item col-span-2">
                    <span className="info-label"><Link2 size={14} /> Portfolio</span>
                    <a href={item.portfolioUrl} target="_blank" rel="noreferrer" className="drawer-link">
                      {item.portfolioUrl}
                    </a>
                  </div>
                  <div className="info-item col-span-2">
                    <span className="info-label"><Wrench size={14} /> Tools Used</span>
                    <span className="info-value">{item.toolsUsed}</span>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Application Status: <strong className="text-marigold">{item.status}</strong></h3>
                <div className="drawer-btn-group">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onUpdateStatus?.(item.id, 'Shortlisted')}
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onUpdateStatus?.(item.id, 'Interview Scheduled')}
                  >
                    Schedule Interview
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onUpdateStatus?.(item.id, 'Approved')}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
