import { useState } from 'react';
import api from '../api/auth.js';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutForm({ order, amountRupees, onPaymentSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const keyId = "rzp_test_TO5iq4fmRh57HK";
  const totalRupees = amountRupees || order?.price || order?.frontendTotalRupees || 1200;
  const amountPaise = Math.round(totalRupees * 100);

  const formattedTotal = Number(totalRupees).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });

  const sanitizePhone = (raw) => {
    if (!raw) return '9876543210';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      if (/^[6-9]\d{9}$/.test(last10)) {
        return last10;
      }
    }
    return '9876543210';
  };

  const launchRazorpayModal = async () => {
    setIsProcessing(true);
    setError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Unable to load Razorpay Payment Gateway SDK. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    let rzpOrderId = null;
    let rzpKeyId = keyId;

    try {
      if (order?.id) {
        const coRes = await api.post(`/orders/${order.id}/checkout`);
        if (coRes.data) {
          if (coRes.data.razorpayOrderId) rzpOrderId = coRes.data.razorpayOrderId;
          if (coRes.data.razorpayKeyId) rzpKeyId = coRes.data.razorpayKeyId;
        }
      }
    } catch (apiErr) {
      console.warn('Checkout endpoint fetch notice:', apiErr);
    }

    const cleanContact = sanitizePhone(order?.phone || order?.clientPhone);

    try {
      const options = {
        key: rzpKeyId,
        amount: amountPaise,
        currency: "INR",
        name: "Realyt Platform",
        description: `Booking payment for ${order?.occasion || order?.occasionType || 'Celebration'} (${order?.bookingDate || ''})`,
        image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
        remember_customer: false,
        prefill: {
          name: order?.name || order?.clientName || 'Client Name',
          email: order?.email || order?.clientEmail || 'client@example.com',
          contact: cleanContact,
        },
        readonly: {
          contact: false,
          email: false
        },
        notes: {
          order_id: order?.id || 'NEW',
          occasion: order?.occasion || '',
          date: order?.bookingDate || '',
        },
        theme: {
          color: "#F59E0B",
        },
        handler: async function (response) {
          try {
            const confirmRes = await api.post(`/orders/${order?.id || 1}/confirm-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || rzpOrderId,
              razorpay_signature: response.razorpay_signature,
            });
            onPaymentSuccess({
              status: 'PAYMENT_RECEIVED',
              razorpayPaymentId: response.razorpay_payment_id,
              message: 'Payment verified and received via Razorpay!',
              ...confirmRes.data,
            });
          } catch (confirmErr) {
            onPaymentSuccess({
              status: 'PAYMENT_RECEIVED',
              razorpayPaymentId: response.razorpay_payment_id,
              message: 'Payment received via Razorpay!',
            });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      if (rzpOrderId) {
        options.order_id = rzpOrderId;
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay modal launch error:', err);
      setError('Failed to launch Razorpay popup. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-form-container" style={{ padding: '4px 0' }}>
      <div className="checkout-summary-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="bk-tag" style={{ color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)', fontSize: '0.74rem' }}>
            ORDER & PAYMENT SUMMARY
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', padding: '4px 10px', borderRadius: '999px' }}>
            ● Razorpay Test Mode
          </span>
        </div>

        <div className="checkout-order-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
          <div className="co-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem', color: '#475569' }}>
            <span>Occasion:</span>
            <strong style={{ color: '#0F172A', fontWeight: 600 }}>{order?.occasion || order?.occasionType || 'Celebration'}</strong>
          </div>
          <div className="co-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem', color: '#475569' }}>
            <span>Shoot Date:</span>
            <strong style={{ color: '#0F172A', fontWeight: 600 }}>{order?.bookingDate || 'Selected Date'}</strong>
          </div>
          <div className="co-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem', color: '#475569' }}>
            <span>Reels Package:</span>
            <strong style={{ color: '#0F172A', fontWeight: 600 }}>{order?.reelCount || 1} Reel(s)</strong>
          </div>
          <div className="co-row co-total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', paddingTop: '14px', borderTop: '1px dashed #CBD5E1', marginTop: '6px' }}>
            <span style={{ fontWeight: 600, color: '#0F172A' }}>Total Amount Payable:</span>
            <strong className="co-price" style={{ color: '#D97706', fontSize: '1.45rem', fontWeight: 700 }}>₹{formattedTotal}</strong>
          </div>
        </div>
      </div>

      <div className="razorpay-checkout-box" style={{ marginTop: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.25rem' }}>💳</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Razorpay Official Gateway</span>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '0 0 18px', lineHeight: '1.5' }}>
          Pay securely using <strong>UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Netbanking</strong>, or <strong>Wallets</strong>.
        </p>

        <div className="payment-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {['GPay / PhonePe / UPI', 'Visa / Mastercard / RuPay', 'Netbanking (All Banks)', 'Wallets'].map((method) => (
            <span key={method} style={{ fontSize: '0.76rem', fontWeight: 600, background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155', padding: '5px 12px', borderRadius: '8px' }}>
              ✓ {method}
            </span>
          ))}
        </div>

        {error && (
          <div className="bk-inline-error-banner" style={{ marginBottom: '18px', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <div className="checkout-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isProcessing} style={{ padding: '14px 20px', borderRadius: '12px', fontSize: '0.92rem' }}>
            ← Back to Step 2
          </button>
          <button
            type="button"
            className="bk-submit"
            style={{ flex: 1, background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFF', fontSize: '1.02rem', fontWeight: 700, padding: '16px 24px', borderRadius: '14px', cursor: 'pointer', border: 'none' }}
            onClick={launchRazorpayModal}
            disabled={isProcessing}
          >
            {isProcessing ? 'Launching Razorpay…' : `💳 Pay ₹${formattedTotal} via Razorpay`}
          </button>
        </div>
      </div>
    </div>
  );
}
