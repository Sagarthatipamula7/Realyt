import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { signupRequest, loginRequest, submitEditorApplicationApi } from '../../api/auth.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import CheckoutForm from '../../components/CheckoutForm.jsx';

const dowNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const occasions = ['Birthday', 'Wedding', 'Anniversary', 'Festival', 'Baby shower', 'Farewell', 'Other'];

const BASE_REELS = [
  'Highlight reel',
  'Short reel (under 1 min)',
  'Long / full reel',
  'Story reel',
  'Recap reel',
  'Teaser / promo reel',
];
const WEDDING_REELS = ['Sangeet reel', 'Reception reel', 'Baraat reel'];

function FieldError({ msg }) {
  return msg ? <p className="bk-field-error">{msg}</p> : null;
}

function ReelBuilder({ reels, onChange, isWedding }) {
  const list = isWedding ? [...BASE_REELS, ...WEDDING_REELS] : BASE_REELS;
  const total = Object.values(reels).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);

  const toggle = (name) => {
    const next = { ...reels };
    if (next[name]) { delete next[name]; } else { next[name] = 1; }
    onChange(next);
  };

  const step = (name, delta) => {
    const next = { ...reels };
    const val = Math.max(1, (next[name] || 1) + delta);
    next[name] = val;
    onChange(next);
  };

  return (
    <div className="rl-builder">
      {list.map((name) => {
        const checked = Boolean(reels[name]);
        return (
          <div key={name} className={`rl-row ${checked ? 'rl-row-on' : ''}`}>
            <button type="button" className="rl-check" onClick={() => toggle(name)}>
              <span className={`rl-box ${checked ? 'rl-box-on' : ''}`}>
                {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1B1030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              <span className="rl-name">{name}</span>
              {isWedding && WEDDING_REELS.includes(name) && <span className="rl-wedding-tag">Wedding</span>}
            </button>
            {checked && (
              <div className="rl-stepper">
                <button type="button" className="rl-step-btn" onClick={() => step(name, -1)} disabled={reels[name] <= 1}>−</button>
                <span className="rl-qty">{reels[name]}</span>
                <button type="button" className="rl-step-btn" onClick={() => step(name, 1)}>+</button>
              </div>
            )}
          </div>
        );
      })}

      {/* Other */}
      <div className={`rl-row ${reels.__otherChecked ? 'rl-row-on' : ''}`}>
        <button type="button" className="rl-check" onClick={() => {
          const next = { ...reels };
          if (next.__otherChecked) { delete next.__otherChecked; delete next.__otherText; }
          else { next.__otherChecked = true; next.__otherText = ''; }
          onChange(next);
        }}>
          <span className={`rl-box ${reels.__otherChecked ? 'rl-box-on' : ''}`}>
            {reels.__otherChecked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#1B1030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </span>
          <span className="rl-name">Other</span>
        </button>
      </div>
      {reels.__otherChecked && (
        <input
          type="text"
          className="bk-input"
          style={{ marginTop: '6px' }}
          value={reels.__otherText || ''}
          onChange={(e) => onChange({ ...reels, __otherText: e.target.value })}
          placeholder="e.g. Mehendi reel, Haldi reel…"
        />
      )}

      <div className="rl-total">
        {total === 0 ? 'No reels selected yet' : `${total} reel${total !== 1 ? 's' : ''} selected`}
      </div>
    </div>
  );
}

const MAX_SLOTS = 8;

function CapacityCard({ open }) {
  const pct = Math.round((open / MAX_SLOTS) * 100);
  const scarce = open <= 2;
  const barColor = open === 0 ? 'rgba(255,255,255,0.12)' : scarce ? '#E8437B' : '#F2A93B';

  return (
    <div className="cap-inner">
      <div className="cap-count">
        {open === 0 ? 'Full' : `${open} open`}
      </div>
      <div className="cap-track">
        <div className="cap-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('booking'); // 'signin' | 'booking' | 'about' | 'contact'
  const [bookingStep, setBookingStep] = useState(1);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [authStage, setAuthStage] = useState('form'); // 'form' | 'done'
  const [authLaunch, setAuthLaunch] = useState('nav'); // 'nav' | 'booking'
  const [authRole, setAuthRole] = useState('CLIENT'); // 'CLIENT' | 'EDITOR'
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [editorForm, setEditorForm] = useState({
    name: '',
    email: '',
    mobile: '',
    portfolio: '',
    experience: '',
    tools: '',
    availability: '',
    notes: '',
  });
  const [editorErrors, setEditorErrors] = useState({});
  const [editorSubmitted, setEditorSubmitted] = useState(false);
  const [authEmailOrMobile, setAuthEmailOrMobile] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authMobile, setAuthMobile] = useState('');
  const [authErrors, setAuthErrors] = useState({});
  const [authMessage, setAuthMessage] = useState('');
  const currentUser = auth?.user;
  const setCurrentUser = (u) => auth?.setUser(u);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  const openProfileModal = () => {
    const u = auth?.user || currentUser || {};
    setProfileForm({
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '',
      email: u.email || '',
      phone: u.mobile || u.phone || '',
      address: u.address || u.city || u.venue || '',
    });
    setProfileSavedSuccess(false);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const u = auth?.user || currentUser || {};
    const nameParts = profileForm.name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';
    const updatedUser = {
      ...u,
      name: profileForm.name.trim(),
      firstName,
      lastName,
      mobile: profileForm.phone.trim(),
      phone: profileForm.phone.trim(),
      address: profileForm.address.trim(),
      city: profileForm.address.trim(),
      venue: profileForm.address.trim(),
    };
    setCurrentUser(updatedUser);
    setProfileSavedSuccess(true);
    if (auth?.showToast) {
      auth.showToast('Profile details updated successfully!', 'success');
    }
    setTimeout(() => {
      setProfileModalOpen(false);
      setProfileSavedSuccess(false);
    }, 1000);
  };

  const [step1Errors, setStep1Errors] = useState({});
  const [step2Errors, setStep2Errors] = useState({});
  const [bookingData, setBookingData] = useState({
    occasion: ['Birthday'],
    occasionOther: '',
    reels: {},
    name: '',
    email: '',
    phone: '',
    venue: '',
    notes: '',
  });

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true' || window.location.hash === '#login') {
      openSignIn();
    }
  }, []);

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [monthAvailability, setMonthAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const isPastMonth = useMemo(() => {
    return (
      viewDate.getFullYear() < today.getFullYear() ||
      (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() <= today.getMonth())
    );
  }, [viewDate, today]);

  const [slideDirection, setSlideDirection] = useState('next');
  const [isTransitioningMonth, setIsTransitioningMonth] = useState(false);

  const handlePrevMonth = () => {
    if (isPastMonth || isTransitioningMonth) return;
    setSlideDirection('prev');
    setIsTransitioningMonth(true);
    setTimeout(() => {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
      setTimeout(() => setIsTransitioningMonth(false), 80);
    }, 120);
  };

  const handleNextMonth = () => {
    if (isTransitioningMonth) return;
    setSlideDirection('next');
    setIsTransitioningMonth(true);
    setTimeout(() => {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
      setTimeout(() => setIsTransitioningMonth(false), 80);
    }, 120);
  };

  const triggerDatePicker = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch (err) {
        input.click();
      }
    } else {
      input.click();
    }
  };

  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const lastDayNum = new Date(year, month + 1, 0).getDate();

    const fromStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const toStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;

    setLoadingAvailability(true);

    api
      .get('/availability', { params: { from: fromStr, to: toStr } })
      .then((res) => {
        const list = res.data || [];
        const map = {};
        list.forEach((item) => {
          if (item.date) {
            map[item.date] = item.openSlots !== undefined ? item.openSlots : (item.open || 0);
          }
        });
        setMonthAvailability(map);
      })
      .catch((err) => {
        console.warn('Failed to fetch availability from backend, using fallback:', err);
        const map = {};
        for (let d = 1; d <= lastDayNum; d++) {
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayVal = d + month + year;
          map[dateKey] = (dayVal * 7) % 8;
        }
        setMonthAvailability(map);
      })
      .finally(() => {
        setLoadingAvailability(false);
      });
  }, [viewDate]);

  const monthDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const list = [];
    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPastDate = dateObj < todayReset;
      const rawSlots = monthAvailability[dateKey];
      const openSlots = isPastDate ? 0 : (rawSlots !== undefined ? rawSlots : 4);

      list.push({
        date: dateObj,
        dateKey,
        open: openSlots,
        isPast: isPastDate,
      });
    }
    return list;
  }, [viewDate, monthAvailability, today]);

  const monthName = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);
  const [focusedField, setFocusedField] = useState('');
  const fieldHelp = {
    authEmailOrMobile: 'Enter the email address or mobile number for your account.',
    authPassword: 'Use your account password. 8+ characters is best for security.',
    authFirstName: 'Your first name as it should appear in booking confirmations.',
    authLastName: 'Your last name as it should appear in communications.',
    authEmail: 'A valid email we can use for account recovery and booking updates.',
    authMobile: 'A reachable mobile number for SMS or WhatsApp updates.',
    authConfirmPassword: 'Re-enter the password exactly as above to confirm it.',
    bkVenue: 'Where the shoot will take place, such as the city or venue name.',
    bkName: 'Who should we contact to confirm the booking?',
    bkEmail: 'The email address for booking details and confirmations.',
    bkPhone: 'A phone or WhatsApp number we can use to reach you quickly.',
    bkNotes: 'Any extra context your editor should know before starting work.',
    editorName: 'Your full name as it should appear in your application.',
    editorEmail: 'The best email to reach you about editor opportunities.',
    editorMobile: 'A mobile number for follow-up and scheduling.',
    editorPortfolio: 'Share a link to your showreel, website, or portfolio profile.',
    editorExperience: 'Choose the experience level that best matches your background.',
    editorTools: 'List the editing software and tools you use regularly.',
    editorAvailability: 'Select the working rhythm that suits your schedule.',
    editorNotes: 'Optional: tell us about your workflow, specialties, or past projects.',
  };
  const handleFieldFocus = (field) => () => setFocusedField(field);
  const handleFieldBlur = () => setFocusedField('');
  const renderFieldHelp = (field) => focusedField === field ? <p className="bk-field-help">{fieldHelp[field]}</p> : null;

  const resetAuthState = () => {
    setAuthStage('form');
    setAuthEmailOrMobile('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    setAuthFirstName('');
    setAuthLastName('');
    setAuthEmail('');
    setAuthMobile('');
    setAuthErrors({});
    setAuthMessage('');
  };

  const openSignIn = () => {
    resetAuthState();
    setModalMode('signin');
    setAuthView('login');
    setAuthLaunch('nav');
    setModalOpen(true);
  };
  const openSignUp = () => {
    resetAuthState();
    setModalMode('signin');
    setAuthView('signup');
    setAuthLaunch('nav');
    setModalOpen(true);
  };
  const openBooking = () => {
    setModalMode('booking');
    setBookingStep(1);
    setStep1Errors({});
    setStep2Errors({});

    const u = auth?.user || currentUser;
    if (u) {
      setBookingData((prev) => ({
        ...prev,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.name,
        email: u.email || prev.email,
        phone: u.phone || u.mobile || prev.phone,
      }));
    }

    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setBookingStep(1);
    setAuthView('login');
    setAuthLaunch('nav');
    resetAuthState();
    setStep1Errors({});
    setStep2Errors({});
  };

  const openEditorApplication = () => {
    setEditorModalOpen(true);
    setEditorErrors({});
    setEditorSubmitted(false);
    setEditorForm({
      name: '',
      email: '',
      mobile: '',
      portfolio: '',
      experience: '',
      tools: '',
      availability: '',
      notes: '',
    });
  };

  const openFooterModal = (mode) => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const copyToClipboard = async (text) => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 1800);
    } catch {
      /* ignore */
    }
  };

  const closeEditorModal = () => {
    setEditorModalOpen(false);
    setEditorSubmitted(false);
    setEditorErrors({});
  };
  const selectDate = (date) => {
    setSelectedDate(date);
    if (currentUser || auth?.user) {
      setModalMode('booking');
      setBookingStep(1);
      setStep1Errors({});
      setStep2Errors({});
      setModalOpen(true);
      return;
    }
    setModalMode('signin');
    resetAuthState();
    setAuthView('signup');
    setAuthLaunch('booking');
    setModalOpen(true);
  };
  const updateField = (field) => (e) => setBookingData((c) => ({ ...c, [field]: e.target.value }));

  const findAccount = (identifier) => {
    if (!identifier) return null;
    const key = identifier.toLowerCase();
    return accounts[key] || Object.values(accounts).find((acct) => acct.email.toLowerCase() === key || acct.mobile === identifier);
  };

  const validateLogin = () => {
    const errs = {};
    if (!authEmailOrMobile.trim()) errs.emailOrMobile = 'Email or mobile number is required.';
    if (!authPassword.trim()) errs.password = 'Password is required.';
    if (authPassword.trim() && authPassword.length < 8) errs.password = 'Password must be at least 8 characters.';
    setAuthErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignUpForm = () => {
    const errs = {};
    if (!authEmail.trim()) {
      errs.email = 'Email address is required.';
    } else if (!authEmail.includes('@')) {
      errs.email = 'Enter a valid email address.';
    }
    if (!authPassword.trim()) {
      errs.password = 'Password is required.';
    } else if (authPassword.trim().length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }
    setAuthErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateForgotReset = () => {
    const errs = {};
    if (!authEmailOrMobile.trim()) errs.emailOrMobile = 'Email or mobile number is required.';
    else if (!findAccount(authEmailOrMobile.trim())) errs.emailOrMobile = 'No account matches that email or mobile.';
    if (!authPassword.trim()) errs.password = 'New password is required.';
    if (!authConfirmPassword.trim()) errs.confirmPassword = 'Confirm new password.';
    else if (authPassword !== authConfirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setAuthErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditorForm = () => {
    const errs = {};
    if (!editorForm.name.trim()) errs.name = 'Full name is required.';
    if (!editorForm.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editorForm.email)) errs.email = 'Enter a valid email address.';
    if (!editorForm.mobile.trim()) errs.mobile = 'Mobile number is required.';
    if (!editorForm.portfolio.trim()) errs.portfolio = 'Portfolio link is required.';
    if (!editorForm.experience) errs.experience = 'Select your experience level.';
    if (!editorForm.tools.trim()) errs.tools = 'Mention the editing tools you use.';
    if (!editorForm.availability) errs.availability = 'Select your availability.';
    setEditorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitEditorApplication = async () => {
    if (!validateEditorForm()) return;
    try {
      await submitEditorApplicationApi({
        name: editorForm.name.trim(),
        email: editorForm.email.trim(),
        mobile: editorForm.mobile.trim(),
        portfolioUrl: editorForm.portfolio.trim(),
        experienceLevel: editorForm.experience,
        toolsUsed: editorForm.tools.trim(),
        notes: editorForm.notes.trim()
      });
      setEditorSubmitted(true);
      if (auth?.showToast) auth.showToast("Application submitted successfully!", "success");
    } catch (err) {
      console.error("Failed to submit editor application to backend:", err);
      setEditorSubmitted(true);
      if (auth?.showToast) auth.showToast("Application received!", "success");
    }
  };

  const continueToBooking = (profile = null) => {
    const nextData = {
      ...bookingData,
      email: profile?.email || authEmail || bookingData.email,
      name: profile?.name || `${authFirstName} ${authLastName}`.trim() || bookingData.name,
      phone: profile?.mobile || authMobile || bookingData.phone,
    };
    setBookingData(nextData);
    setModalMode('booking');
    setBookingStep(1);
  };

  const [rateCard, setRateCard] = useState({
    Highlight: 120000,
    Short: 80000,
    Long: 150000,
    Story: 90000,
    Recap: 100000,
    Teaser: 85000,
    Sangeet: 130000,
    Reception: 130000,
    Baraat: 130000
  });

  const [createdOrder, setCreatedOrder] = useState(null);
  const [checkoutSecret, setCheckoutSecret] = useState(null);

  useEffect(() => {
    api.get('/pricing')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const map = {};
          res.data.forEach((p) => {
            if (p.reelType && p.basePrice) {
              map[p.reelType] = p.basePrice;
            }
          });
          setRateCard((prev) => ({ ...prev, ...map }));
        }
      })
      .catch((err) => console.warn('Using default rate card:', err));
  }, []);

  const getUnitPriceForReelName = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('highlight')) return rateCard['Highlight'] || 120000;
    if (lower.includes('short')) return rateCard['Short'] || 80000;
    if (lower.includes('long') || lower.includes('full')) return rateCard['Long'] || 150000;
    if (lower.includes('story')) return rateCard['Story'] || 90000;
    if (lower.includes('recap')) return rateCard['Recap'] || 100000;
    if (lower.includes('teaser') || lower.includes('promo')) return rateCard['Teaser'] || 85000;
    if (lower.includes('sangeet')) return rateCard['Sangeet'] || 130000;
    if (lower.includes('reception')) return rateCard['Reception'] || 130000;
    if (lower.includes('baraat')) return rateCard['Baraat'] || 130000;
    return 100000;
  };

  const liveTotalRupees = useMemo(() => {
    let totalPaise = 0;
    const reelsObj = bookingData.reels || {};
    Object.entries(reelsObj).forEach(([type, count]) => {
      if (type !== '__otherChecked' && type !== '__otherText') {
        const qty = typeof count === 'number' ? count : 0;
        if (qty > 0) {
          totalPaise += getUnitPriceForReelName(type) * qty;
        }
      }
    });
    if (totalPaise === 0) {
      const totalReels = Object.values(reelsObj).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0) || 1;
      totalPaise = 120000 * totalReels;
    }
    return totalPaise / 100;
  }, [bookingData.reels, rateCard]);

  const handleConfirmBooking = async () => {
    if (!validateStep2()) return;
    const reelCount = Object.values(bookingData.reels).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0) || 1;
    const occasionList = Array.isArray(bookingData.occasion) ? bookingData.occasion : [bookingData.occasion];
    const occasionStr = occasionList.map(o => o === 'Other' ? bookingData.occasionOther.trim() || 'Other' : o).join(', ');
    const payload = {
      email: bookingData.email.trim(),
      name: bookingData.name.trim(),
      phone: bookingData.phone.trim(),
      occasion: occasionStr,
      bookingDate: selectedDate ? selectedDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      reels: bookingData.reels,
      reelCount,
      venue: bookingData.venue.trim(),
      notes: bookingData.notes.trim(),
      frontendTotalRupees: liveTotalRupees,
      price: liveTotalRupees,
    };
    try {
      const res = await api.post('/orders', payload);
      const newOrder = res.data;
      setCreatedOrder(newOrder);

      const coRes = await api.post(`/orders/${newOrder.id}/checkout`);
      if (coRes.data && coRes.data.clientSecret) {
        setCheckoutSecret(coRes.data.clientSecret);
      }
    } catch (err) {
      console.warn('Order created or checkout session generated locally:', err);
    }
    setBookingStep(3); // Step 3 is Checkout Payment
  };

  const handleAuthAction = async () => {
    if (auth?.isLoading) return; // prevent duplicate submissions while a request is in flight
    if (authStage === 'form') {
      if (authView === 'login') {
        if (!validateLogin()) return;
        if (auth?.login) {
          try {
            const loggedInUser = await auth.login(authEmailOrMobile.trim(), authPassword);
            setCurrentUser(loggedInUser);
            // Role-based redirect: send administrators to admin console, editors to editor portal.
            if (loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'ROLE_ADMIN') {
              localStorage.setItem('realyt_admin_token', loggedInUser.token || 'admin_token');
              localStorage.setItem('realyt_admin_user', JSON.stringify({ email: loggedInUser.email, role: loggedInUser.role }));
              if (auth?.showToast) auth.showToast('Admin authenticated! Redirecting to dashboard…', 'success');
              navigate('/app/admin/dashboard', { replace: true });
              return;
            }
            if (loggedInUser?.role === 'EDITOR' || loggedInUser?.role === 'ROLE_EDITOR') {
              localStorage.setItem('realyt_editor_user', JSON.stringify(loggedInUser));
              if (auth?.showToast) auth.showToast('Editor authenticated! Redirecting to Editor Portal…', 'success');
              navigate('/editor/dashboard', { replace: true });
              return;
            }
            if (authLaunch === 'booking') {
              continueToBooking(loggedInUser);
            }
            setModalOpen(false);
            setAuthStage('form');
            return;
          } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
            setAuthErrors({ general: msg });
            return;
          }
        }
        return;
      }
      if (authView === 'signup') {
        if (!validateSignUpForm()) return;
        const fn = authFirstName.trim() || authEmail.trim().split('@')[0];
        const ln = authLastName.trim();
        const registeredEmail = authEmail.trim();
        const newAccount = {
          firstName: fn,
          lastName: ln,
          name: `${fn} ${ln}`.trim(),
          email: registeredEmail,
          mobile: authMobile.trim(),
          role: authRole,
        };
        if (auth?.signup) {
          try {
            const res = await auth.signup(registeredEmail, authPassword.trim(), newAccount);
            if (res) {
              const userObj = {
                name: newAccount.name,
                email: registeredEmail,
                mobile: newAccount.mobile,
                role: authRole,
              };
              setCurrentUser(userObj);
              if (authRole === 'EDITOR') {
                localStorage.setItem('realyt_editor_user', JSON.stringify(userObj));
                if (auth?.showToast) auth.showToast('Editor account created! Welcome to Editor Workspace.', 'success');
                setModalOpen(false);
                navigate('/editor/dashboard', { replace: true });
                return;
              }
              if (authLaunch === 'booking') {
                continueToBooking(userObj);
              } else {
                if (auth?.showToast) auth.showToast('Account created! Welcome to Realyt.', 'success');
                setModalOpen(false);
              }
            }
            return;
          } catch (err) {
            console.error('Signup error details:', err.response?.data || err);
            const msg = err.response?.data?.message 
              || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.map(e => e.defaultMessage || e.message).join(', ') : null)
              || err.message 
              || 'Signup failed. Email may already be registered.';
            setAuthErrors({ general: msg });
            return;
          }
        }
        return;
      }
      if (authView === 'forgot') {
        if (!validateForgotReset()) return;
        const account = findAccount(authEmailOrMobile.trim());
        if (account) {
          const accountKey = account.email.toLowerCase();
          setAccounts((prev) => ({
            ...prev,
            [accountKey]: {
              ...account,
              password: authPassword,
            },
          }));
        }
        setAuthView('login');
        setAuthStage('done');
        setAuthMessage('Password updated. Log in with your new password.');
        return;
      }
    }
  };

  const validateStep1 = () => {
    const errs = {};
    const list = Array.isArray(bookingData.occasion) ? bookingData.occasion : [bookingData.occasion];
    if (list.length === 0) {
      errs.occasion = 'Please select at least one occasion.';
    }
    if (list.includes('Other') && !bookingData.occasionOther.trim()) {
      errs.occasionOther = 'Please describe your occasion.';
    }
    const reelCount = Object.values(bookingData.reels).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
    if (reelCount === 0 && !bookingData.reels.__otherChecked)
      errs.reels = 'Please select at least one reel type.';
    if (bookingData.reels.__otherChecked && !bookingData.reels.__otherText?.trim())
      errs.reelsOther = 'Please describe the reel type.';
    if (!bookingData.venue.trim()) errs.venue = 'Venue or city is required.';
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!bookingData.name.trim()) errs.name = 'Your name is required.';
    if (!bookingData.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) errs.email = 'Enter a valid email address.';
    if (!bookingData.phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(bookingData.phone)) errs.phone = 'Enter a valid phone number.';
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })
    : 'Choose a date';

  const selectedEntry = selectedDate
    ? monthDays.find((d) => d.date.toDateString() === selectedDate.toDateString())
    : null;
  const selectedIsOpen = selectedEntry ? selectedEntry.open > 0 : false;

  return (
    <>
      <header>
        <nav className="wrap">
          <a href="#" className="logo">Real<em>yt</em></a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#occasions">Occasions</a>
            <a href="#stories">Stories</a>
            <a href="/my-bookings">My Bookings</a>
          </div>
          <div className="nav-cta">
            {(auth?.user || currentUser) ? (
              <div className="user-nav-badge">
                <button
                  type="button"
                  className="user-badge-btn"
                  onClick={openProfileModal}
                  title="View & Edit Profile Details"
                >
                  <span className="user-avatar-initial">
                    {(() => {
                      const u = auth?.user || currentUser;
                      const str = u?.firstName || u?.name || u?.email || 'U';
                      return (typeof str === 'string' && str.length > 0) ? str[0].toUpperCase() : 'U';
                    })()}
                  </span>
                  <span className="user-badge-name-text">
                    {(() => {
                      const u = auth?.user || currentUser;
                      return u?.firstName || u?.name || (u?.email ? u.email.split('@')[0] : 'Profile');
                    })()}
                  </span>
                  <span className="user-badge-edit-pill">Profile</span>
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => {
                    setCurrentUser(null);
                    auth?.logout();
                  }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-ghost" type="button" onClick={openSignIn}>Log in</button>
                <button className="btn btn-primary" type="button" onClick={openSignUp}>Sign up</button>
              </>
            )}
            <button className="btn btn-ghost" type="button" onClick={openBooking}>Book your date</button>
          </div>
          <button className="menu-btn" aria-label="Menu" type="button">☰</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="wrap">
            <div className="eyebrow">Celebration films, quietly done right</div>
            <h1>Every celebration,<br /><i>remembered</i> right.</h1>
            <p className="sub">
              Tell us the date. We match you with a skilled editor from our vetted circle — no browsing profiles,
              no guesswork. Just your moment, beautifully cut.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary" type="button" onClick={openBooking}>Check your date</button>
              <button className="btn btn-ghost" type="button"
                onClick={() => document.getElementById('occasions')?.scrollIntoView()}>
                Watch sample films
              </button>
            </div>

            {/* ── DIYA STRIP ── */}
            <div className="lantern-panel reveal">
              <div className="lantern-head">
                <div className="lantern-title-nav">
                  <button
                    type="button"
                    className="month-nav-btn"
                    onClick={handlePrevMonth}
                    disabled={isPastMonth}
                    aria-label="Previous month"
                    title={isPastMonth ? "Cannot navigate to past months" : "Previous month"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <h3 className="lantern-month-heading">
                    Open dates &mdash; <span className={`month-name-smooth ${isTransitioningMonth ? 'switching' : ''}`}>{monthName}</span>
                  </h3>
                  <button
                    type="button"
                    className="month-nav-btn"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    title="Next month"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
                <div className="lantern-actions-right">
                  <div className="custom-date-picker-wrapper">
                    <button
                      type="button"
                      className="custom-date-picker-btn"
                      title="Pick any date from calendar"
                      onClick={() => triggerDatePicker('customDatePickerInput')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Pick Custom Date</span>
                      <input
                        id="customDatePickerInput"
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const [y, m, d] = e.target.value.split('-').map(Number);
                          const pickedDate = new Date(y, m - 1, d);
                          setViewDate(new Date(y, m - 1, 1));
                          selectDate(pickedDate);
                        }}
                        className="custom-date-native-input"
                      />
                    </button>
                  </div>
                  <div className="legend">
                    <span><i className="dot open" /> Open</span>
                    <span><i className="dot full" /> Fully booked</span>
                  </div>
                </div>
              </div>

              <div className="lanterns-wrapper">
                {loadingAvailability && !monthDays.length ? (
                  <div className="lanterns-skeleton">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className="lantern-skeleton">
                        <div className="sk-bar sk-cap" />
                        <div className="sk-bar sk-dow" />
                        <div className="sk-bar sk-day" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    key={viewDate.toISOString()}
                    className={`lanterns lanterns-container ${isTransitioningMonth ? `slide-out-${slideDirection}` : `slide-in-${slideDirection}`}`}
                  >
                    {monthDays.map(({ date, dateKey, open, isPast }) => {
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      return (
                        <button
                          key={dateKey}
                          type="button"
                          disabled={open === 0 || isPast}
                          className={`lantern ${open > 0 && !isPast ? 'open' : 'full'} ${isSelected ? 'selected' : ''}`}
                          onClick={() => selectDate(date)}
                        >
                          <CapacityCard open={open} />
                          <div className="dow">{dowNames[date.getDay()]}</div>
                          <div className="day">{date.getDate()}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="occasions" id="occasions">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>Made for your kind of celebration</h2>
              <p>Every occasion has its own rhythm — we match the edit to the moment, not the other way around.</p>
            </div>
            <div className="garland">
              {[
                { tag: 'Birthday', title: 'Birthday films', copy: 'Bright, upbeat cuts that keep the energy of the room.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
                { tag: 'Anniversary', title: 'Anniversary films', copy: 'Warm, unhurried edits built around the years, not just the day.', img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80' },
                { tag: 'Wedding', title: 'Wedding highlights', copy: 'Every ritual, every reaction, cut with a steady hand.', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80' },
                { tag: 'Festival', title: 'Festival reels', copy: 'Colour, sound and crowd energy edited to move.', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
                { tag: 'Baby shower', title: 'Baby shower films', copy: 'Soft-paced, gentle edits for a soft-paced day.', img: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&q=80' },
                { tag: 'Farewell', title: 'Farewell & reunion', copy: 'Nostalgic cuts that hold onto the room, not just the highlights.', img: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&q=80' },
              ].map((item) => (
                <div className="occard" key={item.tag}>
                  <div className="occ-thumb">
                    <img src={item.img} alt={item.tag} className="occ-img" />
                    <div className="occ-thumb-overlay" />
                    <span className="play">
                      <svg viewBox="0 0 10 10" fill="white"><polygon points="0,0 10,5 0,10" /></svg>
                    </span>
                    <span className="occ-tag">{item.tag}</span>
                  </div>
                  <div className="occ-body">
                    <h4>{item.title}</h4>
                    <p>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="how" id="how">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>From footage to film, in four steps</h2>
              <p>You never manage an editor directly — we handle the matching, the messaging and the payment, start to finish.</p>
            </div>

            <div className="steps reveal">
              <div className="steps-line" aria-hidden="true" />
              {[
                { number: '01', title: 'Share your footage', copy: "Upload your clips and photos, and tell us the mood you're going for." },
                { number: '02', title: 'We match your editor', copy: 'A vetted editor from our circle takes on your story — chosen by us, not browsed by you.', highlight: true },
                { number: '03', title: 'Your draft arrives', copy: 'Review it, request changes, and get it exactly right before it is final.' },
                { number: '04', title: 'The reveal', copy: 'Your finished film, delivered the way the moment deserves.' },
              ].map((step) => (
                <div className={`step${step.highlight ? ' step-highlight' : ''}`} key={step.number}>
                  <div className="step-node">
                    <span className="step-num">{step.number}</span>
                  </div>
                  <h4>{step.title}</h4>
                  <p>{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="stories" id="stories">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>What people are celebrating</h2>
              <p>A few of the moments we've been trusted with.</p>
            </div>
            <div className="story-grid reveal">
              {[
                { tag: '60th birthday', quote: "Our editor caught things we didn't even notice happening — the little reactions, the side conversations.", who: 'Priya, Ahmedabad' },
                { tag: 'Wedding', quote: "We sent three days of raw footage and got back something that finally felt like the wedding, not just a video of it.", who: 'Karan & Meher' },
                { tag: 'Farewell', quote: 'Handling everything through the site made it easy — no back and forth trying to find the right person ourselves.', who: 'Team at a Bengaluru office' },
              ].map((item) => (
                <div className="story" key={item.tag}>
                  <span className="tag">{item.tag}</span>
                  <p className="quote">{item.quote}</p>
                  <div className="who">{item.who}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOR EDITORS SECTION ── */}
      <section className="editor-apply" id="editor-apply">
        <div className="wrap editor-apply-panel reveal">
          <div className="editor-apply-copy">
            <span className="editor-eyebrow">FOR EDITORS</span>
            <h2>Edit for the moments that matter</h2>
            <p>Work with a small, vetted circle of editors and help shape films for milestone moments. If editing is your craft and you're looking for steady work, reach out — applications are reviewed individually.</p>
          </div>
          <div className="editor-apply-action">
            <button className="btn btn-teal" type="button" onClick={openEditorApplication}>Reach out to us</button>
            <p className="editor-apply-note">for editors seeking work</p>
          </div>
        </div>
      </section>

      {/* ── SITE FOOTER ── */}
      <footer className="site-footer reveal">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">Realyt</div>
            <p>Realyt matches celebration video projects with vetted editors, making milestone films feel effortless and memorable.</p>
            <p className="footer-tagline">Celebration editing, matched not browsed.</p>
          </div>

          <div className="footer-column">
            <h3>Services</h3>
            <a href="#booking">Content Creation & Management</a>
            <a href="#how">Automation Systems</a>
            <a href="#stories">Web Services</a>
            <a href="#editor-apply">Digital Marketing</a>
          </div>

          <div className="footer-column">
            <h3>Company</h3>
            <button type="button" className="footer-link-btn" onClick={() => openFooterModal('about')}>About</button>
            <a href="#how">Process</a>
            <button type="button" className="footer-link-btn" onClick={() => openFooterModal('contact')}>Contact</button>
            <a href="#" className="footer-link-btn">Privacy Policy</a>
          </div>

          <div className="footer-column footer-contact">
            <h3>Get In Touch</h3>
            <a className="footer-contact-link" href="mailto:hello@realyt.com">hello@realyt.com</a>
            <a className="footer-contact-link" href="tel:+918320565485">+91 83205 65485</a>
            <div className="footer-social">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
              <a href="tel:+918320565485" aria-label="Phone">📞</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {modalOpen && (
        <div className="bk-overlay" onClick={closeModal}>
          <div className="bk-sheet" onClick={(e) => e.stopPropagation()}>

            {modalMode === 'about' && (
              <>
                <div className="bk-header bk-header-signin">
                  <span className="bk-header-date">About Realyt</span>
                  <button className="bk-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>
                </div>
                <div className="bk-body">
                  <div className="bk-field-group">
                    <p>Realyt matches celebration video projects with a small, vetted circle of editors. We help couples and families capture milestone moments through beautifully edited films without the hassle of profile browsing.</p>
                    <p>Our focus is on editing, not discovery — you tell us the date and vision, and we match you with an editor who can bring the story to life.</p>
                    <p>Every project is reviewed individually, so editors who want steady, meaningful work can join a platform built around trust, quality, and thoughtful storytelling.</p>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'contact' && (
              <>
                <div className="bk-header bk-header-signin">
                  <span className="bk-header-date">Contact Realyt</span>
                  <button className="bk-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>
                </div>
                <div className="bk-body">
                  <div className="bk-field-group">
                    <p className="footer-modal-label">Email</p>
                    <div className="footer-modal-contact-row">
                      <a href="mailto:thatipamulasagar7@gmail.com" className="footer-modal-contact-link">thatipamulasagar7@gmail.com</a>
                      <button type="button" className="footer-copy-btn" onClick={() => copyToClipboard('thatipamulasagar7@gmail.com')}>{copiedText === 'thatipamulasagar7@gmail.com' ? 'Copied' : 'Copy'}</button>
                    </div>
                  </div>
                  <div className="bk-field-group">
                    <p className="footer-modal-label">Phone</p>
                    <div className="footer-modal-contact-row">
                      <a href="tel:+918320565485" className="footer-modal-contact-link">+91 83205 65485</a>
                      <button type="button" className="footer-copy-btn" onClick={() => copyToClipboard('+91 83205 65485')}>{copiedText === '+91 83205 65485' ? 'Copied' : 'Copy'}</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'signin' && (
              <>
                <div className="bk-header bk-header-signin">
                  <span className="bk-header-date">
                    {authView === 'login' ? 'Account Login' : authView === 'signup' ? 'Create Account' : 'Reset Password'}
                  </span>
                  <button className="bk-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>
                </div>
                <div className="bk-body">
                  {authMessage && <p className="bk-inline-msg">{authMessage}</p>}

                  {authStage === 'form' && authView === 'login' && (
                    <>
                      <h3 className="bk-title">Welcome back</h3>
                      <p className="bk-sub">Enter your email and password to log in to Realyt.</p>

                      {authErrors.general && (
                        <div className="bk-inline-error-banner">
                          {authErrors.general}
                        </div>
                      )}

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="authEmailOrMobile">Email or Mobile Number</label>
                        <input id="authEmailOrMobile" type="text" className={`bk-input ${authErrors.emailOrMobile ? 'bk-input-err' : ''}`} value={authEmailOrMobile}
                          onFocus={handleFieldFocus('authEmailOrMobile')}
                          onBlur={handleFieldBlur}
                          onChange={(e) => { setAuthEmailOrMobile(e.target.value); setAuthErrors((c) => ({ ...c, emailOrMobile: '' })); }} placeholder="you@example.com or +91 98765 43210" />
                        <FieldError msg={authErrors.emailOrMobile} />
                        {renderFieldHelp('authEmailOrMobile')}
                      </div>

                      <div className="bk-field-group">
                        <div className="bk-field-header-row">
                          <label className="bk-field-label" htmlFor="authPassword">Password</label>
                          <button type="button" className="bk-forgot-link" onClick={() => { resetAuthState(); setAuthView('forgot'); setAuthStage('form'); }}>
                            Forgot password?
                          </button>
                        </div>
                        <input id="authPassword" type="password" className={`bk-input ${authErrors.password ? 'bk-input-err' : ''}`} value={authPassword}
                          onFocus={handleFieldFocus('authPassword')}
                          onBlur={handleFieldBlur}
                          onChange={(e) => { setAuthPassword(e.target.value); setAuthErrors((c) => ({ ...c, password: '' })); }} placeholder="Enter your password" />
                        <FieldError msg={authErrors.password} />
                      </div>

                      <div className="bk-auth-switch-prompt">
                        <span>New to Realyt?</span>
                        <button type="button" className="bk-auth-switch-btn" onClick={() => { resetAuthState(); setAuthView('signup'); setAuthStage('form'); }}>
                          Create an account
                        </button>
                      </div>
                    </>
                  )}

                  {authStage === 'form' && authView === 'signup' && (
                    <>
                      <h3 className="bk-title">Create your account</h3>
                      <p className="bk-sub">Fill in your details below to lock in your date.</p>

                      {authErrors.general && (
                        <div className="bk-inline-error-banner">
                          {authErrors.general}
                        </div>
                      )}

                      <div className="bk-row-2">
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="authFirstName">First name</label>
                          <input id="authFirstName" type="text" className={`bk-input ${authErrors.firstName ? 'bk-input-err' : ''}`} value={authFirstName}
                            onFocus={handleFieldFocus('authFirstName')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { setAuthFirstName(e.target.value); setAuthErrors((c) => ({ ...c, firstName: '' })); }} placeholder="First name" />
                          <FieldError msg={authErrors.firstName} />
                          {renderFieldHelp('authFirstName')}
                        </div>
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="authLastName">Last name</label>
                          <input id="authLastName" type="text" className={`bk-input ${authErrors.lastName ? 'bk-input-err' : ''}`} value={authLastName}
                            onFocus={handleFieldFocus('authLastName')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { setAuthLastName(e.target.value); setAuthErrors((c) => ({ ...c, lastName: '' })); }} placeholder="Last name" />
                          <FieldError msg={authErrors.lastName} />
                          {renderFieldHelp('authLastName')}
                        </div>
                      </div>

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="authEmail">Email address</label>
                        <input id="authEmail" type="email" className={`bk-input ${authErrors.email ? 'bk-input-err' : ''}`} value={authEmail}
                          onFocus={handleFieldFocus('authEmail')}
                          onBlur={handleFieldBlur}
                          onChange={(e) => { setAuthEmail(e.target.value); setAuthErrors((c) => ({ ...c, email: '' })); }} placeholder="you@example.com" />
                        <FieldError msg={authErrors.email} />
                        {renderFieldHelp('authEmail')}
                      </div>

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="authRole">I want to join Realyt as</label>
                        <select
                          id="authRole"
                          className="bk-input"
                          value={authRole}
                          onChange={(e) => setAuthRole(e.target.value)}
                          style={{ background: '#FFFFFF', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <option value="CLIENT">👤 Client (Book Editors for Events & Celebrations)</option>
                          <option value="EDITOR">🎬 Content Editor (Join Vetted Creator Circle)</option>
                        </select>
                      </div>

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="authMobile">Mobile number</label>
                        <input id="authMobile" type="tel" className={`bk-input ${authErrors.mobile ? 'bk-input-err' : ''}`} value={authMobile}
                          onFocus={handleFieldFocus('authMobile')}
                          onBlur={handleFieldBlur}
                          onChange={(e) => { setAuthMobile(e.target.value); setAuthErrors((c) => ({ ...c, mobile: '' })); }} placeholder="+91 98765 43210" />
                        <FieldError msg={authErrors.mobile} />
                        {renderFieldHelp('authMobile')}
                      </div>

                      <div className="bk-row-2">
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="authPassword">Password</label>
                          <input id="authPassword" type="password" className={`bk-input ${authErrors.password ? 'bk-input-err' : ''}`} value={authPassword}
                            onFocus={handleFieldFocus('authPassword')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { setAuthPassword(e.target.value); setAuthErrors((c) => ({ ...c, password: '' })); }} placeholder="Create a password" />
                          <FieldError msg={authErrors.password} />
                          {renderFieldHelp('authPassword')}
                        </div>
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="authConfirmPassword">Confirm password</label>
                          <input id="authConfirmPassword" type="password" className={`bk-input ${authErrors.confirmPassword ? 'bk-input-err' : ''}`} value={authConfirmPassword}
                            onFocus={handleFieldFocus('authConfirmPassword')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { setAuthConfirmPassword(e.target.value); setAuthErrors((c) => ({ ...c, confirmPassword: '' })); }} placeholder="Confirm password" />
                          <FieldError msg={authErrors.confirmPassword} />
                          {renderFieldHelp('authConfirmPassword')}
                        </div>
                      </div>

                      <div className="bk-auth-switch-prompt">
                        <span>Already have an account?</span>
                        <button type="button" className="bk-auth-switch-btn" onClick={() => { resetAuthState(); setAuthView('login'); setAuthStage('form'); }}>
                          Log in
                        </button>
                      </div>
                    </>
                  )}

                  {authStage === 'form' && authView === 'forgot' && (
                    <>
                      <h3 className="bk-title">Reset your password</h3>
                      <p className="bk-sub">Enter your email or mobile number and choose a new password.</p>

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="authEmailOrMobile">Email or mobile number</label>
                        <input id="authEmailOrMobile" type="text" className={`bk-input ${authErrors.emailOrMobile ? 'bk-input-err' : ''}`} value={authEmailOrMobile}
                          onFocus={handleFieldFocus('authEmailOrMobile')}
                          onBlur={handleFieldBlur}
                          onChange={(e) => { setAuthEmailOrMobile(e.target.value); setAuthErrors((c) => ({ ...c, emailOrMobile: '' })); }} placeholder="you@example.com or +91 98765 43210" />
                        <FieldError msg={authErrors.emailOrMobile} />
                        {renderFieldHelp('authEmailOrMobile')}
                      </div>

                      <div className="bk-row-2">
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="authPassword">New password</label>
                          <input id="authPassword" type="password" className={`bk-input ${authErrors.password ? 'bk-input-err' : ''}`} value={authPassword}
                            onFocus={handleFieldFocus('authPassword')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { setAuthPassword(e.target.value); setAuthErrors((c) => ({ ...c, password: '' })); }} placeholder="New password" />
                          <FieldError msg={authErrors.password} />
                          {renderFieldHelp('authPassword')}
                        </div>
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="authConfirmPassword">Confirm new password</label>
                          <input id="authConfirmPassword" type="password" className={`bk-input ${authErrors.confirmPassword ? 'bk-input-err' : ''}`} value={authConfirmPassword}
                            onFocus={handleFieldFocus('authConfirmPassword')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { setAuthConfirmPassword(e.target.value); setAuthErrors((c) => ({ ...c, confirmPassword: '' })); }} placeholder="Confirm new password" />
                          <FieldError msg={authErrors.confirmPassword} />
                          {renderFieldHelp('authConfirmPassword')}
                        </div>
                      </div>

                      <div className="bk-auth-switch-prompt">
                        <span>Remembered your password?</span>
                        <button type="button" className="bk-auth-switch-btn" onClick={() => { resetAuthState(); setAuthView('login'); setAuthStage('form'); }}>
                          Log in
                        </button>
                      </div>
                    </>
                  )}

                  {authStage === 'done' && (
                    <div className="bk-success">
                      <div className="bk-check">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                          <path d="M4 12l5 5L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="bk-success-title">
                        {authView === 'login' ? "You're logged in." : "Your account is ready."}
                      </h3>
                      <p className="bk-success-sub">
                        {authView === 'login'
                          ? 'Your account is ready. Continue to your dashboard.'
                          : 'Your account has been created. Continue to booking or explore the app.'}
                      </p>
                      <button className="bk-submit" type="button" onClick={closeModal}>Continue</button>
                    </div>
                  )}
                </div>
                {authStage !== 'done' && (
                  <div className="bk-footer">
                    <button className="bk-submit" type="button" onClick={handleAuthAction} disabled={Boolean(auth?.isLoading)}>
                      {auth?.isLoading
                        ? (authView === 'signup' ? 'Creating account…' : 'Logging in…')
                        : (authStage === 'form' && authView === 'login' && 'Log in')
                          || (authStage === 'form' && authView === 'signup' && (authLaunch === 'booking' ? 'Create account & book' : 'Create account'))
                          || (authStage === 'form' && authView === 'forgot' && 'Reset password')}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── BOOKING MODE ── */}
            {modalMode === 'booking' && (
            <>
            <div className="bk-header">
              <div className="bk-header-left">
                <span className="bk-header-date">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                    : 'No date selected'}
                </span>
                {selectedDate && (
                  <span className={`bk-avail-pill ${selectedIsOpen ? 'avail-open' : 'avail-full'}`}>
                    {selectedIsOpen ? '● Open slot' : '● Fully booked'}
                  </span>
                )}
                <button
                  type="button"
                  className="bk-change-date-btn"
                  title="Choose a different date"
                  onClick={() => triggerDatePicker('bkChangeDateInput')}
                >
                  <span>Change date</span>
                  <input
                    id="bkChangeDateInput"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={selectedDate ? selectedDate.toISOString().slice(0, 10) : ''}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      const pickedDate = new Date(y, m - 1, d);
                      setViewDate(new Date(y, m - 1, 1));
                      setSelectedDate(pickedDate);
                    }}
                    className="custom-date-native-input"
                  />
                </button>
              </div>
              <button className="bk-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>
            </div>

            {bookingStep < 3 ? (
              <>
                <div className="bk-progress">
                  <span className={`bk-dot ${bookingStep >= 1 ? 'bk-dot-on' : ''}`} />
                  <span className="bk-prog-line" />
                  <span className={`bk-dot ${bookingStep >= 2 ? 'bk-dot-on' : ''}`} />
                </div>

                <div className="bk-body">
                  {bookingStep === 1 && (
                    <>
                      <p className="bk-eyebrow">Step 1 of 2</p>
                      <h3 className="bk-title">The occasion</h3>
                      <p className="bk-sub">Tell us about the day — we'll take it from there.</p>

                      <div className="bk-field-group">
                        <p className="bk-field-label">What are you celebrating? <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.75 }}>(Select one or more)</span></p>
                        <div className="bk-chips">
                          {occasions.map((occ) => {
                            const selectedList = Array.isArray(bookingData.occasion) ? bookingData.occasion : [bookingData.occasion];
                            const isSelected = selectedList.includes(occ);
                            return (
                              <button
                                key={occ}
                                type="button"
                                className={`bk-chip ${isSelected ? 'bk-chip-on' : ''}`}
                                onClick={() => {
                                  let nextList;
                                  if (isSelected) {
                                    nextList = selectedList.filter((item) => item !== occ);
                                    if (nextList.length === 0) nextList = [occ];
                                  } else {
                                    nextList = [...selectedList, occ];
                                  }
                                  setBookingData((c) => ({ ...c, occasion: nextList }));
                                  setStep1Errors((c) => ({ ...c, occasion: '', occasionOther: '' }));
                                }}
                              >
                                {occ}
                                {isSelected && <span style={{ marginLeft: '6px', fontSize: '0.8rem', fontWeight: 700 }}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                        {((Array.isArray(bookingData.occasion) && bookingData.occasion.includes('Other')) || bookingData.occasion === 'Other') && (
                          <input
                            type="text"
                            className={`bk-input ${step1Errors.occasionOther ? 'bk-input-err' : ''}`}
                            style={{ marginTop: '12px' }}
                            value={bookingData.occasionOther}
                            onChange={(e) => { updateField('occasionOther')(e); setStep1Errors((c) => ({ ...c, occasionOther: '' })); }}
                            placeholder="Tell us what you're celebrating…"
                          />
                        )}
                        <FieldError msg={step1Errors.occasion} />
                        <FieldError msg={step1Errors.occasionOther} />
                      </div>

                      <div className="bk-field-group">
                        <p className="bk-field-label">Reels needed</p>
                        <ReelBuilder
                          reels={bookingData.reels}
                          onChange={(r) => { setBookingData((c) => ({ ...c, reels: r })); setStep1Errors((c) => ({ ...c, reels: '', reelsOther: '' })); }}
                          isWedding={Array.isArray(bookingData.occasion) ? bookingData.occasion.includes('Wedding') : bookingData.occasion === 'Wedding'}
                        />
                        <FieldError msg={step1Errors.reels} />
                        <FieldError msg={step1Errors.reelsOther} />
                      </div>

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="bkVenue">Venue / city</label>
                        <input id="bkVenue" type="text" className={`bk-input ${step1Errors.venue ? 'bk-input-err' : ''}`} value={bookingData.venue}
                          onFocus={handleFieldFocus('bkVenue')}
                          onBlur={handleFieldBlur}
                          onChange={(e) => { updateField('venue')(e); setStep1Errors((c) => ({ ...c, venue: '' })); }} placeholder="Mumbai, Delhi, Jaipur…" />
                        <FieldError msg={step1Errors.venue} />
                        {renderFieldHelp('bkVenue')}
                      </div>
                    </>
                  )}

                  {bookingStep === 2 && (
                    <>
                      <p className="bk-eyebrow">Step 2 of 2</p>
                      <h3 className="bk-title">Reaching you</h3>
                      <p className="bk-sub">So we can confirm your slot and keep you in the loop.</p>

                      {(auth?.user || currentUser) && (
                        <div style={{
                          background: 'rgba(242, 169, 59, 0.12)',
                          border: '1px solid rgba(242, 169, 59, 0.35)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginBottom: '18px',
                          fontSize: '0.84rem',
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '1rem' }}>👤</span>
                          <span>Prefilled from your account profile. You can edit any details below if you are booking for someone else.</span>
                        </div>
                      )}

                      <div className="bk-row-2">
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="bkName">Your name</label>
                          <input id="bkName" type="text" className={`bk-input ${step2Errors.name ? 'bk-input-err' : ''}`} value={bookingData.name}
                            onFocus={handleFieldFocus('bkName')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { updateField('name')(e); setStep2Errors((c) => ({ ...c, name: '' })); }} placeholder="First and last name" />
                          <FieldError msg={step2Errors.name} />
                          {renderFieldHelp('bkName')}
                        </div>
                        <div className="bk-field-group">
                          <label className="bk-field-label" htmlFor="bkEmail">Email address</label>
                          <input id="bkEmail" type="email" className={`bk-input ${step2Errors.email ? 'bk-input-err' : ''}`} value={bookingData.email}
                            onFocus={handleFieldFocus('bkEmail')}
                            onBlur={handleFieldBlur}
                            onChange={(e) => { updateField('email')(e); setStep2Errors((c) => ({ ...c, email: '' })); }} placeholder="you@example.com" />
                          <FieldError msg={step2Errors.email} />
                          {renderFieldHelp('bkEmail')}
                        </div>
                      </div>

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="bkPhone">Phone / WhatsApp</label>
                        <input id="bkPhone" type="tel" className={`bk-input ${step2Errors.phone ? 'bk-input-err' : ''}`} value={bookingData.phone}
                          onFocus={handleFieldFocus('bkPhone')}
                          onBlur={handleFieldBlur}
                          onChange={(e) => { updateField('phone')(e); setStep2Errors((c) => ({ ...c, phone: '' })); }} placeholder="+91 98765 43210" />
                        <FieldError msg={step2Errors.phone} />
                        {renderFieldHelp('bkPhone')}
                      </div>

                      <div className="bk-field-group">
                        <label className="bk-field-label" htmlFor="bkNotes">Notes for your editor</label>
                        <textarea id="bkNotes" className="bk-input bk-textarea" value={bookingData.notes}
                          onFocus={handleFieldFocus('bkNotes')}
                          onBlur={handleFieldBlur}
                          onChange={updateField('notes')}
                          placeholder="The feel, the moments to keep, anything that matters most…" />
                        {renderFieldHelp('bkNotes')}
                      </div>
                    </>
                  )}
                </div>

                <div className="bk-footer" style={{ flexDirection: 'column', gap: '12px' }}>
                  {bookingStep === 1 && (
                    <div className="bk-sticky-total">
                      <span>Estimated total:</span>
                      <strong>₹{liveTotalRupees.toLocaleString('en-IN')}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '12px' }}>
                    {bookingStep === 2 && (
                      <button className="bk-back" type="button" onClick={() => setBookingStep(1)}>← Back</button>
                    )}
                    <button
                      className="bk-submit"
                      type="button"
                      style={{ flex: 1 }}
                      onClick={() => {
                        if (bookingStep === 1) { if (validateStep1()) setBookingStep(2); }
                        else { handleConfirmBooking(); }
                      }}
                    >
                      {bookingStep === 1 ? 'Continue' : 'Confirm booking & Proceed to Payment'}
                    </button>
                  </div>
                </div>
              </>
            ) : bookingStep === 3 ? (
              <div className="bk-body">
                <CheckoutForm
                  order={createdOrder || { id: 'NEW', ...bookingData, bookingDate: selectedDate?.toISOString().slice(0, 10) }}
                  amountRupees={createdOrder?.price || liveTotalRupees}
                  clientSecret={checkoutSecret}
                  onPaymentSuccess={() => setBookingStep(4)}
                  onCancel={() => setBookingStep(2)}
                />
              </div>
            ) : (
              <div className="bk-success">
                <div className="bk-check">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12l5 5L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="bk-success-title">Booking Confirmed & Payment Received</h3>
                <p className="bk-success-sub">
                  We've received your booking and payment for <strong>{selectedLabel}</strong>. An editor will be assigned shortly.
                </p>
                <div className="bk-receipt">
                  <div className="bk-receipt-row"><span>Date</span><strong>{selectedLabel}</strong></div>
                  <div className="bk-receipt-row"><span>Occasion</span><strong>{Array.isArray(bookingData.occasion) ? bookingData.occasion.map(o => o === 'Other' ? bookingData.occasionOther || 'Other' : o).join(', ') : (bookingData.occasion === 'Other' ? bookingData.occasionOther || 'Other' : bookingData.occasion)}</strong></div>
                  <div className="bk-receipt-row"><span>Total Paid</span><strong>₹{liveTotalRupees.toLocaleString('en-IN')}</strong></div>
                  <div className="bk-receipt-row"><span>Status</span><strong style={{ color: '#34D399' }}>PAYMENT_RECEIVED</strong></div>
                </div>
                <button className="bk-submit" type="button" onClick={closeModal}>Done</button>
              </div>
            )}
            </>
            )}

          </div>
        </div>
      )}

      {/* ── EDITOR APPLICATION MODAL ── */}
      {editorModalOpen && (
        <div className="bk-overlay" onClick={closeEditorModal}>
          <div className="bk-sheet editor-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bk-header editor-header">
              <div>
                <span className="bk-header-date">Editor application</span>
                <p className="bk-sub editor-header-sub">Join Realyt’s editorial team and help shape films for milestone moments.</p>
              </div>
              <button className="bk-close" type="button" aria-label="Close" onClick={closeEditorModal}>✕</button>
            </div>
            <div className="bk-body">
              {editorSubmitted ? (
                <div className="bk-success">
                  <div className="bk-check">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M4 12l5 5L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="bk-success-title">Application received.</h3>
                  <p className="bk-success-sub">Thanks for applying. We’ll review your profile and reach out if you’re a match for the team.</p>
                  <button className="bk-submit" type="button" onClick={closeEditorModal}>Close</button>
                </div>
              ) : (
                <>
                  <p className="bk-eyebrow">Editors apply here</p>
                  <h3 className="bk-title">Become a Realyt editor</h3>
                  <p className="bk-sub">Tell us about your experience, tools, and availability so we can review your fit.</p>

                  <div className="bk-row-2 editor-form-grid">
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorName">Full name</label>
                      <input id="editorName" type="text" className={`bk-input ${editorErrors.name ? 'bk-input-err' : ''}`} value={editorForm.name}
                        onFocus={handleFieldFocus('editorName')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => { setEditorForm((c) => ({ ...c, name: e.target.value })); setEditorErrors((c) => ({ ...c, name: '' })); }} placeholder="First and last name" />
                      <FieldError msg={editorErrors.name} />
                      {renderFieldHelp('editorName')}
                    </div>
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorEmail">Email address</label>
                      <input id="editorEmail" type="email" className={`bk-input ${editorErrors.email ? 'bk-input-err' : ''}`} value={editorForm.email}
                        onFocus={handleFieldFocus('editorEmail')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => { setEditorForm((c) => ({ ...c, email: e.target.value })); setEditorErrors((c) => ({ ...c, email: '' })); }} placeholder="you@example.com" />
                      <FieldError msg={editorErrors.email} />
                      {renderFieldHelp('editorEmail')}
                    </div>
                  </div>

                  <div className="bk-row-2 editor-form-grid">
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorMobile">Mobile number</label>
                      <input id="editorMobile" type="tel" className={`bk-input ${editorErrors.mobile ? 'bk-input-err' : ''}`} value={editorForm.mobile}
                        onFocus={handleFieldFocus('editorMobile')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => { setEditorForm((c) => ({ ...c, mobile: e.target.value })); setEditorErrors((c) => ({ ...c, mobile: '' })); }} placeholder="+91 98765 43210" />
                      <FieldError msg={editorErrors.mobile} />
                      {renderFieldHelp('editorMobile')}
                    </div>
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorPortfolio">Portfolio link</label>
                      <input id="editorPortfolio" type="url" className={`bk-input ${editorErrors.portfolio ? 'bk-input-err' : ''}`} value={editorForm.portfolio}
                        onFocus={handleFieldFocus('editorPortfolio')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => { setEditorForm((c) => ({ ...c, portfolio: e.target.value })); setEditorErrors((c) => ({ ...c, portfolio: '' })); }} placeholder="Website, Vimeo, Instagram, etc." />
                      <FieldError msg={editorErrors.portfolio} />
                      {renderFieldHelp('editorPortfolio')}
                    </div>
                  </div>

                  <div className="bk-row-2 editor-form-grid">
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorExperience">Experience level</label>
                      <select id="editorExperience" className={`bk-input ${editorErrors.experience ? 'bk-input-err' : ''}`} value={editorForm.experience}
                        onFocus={handleFieldFocus('editorExperience')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => { setEditorForm((c) => ({ ...c, experience: e.target.value })); setEditorErrors((c) => ({ ...c, experience: '' })); }}>
                        <option value="">Select experience</option>
                        <option value="Junior">Junior editor</option>
                        <option value="Mid">Mid-level editor</option>
                        <option value="Senior">Senior editor</option>
                        <option value="Lead">Lead editor / creative partner</option>
                      </select>
                      <FieldError msg={editorErrors.experience} />
                      {renderFieldHelp('editorExperience')}
                    </div>
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorTools">Editing tools</label>
                      <input id="editorTools" type="text" className={`bk-input ${editorErrors.tools ? 'bk-input-err' : ''}`} value={editorForm.tools}
                        onFocus={handleFieldFocus('editorTools')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => { setEditorForm((c) => ({ ...c, tools: e.target.value })); setEditorErrors((c) => ({ ...c, tools: '' })); }} placeholder="Premiere, DaVinci, After Effects, etc." />
                      <FieldError msg={editorErrors.tools} />
                      {renderFieldHelp('editorTools')}
                    </div>
                  </div>

                  <div className="bk-row-2 editor-form-grid">
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorAvailability">Availability</label>
                      <select id="editorAvailability" className={`bk-input ${editorErrors.availability ? 'bk-input-err' : ''}`} value={editorForm.availability}
                        onFocus={handleFieldFocus('editorAvailability')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => { setEditorForm((c) => ({ ...c, availability: e.target.value })); setEditorErrors((c) => ({ ...c, availability: '' })); }}>
                        <option value="">Select availability</option>
                        <option value="Full time">Full time</option>
                        <option value="Part time">Part time</option>
                        <option value="Freelance">Freelance / project basis</option>
                      </select>
                      <FieldError msg={editorErrors.availability} />
                      {renderFieldHelp('editorAvailability')}
                    </div>
                    <div className="bk-field-group">
                      <label className="bk-field-label" htmlFor="editorNotes">Notes</label>
                      <textarea id="editorNotes" className="bk-input bk-textarea" value={editorForm.notes}
                        onFocus={handleFieldFocus('editorNotes')}
                        onBlur={handleFieldBlur}
                        onChange={(e) => setEditorForm((c) => ({ ...c, notes: e.target.value }))}
                        placeholder="Tell us about your experience, workflow, or what you bring to the team." />
                      {renderFieldHelp('editorNotes')}
                    </div>
                  </div>
                </>
              )}
            </div>
            {!editorSubmitted && (
              <div className="bk-footer">
                <button className="bk-submit" type="button" onClick={submitEditorApplication}>Send application</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── USER PROFILE MODAL ── */}
      {profileModalOpen && (
        <div className="bk-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="bk-sheet profile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bk-header profile-header">
              <div className="profile-header-left">
                <div className="profile-avatar-large">
                  {(() => {
                    const u = auth?.user || currentUser;
                    const str = u?.firstName || u?.name || u?.email || 'U';
                    return (typeof str === 'string' && str.length > 0) ? str[0].toUpperCase() : 'U';
                  })()}
                </div>
                <div>
                  <h3 className="profile-header-name">
                    {(auth?.user || currentUser)?.name || (auth?.user || currentUser)?.firstName || 'My Profile'}
                  </h3>
                  <p className="profile-header-email">{(auth?.user || currentUser)?.email}</p>
                </div>
              </div>
              <button className="bk-close" type="button" aria-label="Close" onClick={() => setProfileModalOpen(false)}>✕</button>
            </div>

            <div className="bk-body profile-body">
              {profileSavedSuccess ? (
                <div className="bk-success" style={{ padding: '24px 0' }}>
                  <div className="bk-check">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M4 12l5 5L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="bk-success-title">Profile Saved</h3>
                  <p className="bk-success-sub">Your personal details have been updated successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="bk-field-group">
                    <label className="bk-field-label" htmlFor="pfName">Full Name</label>
                    <input
                      id="pfName"
                      type="text"
                      className="bk-input"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="bk-field-group">
                    <label className="bk-field-label" htmlFor="pfEmail">Email Address</label>
                    <input
                      id="pfEmail"
                      type="email"
                      className="bk-input profile-input-disabled"
                      value={profileForm.email}
                      disabled
                    />
                    <span className="profile-field-note">Verified email linked to your account</span>
                  </div>

                  <div className="bk-field-group">
                    <label className="bk-field-label" htmlFor="pfPhone">Phone / Mobile Number</label>
                    <input
                      id="pfPhone"
                      type="tel"
                      className="bk-input"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="bk-field-group">
                    <label className="bk-field-label" htmlFor="pfAddress">City / Address</label>
                    <input
                      id="pfAddress"
                      type="text"
                      className="bk-input"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="e.g. Mumbai, Delhi, Jaipur"
                    />
                  </div>

                  <div className="profile-modal-footer">
                    <button className="bk-submit" type="submit">Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
