
import React from 'react';
import { User, Transaction, Card } from './types';

export const EXCHANGE_RATES: Record<string, number> = {
    'GBP': 1.0,
    'USD': 1.28,
    'SAR': 4.81,
    'PHP': 74.62,
    'EUR': 1.18,
    'AED': 4.71,
    'CAD': 1.74,
    'AUD': 1.94,
    'SGD': 1.72,
    'CNY': 9.28,
    'JPY': 200.58,
    'INR': 106.85,
    'NGN': 1948.72,
    'ZAR': 23.65,
    'BRL': 6.91,
    'MXN': 22.51,
    'EGP': 60.54,
    'TRY': 41.15,
    'ARS': 1160.26,
    'SYP': 16666.67,
    'CLP': 339.44,
    'VES': 46.54,
    'RUB': 118.59,
    'KRW': 1717.95,
    'CHF': 1.14,
    'SEK': 13.46,
    'NOK': 13.72,
    'DKK': 8.78,
    'NZD': 2.12,
    'HKD': 10.03,
    'MYR': 6.03,
    'THB': 46.79,
    'IDR': 20512.82,
    'ILS': 4.74,
    'PLN': 5.06,
    'CZK': 29.74,
    'HUF': 461.54,
    'RON': 5.90,
    'COP': 5000.00,
    'PEN': 4.74,
    'UAH': 50.64,
    'KZT': 570.51,
    'QAR': 4.67,
    'KWD': 0.40,
    'OMR': 0.49,
    'BHD': 0.49,
    'JOD': 0.91,
    'LBP': 114743.59,
    'IQD': 1679.49,
    'PKR': 356.41,
    'BDT': 150.00,
    'VND': 32628.21,
    'GHS': 18.59,
    'KES': 166.67,
    'UGX': 4807.69,
    'TZS': 3333.33,
    'ETB': 73.08,
    'MAD': 12.82,
    'TND': 3.97,
    'DZD': 171.79,
    'TJS': 13.59,
    'AZN': 2.18,
    'GEL': 3.46,
    'AMD': 497.44,
    'UZS': 16153.85,
    'KGS': 114.10,
    'MNT': 4384.62,
    'LAK': 28205.13,
    'MMK': 2692.31,
    'KHR': 5256.41,
    'NPR': 171.79,
    'LKR': 384.62,
    'MVR': 19.74,
    'AFN': 91.03,
    'BND': 1.72,
    'FJD': 2.88,
    'XPF': 141.03,
    'WST': 3.53,
    'TOP': 3.01,
    'VUV': 153.85,
    'SBD': 10.90,
    'PGK': 4.97,
    'MUR': 58.97,
    'SCR': 17.69,
    'MGA': 5897.44,
    'MWK': 2243.59,
    'ZMW': 33.33,
    'NAD': 23.65,
    'BWP': 17.31,
    'SZL': 23.65,
    'LSL': 23.65,
    'MZN': 81.67,
    'AOA': 1076.92,
    'CDF': 3589.74,
    'RWF': 1666.67,
    'BIF': 3653.85,
    'SDG': 769.23,
    'SSP': 1666.67,
    'ERN': 19.23,
    'DJF': 228.21,
    'SOS': 730.77,
    'LYD': 6.15,
};

