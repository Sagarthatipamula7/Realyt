import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader.jsx';
import { fetchAnalyticsData } from '../api/adminApi.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Percent, Clock } from 'lucide-react';

const COLORS = ['#F2A93B', '#E8437B', '#2FA98C', '#7A5A26'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData().then(setData);
  }, []);

  return (
    <div className="admin-page-container">
      <AdminHeader title="Platform Analytics & Performance" subtitle="Growth metrics, occasion breakdown, and turnaround bottlenecks" />

      {/* Metrics Row */}
      <div className="admin-grid-2 mb-24">
        <div className="dashboard-card border-left-teal">
          <div className="card-top">
            <span className="card-title">Editor Utilization Rate</span>
            <Percent className="text-teal" size={20} />
          </div>
          <div className="card-value">{data?.editorUtilizationPct ?? 0}%</div>
          <span className="card-trend">% of active editors booked on an average day</span>
        </div>

        <div className="dashboard-card border-left-marigold">
          <div className="card-top">
            <span className="card-title">Average Turnaround Time</span>
            <Clock className="text-marigold" size={20} />
          </div>
          <div className="card-value">{data?.avgTurnaroundDays ?? 0} days</div>
          <span className="card-trend">Request submission → Final video delivery</span>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Order Volume Line Chart */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><TrendingUp size={18} className="text-marigold" /> Order Volume Growth (Monthly)</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={data?.orderVolume || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#C9BCD6" />
                <YAxis stroke="#C9BCD6" />
                <Tooltip contentStyle={{ background: '#241832', border: '1px solid rgba(242,169,59,0.3)', borderRadius: '8px', color: '#F5EEE4' }} />
                <Line type="monotone" dataKey="orders" stroke="#F2A93B" strokeWidth={3} dot={{ r: 5, fill: '#F2A93B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occasion Breakdown Pie Chart */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><PieIcon size={18} className="text-rani" /> Occasion Type Breakdown</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data?.occasionBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label
                >
                  {(data?.occasionBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#241832', border: '1px solid rgba(242,169,59,0.3)', borderRadius: '8px', color: '#F5EEE4' }} />
                <Legend wrapperStyle={{ fontSize: '13px', color: '#C9BCD6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
