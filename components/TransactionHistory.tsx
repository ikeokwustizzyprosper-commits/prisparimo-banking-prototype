
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../App';
import { Transaction } from '../types';
import Modal from './Modal';
import { FilterIcon, formatCurrency, convertFromGbp } from '../constants';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Filters = {
    dateFrom: string;
    dateTo: string;
    type: 'all' | 'credit' | 'debit';
    category: string;
    status: 'all' | 'Completed' | 'Pending' | 'Failed' | 'Reversed';
};

const FilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentFilters: Filters;
    onApply: (filters: Filters) => void;
    categories: string[];
}> = ({ isOpen, onClose, currentFilters, onApply, categories }) => {
    const { t } = useAppContext();
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApply(localFilters);
    };
    
    const handleClear = () => {
        const clearedFilters: Filters = { dateFrom: '', dateTo: '', type: 'all', category: 'all', status: 'all' };
        setLocalFilters(clearedFilters);
        onApply(clearedFilters);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-center mb-2">{t('search')}</h2>
                <div className="flex gap-4">
                    <div>
                        <label htmlFor="dateFrom" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('from')}</label>
                        <input type="date" name="dateFrom" id="dateFrom" value={localFilters.dateFrom} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div>
                        <label htmlFor="dateTo" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('to')}</label>
                        <input type="date" name="dateTo" id="dateTo" value={localFilters.dateTo} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('type')}</label>
                    <select name="type" id="type" value={localFilters.type} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                        <option value="all">{t('all')}</option>
                        <option value="credit">{t('credit')}</option>
                        <option value="debit">{t('debit')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('category')}</label>
                    <select name="category" id="category" value={localFilters.category} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? t('allCategories') : cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1">{t('status')}</label>
                    <select name="status" id="status" value={localFilters.status} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-muted dark:bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                        <option value="all">{t('all')}</option>
                        <option value="Completed">{t('completed')}</option>
                        <option value="Pending">{t('pending')}</option>
                        <option value="Failed">{t('failed')}</option>
                        <option value="Reversed">{t('reversed')}</option>
                    </select>
                </div>
                <div className="flex gap-2 pt-4">
                    <button type="button" onClick={handleClear} className="w-full bg-muted dark:bg-dark-muted text-foreground dark:text-dark-foreground font-bold py-3 px-4 rounded-lg">{t('clear')}</button>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg">{t('apply')}</button>
                </div>
            </form>
        </Modal>
    );
};


interface TransactionHistoryProps {
    transactions: Transaction[];
    showAllToggle?: boolean;
    defaultShowCount?: number;
    containerClassName?: string;
}

const TransactionItem: React.FC<{ tx: Transaction, onClick: () => void }> = ({ tx, onClick }) => {
    const { state, t } = useAppContext();
    const convertedAmount = useMemo(() => convertFromGbp(tx.amount, state.currentCurrency), [tx.amount, state.currentCurrency]);

    const getStatusColor = (status: Transaction['status']) => {
        switch (status) {
            case 'Completed': return 'text-green-600 dark:text-green-400';
            case 'Failed': return 'text-red-600 dark:text-red-400';
            case 'Pending': return 'text-yellow-500 dark:text-yellow-400';
            case 'Reversed': return 'text-slate-500 dark:text-slate-400';
            default: return 'text-muted-foreground dark:text-dark-muted-foreground';
        }
    };

    const getAmountStyle = (type: Transaction['type'], status: Transaction['status']) => {
        let classes = 'font-bold ';
        if (status === 'Failed' || status === 'Reversed') {
            classes += 'text-slate-500 dark:text-slate-400 line-through opacity-70';
        } else if (type === 'credit') {
            classes += 'text-green-600 dark:text-green-400';
        } else {
            classes += 'text-red-600 dark:text-red-400';
        }
        return classes;
    };
    
    return (
        <li>
            <button onClick={onClick} className="w-full flex items-center justify-between py-3 text-left hover:bg-muted dark:hover:bg-dark-muted px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'Reversed' ? 'bg-slate-100 dark:bg-slate-800' : tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        <span className={`text-xl font-bold ${tx.status === 'Reversed' ? 'text-slate-400' : tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'credit' ? '↓' : '↑'}</span>
                    </div>
                    <div>
                        <p className="font-semibold">{tx.description}</p>
                        <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{new Date(tx.date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={getAmountStyle(tx.type, tx.status)}>
                        {tx.type === 'credit' ? '+' : ''}{formatCurrency(convertedAmount, state.currentCurrency)}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-right">
                        {tx.status === 'Completed' && <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />}
                        {tx.status === 'Failed' && <AlertCircle className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />}
                        <p className={`text-[10px] uppercase tracking-tighter font-black ${getStatusColor(tx.status)}`}>
                            {t(`status${tx.status}` as any)}
                        </p>
                    </div>
                </div>
            </button>
        </li>
    );
};


const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, showAllToggle = false, defaultShowCount = 4, containerClassName = "p-4" }) => {
    const { state, dispatch, t } = useAppContext();
    const [showAll, setShowAll] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        dateFrom: '',
        dateTo: '',
        type: 'all',
        category: 'all',
        status: 'all',
    });

    const categories = useMemo(() => {
        const uniqueCategories = new Set(transactions.map(tx => tx.category));
        return ['all', ...Array.from(uniqueCategories).sort()];
    }, [transactions]);
    
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                if (txDate < fromDate) return false;
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (txDate > toDate) return false;
            }
            if (filters.type !== 'all' && tx.type !== filters.type) return false;
            if (filters.category !== 'all' && tx.category !== filters.category) return false;
            if (filters.status !== 'all' && tx.status !== (filters.status as any)) return false;
            return true;
        });
    }, [transactions, filters]);
    
    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setIsFilterModalOpen(false);
    };

    const transactionsToShow = showAllToggle ? (showAll ? filteredTransactions : filteredTransactions.slice(0, defaultShowCount)) : filteredTransactions;

    const listContainerClass = useMemo(() => {
        if (showAllToggle) {
            return ''; // No special class for dashboard view
        }
        return 'max-h-96 overflow-y-auto';
    }, [showAllToggle]);

    return (
        <div className={containerClassName}>
            <div className="flex justify-between items-center px-2 mb-2">
                <h3 className="text-lg font-semibold">{t('recentActivity')}</h3>
                <div className="flex items-center gap-2">
                    {showAllToggle && (
                        <button onClick={() => setShowAll(!showAll)} className="text-sm font-semibold text-primary">
                            {showAll ? t('showLess') : t('seeAll')}
                        </button>
                    )}
                    <button onClick={() => setIsFilterModalOpen(true)} className="p-2 rounded-full hover:bg-muted dark:hover:bg-dark-muted" aria-label="Filter transactions">
                        <FilterIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {transactionsToShow.length > 0 ? (
                <div className={listContainerClass}>
                    <ul className="space-y-1">
                        {transactionsToShow.map((tx, idx) => <TransactionItem key={`${tx.id}-${idx}`} tx={tx} onClick={() => dispatch({ type: 'SET_SELECTED_TRANSACTION', payload: tx })} />)}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>{t('noTransactionsFound')}</p>
                </div>
            )}
            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
                onApply={handleApplyFilters}
                categories={categories}
            />
        </div>
    );
};

export default TransactionHistory;
