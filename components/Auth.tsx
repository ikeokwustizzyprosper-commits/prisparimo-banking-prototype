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

const InputField: React.FC<{ id: string, type: string, placeholder: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean }> = (props) => {
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
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-dark-input border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 font-bold text-sm"
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

const Auth: React.FC = () => {
    const { state, dispatch, t } = useAppContext();
    const [view, setView] = useState<AuthView>(AuthView.LOGIN);
    const [formError, setFormError] = useState<string | null>(null);

    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // Signup form state
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupSuccess, setSignupSuccess] = useState(false);

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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!signupName || !signupEmail || !signupPassword || !signupPhone) {
            setFormError("All fields are required.");
            return;
        }

        const exists = state.users.some(u => 
            u.email.toLowerCase() === signupEmail.toLowerCase().trim() ||
            u.phone.replace(/[^\d]/g, '') === signupPhone.replace(/[^\d]/g, '')
        );

        if (exists) {
            setFormError("A user with this email or phone number already exists.");
            return;
        }

        // Ensure unique account number
        let generatedAcc = '';
        let isUnique = false;
        while (!isUnique) {
            generatedAcc = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
            isUnique = !state.users.some(u => u.accountNumber === generatedAcc);
        }

        const hashedPassword = await hashPassword(signupPassword);

        const newUser: User = {
            id: `usr_${Date.now()}`,
            name: signupName,
            email: signupEmail,
            password: hashedPassword,
            phone: signupPhone,
            accountNumber: generatedAcc,
            bvn: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
            idCardNumber: `ID-${Math.floor(Math.random() * 900000 + 100000)}`,
            avatar: `https://picsum.photos/seed/${signupName}/200/200`,
            balance: 50.0,
            savingsBalance: 0,
            loanBalance: 0,
            transactions: [
                {
                    id: `tx_welcome_${Date.now()}`,
                    date: new Date().toISOString(),
                    description: "Welcome Sign Up Bonus",
                    amount: 50.0,
                    type: 'credit',
                    category: 'Transfer',
                    status: 'Completed',
                    reference: `REF-WELCOME-${Math.floor(Math.random() * 900000 + 100000)}`,
                    senderName: "Prisparimo Bank",
                    senderAccount: "SYSTEM-001",
                    receiverName: signupName,
                    receiverAccount: "SYSTEM-001",
                    bankName: "Prisparimo Core",
                    country: "United Kingdom",
                    currency: "GBP",
                    fee: 0
                }
            ],
            notifications: [
                {
                    id: `notif_${Date.now()}`,
                    title: "Welcome to Prisparimo Bank!",
                    message: "Thank you for creating an account. Enjoy your £50 sign-up bonus!",
                    date: new Date().toISOString(),
                    read: false,
                    type: 'success'
                }
            ],
            pin: '1212',
            currency: 'GBP',
            role: 'customer',
            isActivated: true,
            isBlocked: false
        };

        try {
            dispatch({ type: 'ADD_USER', payload: newUser });
            
            // Sync user to cloud database directly
            await fetch('/api/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            setSignupSuccess(true);
        } catch (err) {
            setFormError("Failed to register. Please try again.");
        }
    };

    // Auto-clear error when user types and handle auth errors
    React.useEffect(() => {
        if (formError) setFormError(null);
    }, [loginIdentifier, password, signupName, signupEmail, signupPassword, signupPhone]);

    React.useEffect(() => {
        if (state.authError) {
            setView(AuthView.LOGIN);
            setFormError(t(state.authError as any));
            dispatch({ type: 'CLEAR_AUTH_ERROR' });
        }
    }, [state.authError, t, dispatch]);

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
                        onClick={() => setView(AuthView.LOGIN)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 dark:bg-dark-muted/50 hover:bg-muted dark:hover:bg-dark-muted transition border border-border/50 dark:border-dark-border/50 text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-primary" />
                        <span>{t('backToLogin')}</span>
                    </button>
                </div>
                <div className="max-w-md w-full bg-white dark:bg-dark-card p-10 rounded-[2.5rem] shadow-2xl border border-border">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">{t('createAccount')}</h2>
                        <p className="text-muted-foreground mt-2 font-bold uppercase text-[9px] tracking-[0.1em]">Join Prisparimo Bank in minutes</p>
                    </div>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <InputField id="signup-name" type="text" label={t('fullName') || "Full Name"} placeholder={t('fullName') || "e.g. John Doe"} value={signupName} onChange={e => setSignupName(e.target.value)} required />
                        <InputField id="signup-email" type="email" label={t('emailLabel')} placeholder={t('emailPlaceholder')} value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                        <InputField id="signup-phone" type="tel" label={t('phoneNumber') || "Phone Number"} placeholder={t('phoneNumber') || "+44 7123 456789"} value={signupPhone} onChange={e => setSignupPhone(e.target.value)} required />
                        <InputField id="signup-password" type="password" label={t('passwordLabel')} placeholder={t('passwordPlaceholder')} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                        
                        {formError && <p className="text-xs text-red-600 bg-red-50 p-4 rounded-xl text-center font-black border border-red-100 uppercase">{formError}</p>}
                        
                        <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs mt-2">{t('createAccount')}</button>
                    </form>
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