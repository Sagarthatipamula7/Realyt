import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Users,
  CreditCard,
  UserPlus,
  BarChart3,
  Settings,
  LifeBuoy,
  ArrowLeft,
  LogOut,
  Sparkles
} from 'lucide-react';

const SECTIONS = [
  {
    label: 'Overview',
    items: [{ path: '/app/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { path: '/app/admin/requests', label: 'Requests', icon: Inbox },
      { path: '/app/admin/applications', label: 'Applications', icon: UserPlus },
    ],
  },
  {
    label: 'People',
    items: [{ path: '/app/admin/editors', label: 'Editors', icon: Users }],
  },
  {
    label: 'Finance',
    items: [{ path: '/app/admin/payments', label: 'Payments', icon: CreditCard }],
  },
  {
    label: 'Insights',
    items: [
      { path: '/app/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/app/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="saa-sidebar">
      <div className="saa-sidebar-brand">
        <div className="saa-brand-mark">
          <Sparkles size={18} />
        </div>
        <div className="saa-brand-text">
          <strong>Realyt</strong>
          <span>Admin Console</span>
        </div>
      </div>

      <nav className="saa-sidebar-nav">
        {SECTIONS.map((section) => (
          <div className="saa-nav-section" key={section.label}>
            <span className="saa-nav-label">{section.label}</span>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `saa-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={17} className="saa-nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="saa-sidebar-footer">
        <button type="button" className="saa-help-btn">
          <LifeBuoy size={16} />
          <span>Help &amp; Docs</span>
        </button>
        <NavLink to="/" className="saa-exit-link" title="Exit to public site">
          <ArrowLeft size={16} />
          <span>Public Site</span>
        </NavLink>
        <div className="saa-user-card">
          <div className="saa-user-avatar">ST</div>
          <div className="saa-user-meta">
            <strong>Admin</strong>
            <span>thatipamulasagar7@gmail.com</span>
          </div>
          <LogOut size={16} className="saa-user-logout" />
        </div>
      </div>
    </aside>
  );
}
