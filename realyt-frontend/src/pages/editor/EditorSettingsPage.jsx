import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Link as LinkIcon, Film, Save } from 'lucide-react';

export default function EditorSettingsPage() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('realyt_editor_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return {
      name: 'Rohan Sharma',
      email: 'editor@realyt.com',
      mobile: '+91 98765 43210',
      portfolioUrl: 'https://vimeo.com/showreel-editor',
      tools: 'Adobe Premiere Pro, After Effects, DaVinci Resolve',
      experience: 'Senior (5+ Years)',
      availability: 'FULL_TIME'
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('realyt_editor_user', JSON.stringify(profile));
    toast.success('Editor Profile & Settings saved successfully!');
  };

  return (
    <div style={{ padding: '32px 36px', color: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif", maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: '#FFF' }}>
          Editor Profile & Settings
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
          Manage your personal details, portfolio link, software editing tools, and availability rhythm.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            FULL NAME
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              MOBILE / WHATSAPP
            </label>
            <input
              type="tel"
              value={profile.mobile || ''}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            PORTFOLIO / SHOWREEL URL
          </label>
          <input
            type="url"
            value={profile.portfolioUrl || ''}
            onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
            style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            EDITING SOFTWARE & TOOLS USED
          </label>
          <input
            type="text"
            value={profile.tools || ''}
            onChange={(e) => setProfile({ ...profile, tools: e.target.value })}
            style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#FFF', fontSize: '0.92rem', outline: 'none' }}
          />
        </div>

        <button
          type="submit"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', border: 'none', color: '#FFF', fontWeight: 700, fontSize: '0.96rem', padding: '14px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
        >
          <Save size={18} /> Save Settings & Profile
        </button>
      </form>
    </div>
  );
}
