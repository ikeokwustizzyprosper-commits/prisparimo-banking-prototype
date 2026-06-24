
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useAppContext, useTheme } from '../App';
import { Page, Card as CardType, User, Transaction, Message } from '../types';
import { 
    ArrowLeftIcon, ProcessingLoaderIcon, AlertCircleIcon, LandmarkIcon, PhoneIcon, MailIcon, 
    RefreshCwIcon, formatCurrency, COUNTRIES_WITH_BANKS, CURRENCY_DATA, 
    MOCK_CARDS_JOSEPH, MOCK_CARDS_JALIHA, MOCK_CARDS_PARADISE,
    BILLER_CATEGORIES, convertToGbp, EXCHANGE_RATES, SettingsIcon, UserIcon, 
    CreditCardIcon, SignOutIcon, MenuIcon, ImageIcon, PaperclipIcon, MessageCircleIcon, ShieldIcon,
    EyeIcon, EyeOffIcon, BellIcon, LockIcon
} from '../constants';
import { Gauge, CheckCircle2Icon, UserCheck } from 'lucide-react';
import Card from './Card';
import Modal from './Modal';
import { generateReceiptPDF } from '../utils/pdfGenerator';

const Header: React.FC<{ title: string }> = ({ title }) => {
    const { dispatch, t } = useAppContext();
    return (
        <header className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm p-4 flex items-center gap-4 z-10 border-b border-border dark:border-dark-border">
            <button onClick={() => dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD })} className="p-2 rounded-full hover:bg-muted dark:hover:bg-dark-muted">
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black uppercase tracking-tight leading-none text-primary dark:text-dark-primary">{t('bankName')}</h1>
            <span className="text-[10px] opacity-40 font-black uppercase tracking-widest ml-auto">{title}</span>
        </header>
    );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 rounded-xl bg-muted dark:bg-dark-input border border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-bold text-sm"/>
);
const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
    <select {...props} className="w-full px-4 py-3 rounded-xl bg-muted dark:bg-dark-input border border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none font-bold text-sm">
        {props.children}
    </select>
);
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props} className={`w-full bg-primary text-white font-black uppercase py-4 px-4 rounded-2xl transition duration-300 shadow-md text-xs tracking-widest ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.98]'}`}>
        {props.children}
    </button>
);

const PinVerificationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onVerify: (pin: string) => void;
    error: string | null;
    title?: string;
}> = ({ isOpen, onClose, onVerify, error, title }) => {
    const { t } = useAppContext();
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(pin);
        setPin('');
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h3 className="text-base font-black text-center uppercase tracking-tight">{title || t('enterPin')}</h3>
                <div className="relative">
                    <input 
                        type={showPin ? "text" : "password"} 
                        maxLength={4} 
                        value={pin} 
                        onChange={(e) => setPin(e.target.value)} 
                        placeholder="••••" 
                        className="w-full text-center text-3xl tracking-[1.5rem] py-4 bg-muted dark:bg-dark-input rounded-xl focus:outline-none" 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
                    >
                        {showPin ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-[10px] text-center font-black uppercase">{error}</p>}
                <Button type="submit">{t('authorize')}</Button>
            </form>
        </Modal>
    );
};

// --- ADMIN PORTAL COMPONENTS ---

