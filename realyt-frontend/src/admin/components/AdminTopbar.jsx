import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  LayoutDashboard,
  Inbox,
  Users,
  CreditCard,
  UserPlus,
  BarChart3,
  CheckCheck
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../api/adminApi.js';

const DESTINATIONS = [
  { path: '/app/admin/dashboard', label: 'Dashboard', keywords: 'home overview stats', icon: LayoutDashboard },
  { path: '/app/admin/requests', label: 'Requests', keywords: 'orders bookings queue', icon: Inbox },
  { path: '/app/admin/applications', label: 'Applications', keywords: 'editor applications recruit', icon: UserPlus },
  { path: '/app/admin/editors', label: 'Editors', keywords: 'roster talent team', icon: Users },
  { path: '/app/admin/payments', label: 'Payments', keywords: 'payouts finance revenue', icon: CreditCard },
  { path: '/app/admin/analytics', label: 'Analytics', keywords: 'reports insights charts', icon: BarChart3 },
  { path: '/app/admin/settings', label: 'Settings', keywords: 'config preferences', icon: Settings },
];

const CATEGORY_ICONS = {
  booking: { icon: Inbox, tone: 'blue' },
  assignment: { icon: Users, tone: 'violet' },
  payout: { icon: CreditCard, tone: 'emerald' },
  application: { icon: UserPlus, tone: 'amber' },
  system: { icon: Settings, tone: 'slate' },
};

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

export default function AdminTopbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifs, setNotifs] = useState({ items: [], unreadCount: 0 });
  const [showBell, setShowBell] = useState(false);
  const bellRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchNotifications().then(setNotifs);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = query.trim()
    ? DESTINATIONS.filter((d) =>
        `${d.label} ${d.keywords}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  const openResult = (path) => {
    navigate(path);
    setQuery('');
    setShowSearch(false);
  };

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotifs((prev) => ({
      unreadCount: Math.max(0, prev.unreadCount - 1),
      items: prev.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead();
    setNotifs((prev) => ({
      unreadCount: 0,
      items: prev.items.map((n) => ({ ...n, read: true })),
    }));
  };

  return (
    <header className="saa-topbar">
      <div className="saa-search" ref={searchRef}>
        <Search size={16} className="saa-search-icon" />
        <input
          className="saa-search-input"
          placeholder="Search pages…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
        />
        {showSearch && query.trim() && (
          <div className="saa-search-drop">
            {results.length ? (
              results.map((r) => {
                const Icon = r.icon;
                return (
                  <button key={r.path} type="button" className="saa-search-result" onClick={() => openResult(r.path)}>
                    <Icon size={15} />
                    <span>Go to {r.label}</span>
                    <kbd>↵</kbd>
                  </button>
                );
              })
            ) : (
              <div className="saa-search-empty">No matching pages</div>
            )}
          </div>
        )}
      </div>

      <div className="saa-topbar-right">
        <span className="saa-live-pill"><i /> Live</span>

        <div className="saa-bell" ref={bellRef}>
          <button
            type="button"
            className="saa-icon-btn"
            onClick={() => setShowBell((v) => !v)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {notifs.unreadCount > 0 && <span className="saa-bell-dot">{notifs.unreadCount}</span>}
          </button>

          {showBell && (
            <div className="saa-bell-drop">
              <div className="saa-bell-head">
                <strong>Notifications</strong>
                <button type="button" className="saa-bell-readall" onClick={handleReadAll}>
                  <CheckCheck size={14} /> Mark all read
                </button>
              </div>
              <div className="saa-bell-list">
                {notifs.items.length === 0 && <div className="saa-bell-empty">You're all caught up 🎉</div>}
                {notifs.items.map((n) => {
                  const cat = CATEGORY_ICONS[n.category] || CATEGORY_ICONS.system;
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={`saa-bell-item ${n.read ? 'read' : ''}`}
                      onClick={() => handleRead(n.id)}
                    >
                      <span className={`saa-bell-icon tone-${cat.tone}`}><CatIcon size={15} /></span>
                      <span className="saa-bell-item-text">
                        <strong>{n.title}</strong>
                        <span className="saa-bell-body">{n.body}</span>
                        <span className="saa-bell-time">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.read && <i className="saa-bell-unread" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

