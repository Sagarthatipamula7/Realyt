import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/auth.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export default function ClientBookingsPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED'
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Review & Rating State
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState({});

  const currentUser = auth?.user;

  useEffect(() => {
    setLoading(true);
    const email = currentUser?.email || '';
    api
      .get('/orders/mine', { params: { email } })
      .then((res) => {
        const fetched = res.data || [];
        setOrders(fetched);
      })
      .catch((err) => {
        console.warn('Failed to fetch client orders:', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    if (activeTab === 'UPCOMING') return orders.filter((o) => o.status === 'PENDING' || o.status === 'DRAFT');
    if (activeTab === 'IN_PROGRESS') return orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED' || o.status === 'CONFIRMED');
    if (activeTab === 'COMPLETED') return orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED');
    return orders;
  }, [orders, activeTab]);

  const stats = useMemo(() => {
    const total = orders.length;
    const upcoming = orders.filter((o) => o.status === 'PENDING' || o.status === 'DRAFT').length;
    const inProgress = orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED' || o.status === 'CONFIRMED').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
    return { total, upcoming, inProgress, completed };
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return { label: 'Delivered', class: 'status-delivered', icon: '✓' };
      case 'CONFIRMED':
      case 'ASSIGNED':
        return { label: 'Booking Done & Editor Assigned', class: 'status-delivered', icon: '✓' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', class: 'status-progress', icon: '⏳' };
      case 'PENDING':
      case 'DRAFT':
      default:
        return { label: 'Matching Editor', class: 'status-pending', icon: '✦' };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return { day: '15', month: 'AUG', year: '2026', weekday: 'SAT', full: 'August 15, 2026' };
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    try {
      await api.post('/reviews', {
        orderId: selectedBooking.id,
        rating: ratingScore,
        comment: reviewComment,
        clientName: currentUser?.name || 'Client',
      });
    } catch {
      /* ignore */
    }
    setSubmittedReviews({
      ...submittedReviews,
      [selectedBooking.id]: { rating: ratingScore, comment: reviewComment }
    });
    toast.success(`Thank you! Your ${ratingScore}⭐ feedback for the editor has been submitted.`);
  };

  return (
    <div className="client-bookings-layout">
      {/* ── HEADER NAVBAR ── */}
      <header>
        <nav className="wrap">
          <Link to="/" className="logo">Real<em>yt</em></Link>
          <div className="nav-links">
            <Link to="/#how">How it works</Link>
            <Link to="/#occasions">Occasions</Link>
            <Link to="/#stories">Stories</Link>
            <Link to="/my-bookings" className="nav-link-active">My Bookings</Link>
          </div>
          <div className="nav-cta">
            {currentUser ? (
              <div className="user-nav-badge">
                <span className="user-badge-name">
                  <span className="user-avatar-initial">
                    {(currentUser.firstName || currentUser.name || 'U')[0].toUpperCase()}
                  </span>
                  {currentUser.firstName || currentUser.name || 'User'}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => {
                    auth?.logout();
                    navigate('/');
                  }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link to="/?login=true" className="btn btn-ghost">Sign in</Link>
            )}
            <Link to="/" className="btn btn-primary">Book new date</Link>
          </div>
        </nav>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="wrap my-bookings-main">
        {/* Hero Section */}
        <section className="bookings-hero">
          <div className="eyebrow">YOUR CELEBRATION HUB</div>
          <h1>My <i>Bookings</i> & Details</h1>
          <p className="sub">
            All your reserved celebration dates, occasion types, edit packages, and matched editor progress in one complete view.
          </p>
        </section>

        {/* Stats Grid */}
        <div className="my-bookings-stats-grid">
          <div className="mb-stat-card">
            <div className="mb-stat-val">{stats.total}</div>
            <div className="mb-stat-lbl">Total Bookings</div>
          </div>
          <div className="mb-stat-card">
            <div className="mb-stat-val">{stats.upcoming}</div>
            <div className="mb-stat-lbl">Upcoming Shoots</div>
          </div>
          <div className="mb-stat-card highlight-stat">
            <div className="mb-stat-val">{stats.inProgress}</div>
            <div className="mb-stat-lbl">In Progress</div>
          </div>
          <div className="mb-stat-card">
            <div className="mb-stat-val">{stats.completed}</div>
            <div className="mb-stat-lbl">Delivered Films</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="my-bookings-toolbar">
          <div className="my-bookings-tabs">
            <button
              type="button"
              className={`mb-tab ${activeTab === 'ALL' ? 'mb-tab-active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              All Orders ({stats.total})
            </button>
            <button
              type="button"
              className={`mb-tab ${activeTab === 'UPCOMING' ? 'mb-tab-active' : ''}`}
              onClick={() => setActiveTab('UPCOMING')}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              type="button"
              className={`mb-tab ${activeTab === 'IN_PROGRESS' ? 'mb-tab-active' : ''}`}
              onClick={() => setActiveTab('IN_PROGRESS')}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              type="button"
              className={`mb-tab ${activeTab === 'COMPLETED' ? 'mb-tab-active' : ''}`}
              onClick={() => setActiveTab('COMPLETED')}
            >
              Delivered ({stats.completed})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="mb-loading-state">
            <div className="mb-spinner" />
            <p>Loading your celebration bookings…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mb-empty-card">
            <div className="mb-empty-icon">🎬</div>
            <h3>No bookings found</h3>
            <p>You haven't reserved any celebration film dates yet.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '18px' }}>
              Book Your Date Now
            </Link>
          </div>
        ) : (
          <div className="my-bookings-list">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const d = formatDate(order.bookingDate);

              return (
                <div key={order.id} className="booking-card glow-card">
                  {/* Left Date Box */}
                  <div className="bc-date-box">
                    <span className="bc-month">{d.month}</span>
                    <span className="bc-day">{d.day}</span>
                    <span className="bc-year">{d.year}</span>
                    <span className="bc-weekday">{d.weekday}</span>
                  </div>

                  {/* Center Content & Details */}
                  <div className="bc-content">
                    <div className="bc-header-row">
                      <span className="bc-tag">🎉 {order.occasionType || 'Celebration'}</span>
                      <span className={`bc-status-pill ${badge.class}`}>
                        <i className="status-dot" /> {badge.label}
                      </span>
                    </div>

                    <h3 className="bc-title">{order.occasionType} Film Booking</h3>
                    <p className="bc-desc">{order.description || 'Custom highlight film edit package'}</p>

                    {/* Metadata Grid */}
                    <div className="bc-meta-row">
                      <div className="bc-meta-item">
                        <span className="meta-lbl">Shoot Date</span>
                        <span className="meta-val">{d.full}</span>
                      </div>
                      <div className="bc-meta-item">
                        <span className="meta-lbl">Reels Package</span>
                        <span className="meta-val">{order.reelCount || 1} Reel{order.reelCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="bc-meta-item">
                        <span className="meta-lbl">Price</span>
                        <span className="meta-val">₹{Number(order.price || (order.quotedAmount ? order.quotedAmount / 100 : 1200)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bc-meta-item">
                        <span className="meta-lbl">Booking Ref</span>
                        <span className="meta-val">#RLY-{order.id}</span>
                      </div>
                    </div>

                    {/* Matched Editor Bar */}
                    <div className="bc-editor-bar">
                      <div className="bc-editor-info">
                        <span className="ed-icon">✂️</span>
                        <div>
                          <span className="ed-label">Vetted Editor</span>
                          <span className="ed-name">
                            {order.editor ? order.editor.fullName || 'Assigned Editor' : 'Matching in progress…'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedBooking(order)}
                      >
                        View Full Details & Progress →
                      </button>
                    </div>

                    {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
                      <div style={{
                        marginTop: '14px',
                        padding: '12px 16px',
                        background: 'rgba(245, 158, 11, 0.14)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '0.86rem', color: '#FCD34D', fontWeight: 600 }}>
                          🎉 Reel Edit Completed! Leave rating feedback for your editor:
                        </span>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedBooking(order)}
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          ⭐ Leave Feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── DETAIL MODAL DRAWER ── */}
      {selectedBooking && (
        <div className="bk-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="bk-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="bk-header">
              <span className="bk-header-date">Booking Details #RLY-{selectedBooking.id}</span>
              <button
                className="bk-close"
                type="button"
                aria-label="Close"
                onClick={() => setSelectedBooking(null)}
              >
                ✕
              </button>
            </div>
            <div className="bk-body" style={{ padding: '24px 28px' }}>
              
              {/* Header Summary */}
              <div className="modal-booking-summary">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="bc-tag">🎉 {selectedBooking.occasionType}</span>
                  <span className={`bc-status-pill ${getStatusBadge(selectedBooking.status).class}`}>
                    {getStatusBadge(selectedBooking.status).label}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', marginTop: '10px', marginBottom: '4px' }}>
                  {selectedBooking.occasionType} Celebration Film
                </h2>
                <p className="modal-date-hdr">
                  📅 Reserved Shoot Date: <strong>{formatDate(selectedBooking.bookingDate).full}</strong>
                </p>
                {(selectedBooking.editor || selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'ASSIGNED') && (
                  <div className="modal-success-banner" style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#34D399',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    margin: '12px 0 16px',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}>
                    ✅ Booking done successfully! Vetted editor ({selectedBooking.editor?.fullName || 'Assigned Editor'}) has been assigned to your celebration.
                  </div>
                )}
              </div>

              {/* Comprehensive Booking Details Grid */}
              <div className="modal-details-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                background: 'rgba(255,255,255,0.03)',
                padding: '16px 20px',
                borderRadius: '16px',
                margin: '18px 0',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div>
                  <span className="meta-lbl">Occasion Type</span>
                  <div className="meta-val">{selectedBooking.occasionType}</div>
                </div>
                <div>
                  <span className="meta-lbl">Shoot Date</span>
                  <div className="meta-val">{selectedBooking.bookingDate}</div>
                </div>
                <div>
                  <span className="meta-lbl">Reels Included</span>
                  <div className="meta-val">{selectedBooking.reelCount || 1} Reel(s)</div>
                </div>
                <div>
                  <span className="meta-lbl">Total Cost</span>
                  <div className="meta-val">₹{Number(selectedBooking.price || (selectedBooking.quotedAmount ? selectedBooking.quotedAmount / 100 : 1200)).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="meta-lbl">Client Name</span>
                  <div className="meta-val">{selectedBooking.clientName || currentUser?.name || 'Client'}</div>
                </div>
                <div>
                  <span className="meta-lbl">Assigned Editor</span>
                  <div className="meta-val">{selectedBooking.editor ? selectedBooking.editor.fullName : 'Matching Editor'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="meta-lbl">Notes & Instructions</span>
                  <div className="meta-val" style={{ fontSize: '0.88rem', fontWeight: 400, marginTop: '4px', color: 'rgba(255,255,255,0.85)' }}>
                    {selectedBooking.description || 'No custom notes specified.'}
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="modal-stepper">
                <h4 className="stepper-title">FULFILLMENT TIMELINE</h4>
                <div className="stepper-track">
                  <div className="step-item step-done">
                    <div className="step-num">1</div>
                    <div className="step-info">
                      <span className="step-name">Booking Confirmed</span>
                      <span className="step-sub">Date & occasion package locked</span>
                    </div>
                  </div>
                  <div className={`step-item ${selectedBooking.editor ? 'step-done' : 'step-current'}`}>
                    <div className="step-num">2</div>
                    <div className="step-info">
                      <span className="step-name">Vetted Editor Assigned</span>
                      <span className="step-sub">{selectedBooking.editor ? `Assigned to ${selectedBooking.editor.fullName}` : 'Matching best video editor'}</span>
                    </div>
                  </div>
                  <div className={`step-item ${selectedBooking.status === 'IN_PROGRESS' || selectedBooking.status === 'CONFIRMED' ? 'step-current' : selectedBooking.status === 'COMPLETED' ? 'step-done' : ''}`}>
                    <div className="step-num">3</div>
                    <div className="step-info">
                      <span className="step-name">Edit & Sound Mix</span>
                      <span className="step-sub">Raw footage cut, color graded & music mixed</span>
                    </div>
                  </div>
                  <div className={`step-item ${selectedBooking.status === 'COMPLETED' || selectedBooking.status === 'DELIVERED' ? 'step-done' : ''}`}>
                    <div className="step-num">4</div>
                    <div className="step-info">
                      <span className="step-name">Final Reels Delivered</span>
                      <span className="step-sub">Download high-res 4K reels</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post-Delivery Rating & Review Feedback Section */}
              {(selectedBooking.status === 'COMPLETED' || selectedBooking.status === 'DELIVERED' || submittedReviews[selectedBooking.id]) && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginTop: '24px'
                }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#FCD34D' }}>
                    ⭐ Rate Your Editor & Leave Feedback
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#CBD5E1', margin: '0 0 14px' }}>
                    How was your completed reel edit? Your review helps compute the editor's overall rating score.
                  </p>

                  {submittedReviews[selectedBooking.id] ? (
                    <div style={{ background: '#0F172A', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F59E0B', marginBottom: '4px' }}>
                        {'⭐'.repeat(submittedReviews[selectedBooking.id].rating)} ({submittedReviews[selectedBooking.id].rating} / 5 Stars)
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#E2E8F0', margin: 0, fontStyle: 'italic' }}>
                        "{submittedReviews[selectedBooking.id].comment || 'Incredible editing job!'}"
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingScore(star)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '1.6rem',
                              cursor: 'pointer',
                              filter: star <= ratingScore ? 'drop-shadow(0 0 6px #F59E0B)' : 'grayscale(100%) opacity(40%)'
                            }}
                          >
                            ⭐
                          </button>
                        ))}
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F59E0B', alignSelf: 'center', marginLeft: '8px' }}>
                          {ratingScore} / 5 Stars
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Write your feedback comment for the editor..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#0F172A',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          color: '#FFF',
                          fontSize: '0.86rem',
                          outline: 'none',
                          marginBottom: '12px'
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleSubmitReview}
                      >
                        Submit Editor Feedback & Rating
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-actions" style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    alert('Footage upload instructions will be emailed prior to your shoot date.');
                  }}
                >
                  Upload Raw Footage
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
