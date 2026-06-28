import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    getDocs, 
    query, 
    where 
} from "firebase/firestore";

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

// Fallback in-memory state
let dbState = {
    users: [] as any[],
    messages: [] as any[],
    systemNote: ""
};

// Load initial fallback state from data.json if it exists
if (fs.existsSync(DATA_FILE)) {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        dbState = JSON.parse(data);
    } catch (e) {
        console.error("Error reading data file", e);
    }
}

// Initialize Firebase from config
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseApp: any = null;
let firestore: any = null;

if (fs.existsSync(firebaseConfigPath)) {
    try {
        const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
        firebaseApp = initializeApp(config);
        if (config.firestoreDatabaseId) {
            firestore = getFirestore(firebaseApp, config.firestoreDatabaseId);
        } else {
            firestore = getFirestore(firebaseApp);
        }
        console.log("Firebase Firestore initialized successfully with project:", config.projectId);
    } catch (e) {
        console.error("Failed to initialize Firebase:", e);
    }
} else {
    console.warn("firebase-applet-config.json not found, falling back to local memory database.");
}

function saveLocalState() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(dbState, null, 2));
    } catch (e) {
        console.error("Error saving state", e);
    }
}

// Fetch complete state (users, messages, config)
async function getDbState() {
    if (!firestore) {
        return dbState;
    }
    try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const users: any[] = [];
        usersSnapshot.forEach(docSnap => {
            users.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Fetch messages
        const messagesSnapshot = await getDocs(collection(firestore, 'messages'));
        const messages: any[] = [];
        messagesSnapshot.forEach(docSnap => {
            messages.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Sort messages by timestamp
        messages.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeA - timeB;
        });

        // Fetch system config
        let systemNote = "";
        try {
            const configDoc = await getDoc(doc(firestore, 'system', 'config'));
            if (configDoc.exists()) {
                systemNote = configDoc.data().systemNote || "";
            }
        } catch (e) {
            console.error("Error fetching system config", e);
        }

        // If firestore is completely empty, seed it with fallback users/messages
        if (users.length === 0) {
            console.log("Firestore is empty. Seeding with fallback data...");
            const seedUsers = dbState.users && dbState.users.length > 0 ? dbState.users : [];
            for (const u of seedUsers) {
                await setDoc(doc(firestore, 'users', u.id), u);
                users.push(u);
            }

            const seedMessages = dbState.messages && dbState.messages.length > 0 ? dbState.messages : [];
            for (const m of seedMessages) {
                const mId = m.id || `msg_${Math.random().toString(36).substring(2, 9)}`;
                await setDoc(doc(firestore, 'messages', mId), m);
                messages.push(m);
            }

            if (dbState.systemNote) {
                await setDoc(doc(firestore, 'system', 'config'), { systemNote: dbState.systemNote });
                systemNote = dbState.systemNote;
            }
        }

        return { users, messages, systemNote };
    } catch (e) {
        console.error("Error fetching state from Firestore:", e);
        return dbState;
    }
}

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Helpers for real-time notifications
function formatTime(isoString: string): string {
    try {
        const d = new Date(isoString);
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const minStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minStr} ${ampm}`;
    } catch(e) {
        return "now";
    }
}

function getCurrencySymbol(currency: string): string {
    switch (currency?.toUpperCase()) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'NGN': return '₦';
        default: return '£';
    }
}

// Endpoint to register/update FCM token
app.post("/api/users/update-fcm-token", async (req, res) => {
    const { userId, fcmToken } = req.body;
    if (!userId || !fcmToken) {
        return res.status(400).json({ error: "Missing userId or fcmToken" });
    }

    if (!firestore) {
        const index = dbState.users.findIndex(u => u.id === userId);
        if (index === -1) {
            return res.status(404).json({ error: "User not found" });
        }
        dbState.users[index].fcmToken = fcmToken;
        saveLocalState();
        return res.json({ success: true, fcmToken });
    }

    try {
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found" });
        }
        await updateDoc(userRef, { fcmToken });
        res.json({ success: true, fcmToken });
    } catch (e) {
        console.error("Error updating FCM token:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

async function saveUserToFirestore(user: any) {
    // If the password is a short plaintext string, automatically hash it for security
    if (user.password && user.password.length < 60) {
        user.password = hashPassword(user.password);
    }

    if (!firestore) {
        const index = dbState.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            dbState.users[index] = { ...dbState.users[index], ...user };
        } else {
            dbState.users.push(user);
        }
        saveLocalState();
        return;
    }
    try {
        await setDoc(doc(firestore, 'users', user.id), user, { merge: true });
    } catch (e) {
        console.error("Error saving user to Firestore:", e);
    }
}

async function saveMessageToFirestore(message: any) {
    if (!firestore) {
        dbState.messages.push(message);
        saveLocalState();
        return;
    }
    try {
        const msgId = message.id || `msg_${Math.random().toString(36).substring(2, 9)}`;
        await setDoc(doc(firestore, 'messages', msgId), message);
    } catch (e) {
        console.error("Error saving message to Firestore:", e);
    }
}

async function saveSystemConfigToFirestore(systemNote: string) {
    if (!firestore) {
        dbState.systemNote = systemNote;
        saveLocalState();
        return;
    }
    try {
        await setDoc(doc(firestore, 'system', 'config'), { systemNote }, { merge: true });
    } catch (e) {
        console.error("Error saving system config to Firestore:", e);
    }
}

// API Routes
app.get("/api/state", async (req, res) => {
    try {
        const state = await getDbState();
        res.json(state);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch state" });
    }
});

app.post("/api/state/sync", async (req, res) => {
    try {
        const { users, messages, systemNote } = req.body;
        
        if (users && Array.isArray(users)) {
            for (const u of users) {
                if (u && u.id) {
                    await saveUserToFirestore(u);
                }
            }
        }
        if (messages && Array.isArray(messages)) {
            for (const m of messages) {
                await saveMessageToFirestore(m);
            }
        }
        if (systemNote !== undefined) {
            await saveSystemConfigToFirestore(systemNote);
        }
        
        const state = await getDbState();
        res.json(state);
    } catch (err) {
        console.error("Sync error:", err);
        res.status(500).json({ error: "Failed to sync state" });
    }
});

app.post("/api/users/update", async (req, res) => {
    try {
        const updatedUser = req.body;
        if (!updatedUser || !updatedUser.id) {
            return res.status(400).json({ error: "Invalid user data" });
        }
        await saveUserToFirestore(updatedUser);
        res.json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

app.post("/api/auth/send-email", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ error: "Missing email or code" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!apiKey) {
        console.warn("[WARNING] RESEND_API_KEY is not defined. Email sent via Simulation Mode only.");
        return res.json({ 
            success: true, 
            simulated: true, 
            message: `[Simulated] Code ${code} sent to ${email}` 
        });
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0d9488; text-transform: uppercase; font-size: 20px; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-top: 0;">Security Verification</h2>
            <p style="font-size: 16px; color: #334155;">Hello,</p>
            <p style="font-size: 16px; color: #334155;">You are registering for an account with <strong>Prisparimo Bank</strong>. Please use the verification code below to complete your registration:</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0d9488;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #64748b; margin-top: 25px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
            <p style="font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px;">&copy; 2026 Prisparimo Bank. All rights reserved.</p>
        </div>
    `;

    async function trySend(sender: string) {
        return await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: `Prisparimo Bank <${sender}>`,
                to: [email],
                subject: "Prisparimo Bank - Security Verification Code",
                html: htmlContent
            })
        });
    }

    try {
        let response = await trySend(fromEmail);

        if (!response.ok && fromEmail !== "onboarding@resend.dev") {
            const errText = await response.text();
            console.warn(`[WARNING] Failed sending via custom sender '${fromEmail}'. Error: ${errText}. Retrying with 'onboarding@resend.dev'...`);
            response = await trySend("onboarding@resend.dev");
        }

        if (response.ok) {
            const data = await response.json();
            return res.json({ success: true, simulated: false, data });
        } else {
            const errText = await response.text();
            console.error("Resend API failed, falling back to simulated verification code. Details:", errText);
            return res.json({
                success: true,
                simulated: true,
                warning: "Resend provider validation error. Fell back to simulation.",
                details: errText,
                message: `[Fallback Simulated] Code ${code} sent to ${email}`
            });
        }
    } catch (e: any) {
        console.error("Failed to send real email due to network/server error, falling back to simulation:", e);
        return res.json({
            success: true,
            simulated: true,
            warning: "Resend dispatch network error. Fell back to simulation.",
            details: e.message,
            message: `[Fallback Simulated] Code ${code} sent to ${email}`
        });
    }
});

