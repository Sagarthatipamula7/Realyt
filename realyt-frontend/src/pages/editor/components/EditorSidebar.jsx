import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BarChart3, Settings, Film, LogOut, ExternalLink 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EditorSidebar() {
  const navigate = useNavigate();
  const editorUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('realyt_editor_user') || '{}');
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('realyt_editor_user');
    toast.success('Logged out of Editor Portal');
    navigate('/');
  };

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      height: '100vh',
      background: '#1E293B',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      color: '#F8FAFC',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
      zIndex: 10
    }}>
      {/* Brand Header */}
      <div style={{ padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF'
          }}>
            <Film size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFF', letterSpacing: '-0.02em' }}>
              Realyt <span style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(245,158,11,0.15)', padding: '2px 6px', borderRadius: '6px' }}>EDITOR</span>
            </h1>
            <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Creator Portal</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 4px' }}>
          MAIN MENU
        </div>

        <NavLink
          to="/editor/dashboard"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '12px',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
            background: isActive ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)' : 'transparent',
            color: isActive ? '#FCD34D' : '#CBD5E1',
            border: isActive ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          })}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/editor/clients"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '12px',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
            background: isActive ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)' : 'transparent',
            color: isActive ? '#FCD34D' : '#CBD5E1',
            border: isActive ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          })}
        >
          <Users size={18} />
          <span>Assigned Clients</span>
        </NavLink>

        <NavLink
          to="/editor/analytics"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '12px',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
            background: isActive ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)' : 'transparent',
            color: isActive ? '#FCD34D' : '#CBD5E1',
            border: isActive ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          })}
        >
          <BarChart3 size={18} />
          <span>Earnings & Analytics</span>
        </NavLink>

        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '18px 10px 4px' }}>
          PREFERENCES
        </div>

        <NavLink
          to="/editor/settings"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '12px',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
            background: isActive ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)' : 'transparent',
            color: isActive ? '#FCD34D' : '#CBD5E1',
            border: isActive ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          })}
        >
          <Settings size={18} />
          <span>Profile & Settings</span>
        </NavLink>
      </div>

      {/* Footer Profile & Switch Site */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94A3B8', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem'
          }}
        >
          <span>Back to Main Site</span>
          <ExternalLink size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
              {(editorUser?.name || editorUser?.email || 'E')[0].toUpperCase()}
            </div>
            <div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{editorUser?.name || 'Editor'}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{editorUser?.email || 'editor@realyt.com'}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
