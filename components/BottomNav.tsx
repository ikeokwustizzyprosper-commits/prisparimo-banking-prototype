
import React from 'react';
import { useAppContext } from '../App';
import { Page } from '../types';
import { HomeIcon, MenuIcon, SettingsIcon, SignOutIcon } from '../constants';

const BottomNav: React.FC = () => {
    const { state, dispatch, t } = useAppContext();

    const navItems = [
        { 
            icon: HomeIcon, 
            label: state.currentUser?.role === 'admin' ? 'Admin' : t('home'), 
            page: state.currentUser?.role === 'admin' ? Page.ADMIN_DASHBOARD : Page.DASHBOARD 
        },
        { icon: MenuIcon, label: t('menu'), page: Page.MENU },
        { icon: SettingsIcon, label: t('settings'), page: Page.SETTINGS },
    ];

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-card dark:bg-dark-card border-t border-border dark:border-dark-border shadow-t-lg">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })}
                        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                            state.currentPage === item.page ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                        }`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
                <button
                    onClick={() => dispatch({ type: 'LOGOUT' })}
                    className="flex flex-col items-center justify-center w-full text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                    <SignOutIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{t('signOut')}</span>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