const AdminDashboard = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [tab, setTab] = useState<'overview' | 'users' | 'transfers' | 'loans' | 'savings' | 'irs' | 'cards' | 'support' | 'settings' | 'broadcast'>('overview');
    const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
    
    const customers = state.users.filter(u => u.role === 'customer');
    const allTransactions = useMemo(() => {
        return state.users.flatMap(u => u.transactions.map(tx => ({ ...tx, userId: u.id, userName: u.name })))
                          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [state.users]);

    const newUsersToday = useMemo(() => {
        // Count users created today or fallback to a realistic alive value
        const count = state.users.filter(u => u.id.startsWith('usr_new_') || u.id === 'usr_joakim_blom').length;
        return count || 1;
    }, [state.users]);

    const recentTransfers = useMemo(() => {
        return allTransactions.filter(tx => tx.category === 'Transfer' || tx.description.toLowerCase().includes('transfer'))
                              .slice(0, 5);
    }, [allTransactions]);

    const usersWithLoans = state.users.filter(u => u.loanBalance > 0);
    const usersWithSavings = state.users.filter(u => u.savingsBalance > 0);

    const [searchQuery, setSearchQuery] = useState('');
    const filteredUsers = customers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.accountNumber.includes(searchQuery)
    );

    const [showCreateUser, setShowCreateUser] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newBalance, setNewBalance] = useState('');
    const [newLoanBalance, setNewLoanBalance] = useState('');
    const [newSavingsBalance, setNewSavingsBalance] = useState('');

    const handleUpdateUserAssets = () => {
        if (!editingUser) return;
        dispatch({ type: 'UPDATE_USER_BALANCE', payload: { userId: editingUser.id, newBalance: parseFloat(newBalance) } });
        dispatch({ 
            type: 'UPDATE_USER', 
            payload: { 
                id: editingUser.id, 
                loanBalance: parseFloat(newLoanBalance),
                savingsBalance: parseFloat(newSavingsBalance)
            } as Partial<User> 
        });
        syncWithServer();
        setEditingUser(null);
        alert(t('balanceUpdatedSuccessfully'));
    };

    const handleTransactionStatus = (userId: string, transactionId: string, status: Transaction['status']) => {
        dispatch({ type: 'UPDATE_TRANSACTION_STATUS', payload: { userId, transactionId, status } });
        syncWithServer();
        alert(`${t('transaction')} ${status}`);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex bg-muted dark:bg-dark-muted p-1 rounded-2xl sticky top-[72px] z-20 shadow-sm overflow-x-auto scrollbar-hide">
                {[
                    { id: 'overview', label: t('overview'), icon: Gauge },
                    { id: 'users', label: t('users'), icon: UserIcon },
                    { id: 'transfers', label: t('transfers'), icon: RefreshCwIcon },
                    { id: 'loans', label: t('loan'), icon: LandmarkIcon },
                    { id: 'savings', label: t('vault'), icon: LockIcon },
                    { id: 'irs', label: t('irsHub'), icon: LandmarkIcon },
                    { id: 'cards', label: t('cards'), icon: CreditCardIcon },
                    { id: 'support', label: t('support'), icon: MessageCircleIcon },
                    { id: 'broadcast', label: t('broadcast'), icon: ShieldIcon },
                    { id: 'settings', label: t('settings'), icon: SettingsIcon },
                ].map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setTab(item.id as any)} 
                        className={`min-w-[100px] py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 ${tab === item.id ? 'bg-white dark:bg-dark-card shadow-sm text-primary dark:text-dark-primary' : 'text-muted-foreground opacity-50'}`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            {tab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AdminStatCard label={t('totalUsers')} value={customers.length.toString()} icon={UserIcon} />
                        <AdminStatCard label={t('totalBalance')} value={formatCurrency(state.users.reduce((a,u) => a + u.balance + u.savingsBalance, 0))} icon={LandmarkIcon} />
                        <AdminStatCard label="Total Transactions" value={allTransactions.length.toString()} icon={RefreshCwIcon} />
                        <AdminStatCard label="New Users Today" value={newUsersToday.toString()} icon={UserIcon} color="text-green-500" />
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-dark-primary">Recent Transfers</h3>
                        {recentTransfers.length === 0 ? (
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 py-4 text-center">No recent transfers processed.</p>
                        ) : (
                            <div className="divide-y divide-border/50 dark:divide-dark-border/50">
                                {recentTransfers.map((tx, idx) => (
                                    <div key={`${tx.id}-${tx.userId || tx.senderAccount || ''}-${idx}`} className="py-3 flex justify-between items-center text-xs">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{tx.userName || tx.senderName} ➔ {tx.receiverName}</p>
                                            <p className="text-[9px] font-black uppercase opacity-40 mt-0.5">{new Date(tx.date).toLocaleDateString()} • {tx.reference}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-red-500">{formatCurrency(Math.abs(tx.amount))}</p>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                tx.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                                tx.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                                                'bg-red-100 dark:bg-red-900/30 text-red-600'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={() => setShowCreateUser(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">{t('createNewCustomerAccount')}</button>
                </div>
            )}

            {tab === 'users' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-2 mb-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('userManagement')}</h3>
                        <div className="relative w-48">
                            <Input 
                                placeholder={t('searchUsers')} 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="!py-2 !text-[9px]"
                            />
                        </div>
                    </div>
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={user.avatar} className="w-10 h-10 rounded-xl border border-gray-100 dark:border-dark-border object-cover" referrerPolicy="no-referrer" />
                                        {!user.isBlocked && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-card" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-tight">{user.name}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold opacity-60 tracking-tighter">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-xs text-primary dark:text-dark-primary">{formatCurrency(user.balance)}</p>
                                    <button onClick={() => dispatch({ type: 'UPDATE_USER_STATUS', payload: { userId: user.id, isBlocked: !user.isBlocked } })} className={`text-[8px] font-black uppercase tracking-widest mt-1 ${user.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                                        {user.isBlocked ? t('unblock') : t('block')}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingUser(user); setNewBalance(user.balance.toString()); setNewLoanBalance(user.loanBalance.toString()); setNewSavingsBalance(user.savingsBalance.toString()); }} className="flex-1 py-2.5 bg-slate-50 dark:bg-dark-muted text-[9px] font-black uppercase rounded-xl hover:bg-primary/5 transition">{t('editBalance')}</button>
                                <button onClick={() => {
                                    const newStatus = !user.isActivated;
                                    dispatch({ type: 'UPDATE_USER', payload: { ...user, isActivated: newStatus } });
                                    alert(newStatus ? t('accountActivated') : t('accountRestricted'));
                                }} className="flex-1 py-2.5 bg-slate-50 dark:bg-dark-muted text-[9px] font-black uppercase rounded-xl hover:bg-primary/5 transition">
                                    {user.isActivated ? t('restrict') : t('activate')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'loans' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminStatCard label="Loan Volume" value={formatCurrency(usersWithLoans.reduce((a,u) => a + u.loanBalance, 0))} icon={LandmarkIcon} />
                        <AdminStatCard label="Active Borrowers" value={usersWithLoans.length.toString()} icon={UserIcon} />
                    </div>
                    <div className="space-y-3">
                        {usersWithLoans.map(u => (
                             <div key={u.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border flex justify-between items-center shadow-sm">
                                 <div>
                                     <p className="text-[10px] font-black uppercase">{u.name}</p>
                                     <p className="text-[8px] opacity-40 uppercase tracking-widest">{u.email}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs font-black text-red-600 tabular-nums">{formatCurrency(u.loanBalance)}</p>
                                     <button onClick={() => { setEditingUser(u); setNewBalance(u.balance.toString()); setNewLoanBalance(u.loanBalance.toString()); setNewSavingsBalance(u.savingsBalance.toString()); }} className="text-[8px] font-black uppercase tracking-widest text-primary mt-1">Adjust</button>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'savings' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminStatCard label="Vault Deposits" value={formatCurrency(usersWithSavings.reduce((a,u) => a + u.savingsBalance, 0))} icon={LockIcon} />
                        <AdminStatCard label="Vault Users" value={usersWithSavings.length.toString()} icon={UserIcon} />
                    </div>
                    <div className="space-y-3">
                        {usersWithSavings.map(u => (
                             <div key={u.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border flex justify-between items-center shadow-sm">
                                 <div>
                                     <p className="text-[10px] font-black uppercase">{u.name}</p>
                                     <p className="text-[8px] opacity-40 uppercase tracking-widest">{u.email}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs font-black text-green-600 tabular-nums">{formatCurrency(u.savingsBalance)}</p>
                                     <button onClick={() => { setEditingUser(u); setNewBalance(u.balance.toString()); setNewLoanBalance(u.loanBalance.toString()); setNewSavingsBalance(u.savingsBalance.toString()); }} className="text-[8px] font-black uppercase tracking-widest text-primary mt-1">Adjust</button>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'irs' && (
                <div className="space-y-4">
                    <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20 text-center space-y-4 mb-6">
                        <LandmarkIcon className="w-12 h-12 text-primary mx-auto opacity-30" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Federal Hub Triage</h3>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-tight">Manual Asset Injection Console</p>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('createIrsRefund')}</h3>
                        <Select id="irs-user-select">
                            <option value="">{t('selectUser')}</option>
                            {customers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.accountNumber})</option>)}
                        </Select>
                        <Input type="number" placeholder={t('refundAmount')} id="irs-refund-amount" />
                        <Button onClick={() => {
                            const userId = (document.getElementById('irs-user-select') as HTMLSelectElement).value;
                            const amountStr = (document.getElementById('irs-refund-amount') as HTMLInputElement).value;
                            const amount = parseFloat(amountStr);

                            if (!userId || isNaN(amount) || amount <= 0) return alert(t('fillAllFields'));

                            const user = state.users.find(u => u.id === userId);
                            if (!user) return;

                            dispatch({ type: 'UPDATE_USER_BALANCE', payload: { userId, newBalance: user.balance + amount } });
                            dispatch({ 
                                type: 'ADD_TRANSACTION_TO_USER', 
                                payload: { 
                                    userId, 
                                    transaction: { 
                                        id: `irs_${Date.now()}`, 
                                        date: new Date().toISOString(), 
                                        description: 'Federal IRS Refund Hub', 
                                        amount: amount, 
                                        type: 'credit', 
                                        category: 'Government', 
                                        status: 'Completed' 
                                    } 
                                } 
                            });
                            syncWithServer();
                            alert(t('irsReleaseSuccess'));
                            (document.getElementById('irs-refund-amount') as HTMLInputElement).value = '';
                        }}>{t('authorizeRelease')}</Button>
                    </div>
                </div>
            )}

            {tab === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.users.filter(u => u.cards && u.cards.length > 0).flatMap(u => (
                        u.cards?.map(card => (
                            <div key={card.id} className="bg-white dark:bg-dark-card p-5 rounded-[2rem] border border-border dark:border-dark-border shadow-soft space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-muted flex items-center justify-center">
                                        <CreditCardIcon className="w-4 h-4 opacity-40" />
                                    </div>
                                    <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 rounded uppercase opacity-50">{card.type}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black tracking-[0.2em]">•••• •••• •••• {card.number.slice(-4)}</p>
                                    <p className="text-[9px] font-black uppercase opacity-40 mt-1">{u.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-red-600/10 text-red-600 text-[8px] font-black uppercase rounded-lg">Freeze</button>
                                    <button className="flex-1 py-2 bg-slate-600/10 text-slate-600 text-[8px] font-black uppercase rounded-lg">Limit</button>
                                </div>
                            </div>
                        ))
                    ))}
                </div>
            )}

            {tab === 'transfers' && (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2">{t('transactionLedger')}</h3>
                    {allTransactions.length === 0 ? (
                        <div className="py-20 text-center opacity-20 flex flex-col items-center gap-3">
                            <LandmarkIcon className="w-10 h-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('noTransactionsFound')}</p>
                        </div>
                    ) : 
                    allTransactions.map((tx, idx) => {
                        const isExpanded = expandedTxId === tx.id;
                        return (
                            <div key={`${tx.id}-${tx.userId || tx.senderAccount || ''}-${idx}`} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-border dark:border-dark-border shadow-sm hover:border-primary/20 transition duration-300">
                                <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-tight">{tx.userName}</p>
                                        <p className="text-xs font-bold text-muted-foreground leading-snug">{tx.description}</p>
                                        <p className="text-[9px] font-black uppercase opacity-40 mt-1">{tx.reference} • {tx.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-black block ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(tx.amount)}</span>
                                        <span className="text-[8px] text-primary hover:underline font-black uppercase tracking-widest mt-1.5 block">
                                            {isExpanded ? 'Collapse ▲' : 'Details ▼'}
                                        </span>
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-border/50 dark:border-dark-border/50 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-[11px] text-gray-500 dark:text-gray-400 animate-in fade-in duration-200">
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Date & Time:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{new Date(tx.date).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Reference Code:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.reference}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Category:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.category}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Sender Name:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.senderName || tx.userName}</span>
                                        </div>
                                        {tx.senderAccount && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Sender Account:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.senderAccount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Receiver Name:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-white">{tx.receiverName || 'N/A'}</span>
                                        </div>
                                        {tx.receiverAccount && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Receiver Account:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.receiverAccount}</span>
                                            </div>
                                        )}
                                        {tx.bankName && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Institution:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.bankName}</span>
                                            </div>
                                        )}
                                        {tx.country && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Country:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{tx.country}</span>
                                            </div>
                                        )}
                                        {tx.fee !== undefined && (
                                            <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                                <span className="font-bold opacity-60">Transfer Fee:</span>
                                                <span className="font-extrabold text-gray-800 dark:text-white">{formatCurrency(tx.fee)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-b border-gray-100 dark:border-dark-border/40 pb-1">
                                            <span className="font-bold opacity-60">Status:</span>
                                            <span className={`font-black uppercase ${
                                                tx.status === 'Completed' ? 'text-green-500' :
                                                tx.status === 'Pending' ? 'text-yellow-500' :
                                                'text-red-500'
                                            }`}>{tx.status}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <button onClick={() => handleTransactionStatus(tx.userId!, tx.id, 'Completed')} className="py-2 bg-green-600/10 text-green-600 text-[8px] font-black uppercase rounded-lg border border-green-600/20">{t('complete')}</button>
                                    <button onClick={() => handleTransactionStatus(tx.userId!, tx.id, 'Held')} className="py-2 bg-yellow-600/10 text-yellow-600 text-[8px] font-black uppercase rounded-lg border border-yellow-600/20">{t('hold')}</button>
                                    <button onClick={() => handleTransactionStatus(tx.userId!, tx.id, 'Failed')} className="py-2 bg-red-600/10 text-red-600 text-[8px] font-black uppercase rounded-lg border border-red-600/20">{t('fail')}</button>
                                    <button onClick={() => handleTransactionStatus(tx.userId!, tx.id, 'Reversed')} className="py-2 bg-slate-600/10 text-slate-600 text-[8px] font-black uppercase rounded-lg border border-slate-600/20">{t('reverse')}</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 'support' && <AdminSupportChat />}

            {tab === 'settings' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('systemNoteLabel')}</h3>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold italic">{t('systemNoteDescription')}</p>
                        <textarea 
                            value={state.systemNote} 
                            onChange={e => dispatch({ type: 'UPDATE_SYSTEM_NOTE', payload: e.target.value })}
                            onBlur={() => syncWithServer()}
                            className="w-full h-40 p-4 bg-muted dark:bg-dark-input rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary border-none"
                        />
                    </div>
                </div>
            )}

            {tab === 'broadcast' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('systemBroadcast')}</h3>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold italic">{t('systemBroadcastDescription')}</p>
                        <Input placeholder={t('broadcastTitle')} id="broadcast-title" />
                        <textarea 
                            id="broadcast-message"
                            placeholder={t('broadcastMessage')}
                            className="w-full h-32 p-4 bg-muted dark:bg-dark-input rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary border-none"
                        />
                        <Button onClick={() => {
                            const title = (document.getElementById('broadcast-title') as HTMLInputElement).value;
                            const message = (document.getElementById('broadcast-message') as HTMLTextAreaElement).value;
                            if (!title || !message) return alert(t('fillAllFields'));
                            
                            state.users.forEach(u => {
                                if (u.role === 'customer') {
                                    dispatch({ 
                                        type: 'ADD_NOTIFICATION', 
                                        payload: { 
                                            id: `notif_${Date.now()}_${u.id}`, 
                                            title, 
                                            message, 
                                            date: new Date().toISOString(), 
                                            read: false, 
                                            type: 'info' 
                                        } 
                                    });
                                }
                            });
                            syncWithServer();
                            alert(t('broadcastSentToAllCustomers'));
                            (document.getElementById('broadcast-title') as HTMLInputElement).value = '';
                            (document.getElementById('broadcast-message') as HTMLTextAreaElement).value = '';
                        }}>{t('dispatchBroadcast')}</Button>
                    </div>
                </div>
            )}

            {/* MODALS */}
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} className="max-w-sm">
                <div className="p-8 space-y-6">
                    <h3 className="text-base font-black text-center uppercase tracking-tight">{t('assetAdjustment')}</h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">{t('balance')}</label>
                            <Input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">{t('loanLiquidity')}</label>
                            <Input type="number" value={newLoanBalance} onChange={e => setNewLoanBalance(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">{t('vaultLiquidity')}</label>
                            <Input type="number" value={newSavingsBalance} onChange={e => setNewSavingsBalance(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={handleUpdateUserAssets}>{t('finalizeAdjustment')}</Button>
                </div>
            </Modal>

            {showCreateUser && <CreateUserModal isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} />}
        </div>
    );
};

const AdminStatCard: React.FC<{ label: string, value: string, icon: any, color?: string }> = ({ label, value, icon: Icon, color = "text-primary" }) => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-3">
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{label}</p>
            <p className="text-xl font-black tracking-tighter mt-1">{value}</p>
        </div>
    </div>
);

const CreateUserModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { dispatch, t, syncWithServer } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [balance, setBalance] = useState('0');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    // Transaction form state
    const [txDesc, setTxDesc] = useState('');
    const [txAmount, setTxAmount] = useState('');
    const [txType, setTxType] = useState<'credit' | 'debit'>('credit');

    const addTransaction = () => {
        if (!txDesc || !txAmount) return;
        const newTx: Transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: new Date().toISOString(),
            description: txDesc,
            amount: parseFloat(txAmount),
            type: txType,
            category: 'Transfer',
            status: 'Completed',
            reference: `REF-${Math.floor(Math.random() * 900000 + 100000)}`
        };
        setTransactions([...transactions, newTx]);
        setTxDesc('');
        setTxAmount('');
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `usr_${Date.now()}`,
            name,
            email,
            password,
            phone,
            accountNumber: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
            bvn: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
            idCardNumber: `ID-${Math.floor(Math.random() * 900000 + 100000)}`,
            avatar: `https://picsum.photos/seed/${name}/200/200`,
            balance: parseFloat(balance),
            savingsBalance: 0,
            loanBalance: 0,
            transactions: transactions,
            notifications: [],
            pin: '1212',
            currency: 'GBP',
            role: 'customer',
            isActivated: false,
            isBlocked: false
        };
        dispatch({ type: 'ADD_USER', payload: newUser });
        syncWithServer();
        alert(t('customerAccountCreated'));
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <form onSubmit={handleCreate} className="p-8 space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide">
                <h3 className="text-base font-black text-center uppercase tracking-tight mb-4">{t('createCustomerAccount')}</h3>
                
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest px-1">{t('basicInformation')}</p>
                    <Input placeholder={t('fullName')} value={name} onChange={e => setName(e.target.value)} required />
                    <Input type="email" placeholder={t('emailAddress')} value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input type="password" placeholder={t('initialPassword')} value={password} onChange={e => setPassword(e.target.value)} required />
                    <Input placeholder={t('phoneNumber')} value={phone} onChange={e => setPhone(e.target.value)} required />
                    <Input type="number" placeholder={t('initialBalanceGbp')} value={balance} onChange={e => setBalance(e.target.value)} required />
                </div>

                <div className="pt-4 border-t border-border dark:border-dark-border space-y-3">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest px-1">{t('addTransactionHistoryOptional')}</p>
                    <div className="bg-muted/30 p-4 rounded-2xl space-y-3 border border-border/50">
                        <Input placeholder={t('description')} value={txDesc} onChange={e => setTxDesc(e.target.value)} />
                        <div className="flex gap-2">
                            <Input type="number" placeholder={t('amount')} className="flex-1" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                            <Select value={txType} onChange={e => setTxType(e.target.value as any)} className="w-32">
                                <option value="credit">{t('credit')}</option>
                                <option value="debit">{t('debit')}</option>
                            </Select>
                        </div>
                        <button type="button" onClick={addTransaction} className="w-full py-2 bg-slate-200 dark:bg-dark-muted text-[9px] font-black uppercase rounded-xl hover:bg-primary/10 transition">{t('addToHistory')}</button>
                    </div>

                    {transactions.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {transactions.map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-dark-card rounded-xl border border-border/50 shadow-sm">
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-black uppercase truncate">{t.description}</p>
                                        <p className="text-[7px] opacity-40 uppercase">{t.type}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </span>
                                        <button type="button" onClick={() => setTransactions(transactions.filter((_, i) => i !== idx))} className="text-red-500 font-black text-[10px]">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <Button type="submit">{t('deployAccount')}</Button>
                </div>
            </form>
        </Modal>
    );
};

const AdminSupportChat = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [showDetails, setShowDetails] = useState(true);
    const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeCustomer = useMemo(() => state.users.find(u => u.id === activeUserId), [state.users, activeUserId]);

    const chatHistory = useMemo(() => {
        if (!activeUserId) return [];
        return state.messages.filter(m => 
            (m.senderRole === 'customer' && m.senderId === activeUserId) || 
            (m.senderRole === 'admin' && m.receiverId === activeUserId)
        );
    }, [state.messages, activeUserId]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [chatHistory]);

    const sendReply = () => {
        if (!replyText.trim() || !activeUserId) return;
        const msg: Message = {
            id: `msg_${Date.now()}`,
            senderId: state.currentUser!.id,
            receiverId: activeUserId,
            senderName: t('adminTriage'),
            senderRole: 'admin',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        dispatch({ type: 'SEND_MESSAGE', payload: msg });
        syncWithServer();
        setReplyText('');
    };

    const customersWithMessages = useMemo(() => {
        return state.users.filter(u => u.role === 'customer');
    }, [state.users]);

    return (
        <div className="h-[650px] flex bg-white dark:bg-dark-card rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-inner">
            {!activeUserId ? (
                <div className="p-6 overflow-y-auto space-y-4 h-full w-full">
                    <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest px-1 mb-2">{t('queuePriority')}</h4>
                    {customersWithMessages.length === 0 ? (
                        <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
                            <MessageCircleIcon className="w-12 h-12" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('supportLineEmpty')}</p>
                        </div>
                    ) : (
                        customersWithMessages.map(u => {
                            const lastMsg = state.messages.filter(m => m.senderId === u.id || m.receiverId === u.id).pop();
                            return (
                                <button key={u.id} onClick={() => setActiveUserId(u.id)} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-dark-muted rounded-2xl hover:bg-primary/5 transition border border-transparent hover:border-primary/20 shadow-sm">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-base shadow-inner">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-[11px] font-black uppercase tracking-tighter text-gray-900 dark:text-white truncate">{u.name}</p>
                                            <p className="text-[9px] opacity-60 font-medium truncate italic text-gray-500">{lastMsg?.text || t('awaitingInput')}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 pl-3">
                                        <span className="text-[7px] font-black text-primary dark:text-dark-primary uppercase bg-primary/5 dark:bg-dark-primary/10 px-3 py-1.5 rounded-full border border-primary/10">{t('active')}</span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            ) : (
                <>
                    {/* Chat Section */}
                    <div className="flex-1 flex flex-col h-full bg-[#fcfdfe] dark:bg-dark-background border-r border-gray-100 dark:border-dark-border overflow-hidden">
                        <div className="p-5 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border flex justify-between items-center z-10 shadow-sm">
                            <button onClick={() => setActiveUserId(null)} className="p-3 bg-slate-50 dark:bg-dark-muted hover:bg-primary/5 rounded-2xl transition"><ArrowLeftIcon className="w-5 h-5 text-primary"/></button>
                            <div className="text-center">
                                <p className="text-[12px] font-black uppercase tracking-tighter text-gray-900 dark:text-white">{activeCustomer?.name}</p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-[8px] font-black text-green-600 uppercase tracking-widest">{t('encryptedUplink')}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowDetails(!showDetails)} 
                                className={`px-4 py-2.5 text-[9px] font-black uppercase rounded-2xl transition duration-300 ${
                                    showDetails 
                                    ? 'bg-primary text-white shadow-md' 
                                    : 'bg-slate-100 dark:bg-dark-muted text-gray-600 dark:text-gray-300 hover:bg-slate-200'
                                }`}
                            >
                                {showDetails ? 'Hide Profile' : 'View Profile'}
                            </button>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
                            {chatHistory.map((m, idx) => (
                                <div key={idx} className={`flex ${m.senderRole === 'admin' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                    <div className={`p-4 rounded-[1.8rem] max-w-[85%] shadow-sm text-xs font-bold leading-relaxed ${
                                        m.senderRole === 'admin' 
                                        ? 'bg-primary text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-tl-none text-gray-800 dark:text-gray-100'
                                    }`}>
                                        {m.imageUrl && (
                                            <img 
                                                src={m.imageUrl} 
                                                alt="Customer Attachment" 
                                                className="max-w-full rounded-xl mb-3 border border-gray-200 dark:border-dark-border shadow-sm"
                                            />
                                        )}
                                        {m.text && <p>{m.text}</p>}
                                        <div className={`flex items-center gap-2 mt-3 opacity-30 font-black text-[7px] uppercase ${m.senderRole === 'admin' ? 'text-white' : 'text-gray-400'}`}>
                                            <span>{m.senderName}</span> • <span>{m.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card flex gap-4">
                            <input 
                                className="flex-1 px-6 py-4 text-xs font-bold bg-slate-50 dark:bg-dark-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 text-gray-900 dark:text-white"
                                placeholder={t('typeSecuredResponse')} 
                                value={replyText} 
                                onChange={e => setReplyText(e.target.value)} 
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendReply(); } }}
                            />
                            <button onClick={sendReply} className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition">
                                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Customer Account Details Sidebar */}
                    {showDetails && activeCustomer && (
                        <div className="w-96 border-l border-gray-100 dark:border-dark-border bg-slate-50 dark:bg-dark-muted/20 p-5 flex flex-col h-full overflow-y-auto space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between border-b border-border dark:border-dark-border pb-3">
                                <h3 className="text-[11px] font-black uppercase tracking-wider text-primary dark:text-dark-primary">Financial Profile</h3>
                                <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${activeCustomer.isActivated ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {activeCustomer.isActivated ? 'Activated' : 'Restricted'}
                                </span>
                            </div>

                            {/* Vital Account Balances */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs">
                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Balance</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white mt-1">{formatCurrency(activeCustomer.balance)}</p>
                                </div>
                                <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs">
                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Savings</p>
                                    <p className="text-xs font-black text-green-600 mt-1">{formatCurrency(activeCustomer.savingsBalance)}</p>
                                </div>
                                <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs col-span-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Loan Outstanding</p>
                                            <p className="text-xs font-black text-red-600 mt-0.5">{formatCurrency(activeCustomer.loanBalance)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Base Currency</p>
                                            <p className="text-xs font-black text-gray-500 mt-0.5">{activeCustomer.currency || 'GBP'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Demographics / General Identification Profile */}
                            <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-border dark:border-dark-border space-y-2 text-[10px]">
                                <p className="text-[8px] font-black uppercase opacity-40 tracking-wider mb-2 border-b border-gray-100 dark:border-dark-border pb-1">Identification & Contacts</p>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Account Number:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.accountNumber}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">National ID/BVN:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.bvn || activeCustomer.idCardNumber || 'N/A'}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Phone Number:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.phone}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Email Address:</span><span className="font-extrabold text-gray-800 dark:text-white truncate max-w-[150px]">{activeCustomer.email}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-50 font-bold">Secure PIN:</span><span className="font-extrabold text-gray-800 dark:text-white">{activeCustomer.pin || '1212'}</span></div>
                            </div>

                            {/* Customer Transaction Ledger */}
                            <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                <p className="text-[8px] font-black uppercase opacity-40 tracking-wider">Transactions Ledger ({activeCustomer.transactions?.length || 0})</p>
                                {(!activeCustomer.transactions || activeCustomer.transactions.length === 0) ? (
                                    <p className="text-[9px] text-center font-bold text-muted-foreground uppercase opacity-40 py-6">No transactions recorded.</p>
                                ) : (
                                    <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[220px]">
                                        {activeCustomer.transactions.map((tx: any, idx: number) => {
                                            const isExpanded = expandedTxId === tx.id;
                                            return (
                                                <div 
                                                    key={`${tx.id}-${idx}`} 
                                                    className="bg-white dark:bg-dark-card p-3 rounded-xl border border-border dark:border-dark-border shadow-xs cursor-pointer transition hover:border-primary/20"
                                                    onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                                                >
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <div className="overflow-hidden pr-2">
                                                            <p className="font-bold text-gray-900 dark:text-white truncate">{tx.description}</p>
                                                            <p className="text-[8px] opacity-40 mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className={`font-black shrink-0 ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                                        </span>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="mt-2.5 pt-2.5 border-t border-border/50 dark:border-dark-border/50 text-[9px] space-y-1.5 text-gray-500 animate-in fade-in duration-150">
                                                            <div className="flex justify-between"><span>Reference:</span><span className="font-bold text-gray-800 dark:text-white">{tx.reference}</span></div>
                                                            <div className="flex justify-between"><span>Status:</span><span className={`font-black uppercase ${tx.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>{tx.status}</span></div>
                                                            <div className="flex justify-between"><span>Category:</span><span className="font-bold text-gray-800 dark:text-white">{tx.category}</span></div>
                                                            {tx.senderName && <div className="flex justify-between"><span>Sender:</span><span className="font-bold text-gray-800 dark:text-white">{tx.senderName} ({tx.senderAccount})</span></div>}
                                                            {tx.receiverName && <div className="flex justify-between"><span>Receiver:</span><span className="font-bold text-gray-800 dark:text-white">{tx.receiverName} ({tx.receiverAccount})</span></div>}
                                                            {tx.bankName && <div className="flex justify-between"><span>Bank:</span><span className="font-bold text-gray-800 dark:text-white">{tx.bankName}</span></div>}
                                                            {tx.country && <div className="flex justify-between"><span>Country:</span><span className="font-bold text-gray-800 dark:text-white">{tx.country}</span></div>}
                                                            {tx.fee !== undefined && <div className="flex justify-between"><span>Fee:</span><span className="font-bold text-gray-800 dark:text-white">{formatCurrency(tx.fee)}</span></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// --- CUSTOMER PAGE LOGIC ---

const DepositPage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [method, setMethod] = useState<'card' | 'bank' | 'crypto'>('card');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            const depAmount = parseFloat(amount);
            dispatch({ type: 'UPDATE_BALANCE', payload: state.currentUser!.balance + depAmount });
            dispatch({
                type: 'ADD_TRANSACTION',
                payload: { id: `dep_${Date.now()}`, date: new Date().toISOString(), description: `Deposit via ${method.toUpperCase()}`, amount: depAmount, type: 'credit', category: 'Deposit', status: 'Completed' }
            });
            syncWithServer();
            setIsProcessing(false);
            alert(t('depositSuccess'));
            dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
        }, 2000);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex bg-muted dark:bg-dark-muted p-1 rounded-2xl border border-border dark:border-dark-border">
                {['card', 'bank', 'crypto'].map(m => (
                    <button key={m} onClick={() => setMethod(m as any)} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] transition tracking-widest ${method === m ? 'bg-white dark:bg-dark-card shadow-sm text-primary dark:text-dark-primary' : 'text-muted-foreground opacity-50'}`}>{t(m as any)}</button>
                ))}
            </div>

            {isProcessing ? (
                <div className="py-24 text-center space-y-6">
                    <ProcessingLoaderIcon className="w-14 h-14 text-primary mx-auto animate-spin" />
                    <p className="font-black uppercase tracking-[0.3em] text-[11px] animate-pulse">{t('syncingLedger')}</p>
                </div>
            ) : (
                <form onSubmit={handleDeposit} className="space-y-6">
                    {method === 'card' && (
                        <div className="space-y-4">
                            <Input placeholder={t('cardNumber')} required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="MM/YY" required />
                                <Input placeholder="CVV" required />
                            </div>
                        </div>
                    )}
            {method === 'bank' && (
                <div className="bg-slate-50 dark:bg-dark-muted p-6 rounded-[2rem] border border-dashed border-primary/20 space-y-3">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('settlementDesk')}</p>
                    <p className="text-xs font-black">{t('bank')}: Prisparimo Global Hub</p>
                    <p className="text-xs font-black">{t('account')}: {state.currentUser?.accountNumber}</p>
                    <div className="pt-2 border-t border-gray-100 dark:border-dark-border">
                        <p className="text-[9px] text-primary font-black uppercase">{t('instantCredit')}</p>
                    </div>
                </div>
            )}
                    {method === 'crypto' && (
                        <div className="space-y-4">
                            <Select required><option value="USDT">USDT (TRC20)</option><option value="BTC">Bitcoin</option></Select>
                            <div className="p-5 bg-muted dark:bg-dark-muted rounded-2xl text-center border border-border dark:border-dark-border">
                                <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-widest">{t('assetDestination')}</p>
                                <p className="text-[10px] font-mono break-all font-bold select-all">0x71c7656ec7ab88b098defb751b7401b5f6d8976f</p>
                            </div>
                        </div>
                    )}
                    <Input type="number" placeholder={t('enterAmount')} value={amount} onChange={e => setAmount(e.target.value)} required />
                    <Button type="submit">{t('verifyDeposit')}</Button>
                </form>
            )}
        </div>
    );
};

const TransferPage = () => {
    const { state, dispatch, t, syncWithServer } = useAppContext();
    const [transferType, setTransferType] = useState<'local' | 'international'>('local');
    const [selectedCountryName, setSelectedCountryName] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [isCustomBank, setIsCustomBank] = useState(false);
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'pin' | 'animating'>('idle');
    const [pinError, setPinError] = useState<string | null>(null);
    const [detectedUser, setDetectedUser] = useState<User | null>(null);

    const selectedCountry = useMemo(() => COUNTRIES_WITH_BANKS.find(c => c.name === selectedCountryName), [selectedCountryName]);
    const currentRate = useMemo(() => selectedCountry ? EXCHANGE_RATES[selectedCountry.currency] : 1, [selectedCountry]);
    const targetAmount = useMemo(() => {
        const cleanAmount = amount.replace(/,/g, '');
        return parseFloat(cleanAmount) * currentRate || 0;
    }, [amount, currentRate]);

    // Auto-detect and look up recipient by account number
    useEffect(() => {
        if (!accountNumber) {
            setDetectedUser(null);
            return;
        }
        const cleanAcc = accountNumber.trim().replace(/\s+/g, '');
        const found = state.users.find(u => u.accountNumber.trim().replace(/\s+/g, '') === cleanAcc);
        if (found) {
            setDetectedUser(found);
            setRecipientName(found.name);
            if (transferType === 'local') {
                setBankName('Prisparimo Core');
            }
        } else {
            setDetectedUser(null);
        }
    }, [accountNumber, state.users, transferType]);

    // Listen to custom autofill-transfer events from the side companion
    useEffect(() => {
        const handleAutofill = (e: Event) => {
            const customEvent = e as CustomEvent<{ accountNumber: string, name: string }>;
            if (customEvent.detail) {
                setAccountNumber(customEvent.detail.accountNumber);
                setRecipientName(customEvent.detail.name);
            }
        };
        window.addEventListener('autofill-transfer', handleAutofill);
        return () => window.removeEventListener('autofill-transfer', handleAutofill);
    }, []);

    const handleTransfer = (e: React.FormEvent) => { 
        e.preventDefault(); 
        setStatus('pin'); 
    };

    const onPinVerify = async (pin: string) => {
        if (pin.trim() === state.currentUser?.pin) {
            const cleanAmount = amount.replace(/,/g, '');
            const txAmount = parseFloat(cleanAmount);
            const transferFee = transferType === 'local' ? 1.50 : 12.50;
            const totalDeduction = txAmount + transferFee;
            if (totalDeduction > state.currentUser!.balance) { setPinError(t('assetShortage')); return; }
            
            setStatus('animating');
            try {
                const response = await fetch('/api/transfer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        senderId: state.currentUser?.id,
                        receiverAccountNumber: accountNumber,
                        amount: txAmount,
                        transferType,
                        bankName: bankName || (transferType === 'local' ? 'Prisparimo Core' : ''),
                        countryName: transferType === 'local' ? 'United Kingdom' : selectedCountryName,
                        currency: state.currentUser?.currency || 'GBP',
                        receiverName: recipientName,
                        fee: transferFee
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    setPinError(errData.error || "Transfer failed.");
                    setStatus('idle');
                    return;
                }

                const result = await response.json();
                
                if (result.success) {
                    // Instantly sync context state
                    dispatch({ type: 'UPDATE_USER', payload: result.sender });
                    if (result.receiver) {
                        dispatch({ type: 'UPDATE_USER', payload: result.receiver });
                    }

                    const isJoakim = state.currentUser?.id === 'usr_joakim_blom';
                    if (isJoakim) {
                        dispatch({ type: 'UPDATE_SYSTEM_NOTE', payload: "Your high-level corporate account is under a Location/High-Asset Audit check. New transfers will reside in 'Pending' status pending executive board release clearance." });
                        setStatus('idle');
                        dispatch({ type: 'SET_PAGE', payload: Page.RESTRICTION });
                    } else {
                        setStatus('idle');
                        alert("Transfer Completed Successfully! A downloadable PDF receipt has been prepared.");
                        // Generate the receipt PDF immediately
                        generateReceiptPDF(result.transaction);
                        dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
                    }
                }
            } catch (error) {
                console.error("Transfer submission failed:", error);
                setPinError("Secure channel validation error. Please try again.");
                setStatus('idle');
            }
        } else {
            setPinError("Invalid Authorization PIN.");
        }
    };

    return (
        <div className="p-5 space-y-6">
            <div className="flex bg-muted dark:bg-dark-muted p-1 rounded-[1.5rem] border border-border dark:border-dark-border shadow-inner">
                <button onClick={() => setTransferType('local')} className={`flex-1 py-3 rounded-[1.2rem] font-black uppercase text-[9px] transition-all duration-300 tracking-[0.2em] ${transferType === 'local' ? 'bg-white dark:bg-dark-card shadow-md text-primary dark:text-dark-primary' : 'text-muted-foreground opacity-50'}`}>{t('domestic')}</button>
                <button onClick={() => setTransferType('international')} className={`flex-1 py-3 rounded-[1.2rem] font-black uppercase text-[9px] transition-all duration-300 tracking-[0.2em] ${transferType === 'international' ? 'bg-white dark:bg-dark-card shadow-md text-primary dark:text-dark-primary' : 'text-muted-foreground opacity-50'}`}>{t('international')}</button>
            </div>

            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 opacity-40">
                    <LandmarkIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('transferProtocol')}</h3>
                </div>

                {status === 'animating' ? (
                    <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-[3px] border-primary/10 rounded-full"></div>
                            <div className="absolute inset-0 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                                    <ProcessingLoaderIcon className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="font-black uppercase tracking-[0.5em] text-[12px] text-primary animate-pulse">{t('verifyingSecurity')}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 tracking-[0.3em]">{t('encryptedHandshake')}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleTransfer} className="space-y-5">
                        {transferType === 'international' && (
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">{t('destinationCountry')}</label>
                                <Select value={selectedCountryName} onChange={e => setSelectedCountryName(e.target.value)} required>
                                    <option value="">{t('selectProtocol')}</option>
                                    {COUNTRIES_WITH_BANKS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </Select>
                                {selectedCountry && (
                                    <div className="p-4 bg-primary/5 rounded-xl flex justify-between items-center border border-primary/10 animate-in slide-in-from-top-2">
                                        <span className="text-[9px] font-black uppercase text-primary tracking-widest">{t('liveRate')}</span>
                                        <span className="text-[10px] font-black tabular-nums">1 GBP = {currentRate} {selectedCountry.currency}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-2">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">{t('financialInstitution')}</label>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsCustomBank(!isCustomBank);
                                        setBankName('');
                                    }} 
                                    className="text-[9px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider hover:underline"
                                >
                                    {isCustomBank ? "Select from list" : "Type manual institution"}
                                </button>
                            </div>
                            {isCustomBank ? (
                                <Input 
                                    placeholder="Enter Financial Institution / Bank Name" 
                                    value={bankName} 
                                    onChange={e => setBankName(e.target.value)} 
                                    required 
                                />
                            ) : (
                                <Select value={bankName} onChange={e => setBankName(e.target.value)} required>
                                    <option value="">{t('selectInstitution')}</option>
                                    {(COUNTRIES_WITH_BANKS.find(c => c.name === (transferType === 'local' ? 'United Kingdom' : selectedCountryName))?.banks || []).map(b => <option key={b} value={b}>{b}</option>)}
                                </Select>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">{t('recipientInformation')}</label>
                            
                            <Input 
                                placeholder={t('accountIbanProtocol')} 
                                value={accountNumber} 
                                onChange={e => setAccountNumber(e.target.value)} 
                                required 
                            />

                            {detectedUser ? (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                    <img src={detectedUser.avatar} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-green-700 dark:text-green-400 tracking-widest leading-none">Auto-Detected Recipient</p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mt-1.5">{detectedUser.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <Input 
                                    placeholder={t('fullLegalName')} 
                                    value={recipientName} 
                                    onChange={e => setRecipientName(e.target.value)} 
                                    required 
                                />
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">{t('assetAmount')}</label>
                            <div className="space-y-2">
                                <Input type="number" placeholder={t('amountInGbp')} value={amount} onChange={e => setAmount(e.target.value)} required />
                                {targetAmount > 0 && transferType === 'international' && selectedCountry && (
                                    <p className="text-[9px] font-black text-primary/60 pl-2 uppercase tracking-tighter italic">Settlement: {targetAmount.toLocaleString()} {selectedCountry.currency}</p>
                                )}
                            </div>
                        </div>

                        {parseFloat(amount) > 0 && (
                            <div className="space-y-2 p-4 bg-muted/50 dark:bg-dark-muted/50 rounded-2xl border border-border dark:border-dark-border animate-in fade-in duration-300">
                                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                                    <span>Transfer Amount:</span>
                                    <span className="tabular-nums font-bold">
                                        {formatCurrency(parseFloat(amount), state.currentUser?.currency || 'GBP')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground border-t border-border/40 dark:border-dark-border/40 pt-2">
                                    <span>Transfer Fee:</span>
                                    <span className="tabular-nums font-bold text-red-500">
                                        {formatCurrency(transferType === 'local' ? 1.50 : 12.50, state.currentUser?.currency || 'GBP')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] uppercase font-black tracking-wider text-foreground border-t border-border/80 dark:border-dark-border/80 pt-2 mt-1">
                                    <span>Total Deduction:</span>
                                    <span className="tabular-nums font-extrabold text-primary">
                                        {formatCurrency(parseFloat(amount) + (transferType === 'local' ? 1.50 : 12.50), state.currentUser?.currency || 'GBP')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button type="submit">{t('authorizeDispatch')}</Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Recognized Vault Directory */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Recognized Vault Directory</h4>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Click any account below to instantly fill details and verify</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                    {state.users.filter(u => u.id !== state.currentUser?.id && u.role !== 'admin').map(u => (
                        <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                                setAccountNumber(u.accountNumber);
                                setRecipientName(u.name);
                                // Determine matching country / currency / bank
                                if (u.currency === 'USD') {
                                    setTransferType('international');
                                    setSelectedCountryName('United States');
                                    setBankName('Chase Bank');
                                    setIsCustomBank(false);
                                } else {
                                    setTransferType('local');
                                    setSelectedCountryName('United Kingdom');
                                    setBankName('Prisparimo Core');
                                    setIsCustomBank(false);
                                }
                            }}
                            className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 dark:border-dark-border/60 hover:border-teal-500/50 hover:bg-teal-50/25 dark:hover:bg-teal-950/15 text-left transition-all duration-300 group"
                        >
                            <img src={u.avatar} className="w-9 h-9 rounded-xl object-cover border border-border/40" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">{u.name}</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-80 mt-0.5 tracking-tight">Acc: <span className="font-mono text-gray-900 dark:text-white bg-muted dark:bg-dark-muted px-1 rounded">{u.accountNumber}</span></p>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                                    {u.currency}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <PinVerificationModal isOpen={status === 'pin'} onClose={() => setStatus('idle')} onVerify={onPinVerify} error={pinError} />
        </div>
    );
};

const PayBillsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [category, setCategory] = useState(BILLER_CATEGORIES[0]);
    const [selectedBiller, setSelectedBiller] = useState('');
    const [amount, setAmount] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);

    const onPinVerify = (pin: string) => {
        if (pin.trim() === state.currentUser?.pin) {
            const billAmount = parseFloat(amount);
            if (billAmount > state.currentUser!.balance) { setPinError("Insufficient Vault Balance."); return; }
            dispatch({ type: 'UPDATE_BALANCE', payload: state.currentUser!.balance - billAmount });
            dispatch({
                type: 'ADD_TRANSACTION',
                payload: { id: `bill_${Date.now()}`, date: new Date().toISOString(), description: `Service: ${selectedBiller}`, amount: -billAmount, type: 'debit', category: 'Settlement', status: 'Completed' }
            });
            setIsPinModalOpen(false);
            alert(t('settlementSuccessful'));
            dispatch({ type: 'SET_PAGE', payload: Page.DASHBOARD });
        } else { setPinError("Invalid Authorization PIN."); }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {BILLER_CATEGORIES.map(c => (
                    <button key={c.name} onClick={() => { setCategory(c); setSelectedBiller(''); }} className={`px-5 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase transition tracking-widest ${category.name === c.name ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted dark:bg-dark-muted opacity-50'}`}>{c.name}</button>
                ))}
            </div>
            <form onSubmit={e => {e.preventDefault(); setIsPinModalOpen(true);}} className="space-y-6">
                <Select value={selectedBiller} onChange={e => setSelectedBiller(e.target.value)} required>
                    <option value="">{t('institutionUtility')}</option>
                    {category.billers.map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
                <Input placeholder={t('clientIdentifierRef')} required />
                <Input type="number" placeholder={t('settlementAmount')} value={amount} onChange={e => setAmount(e.target.value)} required />
                <Button type="submit">{t('completePayment')}</Button>
            </form>
            <PinVerificationModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} onVerify={onPinVerify} error={pinError} />
        </div>
    );
};

const LoanPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [step, setStep] = useState<'info' | 'apply' | 'done'>('info');

    useEffect(() => {
        if (step === 'done') {
            const timer = setTimeout(() => {
                if (!state.currentUser?.isActivated) {
                    dispatch({ type: 'SET_PAGE', payload: Page.RESTRICTION });
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step, state.currentUser, dispatch]);

    return (
        <div className="p-6 space-y-6">
            {step === 'info' && (
                <div className="bg-[#0f172a] p-10 rounded-[2.5rem] text-white space-y-8 relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">{t('loanBalance')}</p>
                    <p className="text-4xl font-black tracking-tighter tabular-nums">{formatCurrency(state.currentUser!.loanBalance)}</p>
                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase opacity-50 tracking-widest">{t('interestRate')}</span>
                        <span className="text-[11px] font-black text-red-400">1.8% Fixed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => setStep('apply')}>{t('applyForLoan')}</Button>
                        <Button onClick={() => setStep('management')} className="bg-white/5 border border-white/10 text-white">{t('management')}</Button>
                    </div>
                </div>
            )}
            {step === 'apply' && (
                <form onSubmit={e => {e.preventDefault(); setStep('done');}} className="space-y-6">
                    <h3 className="text-base font-black uppercase tracking-tight text-center">{t('assetFinancing')}</h3>
                    <Select required><option value="Asset">{t('assetFinancing')}</option><option value="Personal">{t('premiumLine')}</option></Select>
                    <Input type="number" placeholder={t('requestedCapital')} required />
                    <Input placeholder={t('intendedUseOfFunds')} required />
                    <Button type="submit">{t('verifyCreditProfile')}</Button>
                    <button type="button" onClick={() => setStep('info')} className="w-full text-[10px] font-black uppercase opacity-30 mt-2">{t('back')}</button>
                </form>
            )}
            {step === 'management' && (
                <div className="space-y-6">
                    <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                        <div className="flex items-center gap-2.5 opacity-40">
                            <ShieldIcon className="w-3.5 h-3.5" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('loanProtocol')}</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-center">{t('transferToLoan')}</p>
                            <Input type="number" placeholder={t('assetAmount')} id="loan-amount" />
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={() => {
                                    const val = (document.getElementById('loan-amount') as HTMLInputElement).value;
                                    const amount = parseFloat(val);
                                    if (!amount || amount <= 0) return alert(t('invalidAmount'));
                                    if (amount > state.currentUser!.balance) return alert(t('insufficientBalance'));
                                    dispatch({ type: 'MOVE_TO_LOAN', payload: amount });
                                    (document.getElementById('loan-amount') as HTMLInputElement).value = '';
                                    alert(t('loanTransactionAuthorized'));
                                }}>{t('transferToLoan')}</Button>
                                <Button onClick={() => {
                                    const val = (document.getElementById('loan-amount') as HTMLInputElement).value;
                                    const amount = parseFloat(val);
                                    if (!amount || amount <= 0) return alert(t('invalidAmount'));
                                    if (amount > state.currentUser!.loanBalance) return alert(t('insufficientBalance'));
                                    dispatch({ type: 'MOVE_FROM_LOAN', payload: amount });
                                    (document.getElementById('loan-amount') as HTMLInputElement).value = '';
                                    alert(t('loanTransactionAuthorized'));
                                }} className="bg-slate-100 dark:bg-dark-muted text-foreground dark:text-white">{t('withdrawFromLoan')}</Button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setStep('info')} className="w-full text-[10px] font-black uppercase opacity-30 mt-2">{t('back')}</button>
                </div>
            )}
            {step === 'done' && (
                <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-dark-muted rounded-3xl flex items-center justify-center mx-auto shadow-inner"><RefreshCwIcon className="w-10 h-10 text-primary animate-spin" /></div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{t('profileScanning')}</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60 px-8">{t('riskDeskAudit')}</p>
                    <Button onClick={() => setStep('info')}>{t('backToDesk')}</Button>
                </div>
            )}
        </div>
    );
};

const IrsRefundPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRelease = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setVerified(true);
            const amount = 156000;
            dispatch({ type: 'UPDATE_BALANCE', payload: state.currentUser!.balance + amount });
            dispatch({ type: 'ADD_TRANSACTION', payload: { id: `irs_${Date.now()}`, date: new Date().toISOString(), description: 'Federal IRS Refund Hub', amount: amount, type: 'credit', category: 'Government', status: 'Completed' } });
            alert(t('irsReleaseSuccess'));
        }, 3000);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-[#003366] via-black to-[#001a33] p-10 rounded-[3rem] text-white text-center space-y-8 shadow-2xl relative overflow-hidden">
                <LandmarkIcon className="w-14 h-14 mx-auto opacity-30" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">{t('irsAssetRelease')}</h2>
                <div className="py-6 border-y border-white/5">
                    <p className="text-[11px] font-black uppercase opacity-40 mb-1 tracking-[0.3em]">{t('blockedLiquidity')}</p>
                    <p className="text-5xl font-black tracking-tighter">$156,000.00</p>
                </div>
                {!verified && !loading && <Button onClick={handleRelease}>{t('authorizeRelease')}</Button>}
                {loading && (
                    <div className="space-y-4">
                        <ProcessingLoaderIcon className="w-12 h-12 mx-auto animate-spin" />
                        <p className="text-[11px] font-black uppercase animate-pulse tracking-widest">{t('syncingFederalVaults')}</p>
                    </div>
                )}
                {verified && (
                    <div className="bg-green-500/10 p-6 rounded-[1.8rem] border border-green-500/20 text-left">
                        <p className="text-[11px] font-black uppercase text-green-400 mb-2 tracking-widest">{t('releasedSuccessfully')}</p>
                        <p className="text-xs font-bold leading-relaxed text-white/80">{t('governmentAssetsCleared')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PrivacyPolicyPage: React.FC = () => {
    const { t } = useAppContext();
    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-dark-muted rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-white/5">
                <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">1. Data Collection</h3>
                        <p>We collect information that you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">2. Use of Information</h3>
                        <p>We may use the information we collect about you to provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">3. Sharing of Information</h3>
                        <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including sharing with third-party vendors, consultants, and other service providers.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">4. Security</h3>
                        <p>We are committed to protecting your data. We use a variety of security technologies and procedures to help protect your personal information from unauthorized access, use, or disclosure.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

const TermsOfServicePage: React.FC = () => {
    const { t } = useAppContext();
    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-dark-muted rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-white/5">
                <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">1. Acceptance of Terms</h3>
                        <p>By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our Services.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">2. Account Responsibility</h3>
                        <p>You are responsible for any activity that occurs through your account and you agree you will not sell, transfer, license or assign your account, followers, username, or any account rights.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">3. Prohibited Conduct</h3>
                        <p>You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium; (ii) using any automated system to access the Service.</p>
                    </section>
                    <section>
                        <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] mb-3">4. Termination</h3>
                        <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

const PageContainer: React.FC<{ page: Page }> = ({ page }) => {
    const { state, dispatch, t } = useAppContext();
    switch (page) {
        case Page.PROFILE: return <><Header title={t('memberProfile')} /><ProfilePage /></>;
        case Page.SETTINGS: return <><Header title={t('systemSettings')} /><SettingsPage /></>;
        case Page.TRANSFER: return <><Header title={t('assetTransfer')} /><TransferPage /></>;
        case Page.DEPOSIT: return <><Header title={t('assetInjection')} /><DepositPage /></>;
        case Page.PAY_BILLS: return <><Header title={t('billSettlement')} /><PayBillsPage /></>;
        case Page.LOAN: return <><Header title={t('capitalDesk')} /><LoanPage /></>;
        case Page.IRS_REFUND: return <><Header title={t('federalHub')} /><IrsRefundPage /></>;
        case Page.ADMIN_DASHBOARD: return <><Header title={t('adminPortal')} /><AdminDashboard /></>;
        case Page.NOTIFICATIONS: return <><Header title={t('alertCenter')} /><NotificationsPage /></>;
        case Page.CHANGE_PIN: return <><Header title={t('securityProtocol')} /><ChangePinPage /></>;
        case Page.PRIVACY_POLICY: return <><Header title={t('privacyPolicy')} /><PrivacyPolicyPage /></>;
        case Page.TERMS_OF_SERVICE: return <><Header title={t('termsOfService')} /><TermsOfServicePage /></>;
        case Page.MENU: return (
            <><Header title={t('operationsMenu')} />
            <div className="p-6 grid grid-cols-2 gap-5">
                {[
                    { label: t('deposit'), page: Page.DEPOSIT, icon: '📥' },
                    { label: t('transfer'), page: Page.TRANSFER, icon: '✈️' },
                    { label: t('settlement'), page: Page.PAY_BILLS, icon: '📜' },
                    { label: t('loan'), page: Page.LOAN, icon: '💎' },
                    { label: t('vault'), page: Page.SAVINGS, icon: '🛡️' },
                    { label: t('identity'), page: Page.PROFILE, icon: '🆔' },
                    { label: t('settings'), page: Page.SETTINGS, icon: '⚙️' },
                    { label: t('irsHub'), page: Page.IRS_REFUND, icon: '🏦' },
                    { label: t('alerts'), page: Page.NOTIFICATIONS, icon: '🔔' },
                    { label: t('security'), page: Page.CHANGE_PIN, icon: '🔐' },
                    { label: t('limits'), page: Page.LIMITS, icon: '📊' },
                ].map(item => (
                    <button key={item.label} onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-muted rounded-[2rem] border border-transparent hover:border-primary active:scale-95 transition shadow-sm group">
                        <div className="text-3xl mb-2 transform group-hover:scale-110 transition">{item.icon}</div>
                        <span className="font-black text-[9px] uppercase tracking-widest text-slate-800 dark:text-white">{item.label}</span>
                    </button>
                ))}
            </div></>
        );
        case Page.CARDS: {
            const userCards = state.currentUser?.cards || [];
            return <><Header title={t('infinityCards')} /><div className="p-6 flex flex-col items-center gap-5">{userCards.map(c => <Card key={c.id} card={c} />)}</div></>;
        }
        case Page.SAVINGS: return <><Header title={t('lockedVault')} /><SavingsPage /></>;
        case Page.LIMITS: return <><Header title={t('spendingControls')} /><LimitsPage /></>;
        case Page.RESTRICTION: return <><Header title={t('securityHold')} /><RestrictionPage /></>;
        default: return <div className="p-16 text-center font-black opacity-10 uppercase tracking-[1rem]">Prisparimo</div>;
    }
};

const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center py-5 border-b border-border/50 last:border-0">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{label}</span>
        <span className="text-[13px] font-black text-foreground dark:text-white">{value}</span>
    </div>
);

const ProfilePage = () => {
    const { state, dispatch, t } = useAppContext();
    const user = state.currentUser!;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            try {
                const res = await fetch('/api/upload-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, avatarBase64: base64 })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        dispatch({ type: 'UPDATE_USER', payload: data.user });
                        alert("Profile picture uploaded successfully!");
                    }
                } else {
                    alert("Failed to upload profile picture.");
                }
            } catch (err) {
                console.error("Error uploading avatar:", err);
                alert("Upload error.");
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="p-5 space-y-6">
            <div className="text-center bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent" />
                <div className="relative inline-block mb-6">
                    <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                        <img src={user.avatar} className="w-24 h-24 rounded-[2rem] mx-auto border-4 border-white/10 shadow-2xl object-cover transition duration-300 group-hover:brightness-50" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-xl shadow-xl border-2 border-slate-950">
                            <LandmarkIcon className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />

                <div className="mb-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition border border-white/10"
                    >
                        Change Profile Photo
                    </button>
                    <p className="text-[7px] text-gray-500 uppercase tracking-wider mt-2">
                        Stored in persistent database
                    </p>
                </div>

                {/* 
                  FIREBASE STORAGE EQUIVALENT FOR PRODUCTION:
                  ------------------------------------------
                  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
                  import { getFirestore, doc, updateDoc } from "firebase/firestore";

                  const storage = getStorage();
                  const db = getFirestore();

                  async function uploadToFirebase(file: File, userId: string) {
                      const avatarRef = ref(storage, `avatars/${userId}`);
                      await uploadBytes(avatarRef, file);
                      const downloadUrl = await getDownloadURL(avatarRef);
                      
                      const userRef = doc(db, "users", userId);
                      await updateDoc(userRef, { avatar: downloadUrl });
                      return downloadUrl;
                  }
                */}

                <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none mb-2">{user.name}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em]">{t('infinityTierMember')}</p>
                </div>
            </div>
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl">
                <div className="flex items-center gap-2.5 mb-6 opacity-40">
                    <UserIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('identityProtocol')}</h3>
                </div>
                <DetailRow label={t('legalEntity')} value={user.name} />
                {user.profession && <DetailRow label={t('professionalStatus')} value={user.profession} />}
                <DetailRow label={t('ledgerId')} value={user.accountNumber} />
                <DetailRow label={t('commsEmail')} value={user.email} />
                <DetailRow label={t('handsetProtocol')} value={user.phone} />
                <DetailRow label={t('federalAssetId')} value={user.bvn} />
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="p-5 space-y-6">
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] space-y-6 border border-border dark:border-dark-border shadow-xl">
                <div className="flex items-center gap-2.5 mb-1 opacity-40">
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('systemPreferences')}</h3>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-foreground tracking-widest">{t('nightProtocol')}</span>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{t('toggleDarkInterface')}</p>
                    </div>
                    <button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${theme === 'dark' ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
                
                <div className="flex justify-between items-center pt-5 border-t border-border/50">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-foreground tracking-widest">{t('authPin')}</span>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{t('secureTransactionAuth')}</p>
                    </div>
                    <button onClick={() => dispatch({type: 'SET_PAGE', payload: Page.CHANGE_PIN})} className="px-3 py-1.5 bg-primary/10 text-primary font-black text-[9px] uppercase rounded-lg hover:bg-primary/20 transition tracking-widest">{t('configure')}</button>
                </div>

                <div className="flex justify-between items-center pt-5 border-t border-border/50">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-foreground tracking-widest">{t('limits')}</span>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{t('manageSpendingLimits')}</p>
                    </div>
                    <button onClick={() => dispatch({type: 'SET_PAGE', payload: Page.LIMITS})} className="px-3 py-1.5 bg-primary/10 text-primary font-black text-[9px] uppercase rounded-lg hover:bg-primary/20 transition tracking-widest">{t('configure')}</button>
                </div>

                {state.currentUser?.role === 'admin' && (
                    <div className="flex justify-between items-center pt-5 border-t border-border/50">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase text-foreground tracking-widest">{t('adminRights')}</span>
                            <p className="text-[8px] text-muted-foreground font-bold uppercase opacity-60">{t('systemWideAdminAccess')}</p>
                        </div>
                        <span className="text-green-600 font-black text-[8px] uppercase bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">{t('level5Access')}</span>
                    </div>
                )}
            </div>
            
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] space-y-6 border border-border dark:border-dark-border shadow-xl">
                <div className="flex items-center gap-2.5 mb-1 opacity-40">
                    <PhoneIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('supportUplink')}</h3>
                </div>
                
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('whatsappCall')}</span>
                        <a href="https://wa.me/447922284110" target="_blank" rel="noopener noreferrer" className="text-primary font-black text-[10px] hover:opacity-70 transition border-b border-primary/20 pb-0.5">+44 7922 284110</a>
                    </div>
                    <div className="flex justify-between items-center pt-5 border-t border-border/50">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('emailSupport')}</span>
                        <a href="mailto:prisparimobank@gmail.com" className="text-primary font-black text-[10px] hover:opacity-70 transition border-b border-primary/20 pb-0.5">prisparimobank@gmail.com</a>
                    </div>
                </div>
            </div>

            <button onClick={() => dispatch({type: 'LOGOUT'})} className="w-full py-4 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-[0.4em] rounded-[1.5rem] border border-red-500/10 hover:bg-red-500/10 active:scale-95 transition-all duration-300 shadow-sm">{t('secureLogout')}</button>
        </div>
    );
};

const LimitInput = ({ label, value, onChange, min = 0, max: customMax }: { label: string, value: number, onChange: (val: number) => void, min?: number, max?: number }) => {
    const max = customMax || (label.includes('Monthly') ? 500000 : 100000);
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : min;
    const rawProgress = ((safeValue - min) / (max - min)) * 100;
    const progress = Math.max(0, Math.min(100, isNaN(rawProgress) ? 0 : rawProgress));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
                <span className="text-[12px] font-black text-primary">{formatCurrency(safeValue)}</span>
            </div>
            <div className="relative h-12 flex items-center">
                {/* Track */}
                <div className="absolute w-full h-2 bg-slate-200 dark:bg-dark-muted rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                
                {/* Draggable Thumb */}
                <div className="relative w-full h-full">
                    <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0}
                        dragMomentum={false}
                        onDrag={(_, info) => {
                            const rect = (info as any).point.x; // This is not quite right for absolute positioning
                            // We need the container width
                        }}
                        className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                        style={{ left: `${progress}%` }}
                    >
                        {/* We'll use a standard range input hidden but overlayed for better accessibility and easier logic, 
                            but styled with motion for the "draggable" feel if possible. 
                            Actually, a better way for "draggable" is a custom slider.
                        */}
                    </motion.div>
                    
                    {/* Interactive Range Input (Hidden but functional) */}
                    <input 
                        type="range" 
                        min={min} 
                        max={max} 
                        step={max <= 1000 ? "10" : "500"} 
                        value={safeValue} 
                        onChange={(e) => onChange(parseInt(e.target.value) || min)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {/* Visual Thumb */}
                    <motion.div 
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-100 rounded-full shadow-lg border-2 border-primary pointer-events-none flex items-center justify-center"
                        style={{ left: `calc(${progress}% - 12px)` }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="w-1 h-3 bg-primary/20 rounded-full mx-0.5"></div>
                        <div className="w-1 h-3 bg-primary/20 rounded-full mx-0.5"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const LimitsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [limits, setLimits] = useState(state.currentUser?.limits || {
        dailyTransfer: 500,
        dailyAtm: 2000,
        monthlySpending: 150000,
        perTransaction: 25000,
        onlinePurchase: 10000
    });

    const [success, setSuccess] = useState(false);

    const handleUpdate = () => {
        dispatch({ type: 'UPDATE_LIMITS', payload: limits });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="p-5 space-y-6 pb-24">
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2.5rem] border border-border dark:border-dark-border shadow-xl space-y-8">
                <div className="flex items-center gap-2.5 opacity-40 mb-2">
                    <LockIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('spendingControls')}</h3>
                </div>

                <div className="space-y-8">
                    <LimitInput 
                        label={t('dailyTransferLimit')} 
                        value={limits.dailyTransfer} 
                        onChange={(val) => setLimits({ ...limits, dailyTransfer: val })} 
                        min={50}
                        max={1000}
                    />
                    <LimitInput 
                        label={t('dailyAtmWithdrawalLimit')} 
                        value={limits.dailyAtm} 
                        onChange={(val) => setLimits({ ...limits, dailyAtm: val })} 
                    />
                    <LimitInput 
                        label={t('monthlySpendingLimit')} 
                        value={limits.monthlySpending} 
                        onChange={(val) => setLimits({ ...limits, monthlySpending: val })} 
                    />
                    <LimitInput 
                        label={t('perTransactionLimit')} 
                        value={limits.perTransaction} 
                        onChange={(val) => setLimits({ ...limits, perTransaction: val })} 
                    />
                    <LimitInput 
                        label={t('onlinePurchaseLimit')} 
                        value={limits.onlinePurchase} 
                        onChange={(val) => setLimits({ ...limits, onlinePurchase: val })} 
                    />
                </div>

                <div className="pt-4 space-y-4">
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3"
                        >
                            <CheckCircle2Icon className="w-5 h-5 text-green-600" />
                            <p className="text-[10px] font-black uppercase text-green-700">{t('limitsUpdatedSuccess')}</p>
                        </motion.div>
                    )}
                    <Button onClick={handleUpdate}>{t('updateLimits')}</Button>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-[2rem] flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircleIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-tight text-blue-900 dark:text-blue-400">{t('securityNotice')}</h4>
                    <p className="text-[9px] font-bold text-blue-800/60 dark:text-blue-300/60 leading-relaxed uppercase">{t('limitsNoticeDescription')}</p>
                </div>
            </div>
        </div>
    );
};

const SavingsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [val, setVal] = useState('');

    const handleVaultAction = (action: 'move_to' | 'move_from') => {
        if (!state.currentUser?.isActivated) {
            dispatch({ type: 'SET_PAGE', payload: Page.RESTRICTION });
            return;
        }
        const amount = parseFloat(val);
        if (isNaN(amount) || amount <= 0) return alert(t('invalidAmount'));
        
        if (action === 'move_to') {
            if (amount > state.currentUser.balance) return alert(t('insufficientBalance'));
            dispatch({ type: 'MOVE_TO_SAVINGS', payload: amount });
        } else {
            if (amount > state.currentUser.savingsBalance) return alert(t('insufficientVaultAssets'));
            dispatch({ type: 'MOVE_FROM_SAVINGS', payload: amount });
        }
        setVal('');
        alert(t('vaultTransactionAuthorized'));
    };

    return (
        <div className="p-5 space-y-6">
            <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">{t('vaultLiquidity')}</p>
                <p className="text-4xl font-black tracking-tighter tabular-nums">{formatCurrency(state.currentUser!.savingsBalance)}</p>
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase opacity-50 tracking-widest">{t('guaranteedYield')}</span>
                    <span className="text-[11px] font-black text-green-400">8.45% Fixed</span>
                </div>
            </div>
            <div className="bg-card dark:bg-dark-card p-6 rounded-[2rem] border border-border dark:border-dark-border shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 opacity-40">
                    <ShieldIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('vaultProtocol')}</h3>
                </div>
                <div className="space-y-4">
                    <Input type="number" placeholder={t('capitalToLock')} value={val} onChange={e => setVal(e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => handleVaultAction('move_to')}>{t('transferToSavings')}</Button>
                        <Button onClick={() => handleVaultAction('move_from')} className="bg-slate-100 dark:bg-dark-muted text-foreground dark:text-white">{t('withdrawFromSavings')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const RestrictionPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [showChoice, setShowChoice] = useState(false);

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-dark-card p-10 rounded-[3rem] border-2 border-red-500/20 shadow-2xl text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
                    <AlertCircleIcon className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600">{t('accountRestricted')}</h2>
                    <div className="p-5 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-left">
                        {state.currentUser?.id === 'usr_joakim_blom' ? (
                            <div className="text-[11px] font-bold text-red-800 dark:text-red-400 space-y-3 leading-relaxed">
                                <p className="italic">"{state.systemNote || "Your high-level corporate account is under a Location/High-Asset Audit check. New transfers will reside in 'Pending' status pending executive board release clearance."}"</p>
                                <div className="pt-2 border-t border-red-200/50 dark:border-red-900/40 space-y-2">
                                    <p className="uppercase text-[9px] tracking-wider opacity-60 font-black">Hold Parameters & Status:</p>
                                    <ul className="list-disc list-inside space-y-1 text-[10px] ml-1">
                                        <li><span className="font-extrabold">Primary Trigger:</span> Geographic access detected outside established Swedish corporate headquarters.</li>
                                        <li><span className="font-extrabold">Executive Threshold Check:</span> Inbound asset values and merger settlements exceeding individual compliance thresholds.</li>
                                        <li><span className="font-extrabold">Regulatory Requirement:</span> Routine Swiss Financial Market Authority (FINMA) High-Net-Worth Individual (HNWI) security verification.</li>
                                    </ul>
                                    <p className="pt-1">To authorize immediate release and bypass geographical restrictions, please contact support or your dedicated private relationship manager to complete the executive board safety check.</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[11px] font-bold text-red-800 dark:text-red-400 leading-relaxed italic text-center">
                                "{state.systemNote || t('transferRestrictedMessage')}"
                            </p>
                        )}
                    </div>
                </div>

                {!showChoice ? (
                    <div className="pt-4">
                        <Button onClick={() => setShowChoice(true)} className="bg-red-600 hover:bg-red-700">{t('verificationDesk')}</Button>
                    </div>
                ) : (
                    <div className="space-y-4 pt-4 border-t border-border dark:border-dark-border animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('callOrWhatsapp')}</p>
                    <div className="grid grid-cols-2 gap-3 pb-2">
                        <a href="tel:+447922284110" className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 dark:bg-dark-muted rounded-2xl border border-border dark:border-dark-border hover:border-primary transition group">
                            <PhoneIcon className="w-6 h-6 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-tight">{t('callNow')}</span>
                        </a>
                        <a href="https://wa.me/447922284110" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-5 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800/30 hover:border-green-500 transition group">
                            <MessageCircleIcon className="w-6 h-6 text-green-600" />
                            <span className="text-[9px] font-black uppercase tracking-tight">{t('whatsappNow')}</span>
                        </a>
                    </div>
                    <a href="mailto:prisparimobank@gmail.com" className="flex items-center justify-center gap-3 w-full p-4 bg-muted dark:bg-dark-muted rounded-2xl border border-border dark:border-dark-border group hover:border-primary transition">
                        <MailIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t('emailUs')}</span>
                    </a>
                    <button onClick={() => setShowChoice(false)} className="text-[9px] font-black uppercase opacity-30 mt-2">{t('back')}</button>
                    </div>
                )}

                <div className="pt-4 border-t border-border dark:border-dark-border">
                    <Button onClick={() => dispatch({ type: 'TOGGLE_CHAT', payload: true })} className="bg-slate-100 dark:bg-dark-muted text-foreground">{t('chatWithAgent')}</Button>
                </div>
                
                <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Reference: ERR-LOC-{Math.floor(Math.random() * 1000000)}</p>
            </div>
        </div>
    );
};

const NotificationsPage = () => {
    const { state, dispatch, t } = useAppContext();
    const notifications = state.currentUser?.notifications || [];

    useEffect(() => {
        if (notifications.some(n => !n.read)) {
            dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
        }
    }, [dispatch, notifications]);

    return (
        <div className="p-5 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em]">{t('systemAlerts')}</p>
                {notifications.length > 0 && (
                    <button onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })} className="text-[9px] font-black uppercase text-red-500 hover:opacity-70 transition">{t('clearAll')}</button>
                )}
            </div>
            {notifications.length === 0 ? (
                <div className="bg-card dark:bg-dark-card p-12 rounded-[2rem] border border-border dark:border-dark-border shadow-xl text-center">
                    <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t('noNotifications')}</p>
                </div>
            ) : (
                notifications.map(n => (
                    <div 
                        key={n.id} 
                        onClick={() => {}} // Make it clickable
                        className={`bg-card dark:bg-dark-card p-5 rounded-[1.8rem] border border-border dark:border-dark-border shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-all active:scale-[0.99] ${!n.read ? 'border-l-4 border-l-primary' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-[11px] font-black uppercase tracking-tight">{t(n.title as any) || n.title}</h4>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">{t(n.message as any) || n.message}</p>
                    </div>
                ))
            )}
        </div>
    );
};

const ChangePinPage = () => {
    const { state, dispatch, t } = useAppContext();
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpdatePin = () => {
        setError(null);
        if (currentPin !== state.currentUser?.pin) return setError(t('currentPinIncorrect'));
        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) return setError(t('pinMustBe4Digits'));
        if (newPin !== confirmPin) return setError(t('pinsDoNotMatch'));

        dispatch({ type: 'CHANGE_PIN', payload: newPin });
        setSuccess(true);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="p-5 space-y-6">
            <div className="bg-card dark:bg-dark-card p-8 rounded-[2.5rem] border border-border dark:border-dark-border shadow-xl space-y-8">
                <div className="flex items-center gap-2.5 opacity-40">
                    <LockIcon className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('securityProtocol')}</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-1 tracking-widest">{t('currentPin')}</label>
                        <input 
                            type="password" 
                            maxLength={4}
                            value={currentPin}
                            onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-100 dark:bg-dark-muted border-2 border-transparent focus:border-primary rounded-2xl p-4 text-center text-2xl tracking-[1em] font-black transition"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-1 tracking-widest">{t('newPin')}</label>
                            <input 
                                type="password" 
                                maxLength={4}
                                value={newPin}
                                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-100 dark:bg-dark-muted border-2 border-transparent focus:border-primary rounded-2xl p-4 text-center text-2xl tracking-[1em] font-black transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-1 tracking-widest">{t('confirmNewPin')}</label>
                            <input 
                                type="password" 
                                maxLength={4}
                                value={confirmPin}
                                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-100 dark:bg-dark-muted border-2 border-transparent focus:border-primary rounded-2xl p-4 text-center text-2xl tracking-[1em] font-black transition"
                            />
                        </div>
                    </div>
                </div>

                {error && <p className="text-[9px] font-black uppercase text-red-500 text-center animate-pulse">{error}</p>}
                {success && <p className="text-[9px] font-black uppercase text-green-500 text-center animate-bounce">{t('pinUpdatedSuccess')}</p>}

                <Button onClick={handleUpdatePin}>{t('updatePin')}</Button>
            </div>
        </div>
    );
};

export default PageContainer;