app.post("/api/auth/send-sms", async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) {
        return res.status(400).json({ error: "Missing phone number or code" });
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioAuthToken || !twilioPhoneNumber) {
        console.warn("[WARNING] Twilio credentials are not defined. SMS sent via Simulation Mode only.");
        return res.json({ 
            success: true, 
            simulated: true, 
            message: `[Simulated] Code ${code} sent to ${phone}` 
        });
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const authHeader = `Basic ${Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64')}`;
        
        const params = new URLSearchParams();
        params.append("To", phone);
        params.append("From", twilioPhoneNumber);
        params.append("Body", `Prisparimo Bank: Your security verification code is ${code}. Never share this code with anyone.`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        if (response.ok) {
            const data = await response.json();
            return res.json({ success: true, simulated: false, data });
        } else {
            const errText = await response.text();
            console.error("Twilio API error, falling back to simulated code. Details:", errText);
            return res.json({
                success: true,
                simulated: true,
                warning: "Twilio provider error. Fell back to simulation.",
                details: errText,
                message: `[Fallback Simulated] Code ${code} sent to ${phone}`
            });
        }
    } catch (e: any) {
        console.error("Failed to send real SMS due to network error, falling back to simulation:", e);
        return res.json({
            success: true,
            simulated: true,
            warning: "Twilio dispatch network error. Fell back to simulation.",
            details: e.message,
            message: `[Fallback Simulated] Code ${code} sent to ${phone}`
        });
    }
});

