
export enum AuthView {
  LOGIN,
  SIGNUP,
  FORGOT_PASSWORD,
  CODE_VERIFICATION,
  NEW_ACCOUNT_LOADING,
  LOGGING_IN,
  SIGNUP_SUCCESS
}

export enum Page {
  DASHBOARD,
  DEPOSIT,
  TRANSFER,
  PAY_BILLS,
  LOAN,
  SAVINGS,
  IRS_REFUND,
  CARDS,
  PROFILE,
  SETTINGS,
  MENU,
  ADMIN_DASHBOARD,
  CHANGE_PIN,
  NOTIFICATIONS,
  RESTRICTION,
  LIMITS,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  accountNumber: string;
  bvn: string;
  idCardNumber: string;
  avatar: string;
  balance: number;
  savingsBalance: number;
  loanBalance: number;
  transactions: Transaction[];
  notifications: Notification[];
  pin: string;
  currency: string;
  role: 'customer' | 'admin';
  isBlocked?: boolean;
  isActivated?: boolean;
  profession?: string;
  dob?: string;
  income?: string;
  cards?: Card[];
  limits?: {
    dailyTransfer: number;
    dailyAtm: number;
    monthlySpending: number;
    perTransaction: number;
    onlinePurchase: number;
  };
}

export interface Transaction {
  id: string;
  userId?: string; 
  userName?: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  reference?: string;
  status?: 'Completed' | 'Pending' | 'Failed' | 'Held' | 'Reversed';
  senderName?: string;
  senderAccount?: string;
  receiverName?: string;
  receiverAccount?: string;
  bankName?: string;
  country?: string;
  currency?: string;
  fee?: number;
}

export interface Card {
  id: string;
  type: 'virtual' | 'physical';
  provider: 'visa' | 'mastercard';
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; 
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  imageUrl?: string;
  timestamp: string;
  isRead?: boolean;
}

export type Action =
  | { type: 'LOGIN'; payload: { email: string; password: string } }
  | { type: 'SIGNUP'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'UPDATE_USER_BALANCE'; payload: { userId: string, newBalance: number } }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string, isBlocked: boolean } }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION_STATUS'; payload: { userId: string, transactionId: string, status: Transaction['status'] } }
  | { type: 'SET_SELECTED_TRANSACTION', payload: Transaction | null }
  | { type: 'MOVE_TO_SAVINGS', payload: number }
  | { type: 'MOVE_FROM_SAVINGS', payload: number }
  | { type: 'MOVE_TO_LOAN', payload: number }
  | { type: 'MOVE_FROM_LOAN', payload: number }
  | { type: 'CHANGE_PIN', payload: string }
  | { type: 'UPDATE_LIMITS', payload: User['limits'] }
  | { type: 'CLEAR_AUTH_ERROR' }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'TOGGLE_CHAT'; payload: boolean }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_TRANSACTION_TO_USER'; payload: { userId: string, transaction: Transaction } }
  | { type: 'UPDATE_SYSTEM_NOTE'; payload: string }
  | { type: 'SYNC_STATE'; payload: AppState }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'QUICK_LOGIN'; payload: User };

export interface AppState {
  isAuthenticated: boolean;
  isChatbotOpen: boolean;
  currentUser: User | null;
  currentPage: Page;
  selectedTransaction: Transaction | null;
  users: User[];
  messages: Message[];
  authError: string | null;
  currentCurrency: string;
  systemNote: string;
  language: string;
}
