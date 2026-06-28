import React, { useState } from 'react';
import { AuthView, User } from '../types';
import { useAppContext } from '../App';
import { languages } from '../translations';
import { EyeIcon, EyeOffIcon, UserPlusIcon } from '../constants';
import { Languages, ArrowLeft } from 'lucide-react';

const LanguageSelector: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 dark:bg-dark-muted/50 hover:bg-muted dark:hover:bg-dark-muted transition border border-border/50 dark:border-dark-border/50"
            >
                <Languages className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {languages.find(l => l.code === state.language)?.name || 'English'}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-64 py-2 animate-in fade-in zoom-in duration-200">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    dispatch({ type: 'SET_LANGUAGE', payload: lang.code });
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted dark:hover:bg-dark-muted transition ${state.language === lang.code ? 'bg-primary/10 text-primary' : ''}`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-xs font-bold uppercase tracking-tight">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const InputField: React.FC<{ 
    id: string, 
    type: string, 
    placeholder: string, 
    label: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    required?: boolean,
    maxLength?: number,
    pattern?: string,
    inputMode?: "search" | "text" | "none" | "tel" | "url" | "email" | "numeric" | "decimal" | undefined
}> = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

    return (
        <div className="relative">
            <label htmlFor={props.id} className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-tighter">{props.label}</label>
            <div className="relative">
                <input
                    {...props}
                    type={inputType}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-dark-input border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 font-bold text-sm text-slate-900 dark:text-white"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

// Helper to compute SHA-256 hash using native Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const COUNTRY_CODES = [
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
];

const Auth: React.FC = () => {
    const { state, dispatch, t } = useAppContext();
    const [view, setView] = useState<AuthView>(AuthView.LOGIN);
    const [formError, setFormError] = useState<string | null>(null);

    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // Signup form state
    const [signupStep, setSignupStep] = useState(1);
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupCountryCode, setSignupCountryCode] = useState('+44');
    const [signupPhoneBody, setSignupPhoneBody] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    
    // Verification States
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailInputCode, setEmailInputCode] = useState('');
    const [expectedEmailCode, setExpectedEmailCode] = useState('');
    const [emailSending, setEmailSending] = useState(false);

    const [phoneCodeSent, setPhoneCodeSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [phoneInputCode, setPhoneInputCode] = useState('');
    const [expectedPhoneCode, setExpectedPhoneCode] = useState('');
    const [phoneSending, setPhoneSending] = useState(false);

    const [simulatedNotifications, setSimulatedNotifications] = useState<{ id: string, type: 'email' | 'sms', to: string, body: string }[]>([]);
    const [authWarning, setAuthWarning] = useState<{ type: 'email' | 'sms', message: string, details?: string } | null>(null);

    const [signupIdCard, setSignupIdCard] = useState('');
    const [signupTaxNumber, setSignupTaxNumber] = useState('');
    const [signupOther, setSignupOther] = useState('');
    const [signupDob, setSignupDob] = useState('');
    const [signupIncome, setSignupIncome] = useState('');
    const [signupPin, setSignupPin] = useState('');
    const [signupConfirmPin, setSignupConfirmPin] = useState('');
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    const handleSendEmailCode = async () => {
        if (!signupEmail || !signupEmail.includes('@')) {
            setFormError("Please enter a valid email address first.");
            return;
        }
        setFormError(null);
        setEmailSending(true);
        
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setExpectedEmailCode(randomCode);

        try {
            const response = await fetch('/api/auth/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupEmail, code: randomCode })
            });
            const resData = await response.json();
            
            setEmailCodeSent(true);
            setEmailSending(false);

            if (resData.simulated) {
                const newNotif = {
                    id: `email-${Date.now()}`,
                    type: 'email' as const,
                    to: signupEmail,
                    body: `Your verification code is: ${randomCode}. This code will expire in the next 5 minutes.`
                };
                setSimulatedNotifications(prev => [newNotif, ...prev]);
            } else {
                setAuthWarning(null);
                const newNotif = {
                    id: `email-${Date.now()}`,
                    type: 'email' as const,
                    to: signupEmail,
                    body: `Your verification code is: ${randomCode}. This code will expire in the next 5 minutes.`
                };
                setSimulatedNotifications(prev => [newNotif, ...prev]);
            }
        } catch (err: any) {
            console.error(err);
            setEmailSending(false);
            setFormError("Failed to dispatch verification email. Please check your network or credentials.");
        }
    };

    const handleVerifyEmail = () => {
        if (emailInputCode === expectedEmailCode) {
            setEmailVerified(true);
            setFormError(null);
        } else {
            setFormError("Invalid email verification code. Please try again.");
        }
    };

    const handleSendPhoneCode = async () => {
        if (!signupPhoneBody || signupPhoneBody.trim().length < 5) {
            setFormError("Please enter a valid phone number first.");
            return;
        }
        setFormError(null);
        setPhoneSending(true);
        const fullPhone = `${signupCountryCode}${signupPhoneBody.trim()}`;
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setExpectedPhoneCode(randomCode);

        try {
            const response = await fetch('/api/auth/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone, code: randomCode })
            });
            const resData = await response.json();

            setPhoneCodeSent(true);
            setPhoneSending(false);

            if (resData.simulated) {
                const newNotif = {
                    id: `sms-${Date.now()}`,
                    type: 'sms' as const,
                    to: fullPhone,
                    body: `Your mobile verification code is: ${randomCode}. This code will expire in the next 5 minutes.`
                };
                setSimulatedNotifications(prev => [newNotif, ...prev]);
            } else {
                setAuthWarning(null);
                const newNotif = {
                    id: `sms-${Date.now()}`,
                    type: 'sms' as const,
                    to: fullPhone,
                    body: `Your mobile verification code is: ${randomCode}. This code will expire in the next 5 minutes.`
                };
                setSimulatedNotifications(prev => [newNotif, ...prev]);
            }
        } catch (err: any) {
            console.error(err);
            setPhoneSending(false);
            setFormError("Failed to dispatch verification SMS. Please check your network or credentials.");
        }
    };

    const handleVerifyPhone = () => {
        if (phoneInputCode === expectedPhoneCode) {
            setPhoneVerified(true);
            setSignupPhone(`${signupCountryCode}${signupPhoneBody}`);
            setFormError(null);
        } else {
            setFormError("Invalid phone verification code. Please try again.");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        dispatch({ type: 'CLEAR_AUTH_ERROR' });

        setView(AuthView.LOGGING_IN);

        let currentUsersList = state.users;
        try {
            // Force synchronous database fetch to guarantee multi-device login immediately
            const res = await fetch('/api/state');
            if (res.ok) {
                const data = await res.json();
                if (data && data.users) {
                    currentUsersList = data.users;
                }
                dispatch({ type: 'SYNC_STATE', payload: data });
            }
        } catch (err) {
            console.warn("Could not fetch fresh state before login", err);
        }
        
        const cleanIdentifier = loginIdentifier.toLowerCase().trim().replace(/\s+/g, '');
        const inputPhoneDigits = loginIdentifier.replace(/[^\d]/g, '');
        const hashedPassword = await hashPassword(password);

        const foundUser = currentUsersList.find(u => {
            const userEmail = u.email.toLowerCase().trim().replace(/\s+/g, '');
            const userPhoneDigits = u.phone.replace(/[^\d]/g, '');
            const userName = u.name.toLowerCase().trim().replace(/\s+/g, '');
            const userAccount = u.accountNumber.trim();
            
            const isPhoneMatch = Boolean(
                inputPhoneDigits && 
                userPhoneDigits && 
                (userPhoneDigits === inputPhoneDigits || 
                 userPhoneDigits.endsWith(inputPhoneDigits) || 
                 inputPhoneDigits.endsWith(userPhoneDigits))
            );

            const isPasswordCorrect = u.password === password || u.password === hashedPassword;

            return (userEmail === cleanIdentifier || 
                    isPhoneMatch || 
                    userName === cleanIdentifier ||
                    userAccount === loginIdentifier.trim()) && 
                    isPasswordCorrect;
        });

        if (!foundUser) {
            setView(AuthView.LOGIN);
            setFormError(t('errorInvalidCredentials'));
            return;
        }

        setTimeout(() => {
            dispatch({ type: 'LOGIN', payload: { email: foundUser.email, password: password, hashedPassword: hashedPassword } });
        }, 800);
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword || !signupPhoneBody) {
            setFormError("All fields on this page are required.");
            return;
        }

        if (signupPassword !== signupConfirmPassword) {
            setFormError("Passwords do not match. Please enter the same password twice.");
            return;
        }

        if (signupPassword.length < 6) {
            setFormError("Password must be at least 6 characters long.");
            return;
        }

        if (!emailVerified) {
            setFormError("Please verify your email address first.");
            return;
        }

        if (!phoneVerified) {
            setFormError("Please verify your phone number first.");
            return;
        }

        const fullPhoneDigits = `${signupCountryCode}${signupPhoneBody}`.replace(/[^\d]/g, '');

        const exists = state.users.some(u => 
            u.email.toLowerCase() === signupEmail.toLowerCase().trim() ||
            u.phone.replace(/[^\d]/g, '') === fullPhoneDigits
        );

        if (exists) {
            setFormError("A user with this email or phone number already exists.");
            return;
        }

        setSignupStep(2);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!signupIdCard || !signupTaxNumber || !signupPin || !signupConfirmPin || !signupDob || !signupIncome) {
            setFormError("All fields are required. Please enter your ID card, Tax ID/BVN, DOB, Income, and PIN.");
            return;
        }

        if (signupPin.length !== 4 || isNaN(Number(signupPin))) {
            setFormError("Transaction PIN must be exactly 4 digits.");
            return;
        }

        if (signupPin !== signupConfirmPin) {
            setFormError("Transaction PINs do not match. Please enter the same 4-digit PIN twice.");
            return;
        }

        setIsCreatingAccount(true);

        try {
            const hashedPassword = await hashPassword(signupPassword);

            // Ensure unique account number
            let generatedAcc = '';
            let isUnique = false;
            while (!isUnique) {
                generatedAcc = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
                isUnique = !state.users.some(u => u.accountNumber === generatedAcc);
            }

            const newUser: User = {
                id: `usr_${Date.now()}`,
                name: signupName,
                email: signupEmail,
                password: hashedPassword,
                phone: signupPhone,
                accountNumber: generatedAcc,
                bvn: signupTaxNumber,
                idCardNumber: signupIdCard,
                avatar: `https://picsum.photos/seed/${signupName}/200/200`,
                balance: 0.0, // Empty balance, no bonus!
                savingsBalance: 0,
                loanBalance: 0,
                transactions: [], // Empty transactions, no bonus transaction!
                notifications: [
                    {
                        id: `notif_${Date.now()}`,
                        title: "Welcome to Prisparimo Bank!",
                        message: "Thank you for creating an account. Your account is active and verified.",
                        date: new Date().toISOString(),
                        read: false,
                        type: 'success'
                    }
                ],
                pin: signupPin,
                currency: 'GBP',
                role: 'customer',
                isActivated: true,
                isBlocked: false,
                profession: signupOther || undefined,
                dob: signupDob,
                income: signupIncome
            };

            // Wait for 4 seconds to simulate the registration progress
            setTimeout(async () => {
                try {
                    // Sync user to cloud database directly (Firebase via Express backend)
                    await fetch('/api/users/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newUser)
                    });

                    // Trigger state update to log the user in directly to Dashboard
                    dispatch({ type: 'SIGNUP', payload: newUser });
                    setIsCreatingAccount(false);
                } catch (err) {
                    console.error(err);
                    setFormError("Failed to register. Please try again.");
                    setIsCreatingAccount(false);
                }
            }, 4000);

        } catch (err) {
            console.error(err);
            setFormError("An unexpected error occurred. Please try again.");
            setIsCreatingAccount(false);
        }
    };

    // Auto-clear error when user types and handle auth errors
    React.useEffect(() => {
        if (formError) setFormError(null);
    }, [loginIdentifier, password, signupName, signupEmail, signupPassword, signupConfirmPassword, signupPhone, signupIdCard, signupTaxNumber, signupOther, signupPin, signupConfirmPin, signupDob, signupIncome]);

    React.useEffect(() => {
        if (state.authError) {
            setView(AuthView.LOGIN);
            setFormError(t(state.authError as any));
            dispatch({ type: 'CLEAR_AUTH_ERROR' });
        }
    }, [state.authError, t, dispatch]);

    if (isCreatingAccount) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-dark-background px-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-xl font-black uppercase tracking-tighter">{t('bankName')}</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground animate-pulse">Creating your account...</p>
            </div>
        );
    }

    if (view === AuthView.LOGGING_IN) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-dark-background px-4">
                <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-xl font-black uppercase tracking-tighter">{t('bankName')}</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground animate-pulse">{t('signInWait')}</p>
            </div>
        );
    }

    if (view === AuthView.SIGNUP) {
        if (signupSuccess) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background px-4">
                    <div className="max-w-md w-full bg-white dark:bg-dark-card p-10 rounded-[2.5rem] shadow-2xl border border-border text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-3xl mx-auto flex items-center justify-center mb-6">
                            <span className="text-green-600 dark:text-green-400 font-black text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">{t('success')}</h2>
                        <p className="text-sm opacity-80 mb-8">
                            Your Prisparimo account has been successfully created with a welcome bonus! You can now log in using your registered credentials on any device.
                        </p>
                        <button 
                            onClick={() => {
                                setSignupSuccess(false);
                                setSignupStep(1);
                                setView(AuthView.LOGIN);
                            }} 
                            className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition"
                        >
                            {t('backToLogin')}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background px-4 py-8">
                <div className="absolute top-6 left-6">
                    <button 
                        onClick={() => {
                            if (signupStep === 1) {
                                setView(AuthView.LOGIN);
                            } else {
                                setSignupStep(1);
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 dark:bg-dark-muted/50 hover:bg-muted dark:hover:bg-dark-muted transition border border-border/50 dark:border-dark-border/50 text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-primary" />
                        <span>{signupStep === 1 ? t('backToLogin') : "Back to Step 1"}</span>
                    </button>
                </div>
                <div className="max-w-md w-full bg-white dark:bg-dark-card p-10 rounded-[2.5rem] shadow-2xl border border-border mt-12 md:mt-0">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">{t('createAccount')}</h2>
                        <p className="text-muted-foreground mt-2 font-bold uppercase text-[9px] tracking-[0.1em]">Join Prisparimo Bank in minutes</p>
                    </div>

                    {/* Simulated Inbox / Dispatcher Messages */}
                    {simulatedNotifications.length > 0 && (
                        <div className="mb-6 max-h-40 overflow-y-auto space-y-2 border-b border-dashed border-border dark:border-dark-border pb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">⚡ SECURE DISPATCH RECEIVER (SIMULATED)</span>
                                <button onClick={() => setSimulatedNotifications([])} className="text-[8px] font-bold text-red-500 uppercase hover:underline">Clear All</button>
                            </div>
                            {simulatedNotifications.map(notif => (
                                <div key={notif.id} className="p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-300">
                                    <span className="text-base">{notif.type === 'email' ? '📧' : '💬'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black uppercase text-[8px] tracking-wider text-primary opacity-80">{notif.type === 'email' ? `EMAIL to: ${notif.to}` : `SMS to: ${notif.to}`}</p>
                                        <p className="text-gray-900 dark:text-white font-semibold mt-0.5 break-words">{notif.body}</p>
                                    </div>
                                    <button onClick={() => setSimulatedNotifications(prev => prev.filter(n => n.id !== notif.id))} className="text-gray-400 hover:text-gray-600 font-bold text-sm">×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {authWarning && (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300 animate-in fade-in duration-300 relative">
                            <button onClick={() => setAuthWarning(null)} className="absolute top-2 right-2 text-amber-500 hover:text-amber-700 font-bold text-sm">×</button>
                            <p className="font-bold uppercase text-[9px] tracking-widest text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                                <span>⚠️ Real {authWarning.type === 'email' ? 'Email' : 'SMS'} Provider Alert</span>
                            </p>
                            <p className="font-semibold">{authWarning.message}</p>
                            {authWarning.details && (
                                <div className="mt-2 p-2 bg-amber-100/50 dark:bg-amber-950/40 rounded-lg font-mono text-[10px] text-amber-900 dark:text-amber-200 overflow-x-auto whitespace-pre-wrap">
                                    Raw Provider Error: {authWarning.details}
                                </div>
                            )}
                            <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-400">
                                {authWarning.type === 'email' ? (
                                    <>
                                        <strong>How to fix:</strong> In Resend, verify the domain <code>{signupEmail.split('@')[1] || 'your-domain'}</code> on <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-bold">Resend Domains</a>. If using Resend's free tier with <code>onboarding@resend.dev</code>, make sure you sign up with the exact email registered to your Resend account.
                                    </>
                                ) : (
                                    <>
                                        <strong>How to fix:</strong> In Twilio, make sure the destination phone number is added to <a href="https://console.twilio.com/us1/develop/phone-numbers/verified-caller-ids" target="_blank" rel="noreferrer" className="underline font-bold">Verified Caller IDs</a> since your Twilio account is a trial account.
                                    </>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Progress indicator */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex-1 bg-gray-200 dark:bg-dark-muted rounded-full h-1.5 mr-3 overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-300 ${signupStep === 1 ? 'w-1/2' : 'w-full'}`}></div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Step {signupStep} of 2</span>
                    </div>

                    {signupStep === 1 ? (
                        <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in duration-300">
                            <InputField id="signup-name" type="text" label={t('fullName') || "Full Name"} placeholder={t('fullName') || "e.g. John Doe"} value={signupName} onChange={e => setSignupName(e.target.value)} required />
                            
                            {/* Email verification field */}
                            <div className="space-y-1.5">
                                <InputField id="signup-email" type="email" label={t('emailLabel')} placeholder={t('emailPlaceholder')} value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required disabled={emailVerified} />
                                {!emailVerified && (
                                    <div className="mt-1">
                                        {!emailCodeSent ? (
                                            <button
                                                type="button"
                                                onClick={handleSendEmailCode}
                                                disabled={emailSending || !signupEmail.includes('@')}
                                                className="w-full text-center bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 font-black uppercase text-[10px] tracking-widest py-2 px-3 rounded-xl border border-primary/20 transition"
                                            >
                                                {emailSending ? "Sending code..." : "Send Email Verification Code"}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                                <input 
                                                    type="text" 
                                                    placeholder="6-Digit Code" 
                                                    value={emailInputCode} 
                                                    onChange={e => setEmailInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-dark-input font-bold text-xs text-center border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[9px] tracking-widest py-2 px-3 rounded-xl transition"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSendEmailCode}
                                                    className="bg-gray-200 hover:bg-gray-300 dark:bg-dark-muted text-foreground font-black uppercase text-[9px] tracking-widest py-2 px-3 rounded-xl transition"
                                                >
                                                    Resend
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {emailVerified && (
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-wider flex items-center gap-1.5 mt-1">
                                        <span className="w-4 h-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-[9px]">✓</span>
                                        <span>Email address verified</span>
                                    </p>
                                )}
                            </div>

                            {/* Phone with Country Code and verification field */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-tighter">Phone Number</label>
                                <div className="flex gap-2">
                                    <select 
                                        value={signupCountryCode}
                                        onChange={e => setSignupCountryCode(e.target.value)}
                                        disabled={phoneVerified}
                                        className="w-[110px] px-2 py-3 rounded-xl bg-gray-100 dark:bg-dark-input border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-bold text-xs text-slate-900 dark:text-white"
                                    >
                                        {COUNTRY_CODES.map(cc => (
                                            <option key={cc.code} value={cc.code}>
                                                {cc.flag} {cc.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input 
                                        type="tel"
                                        disabled={phoneVerified}
                                        placeholder="7123 456789"
                                        value={signupPhoneBody}
                                        onChange={e => setSignupPhoneBody(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-dark-input border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-bold text-sm text-slate-900 dark:text-white"
                                    />
                                </div>

                                {!phoneVerified && (
                                    <div className="mt-1">
                                        {!phoneCodeSent ? (
                                            <button
                                                type="button"
                                                onClick={handleSendPhoneCode}
                                                disabled={phoneSending || signupPhoneBody.trim().length < 5}
                                                className="w-full text-center bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 font-black uppercase text-[10px] tracking-widest py-2 px-3 rounded-xl border border-primary/20 transition"
                                            >
                                                {phoneSending ? "Sending code..." : "Send SMS Verification Code"}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                                <input 
                                                    type="text" 
                                                    placeholder="6-Digit Code" 
                                                    value={phoneInputCode} 
                                                    onChange={e => setPhoneInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-dark-input font-bold text-xs text-center border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyPhone}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[9px] tracking-widest py-2 px-3 rounded-xl transition"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSendPhoneCode}
                                                    className="bg-gray-200 hover:bg-gray-300 dark:bg-dark-muted text-foreground font-black uppercase text-[9px] tracking-widest py-2 px-3 rounded-xl transition"
                                                >
                                                    Resend
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {phoneVerified && (
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-wider flex items-center gap-1.5 mt-1">
                                        <span className="w-4 h-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-[9px]">✓</span>
                                        <span>Phone number verified ({signupCountryCode} {signupPhoneBody})</span>
                                    </p>
                                )}
                            </div>

                            <InputField id="signup-password" type="password" label={t('passwordLabel')} placeholder={t('passwordPlaceholder')} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                            <InputField id="signup-confirm-password" type="password" label="Confirm Password" placeholder="Repeat your password" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} required />
                            
                            {formError && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl text-center font-black border border-red-100 dark:border-red-900/30 uppercase">{formError}</p>}
                            
                            <button 
                                type="submit" 
                                disabled={!emailVerified || !phoneVerified}
                                className={`w-full text-white font-black py-4 rounded-2xl shadow-xl transition transform uppercase tracking-widest text-xs mt-2 flex items-center justify-center gap-2 ${(!emailVerified || !phoneVerified) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-primary shadow-primary/30 hover:scale-[1.02] active:scale-95'}`}
                            >
                                <span>Next Step</span>
                                <span className="text-lg">➔</span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in duration-300">
                            <InputField id="signup-idcard" type="text" label="ID Card Number" placeholder="e.g. NIN, National ID or Passport Number" value={signupIdCard} onChange={e => setSignupIdCard(e.target.value)} required />
                            <InputField id="signup-taxnumber" type="text" label="Tax ID / BVN" placeholder="e.g. 10 or 11-digit Tax/BVN verification" value={signupTaxNumber} onChange={e => setSignupTaxNumber(e.target.value)} required />
                            <InputField id="signup-other" type="text" label="Profession / Job Details" placeholder="e.g. Accountant, Student, Developer" value={signupOther} onChange={e => setSignupOther(e.target.value)} />
                            <InputField id="signup-dob" type="date" label="Date of Birth" placeholder="Select your DOB" value={signupDob} onChange={e => setSignupDob(e.target.value)} required />
                            <InputField id="signup-income" type="text" label="Annual/Monthly Income" placeholder="e.g. £35,000 or $3,000" value={signupIncome} onChange={e => setSignupIncome(e.target.value)} required />
                            <InputField id="signup-pin" type="password" inputMode="numeric" maxLength={4} pattern="[0-9]*" label="4-Digit Transaction PIN" placeholder="e.g. 1212" value={signupPin} onChange={e => setSignupPin(e.target.value.slice(0, 4))} required />
                            <InputField id="signup-confirm-pin" type="password" inputMode="numeric" maxLength={4} pattern="[0-9]*" label="Confirm 4-Digit Transaction PIN" placeholder="Repeat your 4-digit PIN" value={signupConfirmPin} onChange={e => setSignupConfirmPin(e.target.value.slice(0, 4))} required />
                            
                            {formError && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl text-center font-black border border-red-100 dark:border-red-900/30 uppercase">{formError}</p>}
                            
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setSignupStep(1)} className="flex-1 bg-muted dark:bg-dark-muted text-foreground dark:text-dark-foreground font-black uppercase py-4 rounded-2xl text-[10px] tracking-widest border border-border dark:border-dark-border">Back</button>
                                <button type="submit" className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs">Create Account</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background px-4">
            <div className="absolute top-6 right-6">
                <LanguageSelector />
            </div>
            <div className="max-w-md w-full bg-white dark:bg-dark-card p-10 rounded-[2.5rem] shadow-2xl border border-border">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-primary/20 rotate-3">
                        <span className="text-white font-black text-3xl">P</span>
                    </div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase leading-none">{t('bankName')}</h1>
                    <p className="text-muted-foreground mt-2 font-bold uppercase text-[9px] tracking-[0.2em]">{t('bankSlogan')}</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <InputField id="login-id" type="text" label={t('emailLabel')} placeholder={t('emailPlaceholder')} value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} />
                    <InputField id="password" type="password" label={t('passwordLabel')} placeholder={t('passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} />
                    
                    {formError && <p className="text-xs text-red-600 bg-red-50 p-4 rounded-xl text-center font-black border border-red-100 uppercase">{formError}</p>}
                    <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs">{t('signIn')}</button>
                    
                    <div className="flex flex-col items-center gap-4 pt-4 border-t border-border mt-4">
                        <button type="button" onClick={() => setView(AuthView.SIGNUP)} className="flex items-center gap-3 text-primary font-black uppercase text-[11px] tracking-widest hover:opacity-70 transition group">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition">
                                <UserPlusIcon className="w-5 h-5" />
                            </div>
                            {t('createAccount')}
                        </button>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{t('secureLogin')}</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;