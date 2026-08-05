import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader.jsx';
import RequestDetailDrawer from '../components/RequestDetailDrawer.jsx';
import AssignEditorModal from '../components/AssignEditorModal.jsx';
import {
  fetchCustomerRequests,
  fetchEditorApplications,
  assignEditorToOrder,
  updateEditorApplicationStatus
} from '../api/adminApi.js';
import { Search, Filter, UserPlus, Inbox, CheckCircle2 } from 'lucide-react';

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'editor'
  const [customerRequests, setCustomerRequests] = useState([]);
  const [editorApps, setEditorApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedItem, setSelectedItem] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);

  useEffect(() => {
    fetchCustomerRequests().then((data) => setCustomerRequests(Array.isArray(data) ? data : []));
    fetchEditorApplications().then((data) => setEditorApps(Array.isArray(data) ? data : []));
  }, []);

  const handleAssignConfirmed = async (orderId, editorId) => {
    const res = await assignEditorToOrder(orderId, editorId);
    const assignedName = res?.editorName || `Editor #${editorId}`;
    setCustomerRequests((prev) =>
      prev.map((r) => (r.id === orderId ? { ...r, status: 'CONFIRMED', editorName: assignedName } : r))
    );
    toast.success(`Booking done successfully! Assigned to ${assignedName}.`);
    setAssigningOrder(null);
  };

  const handleUpdateStatus = async (appId, status) => {
    await updateEditorApplicationStatus(appId, status);
    setEditorApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
    if (selectedItem?.id === appId) {
      setSelectedItem((prev) => ({ ...prev, status }));
    }
  };

  const filteredCustomerRequests = customerRequests.filter((req) => {
    const matchesSearch =
      String(req.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(req.occasionType || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || String(req.status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const filteredEditorApps = editorApps.filter((app) => {
    const matchesSearch =
      String(app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(app.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || String(app.status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-container">
      <AdminHeader title="Requests & Applications Queue" subtitle="Manage incoming client bookings and editor applications" />

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
          onClick={() => { setActiveTab('customer'); setStatusFilter('ALL'); }}
        >
          <Inbox size={16} /> Customer Requests ({customerRequests.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => { setActiveTab('editor'); setStatusFilter('ALL'); }}
        >
          <UserPlus size={16} /> Editor Applications ({editorApps.length})
        </button>
      </div>

      {/* Controls Bar */}
      <div className="admin-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-input"
            placeholder={activeTab === 'customer' ? 'Search by client name or occasion...' : 'Search by applicant name or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-select-wrap">
          <Filter size={16} className="filter-icon" />
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {activeTab === 'customer' ? (
              <>
                <option value="PENDING">Pending / Submitted</option>
                <option value="CONFIRMED">Confirmed / Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed / Delivered</option>
              </>
            ) : (
              <>
                <option value="NEW">New</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview Scheduled</option>
                <option value="APPROVED">Approved</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Content Table */}
      {activeTab === 'customer' ? (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client Name</th>
                <th>Email Address</th>
                <th>Mobile No</th>
                <th>Occasion</th>
                <th>Requested Date</th>
                <th>Reels</th>
                <th>Status</th>
                <th>Assigned Editor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomerRequests.map((req) => {
                const statusStr = String(req.status || 'PENDING').toUpperCase();
                const email = req.clientEmail || req.email || req.client?.email || 'N/A';
                const phone = req.clientPhone || req.phone || req.mobile || req.client?.mobile || 'N/A';
                return (
                  <tr
                    key={req.id}
                    className="table-row-clickable"
                    onClick={() => setSelectedItem({ ...req, _type: 'customer' })}
                  >
                    <td><strong>#{req.id}</strong></td>
                    <td><strong>{req.clientName || 'Client'}</strong></td>
                    <td className="text-sm">{email}</td>
                    <td className="text-sm">{phone}</td>
                    <td><span className="badge-occasion">{req.occasionType || 'General'}</span></td>
                    <td>{req.bookingDate || req.createdAt?.split('T')[0] || '2026-08-10'}</td>
                    <td>{req.reelCount || 1} reels</td>
                    <td>
                      <span className={`status-pill status-${statusStr.toLowerCase().replace('_', '-')}`}>
                        {statusStr}
                      </span>
                    </td>
                    <td>{req.editorName || (req.editor ? req.editor.fullName : <span className="text-dim">Unassigned</span>)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setAssigningOrder(req)}
                      >
                        Assign Editor
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Portfolio</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Inline Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEditorApps.map((app) => {
                const statusStr = String(app.status || 'NEW').toUpperCase();
                return (
                  <tr
                    key={app.id}
                    className="table-row-clickable"
                    onClick={() => setSelectedItem({ ...app, _type: 'editor' })}
                  >
                    <td><strong>{app.name}</strong></td>
                    <td>{app.email}</td>
                    <td>{app.experienceLevel}</td>
                    <td>
                      <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="drawer-link" onClick={(e) => e.stopPropagation()}>
                        View Link
                      </a>
                    </td>
                    <td>{app.appliedDate || app.createdAt?.split('T')[0] || '2026-08-01'}</td>
                    <td>
                      <span className={`status-pill status-${statusStr.toLowerCase().replace('_', '-')}`}>
                        {statusStr}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions-group">
                        {statusStr !== 'APPROVED' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                            title="Approve Editor Application"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                        )}
                        {statusStr !== 'SHORTLISTED' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                          >
                            Shortlist
                          </button>
                        )}
                        {statusStr !== 'INTERVIEW_SCHEDULED' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleUpdateStatus(app.id, 'INTERVIEW_SCHEDULED')}
                          >
                            Interview
                          </button>
                        )}
                        {statusStr !== 'REJECTED' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm text-danger"
                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                            style={{ color: 'var(--rani)' }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-In Detail Drawer */}
      <RequestDetailDrawer
        item={selectedItem}
        type={selectedItem?._type}
        onClose={() => setSelectedItem(null)}
        onAssign={(ord) => { setSelectedItem(null); setAssigningOrder(ord); }}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Assign Editor Modal */}
      <AssignEditorModal
        order={assigningOrder}
        onClose={() => setAssigningOrder(null)}
        onAssignConfirmed={handleAssignConfirmed}
      />
    </div>
  );
}
