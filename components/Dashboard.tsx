
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext, useTheme } from '../App';
import { Page } from '../types';
import { EyeIcon, EyeOffIcon, RefreshCwIcon, CreditCardIcon, MessageCircleIcon, UserIcon, formatCurrency, CURRENCY_DATA, convertFromGbp, AlertCircleIcon, EXCHANGE_RATES, BellIcon } from '../constants';
import { languages } from '../translations';
import { Languages, ShieldCheck, Lock, Settings, Moon, FileText, ChevronRight, Gauge } from 'lucide-react';
import Chatbot from './Chatbot';
import TransactionHistory from './TransactionHistory';

const CurrencySwitcher: React.FC = () => {
    const { state, dispatch, t } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedCurrency = CURRENCY_DATA.find(c => c.code === state.currentCurrency) || CURRENCY_DATA[0];
    const currentRate = EXCHANGE_RATES[state.currentCurrency] || 1;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-2 bg-muted/50 dark:bg-dark-muted text-[10px] rounded-xl py-2 px-4 border border-border dark:border-dark-border focus:outline-none"
                aria-label="Select currency"
            >
                <div className="flex items-center gap-2 font-black uppercase tracking-widest">
                    <span>{selectedCurrency.flag}</span>
                    <span>{selectedCurrency.code}</span>
                    {state.currentCurrency !== 'GBP' && (
                        <span className="ml-1 opacity-40 font-bold text-[8px] lowercase tracking-normal">
                            (1£ ≈ {currentRate.toFixed(2)} {state.currentCurrency})
                        </span>
                    )}
                </div>
                <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <ul className="absolute top-full mt-1 w-full bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl shadow-2xl z-30 overflow-y-auto max-h-64 py-1 animate-in fade-in zoom-in duration-200">
                    {CURRENCY_DATA.map(currency => (
                        <li key={currency.code}>
                            <button
                                onClick={() => {
                                    dispatch({ type: 'SET_CURRENCY', payload: currency.code });
                                    setIsOpen(false);
                                }}
                                className="w-full text-left flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase hover:bg-muted"
                            >
                                <div className="flex items-center gap-3">
                                    <span>{currency.flag}</span>
                                    <span>{currency.code}</span>
                                </div>
                                {currency.code !== 'GBP' && (
                                    <span className="text-[8px] opacity-40 font-bold lowercase tracking-tight">
                                        1£ ≈ {(EXCHANGE_RATES[currency.code] || 1).toFixed(2)} {currency.code}
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const BalanceCard: React.FC = () => {
    const { state, dispatch, t } = useAppContext();
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => { setIsRefreshing(false); }, 1500);
    };
    
    const convertedBalance = useMemo(() => {
        if (!state.currentUser) return 0;
        return convertFromGbp(state.currentUser.balance, state.currentCurrency);
    }, [state.currentUser, state.currentCurrency]);

    const unreadNotificationsCount = useMemo(() => {
        return (state.currentUser?.notifications || []).filter(n => !n.read).length;
    }, [state.currentUser?.notifications]);

    return (
        <div className="p-5 bg-slate-950 text-white rounded-b-[2.5rem] shadow-2xl relative overflow-hidden border-b border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] -ml-24 -mb-24" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={state.currentUser?.avatar} alt="User Avatar" className="w-10 h-10 rounded-xl border border-white/20 object-cover shadow-lg" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase opacity-40 tracking-[0.2em]">{t('accountHolder')}</p>
                        <h2 className="text-sm font-black uppercase tracking-tight">{state.currentUser?.name}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.NOTIFICATIONS })}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10 backdrop-blur-md relative"
                    >
                        <BellIcon className="w-4 h-4 text-primary" />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] font-black flex items-center justify-center rounded-full border border-slate-950">
                                {unreadNotificationsCount}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.PROFILE })}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10 backdrop-blur-md"
                    >
                        <UserIcon className="w-4 h-4 text-primary" />
                    </button>
                </div>
            </div>

            <div className="text-center pb-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded-full border border-white/10 mb-3">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                    <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">{t('securedLedger')}</p>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-1">
                    <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.4em]">{t('availableAssets')}</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tighter tabular-nums">
                            {isBalanceVisible ? formatCurrency(convertedBalance, state.currentCurrency) : '••••••••'}
                        </h1>
                        <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="p-1.5 hover:bg-white/5 rounded-full transition">
                            {isBalanceVisible ? <EyeOffIcon className="w-4 h-4 opacity-40" /> : <EyeIcon className="w-4 h-4 opacity-40" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-[9px] font-black opacity-30 mt-6 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>ID: {state.currentUser?.accountNumber}</span>
                  </div>
                  <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-1.5 hover:opacity-100 transition">
                    <RefreshCwIcon className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{t('sync')}</span>
                  </button>
                </div>
            </div>
        </div>
    );
};

