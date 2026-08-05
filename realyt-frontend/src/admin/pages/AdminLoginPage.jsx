import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLoginRequest } from '../../api/auth.js';
import { ShieldCheck, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both Admin Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLoginRequest(email.trim(), password.trim());
      if (data && data.token) {
        localStorage.setItem('realyt_admin_token', data.token);
        localStorage.setItem('realyt_admin_user', JSON.stringify({ email: data.email, role: data.role }));
        navigate('/app/admin/dashboard', { replace: true });
      } else {
        setError('Login failed: Token missing in response.');
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid admin credentials or access denied.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo-badge">
            <Sparkles size={24} className="text-marigold" />
          </div>
          <h1>Real<em>yt</em> Admin</h1>
          <p className="admin-login-subtitle">Internal Security & Operations Portal</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="adminEmail">Admin Email</label>
            <div className="admin-input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="adminEmail"
                type="email"
                className="admin-login-input"
                placeholder="thatipamulasagar7@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="adminPassword">Security Password</label>
            <div className="admin-input-icon-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="adminPassword"
                type="password"
                className="admin-login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="admin-login-submit" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                <ShieldCheck size={18} /> Authenticate Admin Access
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>🔒 Protected area — Authorized Realyt personnel only</span>
        </div>
      </div>
    </div>
  );
}