export const COUNTRIES_WITH_BANKS = [
    { name: "Mexico", currency: "MXN", banks: ["BBVA Mexico", "Santander Mexico", "Banorte", "Citibanamex", "HSBC Mexico", "Scotiabank Mexico", "Banco Azteca"] },
    { name: "Syria", currency: "SYP", banks: ["Commercial Bank of Syria", "Real Estate Bank of Syria", "Industrial Bank", "Popular Credit Bank", "Agricultural Cooperative Bank", "Saving Bank", "Bank of Syria and Overseas", "Banque Bemo Saudi Fransi", "Cham Bank", "Syria International Islamic Bank", "Al-Baraka Bank Syria"] },
    { name: "United States", currency: "USD", banks: ["Bank of America", "Chase", "Wells Fargo", "Citibank", "Capital One", "Goldman Sachs", "Morgan Stanley"] },
    { name: "Argentina", currency: "ARS", banks: ["Banco de la Nación Argentina", "Banco Santander Argentina", "Banco Galicia", "BBVA Argentina", "Banco Macro", "HSBC Argentina", "Banco Provincia"] },
    { name: "United Kingdom", currency: "GBP", banks: ["HSBC", "Lloyds", "Barclays", "NatWest", "Prisparimo Core", "Standard Chartered", "Santander UK"] },
    { name: "Saudi Arabia", currency: "SAR", banks: ["Saudi National Bank (SNB)", "Al-Rajhi Bank", "Riyad Bank", "Alinma Bank", "Banque Saudi Fransi", "STC Pay", "Urpay"] },
    { name: "Philippines", currency: "PHP", banks: ["BDO Unibank", "BPI", "Metrobank", "Landbank", "Security Bank", "GCash", "Maya"] },
    { name: "United Arab Emirates", currency: "AED", banks: ["First Abu Dhabi Bank", "Emirates NBD", "ADCB", "Mashreq Bank"] },
    { name: "Canada", currency: "CAD", banks: ["RBC", "TD", "Scotiabank", "BMO", "CIBC"] },
    { name: "Australia", currency: "AUD", banks: ["Commonwealth Bank", "Westpac", "ANZ", "NAB"] },
    { name: "Singapore", currency: "SGD", banks: ["DBS", "OCBC", "UOB"] },
    { name: "China", currency: "CNY", banks: ["ICBC", "CCB", "Alipay", "WeChat Pay", "Bank of China"] },
    { name: "France", currency: "EUR", banks: ["BNP Paribas", "Société Générale", "Crédit Agricole"] },
    { name: "Germany", currency: "EUR", banks: ["Deutsche Bank", "Commerzbank", "N26"] },
    { name: "Japan", currency: "JPY", banks: ["MUFG", "SMBC", "Mizuho"] },
    { name: "India", currency: "INR", banks: ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"] },
    { name: "Nigeria", currency: "NGN", banks: ["Zenith Bank", "GTBank", "Access Bank", "First Bank", "UBA"] },
    { name: "South Africa", currency: "ZAR", banks: ["Standard Bank", "FirstRand", "Absa", "Nedbank"] },
    { name: "Brazil", currency: "BRL", banks: ["Itaú Unibanco", "Bradesco", "Banco do Brasil", "Nubank"] },
    { name: "Egypt", currency: "EGP", banks: ["National Bank of Egypt", "Banque Misr", "CIB"] },
    { name: "Turkey", currency: "TRY", banks: ["Ziraat Bank", "İşbank", "Garanti BBVA"] },
    { name: "Switzerland", currency: "CHF", banks: ["UBS", "Credit Suisse", "Raiffeisen", "Zürcher Kantonalbank"] },
    { name: "Italy", currency: "EUR", banks: ["Intesa Sanpaolo", "UniCredit", "Poste Italiane"] },
    { name: "Spain", currency: "EUR", banks: ["Banco Santander", "BBVA", "CaixaBank"] },
    { name: "Netherlands", currency: "EUR", banks: ["ING Group", "Rabobank", "ABN AMRO"] },
    { name: "South Korea", currency: "KRW", banks: ["KB Financial Group", "Shinhan Financial Group", "Hana Financial Group"] },
    { name: "Israel", currency: "ILS", banks: ["Bank Leumi", "Bank Hapoalim", "Israel Discount Bank"] },
    { name: "Russia", currency: "RUB", banks: ["Sberbank", "VTB Bank", "Gazprombank"] },
    { name: "Sweden", currency: "SEK", banks: ["Svenska Handelsbanken", "Swedbank", "SEB"] },
    { name: "Norway", currency: "NOK", banks: ["DNB", "SpareBank 1", "Nordea"] },
    { name: "Denmark", currency: "DKK", banks: ["Danske Bank", "Jyske Bank", "Nordea"] },
    { name: "Chile", currency: "CLP", banks: ["Banco de Chile", "Banco Santander Chile", "Banco Estado"] },
    { name: "Venezuela", currency: "VES", banks: ["Banco de Venezuela", "Banesco", "Banco Mercantil"] },
    { name: "Pakistan", currency: "PKR", banks: ["Habib Bank", "National Bank of Pakistan", "United Bank", "MCB Bank"] },
    { name: "Bangladesh", currency: "BDT", banks: ["Sonali Bank", "Janata Bank", "Agrani Bank", "Dutch-Bangla Bank"] },
    { name: "Vietnam", currency: "VND", banks: ["Vietcombank", "VietinBank", "BIDV", "Agribank"] },
    { name: "Ghana", currency: "GHS", banks: ["GCB Bank", "Ecobank Ghana", "Stanbic Bank Ghana"] },
    { name: "Kenya", currency: "KES", banks: ["KCB Bank", "Equity Bank", "Co-operative Bank of Kenya"] },
    { name: "Uganda", currency: "UGX", banks: ["Stanbic Bank Uganda", "Centenary Bank", "Standard Chartered Uganda"] },
    { name: "Tanzania", currency: "TZS", banks: ["CRDB Bank", "NMB Bank", "NBC Bank"] },
    { name: "Ethiopia", currency: "ETB", banks: ["Commercial Bank of Ethiopia", "Awash Bank", "Dashen Bank"] },
    { name: "Morocco", currency: "MAD", banks: ["Attijariwafa Bank", "Banque Populaire", "BMCE Bank"] },
    { name: "Tunisia", currency: "TND", banks: ["Banque Internationale Arabe de Tunisie", "Banque Nationale Agricole"] },
    { name: "Algeria", currency: "DZD", banks: ["Banque Nationale d'Algérie", "Crédit Populaire d'Algérie"] },
    { name: "Jordan", currency: "JOD", banks: ["Arab Bank", "Housing Bank for Trade and Finance"] },
    { name: "Lebanon", currency: "LBP", banks: ["Bank Audi", "BLOM Bank", "Byblos Bank"] },
    { name: "Iraq", currency: "IQD", banks: ["Rafidain Bank", "Rasheed Bank", "Trade Bank of Iraq"] },
    { name: "Kuwait", currency: "KWD", banks: ["National Bank of Kuwait", "Kuwait Finance House"] },
    { name: "Qatar", currency: "QAR", banks: ["Qatar National Bank", "Qatar Islamic Bank", "Doha Bank"] },
    { name: "Bahrain", currency: "BHD", banks: ["Ahli United Bank", "National Bank of Bahrain"] },
    { name: "Oman", currency: "OMR", banks: ["Bank Muscat", "National Bank of Oman"] },
];

export const CURRENCY_DATA = [
    { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
    { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
    { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },
    { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
    { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
    { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
    { code: "CAD", symbol: "$", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", symbol: "$", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "SGD", symbol: "$", name: "Singapore Dollar", flag: "🇸🇬" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
    { code: "ARS", symbol: "$", name: "Argentine Peso", flag: "🇦🇷" },
    { code: "CLP", symbol: "$", name: "Chilean Peso", flag: "🇨🇱" },
    { code: "VES", symbol: "Bs.", name: "Venezuelan Bolívar", flag: "🇻🇪" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
    { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
    { code: "SYP", symbol: "£S", name: "Syrian Pound", flag: "🇸🇾" },
    { code: "NZD", symbol: "$", name: "New Zealand Dollar", flag: "🇳🇿" },
    { code: "HKD", symbol: "$", name: "Hong Kong Dollar", flag: "🇭🇰" },
    { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
    { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
    { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
    { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
    { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
    { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
    { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
    { code: "COP", symbol: "$", name: "Colombian Peso", flag: "🇨🇴" },
    { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "🇵🇪" },
    { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
    { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", flag: "🇰🇿" },
    { code: "QAR", symbol: "﷼", name: "Qatari Riyal", flag: "🇶🇦" },
    { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", flag: "🇰🇼" },
    { code: "OMR", symbol: "﷼", name: "Omani Rial", flag: "🇴🇲" },
    { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", flag: "🇧🇭" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
    { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
    { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
    { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
    { code: "NZD", symbol: "$", name: "New Zealand Dollar", flag: "🇳🇿" },
    { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa", flag: "🇲🇻" },
    { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", flag: "🇱🇰" },
    { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", flag: "🇵🇰" },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
    { code: "EGP", symbol: "E£", name: "Egyptian Pound", flag: "🇪🇬" },
    { code: "TND", symbol: "DT", name: "Tunisian Dinar", flag: "🇹🇳" },
    { code: "MAD", symbol: "DH", name: "Moroccan Dirham", flag: "🇲🇦" },
    { code: "UGX", symbol: "USh", name: "Ugandan Shilling", flag: "🇺🇬" },
    { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", flag: "🇹🇿" },
    { code: "ETB", symbol: "Br", name: "Ethiopian Birr", flag: "🇪🇹" },
    { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", flag: "🇿🇲" },
];

// --- MOCK CARDS ---
export const MOCK_CARDS_LAZARUS: Card[] = [
    {
        id: 'card_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9740',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Lazarus Morrison',
    },
    {
        id: 'card_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3412',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Lazarus Morrison',
    }
];

export const MOCK_CARDS_ALEX: Card[] = [
    {
        id: 'card_alex_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9740',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Alex Hoàng Duy',
    },
    {
        id: 'card_alex_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3412',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Alex Hoàng Duy',
    }
];

export const MOCK_CARDS_ALEX_JEFF: Card[] = [
    {
        id: 'card_alex_jeff_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9741',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Alex Jeff',
    },
    {
        id: 'card_alex_jeff_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3413',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Alex Jeff',
    }
];

export const MOCK_CARDS_ALEX_CHOI: Card[] = [
    {
        id: 'card_alex_choi_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9742',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Alex Narong Choi',
    },
    {
        id: 'card_alex_choi_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3414',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Alex Narong Choi',
    }
];

export const MOCK_CARDS_JOSEPH = MOCK_CARDS_LAZARUS;

export const MOCK_CARDS_JALIHA: Card[] = [
    {
        id: 'card_j_1',
        type: 'physical',
        provider: 'visa',
        number: '4111 2222 3333 4444',
        expiry: '10/27',
        cvv: '555',
        holderName: 'jaliha Amat Cadir',
    }
];

export const MOCK_CARDS_PARADISE: Card[] = [
    {
        id: 'card_p_1',
        type: 'physical',
        provider: 'visa',
        number: '4455 6677 8899 0011',
        expiry: '05/30',
        cvv: '121',
        holderName: 'Paradise Pollen (Surgery Doctor Gistr3)',
    }
];

export const MOCK_CARDS = MOCK_CARDS_JOSEPH; // For backward compatibility if any

const MOCK_NAMES = [
    "Oliver Smith", "George Edwards", "Harry Wilson", "Noah Brown", "Jack Taylor",
    "Leo Davies", "Arthur Evans", "Muhammad Thomas", "Oscar Roberts", "Charlie Johnson",
    "Henry Walker", "Archie Wright", "Theo Robinson", "Freddie Thompson", "James White",
    "Amelia Jones", "Olivia Williams", "Isla Taylor", "Ava Davies", "Mia Evans",
    "Ivy Roberts", "Lily Johnson", "Isabella Walker", "Sophia Wright", "Grace Robinson",
    "Freya Thompson", "Dorothy White", "Rose Thomas", "Willow Edwards", "Sophie Smith",
    "Liam Murphy", "Emma Sullivan", "Noah Walsh", "Olivia O'Brien", "James Byrne",
    "Ava Ryan", "Logan O'Connor", "Sophia O'Neill", "Lucas Kelly", "Mia O'Sullivan",
    "Ethan McCarthy", "Charlotte Doyle", "Mason Kennedy", "Amelia O'Shea", "Jacob Murray",
    "Harper O'Reilly", "Jack O'Flaherty", "Evelyn O'Carroll", "Aiden Sheehan", "Abigail O'Mahony",
    "Benjamin Taylor", "Charlotte Brown", "Daniel Evans", "Emily Fox", "Samuel Green",
    "Chloe Hill", "Joseph Lewis", "Megan Morgan", "Matthew Parker", "Lucy Scott"
];

const generateMockTransactions = (
    userName: string, 
    userAccount: string, 
    count: number = 150,
    airportDate: string = '2026-05-09T14:30:00Z',
    airportAmount: number = 1389,
    maxHistoryDate: Date = new Date(2026, 4, 8), // Defaults to May 8th
    airportName: string = 'Heathrow Airport Ltd',
    airportCountry: string = 'United Kingdom',
    airportCurrency: string = 'GBP',
    airportDesc: string = 'Transfer to Heathrow Airport',
    airportAccount: string = 'UK-AUTH-882299',
    airportBank: string = 'Barclays Bank'
): Transaction[] => {
    const txns: Transaction[] = [];
    
    // The specific Airport transaction
    txns.push({
        id: `txn_${userName.toLowerCase().split(' ')[0]}_latest_airport`,
        date: airportDate,
        description: airportDesc,
        amount: airportAmount,
        type: 'debit',
        category: 'Travel',
        status: 'Completed',
        reference: `APT-${Math.floor(Math.random() * 9000 + 1000)}`,
        senderName: userName,
        senderAccount: userAccount,
        receiverName: airportName,
        receiverAccount: airportAccount,
        bankName: airportBank,
        country: airportCountry,
        currency: airportCurrency
    });

    for (let i = 0; i < count - 1; i++) {
        const start = new Date(2023, 0, 1).getTime();
        const end = maxHistoryDate.getTime();
        const date = new Date(start + Math.random() * (end - start));
        
        const isCredit = Math.random() > 0.4;
        const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
        const amount = Number((Math.random() * 8000 + 100).toFixed(2));
        
        const randomCountryObj = COUNTRIES_WITH_BANKS[Math.floor(Math.random() * COUNTRIES_WITH_BANKS.length)];
        const isInternational = Math.random() > 0.6; // 40% are international
        const country = isInternational ? randomCountryObj.name : 'United Kingdom';
        const currency = isInternational ? randomCountryObj.currency : 'GBP';
        const bank = isInternational ? randomCountryObj.banks[Math.floor(Math.random() * randomCountryObj.banks.length)] : 'Prisparimo Core';

        txns.push({
            id: `txn_${userName.toLowerCase().split(' ')[0]}_gen_${i}`,
            date: date.toISOString(),
            description: isCredit ? `Transfer from ${name}` : `Transfer to ${name}`,
            amount: amount,
            type: isCredit ? 'credit' : 'debit',
            category: 'Transfer',
            status: 'Completed',
            reference: `REF-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${i}`,
            senderName: isCredit ? name : userName,
            senderAccount: isCredit ? `ACC-${Math.floor(Math.random()*900000+100000)}` : userAccount,
            receiverName: isCredit ? userName : name,
            receiverAccount: isCredit ? userAccount : `ACC-${Math.floor(Math.random()*900000+100000)}`,
            bankName: bank,
            country: country,
            currency: currency
        });
    }

    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_TRANSACTIONS: Transaction[] = generateMockTransactions('jaliha Amat Cadir', '9189740050', 150);

const generateThomasTransactions = (): Transaction[] => {
    return generateMockTransactions('Thomas Tyler Christopher', '3492100495', 150);
};

const generateLazarusTransactions = (): Transaction[] => {
    return generateMockTransactions('Lazarus Morrison', '7722994411', 150);
};

export const MOCK_USER: User = {
  id: 'usr_lazarus_morrison',
  name: 'Lazarus Morrison',
  email: 'Lazarusmorrison@gmail.com',
  password: 'Lazarus12',
  phone: '+1 (202) 555-0198',
  accountNumber: '2890155789',
  bvn: '998-22-1133',
  idCardNumber: 'USA-NY-7722',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateLazarusTransactions(),
  notifications: [
    {
      id: 'notif_restriction',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_mexico_real',
      title: 'securityAlert',
      message: 'notifTrueMexico',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    },
    {
      id: 'notif_mexico',
      title: 'securityAlert',
      message: 'notifMexico',
      date: new Date().toISOString(),
      read: false,
      type: 'warning'
    },
    {
      id: 'notif_syria',
      title: 'securityAlert',
      message: 'notifSyria',
      date: new Date().toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_LAZARUS,
};

export const MOCK_ADMIN: User = {
  id: 'adm_pris_001',
  name: 'Prisparimo Manager',
  email: 'admin@prisparimo.com',
  password: 'adminpassword123',
  phone: '+44 20 7123 4567',
  accountNumber: '0000000001',
  bvn: '00000000000',
  idCardNumber: 'ADM-PRIS-01',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg',
  balance: 99999999.00,
  savingsBalance: 0,
  loanBalance: 0,
  transactions: [],
  notifications: [],
  pin: '1212',
  currency: 'GBP',
  role: 'admin',
  isActivated: true,
};


export const MOCK_USER_LAZARUS = MOCK_USER;
export const MOCK_USER_JOSEPH = MOCK_USER;

export const MOCK_USER_THOMAS: User = {
  id: 'usr_thomas_123',
  name: 'Thomas Tyler Christopher',
  email: 'thomas.tyler@prisparimo.com',
  password: 'Thomastyler123',
  phone: '+1 202 555 0174',
  accountNumber: '2890155780',
  bvn: '000-12-3456',
  idCardNumber: 'USA-ID-9921',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 2780000.89,
  savingsBalance: 0.00,
  loanBalance: 0.00,
  transactions: generateThomasTransactions(),
  notifications: [
    {
      id: 'notif_restriction',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: false,
  isBlocked: false,
  cards: MOCK_CARDS_LAZARUS,
};

// Removed duplicate MOCK_CARDS definitions from here
const generateParadiseTransactions = (): Transaction[] => {
    return generateMockTransactions('Paradise Pollen (Surgery Doctor Gistr3)', '8833221100', 150);
};

export const generateAlexTransactions = (): Transaction[] => {
    return generateMockTransactions('Alex Hoàng Duy', '2890155790', 150, '2026-05-09T14:30:00Z', 1389, new Date(2026, 4, 8));
};

export const generateAlexJeffTransactions = (): Transaction[] => {
    return generateMockTransactions('Alex Jeff', '2890155791', 150, '2026-05-16T14:30:00Z', 1459, new Date(2026, 4, 15));
};

export const generateAlexChoiTransactions = (): Transaction[] => {
    return generateMockTransactions('Alex Narong Choi', '2890155792', 150, '2026-05-22T09:40:00Z', 1389, new Date(2026, 4, 8));
};

export const MOCK_USER_ALEX: User = {
  id: 'usr_alex_hoang',
  name: 'Alex Hoàng Duy',
  email: 'alexhoang9@gmail.com',
  password: 'Alexduy11',
  phone: '+44 7922 286845',
  accountNumber: '2890155790',
  bvn: '998-22-1144',
  idCardNumber: 'UK-LD-7723',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateAlexTransactions(),
  notifications: [
    {
      id: 'notif_restriction_alex',
      title: 'securityAlert',
      message: 'transferRestrictedAlex',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_syria_alex',
      title: 'securityAlert',
      message: 'notifSyriaAlex',
      date: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_ALEX,
};

export const MOCK_USER_ALEX_JEFF: User = {
  id: 'usr_alex_jeff',
  name: 'Alex Jeff',
  email: 'alexjeff9@gmail.com',
  password: 'Alexjeff11',
  phone: '+44 7599 186937',
  accountNumber: '2890155791',
  bvn: '998-22-1145',
  idCardNumber: 'UK-LD-7724',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateAlexJeffTransactions(),
  notifications: [
    {
      id: 'notif_restriction_alex_jeff',
      title: 'securityAlert',
      message: 'transferRestrictedAlex',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_mexico_real_alex_jeff',
      title: 'securityAlert',
      message: 'notifTrueMexicoAlex',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    },
    {
      id: 'notif_mexico_alex_jeff',
      title: 'securityAlert',
      message: 'notifMexicoAlex',
      date: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'warning'
    },
    {
      id: 'notif_syria_alex_jeff',
      title: 'securityAlert',
      message: 'notifSyriaAlex',
      date: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_ALEX_JEFF,
};

export const MOCK_USER_ALEX_CHOI: User = {
  id: 'usr_alex_choi',
  name: 'Alex Narong Choi',
  email: 'alexnarongchoi@gmail.com',
  password: 'Alexchoi11',
  phone: '+66 84 912 8080',
  accountNumber: '2890155792',
  bvn: '998-22-1146',
  idCardNumber: 'UK-LD-7725',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateAlexChoiTransactions(),
  notifications: [
    {
      id: 'notif_restriction_alex_choi',
      title: 'securityAlert',
      message: 'transferRestrictedAlex',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_mexico_real_alex_choi',
      title: 'securityAlert',
      message: 'notifTrueMexicoAlex',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    },
    {
      id: 'notif_syria_alex_choi',
      title: 'securityAlert',
      message: 'notifSyriaAlex',
      date: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_ALEX_CHOI,
};

export const MOCK_USER_PARADISE: User = {
  id: 'usr_paradise_pollen',
  name: 'Paradise Pollen (Surgery Doctor Gistr3)',
  email: 'paradisepollen@gmail.com',
  password: 'paradise121',
  phone: '+1 310 555 9988',
  accountNumber: '2890155781',
  bvn: '112-22-3344',
  idCardNumber: 'USA-CA-8833',
  avatar: 'https://img.freepik.com/free-vector/surgeon-character-design_23-2148170154.jpg', 
  balance: 1790679.06,
  savingsBalance: 50000.00,
  loanBalance: 0.00,
  transactions: generateParadiseTransactions(),
  notifications: [
    {
      id: 'notif_restriction',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_mexico_real_paradise',
      title: 'securityAlert',
      message: 'notifTrueMexico',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '1212',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  profession: 'Surgery Doctor Gistr3',
  cards: MOCK_CARDS_PARADISE,
};

export const generateJarkTransactions = (): Transaction[] => {
    const txns = generateMockTransactions('Jark Rubbinson', '2890155799', 150, '2026-05-21T14:30:00Z', 1389, new Date(2026, 4, 20));
    // Modify the airport transaction to be JFK
    const latestAirportTx = txns.find(t => t.id.includes('latest_airport'));
    if (latestAirportTx) {
        latestAirportTx.description = 'Transfer to John F. Kennedy International Airport';
        latestAirportTx.receiverName = 'John F. Kennedy International Airport';
        latestAirportTx.receiverAccount = 'US-JFK-914830';
        latestAirportTx.bankName = 'Chase Bank';
        latestAirportTx.country = 'United States';
        latestAirportTx.currency = 'USD';
    }
    // Also make sure all transactions are in USD
    txns.forEach(t => {
        t.currency = 'USD';
    });
    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_CARDS_JARK: Card[] = [
    {
        id: 'card_jark_1',
        type: 'physical',
        provider: 'visa',
        number: '4455 6677 8899 9248',
        expiry: '09/31',
        cvv: '284',
        holderName: 'Jark Rubbinson',
    }
];

export const MOCK_USER_JARK: User = {
  id: 'usr_jark_rubbinson',
  name: 'Jark Rubbinson',
  email: 'Jarkrubbinson@gmail.com',
  password: 'jarkson11',
  phone: '+13684002849',
  accountNumber: '2890155799',
  bvn: '998-33-2211',
  idCardNumber: 'US-NY-8844',
  avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateJarkTransactions(),
  notifications: [
    {
      id: 'notif_restriction_jark',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_mexico_real_jark',
      title: 'securityAlert',
      message: 'notifTrueMexico',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    },
    {
      id: 'notif_syria_real_jark',
      title: 'securityAlert',
      message: 'notifTrueSyria',
      date: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'USD',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_JARK,
};

export const generateJamesTransactions = (): Transaction[] => {
    return generateMockTransactions(
        'James Stephen', 
        '2890155793', 
        150, 
        '2026-05-23T11:20:00Z', 
        2480, 
        new Date(2026, 4, 15),
        'Ben Gurion International Airport',
        'Israel',
        'ILS',
        'Transfer to Ben Gurion International Airport',
        'IL-AUTH-994488',
        'Bank Leumi'
    );
};

export const MOCK_CARDS_JAMES: Card[] = [
    {
        id: 'card_james_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9743',
        expiry: '12/29',
        cvv: '918',
        holderName: 'James Stephen',
    },
    {
        id: 'card_james_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3415',
        expiry: '08/28',
        cvv: '443',
        holderName: 'James Stephen',
    }
];

export const MOCK_USER_JAMES: User = {
  id: 'usr_james_stephen',
  name: 'James Stephen',
  email: 'js1513048@gmail.com',
  password: 'James11',
  phone: '+821039421532',
  accountNumber: '2890155793',
  bvn: '998-22-1147',
  idCardNumber: 'KR-SEO-8822',
  avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateJamesTransactions(),
  notifications: [
    {
      id: 'notif_restriction_james',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_hongkong_james',
      title: 'securityAlert',
      message: 'notifTrueHongKong',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    },
    {
      id: 'notif_syria_james',
      title: 'securityAlert',
      message: 'notifTrueSyria',
      date: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_JAMES,
};

export const MOCK_CARDS_JOAKIM: Card[] = [
    {
        id: 'card_joakim_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5412 1290 8821 0814',
        expiry: '12/31',
        cvv: '814',
        holderName: 'JOAKIM BLOM',
    }
];

export const generateJoakimTransactions = (): Transaction[] => {
    const lcg = (seed: number) => {
        let s = seed;
        return () => {
            s = (1103515245 * s + 12345) % 2147483648;
            return s / 2147483648;
        };
    };

    const credits = [
        { desc: 'Corporate Dividend Payout - Blom Holdings', cat: 'Investment', senderName: 'Blom Holdings Group', senderAccount: 'CH-SW-99882211', bankName: 'UBS Switzerland', country: 'Switzerland' },
        { desc: 'Executive Performance Advisory Package', cat: 'Consulting', senderName: 'Elysium Tech Group', senderAccount: 'SG-DBS-991188', bankName: 'DBS Bank', country: 'Singapore' },
        { desc: 'Annual Executive Incentive Bonus', cat: 'Compensation', senderName: 'Blom Holdings Group', senderAccount: 'CH-SW-99882211', bankName: 'UBS Switzerland', country: 'Switzerland' },
        { desc: 'Annual CEO Salary Release', cat: 'Compensation', senderName: 'Blom Holdings Group', senderAccount: 'CH-SW-99882211', bankName: 'UBS Switzerland', country: 'Switzerland' },
        { desc: 'IPO Option Liquidation Settlement', cat: 'Investment', senderName: 'NASDAQ Brokerage', senderAccount: 'US-NY-772211', bankName: 'JP Morgan Chase', country: 'United States' },
        { desc: 'Strategic Merger Advisory Return', cat: 'Consulting', senderName: 'Nordic Mergers AB', senderAccount: 'SE-SEB-883311', bankName: 'SEB Sweden', country: 'Sweden' },
        { desc: 'Venture Capital Distribution - Series B', cat: 'Investment', senderName: 'Nexus Growth Fund IV', senderAccount: 'US-DEL-774422', bankName: 'Silicon Valley Bank', country: 'United States' },
        { desc: 'Fine Art Sotheby Auction Proceeds', cat: 'Fine Art', senderName: 'Sothebys International', senderAccount: 'UK-LD-332211', bankName: 'HSBC London', country: 'United Kingdom' },
        { desc: 'Commercial Real Estate Yield Payout', cat: 'Property', senderName: 'Malmo Properties AB', senderAccount: 'SE-SHB-7123', bankName: 'Handelsbanken', country: 'Sweden' },
        { desc: 'Treasury Bond Yield Maturity', cat: 'Investment', senderName: 'Federal Reserve Bank', senderAccount: 'US-FED-1122', bankName: 'Federal Reserve', country: 'United States' }
    ];

    const debits = [
        { desc: 'Acquisition of Prime Commercial Property', cat: 'Property', receiverName: 'Apex Real Estate Partners', receiverAccount: 'UK-RE-889911', bankName: 'Barclays Bank', country: 'United Kingdom' },
        { desc: 'Private Jet Flight Membership Renewal', cat: 'Travel', receiverName: 'NetJets Europe Ltd', receiverAccount: 'EU-NJ-002211', bankName: 'Prisparimo Core', country: 'United Kingdom' },
        { desc: 'Venture Capital Capital Call - Series C', cat: 'Investment', receiverName: 'Nexus Growth Fund IV', receiverAccount: 'US-DEL-774422', bankName: 'Silicon Valley Bank', country: 'United States' },
        { desc: 'Aman Resorts Luxury Booking', cat: 'Travel', receiverName: 'Aman Resorts Limited', receiverAccount: 'HK-AMAN-22114', bankName: 'HSBC Hong Kong', country: 'Hong Kong' },
        { desc: 'Yacht Charter Weekly Fee', cat: 'Elite Lifestyle', receiverName: 'Oceanic Prestige Charter', receiverAccount: 'MC-MC-112233', bankName: 'Barclays Monaco', country: 'Monaco' },
        { desc: 'Christies Auction Contemporary Art', cat: 'Fine Art', receiverName: 'Christies Fine Art', receiverAccount: 'UK-CH-112233', bankName: 'Coutts & Co', country: 'United Kingdom' },
        { desc: 'Private Equity Fund Commitment', cat: 'Investment', receiverName: 'Carlyle Partners Group', receiverAccount: 'US-NY-554433', bankName: 'Bank of America', country: 'United States' },
        { desc: 'Philanthropic Foundation Grant', cat: 'Philanthropy', receiverName: 'Blom Global Charity Foundation', receiverAccount: 'SE-FOUND-33', bankName: 'Handelsbanken', country: 'Sweden' },
        { desc: 'Premium Luxury Watch Purchase - Patek Philippe', cat: 'Elite Lifestyle', receiverName: 'Patek Philippe Geneve', receiverAccount: 'CH-PP-9988', bankName: 'UBS Geneva', country: 'Switzerland' },
        { desc: 'Swiss Chalet Annual Ground Rent Check', cat: 'Property', receiverName: 'Valais Municipal Trust', receiverAccount: 'CH-VAL-7722', bankName: 'Banque Cantonale du Valais', country: 'Switzerland' }
    ];

    const txns: Transaction[] = [];
    const startMs = new Date('2009-01-10T09:00:00Z').getTime();
    const endMs = new Date('2025-01-10T23:59:59Z').getTime();

    for (let i = 0; i < 1000; i++) {
        const rand = lcg(10814 + i);
        const t = (999 - i) / 999;
        const baseTs = startMs + t * (endMs - startMs);
        
        const maxOffsetMs = ((endMs - startMs) / 1000) * 0.45;
        const offset = (rand() - 0.5) * maxOffsetMs;
        const actualTs = Math.min(endMs, Math.max(startMs, baseTs + offset));
        const dateStr = new Date(actualTs).toISOString();

        const isCredit = rand() < 0.38;
        const refNum = Math.floor(rand() * 90000) + 10000;

        if (isCredit) {
            const item = credits[Math.floor(rand() * credits.length)];
            const amount = Math.floor(rand() * 450000) + 15000 + 0.50; // Max under 500k
            txns.push({
                id: `txn_joakim_dyn_${1000 - i}`,
                date: dateStr,
                description: item.desc,
                amount: amount,
                type: 'credit',
                category: item.cat,
                status: 'Completed',
                reference: `${item.cat.substring(0, 3).toUpperCase()}-${refNum}`,
                senderName: item.senderName,
                senderAccount: item.senderAccount,
                receiverName: 'JOAKIM BLOM',
                receiverAccount: '2890155794',
                bankName: item.bankName,
                country: item.country,
                currency: 'USD'
            });
        } else {
            const item = debits[Math.floor(rand() * debits.length)];
            const amount = -(Math.floor(rand() * 450000) + 15000 + 0.75); // Max under 500k
            txns.push({
                id: `txn_joakim_dyn_${1000 - i}`,
                date: dateStr,
                description: item.desc,
                amount: amount,
                type: 'debit',
                category: item.cat,
                status: 'Completed',
                reference: `${item.cat.substring(0, 3).toUpperCase()}-${refNum}`,
                senderName: 'JOAKIM BLOM',
                senderAccount: '2890155794',
                receiverName: item.receiverName,
                receiverAccount: item.receiverAccount,
                bankName: item.bankName,
                country: item.country,
                currency: 'USD'
            });
        }
    }

    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return txns.map((t, idx) => ({
        ...t,
        id: `txn_joakim_sorted_${1000 - idx}`
    }));
};

export const MOCK_USER_JOAKIM: User = {
  id: 'usr_joakim_blom',
  name: 'JOAKIM BLOM',
  email: 'joakimblom@gmail.com',
  password: 'joakim10',
  phone: '+44 7599 186936',
  accountNumber: '2890155794',
  bvn: '998-22-1148',
  idCardNumber: 'EU-SWE-9921',
  avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar_23-2148174171.jpg',
  balance: 20485900.50,
  savingsBalance: 500000.00,
  loanBalance: 0.00,
  transactions: generateJoakimTransactions(),
  notifications: [
    {
      id: 'notif_restriction_joakim',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'USD',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_JOAKIM,
};

// --- MOCK CARDS ---

export const formatCurrency = (amount: number, currencyCode: string = 'GBP') => {
    const currency = CURRENCY_DATA.find(c => c.code === currencyCode) || CURRENCY_DATA.find(c => c.code === 'GBP') || CURRENCY_DATA[0];
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const convertFromGbp = (amountGbp: number, targetCurrency: string) => {
    return amountGbp * (EXCHANGE_RATES[targetCurrency] || 1);
};

export const convertToGbp = (amount: number, sourceCurrency: string) => {
    return amount / (EXCHANGE_RATES[sourceCurrency] || 1);
};

// Keep old names for compatibility if used elsewhere
export const convertFromUsd = convertFromGbp;
export const convertToUsd = convertToGbp;

// --- ICONS ---
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);
export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const SignOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);
export const RefreshCwIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);
export const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
export const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
);
export const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
);
export const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
);
export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);
export const ProcessingLoaderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
export const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
export const LandmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>
);
export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
export const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);
export const PaperclipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
);
export const SmileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
);
export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
export const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
export const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
);

export const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
export const BILLER_CATEGORIES = [
    { name: 'Utilities', icon: LandmarkIcon, billers: ['Saudi Electricity Company', 'SWCC Water', 'British Gas', 'EDF Energy', 'National Water Company', 'Dubai DEWA'] },
    { name: 'Communications', icon: PhoneIcon, billers: ['STC', 'Mobily', 'Zain', 'EE', 'Vodafone', 'Virgin Mobile', 'Airtel', 'Jio', 'MTN', 'Globe', 'Smart'] },
    { name: 'Transport', icon: RefreshCwIcon, billers: ['Uber', 'Careem', 'Transport for London', 'Lime', 'Bolt', 'Grab'] },
    { name: 'Education', icon: UserIcon, billers: ['University of London', 'Oxford University', 'MIT', 'Harvard', 'Local High School'] },
];
