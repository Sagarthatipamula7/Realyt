import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader.jsx';
import { fetchPayments, releasePayment } from '../api/adminApi.js';
import { DollarSign, ShieldAlert, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments().then((data) => setPayments(Array.isArray(data) ? data : []));
  }, []);

  const handleRelease = async (orderId) => {
    await releasePayment(orderId);
    setPayments((prev) =>
      prev.map((p) => (p.orderId === orderId ? { ...p, status: 'CAPTURED' } : p))
    );
  };

  const filteredPayments = payments.filter(
    (p) => statusFilter === 'ALL' || String(p.status).toUpperCase() === statusFilter.toUpperCase()
  );

  const totalHeld = payments
    .filter((p) => ['HELD', 'PENDING'].includes(String(p.status).toUpperCase()))
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const totalCommission = payments
    .reduce((s, p) => s + (Number(p.commission) || 0), 0);

  const totalPayouts = payments
    .filter((p) => ['RELEASED', 'CAPTURED'].includes(String(p.status).toUpperCase()))
    .reduce((s, p) => s + (Number(p.editorPayout) || 0), 0);

  const revenueChartData = payments.length > 0
    ? payments.map((p) => ({
        month: p.date ? new Date(p.date).toLocaleDateString('en-US', { month: 'short' }) : 'Aug',
        commission: Number(p.commission) || 0,
        payouts: Number(p.editorPayout) || 0,
      }))
    : [];

  return (
    <div className="admin-page-container">
      <AdminHeader title="Payments & Escrow Management" subtitle="Platform commission, editor payouts, and Stripe Connect transfers" />

      {/* Summary Chips */}
      <div className="admin-grid-3 mb-24">
        <div className="dashboard-card border-left-marigold">
          <div className="card-top">
            <span className="card-title">Held in Escrow</span>
            <ShieldAlert className="text-marigold" size={20} />
          </div>
          <div className="card-value">${totalHeld.toFixed(2)}</div>
          <span className="card-trend">Awaiting delivery verification</span>
        </div>

        <div className="dashboard-card border-left-teal">
          <div className="card-top">
            <span className="card-title">This Month's Commission</span>
            <DollarSign className="text-teal" size={20} />
          </div>
          <div className="card-value">${totalCommission.toFixed(2)}</div>
          <span className="card-trend text-teal">15% platform split</span>
        </div>

        <div className="dashboard-card border-left-rani">
          <div className="card-top">
            <span className="card-title">Total Editor Payouts</span>
            <ArrowRightLeft className="text-rani" size={20} />
          </div>
          <div className="card-value">${totalPayouts.toFixed(2)}</div>
          <span className="card-trend">Transferred to Stripe accounts</span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-panel mb-24">
        <div className="panel-header">
          <h3>Monthly Platform Revenue & Payouts</h3>
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#C9BCD6" />
              <YAxis stroke="#C9BCD6" />
              <Tooltip contentStyle={{ background: '#241832', border: '1px solid rgba(242,169,59,0.3)', borderRadius: '8px', color: '#F5EEE4' }} />
              <Area type="monotone" dataKey="payouts" stroke="#E8437B" fill="rgba(232,67,123,0.15)" name="Editor Payouts ($)" />
              <Area type="monotone" dataKey="commission" stroke="#2FA98C" fill="rgba(47,169,140,0.25)" name="Commission ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-controls-bar">
        <span className="controls-label">Filter by Status:</span>
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PENDING">Held / Pending</option>
          <option value="CAPTURED">Released / Captured</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Client</th>
              <th>Editor</th>
              <th>Total Amount</th>
              <th>Commission (15%)</th>
              <th>Editor Payout</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((pay) => {
              const statusStr = String(pay.status || 'PENDING').toUpperCase();
              const isHeld = statusStr === 'HELD' || statusStr === 'PENDING';
              return (
                <tr key={pay.id}>
                  <td><strong>#{pay.orderId || pay.id}</strong></td>
                  <td>{pay.client || 'Client'}</td>
                  <td>{pay.editor || 'Assigned Editor'}</td>
                  <td><strong>${(Number(pay.amount) || 0).toFixed(2)}</strong></td>
                  <td className="text-teal">${(Number(pay.commission) || 0).toFixed(2)}</td>
                  <td className="text-marigold"><strong>${(Number(pay.editorPayout) || 0).toFixed(2)}</strong></td>
                  <td>
                    <span className={`status-pill status-${statusStr.toLowerCase()}`}>
                      {statusStr}
                    </span>
                  </td>
                  <td>{pay.date || pay.createdAt?.split('T')[0] || '2026-08-04'}</td>
                  <td>
                    {isHeld ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRelease(pay.orderId || pay.id)}
                      >
                        <CheckCircle2 size={13} /> Release Payment
                      </button>
                    ) : (
                      <span className="text-dim text-sm">Released</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
