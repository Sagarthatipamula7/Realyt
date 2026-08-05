import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../auth/AuthContext.jsx';

export default function BookingPage() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('email');
  const auth = useAuth();
  const { register, handleSubmit } = useForm();

  const requestOtp = async () => {
    const sent = await auth.loginWithEmail(email);
    if (sent) {
      setStep('otp');
    }
  };

  const handleVerify = async () => {
    const verified = await auth.verifyOtp(email, otpCode);
    if (verified) {
      setStep('book');
    }
  };

  return (
    <main className="page-shell">
      <div className="container">
        <section className="glow-card" style={{ padding: '36px' }}>
          <p className="hero-eyebrow">Booking</p>
          <h1 className="hero-title">Reserve your date</h1>
          <p className="hero-copy">
            Choose your date and share the details. We’ll match you with an editor once your booking is
            confirmed.
          </p>

          {step === 'email' && (
            <div className="fieldset">
              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <button type="button" className="btn-primary" onClick={requestOtp}>
                Send OTP
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="fieldset">
              <label>
                Enter code
                <input
                  type="text"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder="123456"
                />
              </label>
              <button type="button" className="btn-primary" onClick={handleVerify}>
                Verify code
              </button>
            </div>
          )}

          {step === 'book' && (
            <form className="fieldset" onSubmit={handleSubmit(() => {})}>
              <label>
                Occasion type
                <select {...register('occasionType', { required: true })}>
                  <option value="">Select an occasion</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label>
                Requested date
                <input type="date" {...register('requestedDate', { required: true })} />
              </label>
              <label>
                Brief notes
                <textarea {...register('briefNotes')} placeholder="Tell us what matters most." />
              </label>
              <button type="submit" className="btn-primary">
                Confirm booking
              </button>
            </form>
          )}

          {auth.authError && <p style={{ color: '#f19652' }}>{auth.authError}</p>}
          {auth.isLoading && <p className="small-note">Processing…</p>}
        </section>
      </div>
    </main>
  );
}
