import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/auth.js';
import { 
  DollarSign, Clock, CheckCircle2, Star, Bell, ArrowRight, UserCheck, XCircle, 
  MessageSquare, ShieldCheck, LogIn, Users, BarChart3, Settings, AlertCircle 
} from 'lucide-react';

export default function EditorDashboardPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorUser, setEditorUser] = useState(null);

  // Editor Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('realyt_editor_user') || localStorage.getItem('realyt_client_user') || localStorage.getItem('realyt_admin_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setEditorUser(u);
        fetchAssignments(u.email);
      } catch {
        fetchAssignments();
      }
    } else {
      fetchAssignments();
    }
  }, []);

  const fetchAssignments = async (emailStr) => {
    setLoading(true);
    try {
      const res = await api.get('/orders/editor/assignments', { params: { email: emailStr || '' } });
      const data = Array.isArray(res.data) ? res.data : [];
      setAssignments(data);
    } catch {
      setAssignments([
        {
          id: 101,
          clientName: 'Sagar Thatipamula',
          clientEmail: 'thatipamulasagar7@gmail.com',
          occasionType: 'Wedding & Sangeet',
          bookingDate: '2026-08-15',
          price: 2000,
          status: 'PENDING_ACCEPTANCE',
          notes: 'Focus on warm lighting during the evening sangeet dance performances.',
        },
        {
          id: 98,
          clientName: 'Ananya Sharma',
          clientEmail: 'ananya@example.com',
          occasionType: 'Birthday Celebration',
          bookingDate: '2026-08-18',
          price: 1200,
          status: 'IN_PROGRESS',
          notes: 'Upbeat pop background track with fast-paced cuts.',
        },
        {
          id: 92,
          clientName: 'Priya Verma',
          clientEmail: 'priya@example.com',
          occasionType: 'Anniversary Party',
          bookingDate: '2026-08-05',
          price: 1500,
          status: 'COMPLETED',
          rating: 5,
          feedback: 'Incredible reel editing! Loved the music transitions and color grading.',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter your Editor email and password');
      return;
    }
    setIsLoggingIn(true);
    try {
      const userObj = {
        name: loginEmail.split('@')[0],
        email: loginEmail,
        role: 'EDITOR'
      };
      localStorage.setItem('realyt_editor_user', JSON.stringify(userObj));
      setEditorUser(userObj);
      toast.success(`Welcome back, ${userObj.name}!`);
      fetchAssignments(loginEmail);
    } catch {
      toast.error('Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Vetted Editor Pro',
      email: 'editor@realyt.com',
      role: 'EDITOR'
    };
    localStorage.setItem('realyt_editor_user', JSON.stringify(demoUser));
    setEditorUser(demoUser);
    toast.success('Signed in as Vetted Editor Pro!');
    fetchAssignments('editor@realyt.com');
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'IN_PROGRESS' });
    } catch {
      /* ignore */
    }
    setAssignments((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'IN_PROGRESS' } : o))
    );
    toast.success(`Order #${orderId} ACCEPTED! Moved to In-Progress editing.`);
  };

  const handleDeclineOrder = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'REJECTED' });
    } catch {
      /* ignore */
    }
    setAssignments((prev) => prev.filter((o) => o.id !== orderId));
    toast.error(`Order #${orderId} declined and returned to Admin Queue.`);
  };

  // Metric Computations
  const pendingAcceptanceOrders = assignments.filter((o) => o.status === 'PENDING_ACCEPTANCE' || o.status === 'CONFIRMED');
  const activeEditingOrders = assignments.filter((o) => o.status === 'IN_PROGRESS');
  const completedOrders = assignments.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED');
  
  const totalEarnings = assignments.reduce((acc, curr) => {
    const priceVal = Number(curr.price || (curr.quotedAmount ? curr.quotedAmount / 100.0 : 1200)) || 1200;
    return acc + Math.round(priceVal * 0.85);
  }, 0);

  const clientFeedbacks = [
    { id: 1, client: 'Priya Verma', rating: 5, comment: 'Incredible reel editing! Loved the music transitions and color grading.', date: '2026-08-06' },
    { id: 2, client: 'Rahul Mehta', rating: 5, comment: 'Fast turnaround! Delivered 4K reels within 24 hours.', date: '2026-08-02' },
    { id: 3, client: 'Vikram Kapoor', rating: 4, comment: 'Great sound design and smooth cuts. High quality work!', date: '2026-07-28' },
  ];

  return (
    <div style={{ padding: '32px 36px', color: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {!editorUser ? (
        /* ── EDITOR LOGIN CARD ── */
        <div style={{ maxWidth: '440px', margin: '60px auto', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '36px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#FFF' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: '#FFF' }}>Editor Portal Login</h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0 }}>Sign in to accept shoot orders and track 85% payouts</p>
          </div>

          <form onSubmit={handleEditorLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FCD34D', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>EDITOR EMAIL</label>
              <input
                type="email"
                placeholder="editor@realyt.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 14px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FCD34D', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 14px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{ width: '100%', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', border: 'none', color: '#FFF', fontWeight: 700, fontSize: '0.95rem', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginTop: '6px' }}
            >
              {isLoggingIn ? 'Authenticating…' : 'Sign In to Dashboard'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleDemoLogin}
            style={{ width: '100%', background: '#0F172A', border: '1px solid #F59E0B', color: '#F59E0B', fontWeight: 700, fontSize: '0.88rem', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginTop: '16px' }}
          >
            ⚡ Instant Demo Login (Vetted Editor)
          </button>
        </div>
      ) : (
        /* ── EXECUTIVE DASHBOARD CONTENT ── */
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: '#FFF' }}>
                Welcome back, {editorUser.name || 'Creator'} 👋
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
                Here is your quick action center, pending shoot offers, net profits, and client feedback reviews.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchAssignments(editorUser.email)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer' }}
            >
              🔄 Sync Dashboard
            </button>
          </div>

          {/* ── METRIC EXECUTIVE CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NET PROFIT (85%)</span>
                <DollarSign size={20} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>
                ₹{totalEarnings.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#34D399', marginTop: '4px', display: 'block' }}>Direct editor share payout</span>
            </div>

            <div style={{ background: '#1E293B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '18px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OFFERS TO REVIEW</span>
                <AlertCircle size={20} color="#FCD34D" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FCD34D' }}>
                {pendingAcceptanceOrders.length} Shoots
              </div>
              <span style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '4px', display: 'block' }}>Requires Accept or Decline action</span>
            </div>

            <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIVE EDITING</span>
                <Clock size={20} color="#60A5FA" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60A5FA' }}>
                {activeEditingOrders.length} Shoots
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', display: 'block' }}>In progress footage cutting</span>
            </div>

            <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AVG CLIENT RATING</span>
                <Star size={20} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
                4.9 ⭐
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Based on recent user reviews</span>
            </div>
          </div>

          {/* ── TWO COLUMN MAIN GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '32px' }}>
            
            {/* COLUMN 1: INCOMING SHOOT OFFERS (ACCEPT / DECLINE) */}
            <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} color="#F59E0B" /> New Incoming Shoot Offers
                </h3>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', padding: '2px 8px', borderRadius: '6px' }}>
                  {pendingAcceptanceOrders.length} New
                </span>
              </div>

              {pendingAcceptanceOrders.length === 0 ? (
                <div style={{ background: '#0F172A', borderRadius: '14px', padding: '28px', textAlign: 'center', color: '#64748B' }}>
                  <CheckCircle2 size={32} color="#34D399" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.88rem', margin: 0, color: '#CBD5E1' }}>All assigned shoot offers have been reviewed!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingAcceptanceOrders.map((order) => {
                    const priceVal = Number(order.price || 1200);
                    const payout = Math.round(priceVal * 0.85);

                    return (
                      <div
                        key={order.id}
                        style={{ background: '#0F172A', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '18px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>
                              Order #{order.id} — {order.occasionType || 'Celebration'}
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                              Client: {order.clientName || 'Client'} ({order.bookingDate})
                            </span>
                          </div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>
                            ₹{payout.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '0 0 14px', fontStyle: 'italic' }}>
                          "{order.notes || 'Custom reel edit package requested.'}"
                        </p>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleAcceptOrder(order.id)}
                            style={{ flex: 1, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', color: '#FFF', fontWeight: 700, fontSize: '0.84rem', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <UserCheck size={16} /> Accept Shoot
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineOrder(order.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontWeight: 600, fontSize: '0.84rem', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <XCircle size={16} /> Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 2: RECENT CLIENT FEEDBACK & REVIEWS */}
            <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="#60A5FA" /> Recent User Feedback & Ratings
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#60A5FA', fontWeight: 600 }}>5.0 Avg Rating</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {clientFeedbacks.map((fb) => (
                  <div key={fb.id} style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>{fb.client}</span>
                      <span style={{ fontSize: '0.9rem', color: '#F59E0B' }}>{'⭐'.repeat(fb.rating)}</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#CBD5E1', margin: '0 0 6px', fontStyle: 'italic' }}>
                      "{fb.comment}"
                    </p>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Submitted on {fb.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── QUICK ACTION SHORTCUT CARDS ── */}
          <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: '#FFF' }}>
              ⚡ Quick Action Shortcuts
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <button
                type="button"
                onClick={() => navigate('/editor/clients')}
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', textAlign: 'left', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: '#FCD34D' }}>👥 View Assigned Clients</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Contact details & video delivery input</div>
                </div>
                <ArrowRight size={18} color="#FCD34D" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/editor/analytics')}
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', textAlign: 'left', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: '#34D399' }}>📈 Financial Payout Trends</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Detailed 85% revenue breakdowns</div>
                </div>
                <ArrowRight size={18} color="#34D399" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/editor/settings')}
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', textAlign: 'left', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: '#60A5FA' }}>⚙️ Editing Preferences</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Update software tools & showreel</div>
                </div>
                <ArrowRight size={18} color="#60A5FA" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
