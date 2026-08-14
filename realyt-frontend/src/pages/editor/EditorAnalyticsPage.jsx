import { DollarSign, TrendingUp, CheckCircle2, Star, Film } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EditorAnalyticsPage() {
  const chartData = [
    { month: 'Mar', payouts: 8500 },
    { month: 'Apr', payouts: 11200 },
    { month: 'May', payouts: 9400 },
    { month: 'Jun', payouts: 14600 },
    { month: 'Jul', payouts: 16800 },
    { month: 'Aug', payouts: 18500 },
  ];

  return (
    <div style={{ padding: '32px 36px', color: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: '#FFF' }}>
          Earnings & Performance Analytics
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
          Track your 85% editor share payouts, completion rate metrics, and overall client rating scores.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>This Month Payout</span>
            <DollarSign size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>₹18,500</div>
          <span style={{ fontSize: '0.78rem', color: '#34D399', marginTop: '4px', display: 'block' }}>+24% vs last month</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifetime Earnings</span>
            <TrendingUp size={20} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399' }}>₹79,000</div>
          <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Across 42 completed shoots</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>On-Time Delivery</span>
            <CheckCircle2 size={20} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60A5FA' }}>98.5%</div>
          <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Delivered within 48h turnaround</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Rating Score</span>
            <Star size={20} color="#F43F5E" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F43F5E' }}>4.9 ⭐</div>
          <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Based on 36 client reviews</span>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 20px', color: '#FFF' }}>
          Monthly Payout Earnings Growth (₹)
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', color: '#FFF' }} />
              <Area type="monotone" dataKey="payouts" stroke="#F59E0B" fill="rgba(245,158,11,0.18)" name="Monthly Payout (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
