import { useState } from 'react';
import AdminHeader from '../components/AdminHeader.jsx';
import { Save, ShieldCheck, Percent, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const [commissionPct, setCommissionPct] = useState(15);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoRelease, setAutoRelease] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="admin-page-container">
      <AdminHeader title="Platform Settings & Configuration" subtitle="Configure system rules, platform splits, and admin alerts" />

      {savedMessage && (
        <div className="settings-saved-banner">
          <ShieldCheck size={18} /> {savedMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="admin-settings-form">
        {/* Commission Split Configuration */}
        <div className="dashboard-panel mb-24">
          <div className="panel-header">
            <h3><Percent size={18} className="text-marigold" /> Commission Split Configuration</h3>
          </div>
          <div className="settings-field">
            <label className="field-label">Platform Commission Percentage (%):</label>
            <div className="flex-align-gap">
              <input
                type="number"
                min="0"
                max="50"
                className="admin-input input-narrow"
                value={commissionPct}
                onChange={(e) => setCommissionPct(Number(e.target.value))}
              />
              <span className="text-dim">% Realyt Platform Fee</span>
            </div>
            <p className="field-help">
              Editor receives <strong>{100 - commissionPct}%</strong> of order total. Realyt platform keeps <strong>{commissionPct}%</strong>.
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="dashboard-panel mb-24">
          <div className="panel-header">
            <h3><Bell size={18} className="text-teal" /> Notification & Automated Action Settings</h3>
          </div>
          <div className="settings-toggle-group">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              <span>Send instant email alert when a new editor application is submitted</span>
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={autoRelease}
                onChange={(e) => setAutoRelease(e.target.checked)}
              />
              <span>Auto-release editor payout 48 hours after customer receives delivery if no disputes filed</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="settings-action-bar">
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