const LanguageSelector: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 dark:bg-dark-muted/50 hover:bg-muted dark:hover:bg-dark-muted transition border border-border dark:border-dark-border"
            >
                <Languages className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {languages.find(l => l.code === state.language)?.flag}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl shadow-2xl z-50 overflow-y-auto max-h-64 py-1 animate-in fade-in zoom-in duration-200">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                dispatch({ type: 'SET_LANGUAGE', payload: lang.code });
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted dark:hover:bg-dark-muted transition ${state.language === lang.code ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            <span className="text-sm">{lang.flag}</span>
                            <span className="text-[9px] font-bold uppercase tracking-tight">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const TopBar: React.FC = () => (
    <div className="flex items-center justify-between p-3 bg-background dark:bg-dark-background border-b border-border/10">
        <div className="flex-1 max-w-[180px]">
            <CurrencySwitcher />
        </div>
        <LanguageSelector />
    </div>
);

const QuickActions: React.FC = () => {
    const { dispatch, t } = useAppContext();
    const actions = [
        { label: t('deposit'), page: Page.DEPOSIT, icon: '📥' },
        { label: t('transfer'), page: Page.TRANSFER, icon: '✈️' },
        { label: t('payBill'), page: Page.PAY_BILLS, icon: '📜' },
        { label: t('loan'), page: Page.LOAN, icon: '💎' },
        { label: t('vault'), page: Page.SAVINGS, icon: '🛡️' },
        { label: t('irsHub'), page: Page.IRS_REFUND, icon: '🏦' },
        { label: t('cards'), page: Page.CARDS, icon: <CreditCardIcon className="w-5 h-5 text-primary" /> },
        { label: t('support'), page: null, icon: <MessageCircleIcon className="w-5 h-5 text-primary" /> },
    ];
    
    return (
        <div className="p-5 mt-2">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{t('operationsDesk')}</h3>
                <div className="h-[1px] flex-1 bg-border/20 mx-3" />
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
                {actions.map(action => (
                    <button 
                        key={action.label} 
                        onClick={() => action.page ? dispatch({ type: 'SET_PAGE', payload: action.page }) : dispatch({ type: 'TOGGLE_CHAT', payload: true })} 
                        className="flex flex-col items-center gap-2 group transition-all"
                    >
                        <div className="w-12 h-12 bg-white dark:bg-dark-accent rounded-2xl flex items-center justify-center text-xl shadow-sm border border-border/50 group-hover:border-primary/30 group-hover:shadow-md group-active:scale-90 transition-all duration-300">
                            {action.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const SettingsSection: React.FC = () => {
    const { dispatch, t } = useAppContext();
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="px-5 py-8 pb-24">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{t('settings')}</h3>
                <div className="h-[1px] flex-1 bg-border/20 mx-3" />
            </div>

            <div className="space-y-6">
                {/* Security & Fraud Section */}
                <div className="bg-slate-50 dark:bg-dark-muted rounded-[2rem] p-5 border border-border dark:border-dark-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest">{t('securityAndFraud')}</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">{t('fraudMonitoring')}</span>
                            </div>
                            <span className="text-[8px] font-black text-green-600 uppercase bg-green-500/5 px-2 py-1 rounded-full border border-green-500/10">{t('active')}</span>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">{t('locationShield')}</span>
                            </div>
                            <span className="text-[8px] font-black text-green-600 uppercase bg-green-500/5 px-2 py-1 rounded-full border border-green-500/10">{t('active')}</span>
                        </div>
                    </div>
                </div>

                {/* Other Features Section */}
                <div className="bg-white dark:bg-dark-card rounded-[2rem] p-2 border border-border dark:border-dark-border shadow-sm overflow-hidden">
                    <div className="p-3 px-5 border-b border-border/50">
                        <h3 className="text-[9px] font-black uppercase tracking-widest opacity-40">{t('otherFeatures')}</h3>
                    </div>
                    
                    <div className="divide-y divide-border/30">
                        <button 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.CHANGE_PIN })}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">{t('changePin')}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-20" />
                        </button>

                        <button 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.LIMITS })}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/10 rounded-xl flex items-center justify-center">
                                    <Gauge className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">{t('limits')}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-20" />
                        </button>

                        <button 
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                    <Moon className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">{t('theme')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase opacity-40">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                                <ChevronRight className="w-4 h-4 opacity-20" />
                            </div>
                        </button>
                        
                        <button 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.PRIVACY_POLICY })}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">{t('privacyPolicy')}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-20" />
                        </button>
                        
                        <button 
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.TERMS_OF_SERVICE })}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-500/10 rounded-xl flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-slate-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight">{t('termsOfService')}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-20" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { state } = useAppContext();
    return (
        <div className="bg-background dark:bg-dark-background min-h-full">
            <TopBar />
            <BalanceCard />
            <QuickActions />
            <div className="px-6 my-2 opacity-30"><hr className="border-border" /></div>
            <TransactionHistory transactions={state.currentUser?.transactions || []} showAllToggle={true} defaultShowCount={5} />
            <SettingsSection />
        </div>
    );
};

export default Dashboard;