app.post("/api/messages/add", async (req, res) => {
    try {
        const message = req.body;
        await saveMessageToFirestore(message);
        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: "Failed to add message" });
    }
});

app.post("/api/upload-avatar", async (req, res) => {
    const { userId, avatarBase64 } = req.body;
    if (!userId || !avatarBase64) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (!firestore) {
        const index = dbState.users.findIndex(u => u.id === userId);
        if (index === -1) {
            return res.status(404).json({ error: "User not found" });
        }
        dbState.users[index].avatar = avatarBase64;
        saveLocalState();
        return res.json({ success: true, avatarUrl: avatarBase64, user: dbState.users[index] });
    }

    try {
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found" });
        }
        await updateDoc(userRef, { avatar: avatarBase64 });
        const updatedUser = { ...userDoc.data(), avatar: avatarBase64, id: userId };
        res.json({ success: true, avatarUrl: avatarBase64, user: updatedUser });
    } catch (e) {
        console.error("Error uploading avatar to Firestore:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/transfer", async (req, res) => {
    const { 
        senderId, 
        receiverAccountNumber, 
        amount, 
        transferType, 
        bankName, 
        countryName, 
        currency,
        receiverName,
        fee
    } = req.body;

    if (!senderId || !receiverAccountNumber || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid transfer parameters" });
    }

    const txAmount = parseFloat(amount);

    if (!firestore) {
        const senderIndex = dbState.users.findIndex(u => u.id === senderId);
        if (senderIndex === -1) {
            return res.status(404).json({ error: "Sender not found" });
        }
        const sender = dbState.users[senderIndex];
        const txFee = parseFloat(fee) || (transferType === 'local' ? 1.50 : 12.50);
        const totalDeduction = txAmount + txFee;

        if (totalDeduction > sender.balance) {
            return res.status(400).json({ error: "Asset shortage: Insufficient funds" });
        }

        const cleanReceiverAcc = receiverAccountNumber.trim().replace(/\s+/g, '');

        // Prevent duplicate transfers on backend: check if sender has an identical transaction in the last 15 seconds
        const recentTx = (sender.transactions || []).find((t: any) => {
            const timeDiff = Math.abs(Date.now() - new Date(t.date).getTime());
            return t.receiverAccount === receiverAccountNumber && 
                   Math.abs(t.amount) === txAmount && 
                   timeDiff < 15000;
        });

        if (recentTx) {
            return res.status(400).json({ error: "Duplicate transaction detected. Please wait 15 seconds before trying again." });
        }

        const receiverIndex = dbState.users.findIndex(u => u.accountNumber.trim().replace(/\s+/g, '') === cleanReceiverAcc);

        if (transferType === 'local' && receiverIndex === -1) {
            return res.status(404).json({ error: "Recipient account number not found. Please verify the account number." });
        }

        const dateStr = new Date().toISOString();
        const reference = `REF-${transferType === 'local' ? 'LOC' : 'INT'}-${Math.floor(Math.random() * 900000 + 100000)}`;
        const actualReceiverName = receiverIndex !== -1 ? dbState.users[receiverIndex].name : (receiverName || "Unknown");

        const senderTx = {
            id: `tx_debit_${Date.now()}`,
            date: dateStr,
            description: `Transfer to ${actualReceiverName}`,
            amount: -txAmount,
            type: 'debit',
            category: 'Transfer',
            status: (sender.id === 'usr_joakim_blom' && receiverIndex === -1) ? 'Pending' : 'Completed',
            reference,
            senderName: sender.name,
            senderAccount: sender.accountNumber,
            receiverName: actualReceiverName,
            receiverAccount: receiverAccountNumber,
            bankName: bankName || (transferType === 'local' ? 'Prisparimo Core' : 'International Bank'),
            country: countryName || (transferType === 'local' ? 'United Kingdom' : 'Overseas'),
            currency: currency || 'GBP',
            fee: txFee
        };

        sender.balance -= totalDeduction;
        sender.transactions = [senderTx, ...(sender.transactions || [])];

        let receiver = null;
        if (receiverIndex !== -1) {
            receiver = dbState.users[receiverIndex];
            const receiverTx = {
                id: `tx_credit_${Date.now() + 1}`,
                date: dateStr,
                description: `Transfer from ${sender.name}`,
                amount: txAmount,
                type: 'credit',
                category: 'Transfer',
                status: 'Completed',
                reference,
                senderName: sender.name,
                senderAccount: sender.accountNumber,
                receiverName: receiver.name,
                receiverAccount: receiver.accountNumber,
                bankName: bankName || 'Prisparimo Core',
                country: 'United Kingdom',
                currency: receiver.currency || 'GBP',
                fee: 0
            };
            receiver.balance += txAmount;
            receiver.transactions = [receiverTx, ...(receiver.transactions || [])];

            // Send push notification to receiver
            const currencySymbol = getCurrencySymbol(receiver.currency || 'GBP');
            const timeStr = formatTime(dateStr);
            const notifId = `notif_ref_${reference}`;
            
            const notifExists = (receiver.notifications || []).some((n: any) => n.id === notifId);
            if (!notifExists) {
                const newNotification = {
                    id: notifId,
                    title: "Money Received",
                    message: `You received ${currencySymbol}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from ${sender.name} at ${timeStr}`,
                    date: dateStr,
                    read: false,
                    type: 'success'
                };
                receiver.notifications = [newNotification, ...(receiver.notifications || [])];
                
                if (receiver.fcmToken) {
                    console.log(`[FCM PUSH SENT] Target Token: ${receiver.fcmToken} | Title: Money Received | Body: You received ${currencySymbol}${txAmount} from ${sender.name} at ${timeStr}`);
                }
            }
        }

        saveLocalState();
        return res.json({ 
            success: true, 
            sender, 
            receiver, 
            transaction: senderTx 
        });
    }

    try {
        const senderRef = doc(firestore, 'users', senderId);
        const senderDoc = await getDoc(senderRef);
        if (!senderDoc.exists()) {
            return res.status(404).json({ error: "Sender not found" });
        }
        const sender = senderDoc.data() as any;

        const txFee = parseFloat(fee) || (transferType === 'local' ? 1.50 : 12.50);
        const totalDeduction = txAmount + txFee;

        if (totalDeduction > sender.balance) {
            return res.status(400).json({ error: "Asset shortage: Insufficient funds" });
        }

        const cleanReceiverAcc = receiverAccountNumber.trim().replace(/\s+/g, '');

        // Prevent duplicate transfers on backend: check if sender has an identical transaction in the last 15 seconds
        const recentTx = (sender.transactions || []).find((t: any) => {
            const timeDiff = Math.abs(Date.now() - new Date(t.date).getTime());
            return t.receiverAccount === receiverAccountNumber && 
                   Math.abs(t.amount) === txAmount && 
                   timeDiff < 15000;
        });

        if (recentTx) {
            return res.status(400).json({ error: "Duplicate transaction detected. Please wait 15 seconds before trying again." });
        }

        const usersRef = collection(firestore, 'users');
        const receiverQuery = query(usersRef, where('accountNumber', '==', receiverAccountNumber.trim()));
        const receiverSnapshot = await getDocs(receiverQuery);
        
        let receiver: any = null;
        let receiverId: string | null = null;
        
        receiverSnapshot.forEach(docSnap => {
            receiver = docSnap.data();
            receiverId = docSnap.id;
        });

        if (!receiver) {
            const allUsersSnapshot = await getDocs(usersRef);
            allUsersSnapshot.forEach(docSnap => {
                const u = docSnap.data() as any;
                if (u.accountNumber && u.accountNumber.trim().replace(/\s+/g, '') === cleanReceiverAcc) {
                    receiver = u;
                    receiverId = docSnap.id;
                }
            });
        }

        if (transferType === 'local' && !receiver) {
            return res.status(404).json({ error: "Recipient account number not found. Please verify the account number." });
        }

        const dateStr = new Date().toISOString();
        const reference = `REF-${transferType === 'local' ? 'LOC' : 'INT'}-${Math.floor(Math.random() * 900000 + 100000)}`;
        const actualReceiverName = receiver ? receiver.name : (receiverName || "Unknown");

        const senderTx = {
            id: `tx_debit_${Date.now()}`,
            date: dateStr,
            description: `Transfer to ${actualReceiverName}`,
            amount: -txAmount,
            type: 'debit',
            category: 'Transfer',
            status: (sender.id === 'usr_joakim_blom' && !receiver) ? 'Pending' : 'Completed',
            reference,
            senderName: sender.name,
            senderAccount: sender.accountNumber,
            receiverName: actualReceiverName,
            receiverAccount: receiverAccountNumber,
            bankName: bankName || (transferType === 'local' ? 'Prisparimo Core' : 'International Bank'),
            country: countryName || (transferType === 'local' ? 'United Kingdom' : 'Overseas'),
            currency: currency || 'GBP',
            fee: txFee
        };

        sender.balance -= totalDeduction;
        sender.transactions = [senderTx, ...(sender.transactions || [])];
        await setDoc(senderRef, sender, { merge: true });

        if (receiver && receiverId) {
            const receiverRef = doc(firestore, 'users', receiverId);
            const receiverTx = {
                id: `tx_credit_${Date.now() + 1}`,
                date: dateStr,
                description: `Transfer from ${sender.name}`,
                amount: txAmount,
                type: 'credit',
                category: 'Transfer',
                status: 'Completed',
                reference,
                senderName: sender.name,
                senderAccount: sender.accountNumber,
                receiverName: receiver.name,
                receiverAccount: receiver.accountNumber,
                bankName: bankName || 'Prisparimo Core',
                country: 'United Kingdom',
                currency: receiver.currency || 'GBP',
                fee: 0
            };
            receiver.balance += txAmount;
            receiver.transactions = [receiverTx, ...(receiver.transactions || [])];

            // Send push notification to receiver
            const currencySymbol = getCurrencySymbol(receiver.currency || 'GBP');
            const timeStr = formatTime(dateStr);
            const notifId = `notif_ref_${reference}`;
            
            const notifExists = (receiver.notifications || []).some((n: any) => n.id === notifId);
            if (!notifExists) {
                const newNotification = {
                    id: notifId,
                    title: "Money Received",
                    message: `You received ${currencySymbol}${txAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from ${sender.name} at ${timeStr}`,
                    date: dateStr,
                    read: false,
                    type: 'success'
                };
                receiver.notifications = [newNotification, ...(receiver.notifications || [])];
                
                if (receiver.fcmToken) {
                    console.log(`[FCM PUSH SENT] Target Token: ${receiver.fcmToken} | Title: Money Received | Body: You received ${currencySymbol}${txAmount} from ${sender.name} at ${timeStr}`);
                }
            }
            await setDoc(receiverRef, receiver, { merge: true });
        }

        res.json({ 
            success: true, 
            sender, 
            receiver, 
            transaction: senderTx 
        });
    } catch (e) {
        console.error("Error executing transfer in Firestore:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

async function startServer() {
    if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
