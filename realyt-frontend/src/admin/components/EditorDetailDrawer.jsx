import { useEffect, useState } from 'react';
import { X, Star, Film, Calendar, CheckCircle2 } from 'lucide-react';
import { fetchEditorDetail } from '../api/adminApi.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#F2A93B', '#2FA98C', '#E8437B', '#7A5A26', '#5B4E6B'];

export default function EditorDetailDrawer({ editorId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (editorId) {
      setLoading(true);
      fetchEditorDetail(editorId).then((data) => {
        setDetail(data);
        setLoading(false);
      });
    }
  }, [editorId]);

  if (!editorId) return null;

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="drawer-eyebrow">Editor Profile</span>
            <h2 className="drawer-title">{loading ? 'Loading...' : detail?.name}</h2>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="drawer-loading">Loading editor analytics...</div>
        ) : (
          <div className="drawer-body">
            {/* Metric Chips */}
            <div className="editor-stat-row">
              <div className="editor-stat-card">
                <span className="stat-card-label">Lifetime Reels</span>
                <span className="stat-card-value"><Film size={18} /> {detail?.totalLifetimeReels}</span>
              </div>
              <div className="editor-stat-card">
                <span className="stat-card-label">Overall Rating</span>
                <span className="stat-card-value text-marigold"><Star size={18} fill="#F2A93B" /> {detail?.overallRating}</span>
              </div>
              <div className="editor-stat-card">
                <span className="stat-card-label">Join Date</span>
                <span className="stat-card-value">{detail?.joinDate?.split('T')[0] || '2024-03-15'}</span>
              </div>
            </div>

            {/* 6-Month Delivery Trend Chart */}
            <div className="drawer-chart-card">
              <h3>6-Month Delivery Trend (Reels)</h3>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={detail?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#C9BCD6" fontSize={12} />
                    <YAxis stroke="#C9BCD6" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#241832', border: '1px solid rgba(242,169,59,0.3)', borderRadius: '8px', color: '#F5EEE4' }} />
                    <Bar dataKey="reels" fill="#F2A93B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rating Distribution Donut Chart */}
            <div className="drawer-chart-card">
              <h3>Rating Distribution</h3>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={detail?.ratingDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {(detail?.ratingDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#241832', border: '1px solid rgba(242,169,59,0.3)', borderRadius: '8px', color: '#F5EEE4' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#C9BCD6' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Reviews List */}
            <div className="drawer-section">
              <h3>Recent Client Reviews</h3>
              <div className="reviews-list">
                {detail?.reviews?.map((rev) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-card-header">
                      <strong>{rev.clientName}</strong>
                      <span className="badge-occasion">{rev.occasionType}</span>
                      <span className="review-rating">
                        <Star size={14} fill="#F2A93B" color="#F2A93B" /> {rev.rating}.0
                      </span>
                    </div>
                    <p className="review-comment">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Assignments */}
            {detail?.currentAssignments?.length > 0 && (
              <div className="drawer-section">
                <h3>Active In-Progress Jobs</h3>
                {detail.currentAssignments.map((job) => (
                  <div key={job.id} className="job-card">
                    <CheckCircle2 size={16} className="text-teal" />
                    <div>
                      <strong>Order #{job.id} — {job.clientName} ({job.occasionType})</strong>
                      <div className="job-due">Due: {job.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
