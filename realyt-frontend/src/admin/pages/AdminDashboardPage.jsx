import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader.jsx';
import Toast from '../../components/Toast.jsx';
import {
  fetchAdminDashboardStats,
  fetchAnalyticsData,
  fetchCustomerRequests,
  fetchPayments,
  fetchEditorsRoster,
  fetchNotifications,
  assignEditorToOrder,
  markNotificationRead,
  markAllNotificationsRead
} from '../api/adminApi.js';
import {
  CalendarCheck2,
  DollarSign,
  Activity,
  Wallet,
  UserPlus,
  Users,
  TrendingUp,
  PieChart as PieIcon,
  Sparkles,
  RefreshCw,
  CalendarDays,
  Gauge,
  Clock,
  Layers,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Inbox,
  CreditCard,
  CheckCircle2,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CHART_COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const STATUS_META = {
  PENDING: { label: 'Pending', tone: 'amber' },
  DRAFT: { label: 'Draft', tone: 'slate' },
  CONFIRMED: { label: 'Assigned', tone: 'blue' },
  IN_PROGRESS: { label: 'In progress', tone: 'violet' },
  COMPLETED: { label: 'Delivered', tone: 'emerald' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
};

const fmtMoney = (v) =>
  `$${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const initials = (name) =>
  String(name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

function timeAgo(iso) {
  if (!iso) return 'recently';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`saa-panel ${className}`}>
      <div className="saa-panel-head">
        <div>
          <h3 className="saa-panel-title">{title}</h3>
          {subtitle && <span className="saa-panel-sub">{subtitle}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, tone, delta, deltaDir = 'up' }) {
  return (
    <div className={`saa-kpi saa-kpi-${tone}`}>
      <div className="saa-kpi-top">
        <span className="saa-kpi-label">{label}</span>
        <span className="saa-kpi-icon"><Icon size={17} /></span>
      </div>
      <div className="saa-kpi-value">{value}</div>
      <div className="saa-kpi-bottom">
        {delta && (
          <span className={`saa-kpi-delta delta-${deltaDir}`}>
            {deltaDir === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {delta}
          </span>
        )}
        <span className="saa-kpi-sub">{sub}</span>
      </div>
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`saa-skeleton ${className}`} />;
}


function RevenueOrdersChart({ analytics }) {
  const data = useMemo(() => {
    const rev = analytics?.revenueTrend || [];
    const vol = analytics?.orderVolume || [];
    return vol.map((m, i) => ({
      month: m.month,
      orders: m.orders || 0,
      revenue: rev[i]?.revenue ?? 0,
    }));
  }, [analytics]);

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="saaRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
          <YAxis yAxisId="rev" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <YAxis yAxisId="ord" orientation="right" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, color: '#E2E8F0', fontSize: 13 }}
            labelStyle={{ color: '#94A3B8' }}
          />
          <Bar yAxisId="ord" dataKey="orders" name="Orders" fill="#1E3A5F" radius={[5, 5, 0, 0]} barSize={22} />
          <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#saaRev)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function OccasionMixChart({ analytics }) {
  const data = analytics?.occasionBreakdown || [];
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);

  return (
    <div className="saa-donut-wrap">
      <div style={{ width: 190, height: 190, position: 'relative', flexShrink: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, color: '#E2E8F0', fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="saa-donut-center">
          <strong>{total}</strong>
          <span>orders</span>
        </div>
      </div>
      <div className="saa-donut-legend">
        {data.map((d, i) => (
          <div className="saa-donut-row" key={d.name}>
            <span className="saa-donut-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="saa-donut-name">{d.name}</span>
            <span className="saa-donut-val">{d.value}</span>
            <span className="saa-donut-pct">
              {total ? Math.round((Number(d.value) / total) * 100) : 0}%
            </span>
          </div>
        ))}
        {!data.length && <div className="saa-empty-inline">No occasion data yet</div>}
      </div>
    </div>
  );
}

function Ring({ value, size = 150, stroke = 11, color = '#3B82F6', track = '#1E293B' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="saa-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function OpsHealth({ stats, analytics }) {
  const utilization = analytics?.editorUtilizationPct ?? stats?.editorUtilizationPct ?? 0;
  const fulfillment = analytics?.fulfillmentRate ?? 0;
  const turnaround = analytics?.avgTurnaroundDays ?? 0;
  const slots = analytics?.totalSlotsToday ?? stats?.availableSlots ?? 0;
  const openSlots = analytics?.availableSlotsToday ?? stats?.availableSlots ?? 0;

  return (
    <div className="saa-ops">
      <div className="saa-ops-ring">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Ring value={utilization} color="#3B82F6" />
          <div className="saa-ring-center">
            <strong>{utilization}%</strong>
            <span>utilized</span>
          </div>
        </div>
      </div>
      <div className="saa-ops-metrics">
        <div className="saa-ops-item">
          <span className="saa-ops-ic tone-emerald"><CheckCircle2 size={15} /></span>
          <div>
            <strong>{fulfillment}%</strong>
            <span>Fulfillment rate</span>
          </div>
        </div>
        <div className="saa-ops-item">
          <span className="saa-ops-ic tone-blue"><Clock size={15} /></span>
          <div>
            <strong>{turnaround}d</strong>
            <span>Avg turnaround</span>
          </div>
        </div>
        <div className="saa-ops-item">
          <span className="saa-ops-ic tone-violet"><CalendarDays size={15} /></span>
          <div>
            <strong>{openSlots}/{slots}</strong>
            <span>Slots open today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ order, editors, onAssign }) {
  const [edId, setEdId] = useState('');
  const [busy, setBusy] = useState(false);
  const meta = STATUS_META[order.status] || { label: order.status, tone: 'slate' };
  const editorName =
    order.editorName ||
    order.editor?.fullName ||
    (order.editor ? `Editor #${order.editor.id}` : null);

  const submit = async () => {
    if (!edId || busy) return;
    setBusy(true);
    await onAssign(order.id, edId);
    setBusy(false);
    setEdId('');
  };

  return (
    <div className="saa-kanban-card">
      <div className="saa-kanban-card-top">
        <span className="saa-order-id">#{order.id}</span>
        <span className={`saa-pill pill-${meta.tone}`}>{meta.label}</span>
      </div>
      <div className="saa-kanban-client">
        <span className="saa-kanban-avatar">{initials(order.clientName)}</span>
        <span className="saa-kanban-name">{order.clientName}</span>
      </div>
      <div className="saa-kanban-meta">
        <span className="badge-occasion">{order.occasionType || 'Occasion'}</span>
        <span>{order.reelCount || 1} reels</span>
        <span>{order.bookingDate ? String(order.bookingDate).slice(0, 10) : '—'}</span>
      </div>
      {editorName && (
        <div className="saa-kanban-editor">
          <UserCheck size={13} /> {editorName}
        </div>
      )}
      {order.status === 'PENDING' && (
        <div className="saa-kanban-assign">
          <select className="saa-mini-select" value={edId} onChange={(e) => setEdId(e.target.value)}>
            <option value="">Assign editor…</option>
            {(editors || []).map((ed) => (
              <option key={ed.id} value={ed.id}>{ed.name}</option>
            ))}
          </select>
          <button type="button" className="saa-mini-btn" disabled={!edId || busy} onClick={submit}>
            {busy ? '…' : 'Go'}
          </button>
        </div>
      )}
    </div>
  );
}

const KANBAN_COLUMNS = [
  { status: 'PENDING', title: 'New', tone: 'amber', icon: Inbox, includes: ['PENDING', 'DRAFT'] },
  { status: 'CONFIRMED', title: 'Assigned', tone: 'blue', icon: UserCheck, includes: ['CONFIRMED'] },
  { status: 'IN_PROGRESS', title: 'In progress', tone: 'violet', icon: Activity, includes: ['IN_PROGRESS'] },
  { status: 'COMPLETED', title: 'Delivered', tone: 'emerald', icon: CheckCircle2, includes: ['COMPLETED'] },
];

function KanbanBoard({ orders, editors, onAssign, onToast }) {
  return (
    <div className="saa-kanban">
      {KANBAN_COLUMNS.map((col) => {
        const ColIcon = col.icon;
        const items = orders.filter((o) => col.includes.includes(o.status));
        return (
          <div className="saa-kanban-col" key={col.status}>
            <div className="saa-kanban-col-head">
              <span className={`saa-kanban-dot tone-${col.tone}`}><ColIcon size={13} /></span>
              <span className="saa-kanban-col-title">{col.title}</span>
              <span className="saa-kanban-count">{items.length}</span>
            </div>
            <div className="saa-kanban-list">
              {items.map((order) => (
                <KanbanCard key={order.id} order={order} editors={editors} onAssign={onAssign} />
              ))}
              {!items.length && <div className="saa-kanban-empty">No orders</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}


const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOWS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function MiniCalendar({ orders }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(`${year}-${String(month + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);

  const bookingsByDate = useMemo(() => {
    const map = {};
    (orders || []).forEach((o) => {
      const key = String(o.bookingDate || '').slice(0, 10);
      if (key) (map[key] = map[key] || []).push(o);
    });
    return map;
  }, [orders]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = Array.from({ length: startOffset }, () => null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      arr.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return arr;
  }, [year, month]);

  const selectedBookings = bookingsByDate[selected] || [];

  const prev = () => { const d = new Date(year, month - 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };
  const next = () => { const d = new Date(year, month + 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); };

  return (
    <div>
      <div className="saa-cal-head">
        <button type="button" className="saa-cal-nav" onClick={prev}>‹</button>
        <span className="saa-cal-title">{MONTHS[month]} {year}</span>
        <button type="button" className="saa-cal-nav" onClick={next}>›</button>
      </div>
      <div className="saa-cal-grid">
        {DOWS.map((d, i) => <span className="saa-cal-dow" key={i}>{d}</span>)}
        {cells.map((date, i) => {
          if (!date) return <span className="saa-cal-cell empty" key={i} />;
          const day = Number(date.slice(8, 10));
          const has = !!bookingsByDate[date];
          const isSel = date === selected;
          const isToday = date === `${year}-${String(month + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          return (
            <button
              type="button"
              key={i}
              className={`saa-cal-cell ${isSel ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => setSelected(date)}
            >
              {day}
              {has && <i className="saa-cal-dot" />}
            </button>
          );
        })}
      </div>
      <div className="saa-cal-events">
        <div className="saa-cal-events-head">
          <strong>{selectedBookings.length ? `${selectedBookings.length} booking${selectedBookings.length > 1 ? 's' : ''}` : 'No bookings'}</strong>
          <span className="saa-cal-events-date">{selected}</span>
        </div>
        {selectedBookings.map((b) => (
          <div className="saa-cal-event" key={b.id}>
            <span className="saa-cal-event-avatar">{initials(b.clientName)}</span>
            <div className="saa-cal-event-meta">
              <strong>{b.clientName}</strong>
              <span>{b.occasionType} · {b.reelCount || 1} reels</span>
            </div>
            <span className={`saa-pill pill-${(STATUS_META[b.status] || {}).tone || 'slate'}`}>
              {(STATUS_META[b.status] || { label: b.status }).label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


function NotificationsPanel({ notifs, onMarkRead, onMarkAll }) {
  return (
    <div>
      <div className="saa-notif-head">
        <span className="saa-notif-unread">{notifs.unreadCount} unread</span>
        <button type="button" className="saa-link-btn" onClick={onMarkAll}>
          <CheckCheck size={13} /> Mark all read
        </button>
      </div>
      <div className="saa-notif-list">
        {notifs.items.length === 0 && <div className="saa-empty-inline">No notifications</div>}
        {notifs.items.slice(0, 7).map((n) => (
          <button
            type="button"
            key={n.id}
            className={`saa-notif-item ${n.read ? 'read' : ''}`}
            onClick={() => onMarkRead(n.id)}
          >
            <span className="saa-notif-title">
              {!n.read && <i className="saa-bell-unread" />}
              <strong>{n.title}</strong>
            </span>
            <span className="saa-notif-body">{n.body}</span>
            <span className="saa-notif-time">{timeAgo(n.createdAt)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ stats, onNavigate }) {
  const actions = [
    { label: 'New booking', icon: Plus, path: '/app/admin/requests', tone: 'blue', hint: 'Create order' },
    { label: 'Assign editors', icon: UserCheck, path: '/app/admin/requests', tone: 'violet', hint: `${stats?.openRequests || 0} unassigned` },
    { label: 'Review applications', icon: UserPlus, path: '/app/admin/applications', tone: 'amber', hint: `${stats?.pendingApplications || 0} pending` },
    { label: 'Release payouts', icon: Wallet, path: '/app/admin/payments', tone: 'emerald', hint: 'Escrow' },
  ];
  return (
    <div className="saa-qa-grid">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button key={a.label} type="button" className={`saa-qa-btn tone-${a.tone}`} onClick={() => onNavigate(a.path)}>
            <span className="saa-qa-icon"><Icon size={16} /></span>
            <span className="saa-qa-label">{a.label}</span>
            <span className="saa-qa-hint">{a.hint}</span>
          </button>
        );
      })}
    </div>
  );
}


function AiInsights({ stats, analytics, orders }) {
  const [spin, setSpin] = useState(false);
  const insights = useMemo(() => {
    const list = [];
    const util = analytics?.editorUtilizationPct ?? stats?.editorUtilizationPct ?? 0;
    const pending = stats?.openRequests ?? 0;
    const apps = stats?.pendingApplications ?? 0;
    const avg = analytics?.avgTurnaroundDays ?? 0;
    const occ = analytics?.occasionBreakdown?.[0];

    if (pending > 0) list.push({ tone: 'amber', icon: Inbox, text: `${pending} open bookings are waiting for editor assignment — assigning now protects the lead-to-revenue window.` });
    if (util >= 85) list.push({ tone: 'red', icon: Activity, text: `Editor utilization is at ${util}% — capacity is saturated. Consider activating more editors this week.` });
    else if (util > 55) list.push({ tone: 'blue', icon: Activity, text: `Editor utilization sits at ${util}% — healthy headroom to onboard more bookings.` });
    else list.push({ tone: 'emerald', icon: Gauge, text: `Editor utilization is at ${util}% — plenty of open capacity to scale bookings without new hires.` });
    if (apps > 0) list.push({ tone: 'violet', icon: UserPlus, text: `${apps} editor applications are pending review. Fast-tracking strong candidates strengthens pipeline resilience.` });
    if (occ) list.push({ tone: 'cyan', icon: PieIcon, text: `“${occ.name}” is your top occasion type with ${occ.value} orders — a strong marketing angle for the next campaign.` });
    if (avg > 0) list.push({ tone: 'slate', icon: Clock, text: `Average turnaround is ${avg} days. Holding it under 3 days is correlated with repeat bookings.` });
    if (!list.length) list.push({ tone: 'slate', icon: Sparkles, text: 'Not enough operational data yet — insights will appear as bookings, assignments and payouts flow in.' });
    return list;
  }, [stats, analytics, orders]);

  return (
    <div className="saa-ai">
      <div className="saa-ai-head">
        <span className="saa-ai-badge"><Sparkles size={13} /> AI Insights</span>
        <button
          type="button"
          className="saa-link-btn"
          onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 600); }}
          aria-label="Refresh insights"
        >
          <RefreshCw size={13} className={spin ? 'saa-spin' : ''} /> Refresh
        </button>
      </div>
      <div className="saa-ai-list">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <div className="saa-ai-item" key={i}>
              <span className={`saa-ops-ic tone-${ins.tone}`}><Icon size={14} /></span>
              <p>{ins.text}</p>
            </div>
          );
        })}
      </div>
      <div className="saa-ai-foot">Generated from live operational data · refreshes automatically</div>
    </div>
  );
}

function RecentOrdersTable({ orders, onViewAll }) {
  const rows = (orders || []).slice(0, 7);
  return (
    <div className="saa-table-scroll">
      <table className="saa-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Client</th>
            <th>Occasion</th>
            <th>Reels</th>
            <th>Booking</th>
            <th>Editor</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const meta = STATUS_META[o.status] || { label: o.status, tone: 'slate' };
            const editorName = o.editorName || o.editor?.fullName || (o.editor ? `Editor #${o.editor.id}` : '—');
            return (
              <tr key={o.id} onClick={onViewAll} className="saa-table-row">
                <td><span className="saa-order-id">#{o.id}</span></td>
                <td>
                  <div className="saa-user-cell">
                    <span className="saa-table-avatar">{initials(o.clientName)}</span>
                    <span>{o.clientName}</span>
                  </div>
                </td>
                <td><span className="badge-occasion">{o.occasionType || '—'}</span></td>
                <td>{o.reelCount || 1}</td>
                <td>{o.bookingDate ? String(o.bookingDate).slice(0, 10) : '—'}</td>
                <td>{editorName}</td>
                <td><span className={`saa-pill pill-${meta.tone}`}>{meta.label}</span></td>
                <td>{o.price ? fmtMoney(o.price) : '—'}</td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr><td colSpan={8}><div className="saa-empty-inline">No orders yet</div></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editors, setEditors] = useState([]);
  const [notifs, setNotifs] = useState({ items: [], unreadCount: 0 });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchAdminDashboardStats().then((d) => mounted && setStats(d));
    fetchAnalyticsData().then((d) => mounted && setAnalytics(d));
    fetchCustomerRequests().then((d) => mounted && setOrders(Array.isArray(d) ? d : []));
    fetchEditorsRoster().then((d) => mounted && setEditors(Array.isArray(d) ? d : []));
    fetchNotifications().then((d) => mounted && setNotifs(d || { items: [], unreadCount: 0 }));
    return () => { mounted = false; };
  }, []);

  const handleAssign = async (orderId, editorId) => {
    await assignEditorToOrder(orderId, editorId);
    const ed = editors.find((e) => String(e.id) === String(editorId));
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'CONFIRMED', editorName: ed ? ed.name : `Editor #${editorId}` }
          : o
      )
    );
    setToast({ message: `Order #${orderId} assigned to ${ed ? ed.name : 'editor'}`, type: 'success' });
    fetchNotifications().then(setNotifs);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifs((prev) => ({
      unreadCount: Math.max(0, prev.unreadCount - 1),
      items: prev.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifs((prev) => ({ unreadCount: 0, items: prev.items.map((n) => ({ ...n, read: true })) }));
  };

  const dateLine = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const headerActions = (
    <>
      <button type="button" className="saa-btn btn-ghost" onClick={() => navigate('/app/admin/requests')}>
        <ExternalLink size={15} /> View requests
      </button>
      <button type="button" className="saa-btn btn-primary" onClick={() => navigate('/app/admin/requests')}>
        <Plus size={15} /> New booking
      </button>
    </>
  );

  return (
    <div className="saa-dashboard">
      <AdminHeader title="Overview" subtitle={dateLine} actions={headerActions} />

      {/* KPI ROW */}
      <div className="saa-kpi-grid">
        {stats ? (
          <>
            <KpiCard label="Total Bookings" value={stats.totalBookings ?? 0} sub={`${stats.completedBookings ?? 0} delivered`} icon={CalendarCheck2} tone="blue" delta={`${stats.inProgress ?? 0} in progress`} deltaDir="up" />
            <KpiCard label="Gross Revenue" value={fmtMoney(stats.gmv)} sub={`${fmtMoney(stats.platformCommission)} platform fee`} icon={DollarSign} tone="emerald" delta={`avg ${fmtMoney(stats.avgOrderValue)}`} deltaDir="up" />
            <KpiCard label="Editor Utilization" value={`${stats.editorUtilizationPct ?? 0}%`} sub={`${stats.activeEditors ?? 0}/${stats.totalEditors ?? 0} active`} icon={Gauge} tone="violet" delta="live" deltaDir="up" />
            <KpiCard label="Editor Payouts" value={fmtMoney(stats.editorPayouts)} sub="processed via Stripe" icon={Wallet} tone="cyan" delta={fmtMoney(stats.platformCommission)} deltaDir="up" />
            <KpiCard label="Recruitment" value={stats.pendingApplications ?? 0} sub={`${stats.totalApplications ?? 0} total applications`} icon={UserPlus} tone="amber" delta="pending review" deltaDir="up" />
            <KpiCard label="Customers" value={stats.customers ?? 0} sub="registered clients" icon={Users} tone="pink" delta={`${stats.newApplications ?? 0} new`} deltaDir="up" />
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="saa-skeleton-kpi" />)
        )}
      </div>

      {/* CHARTS ROW */}
      <div className="saa-charts">
        <Panel
          title="Revenue & Orders Trend"
          subtitle="Monthly gross revenue vs. order volume"
          className="saa-panel-wide"
          action={<span className="saa-chart-legend"><i className="tone-blue" />Revenue <i className="tone-slate" />Orders</span>}
        >
          {analytics ? <RevenueOrdersChart analytics={analytics} /> : <Skeleton className="saa-skeleton-chart" />}
        </Panel>
        <Panel title="Occasion Mix" subtitle="Share of orders by type">
          {analytics ? <OccasionMixChart analytics={analytics} /> : <Skeleton className="saa-skeleton-chart" />}
        </Panel>
        <Panel title="Operations Health" subtitle="Capacity, fulfillment & turnaround">
          <OpsHealth stats={stats} analytics={analytics} />
        </Panel>
      </div>


      {/* MAIN + RAIL */}
      <div className="saa-two-col">
        <div className="saa-col-main">
          <Panel
            title="Order Pipeline"
            subtitle="Kanban view of live orders"
            action={<span className="saa-panel-chip">{orders.filter((o) => o.status !== 'COMPLETED').length} active</span>}
          >
            <KanbanBoard orders={orders} editors={editors} onAssign={handleAssign} onToast={setToast} />
          </Panel>

          <Panel
            title="Recent Orders"
            subtitle="Latest bookings across the platform"
            action={
              <button type="button" className="saa-link-btn" onClick={() => navigate('/app/admin/requests')}>
                View all <ExternalLink size={12} />
              </button>
            }
          >
            <RecentOrdersTable orders={orders} onViewAll={() => navigate('/app/admin/requests')} />
          </Panel>
        </div>

        <div className="saa-col-rail">
          <Panel title="Schedule" subtitle="Live booking calendar">
            <MiniCalendar orders={orders} />
          </Panel>

          <Panel title="Notifications" action={<span className="saa-live-dot" />}>
            <NotificationsPanel notifs={notifs} onMarkRead={handleMarkRead} onMarkAll={handleMarkAll} />
          </Panel>

          <Panel title="Quick Actions" subtitle="Common operational shortcuts">
            <QuickActions stats={stats} onNavigate={navigate} />
          </Panel>

          <AiInsights stats={stats} analytics={analytics} orders={orders} />
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

