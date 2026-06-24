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

    if (!firestore) {
        const senderIndex = dbState.users.findIndex(u => u.id === senderId);
        if (senderIndex === -1) {
            return res.status(404).json({ error: "Sender not found" });
        }
        const sender = dbState.users[senderIndex];
        const txAmount = parseFloat(amount);
        const txFee = parseFloat(fee) || (transferType === 'local' ? 1.50 : 12.50);
        const totalDeduction = txAmount + txFee;

        if (totalDeduction > sender.balance) {
            return res.status(400).json({ error: "Asset shortage: Insufficient funds" });
        }

        const cleanReceiverAcc = receiverAccountNumber.trim().replace(/\s+/g, '');
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
            status: (sender.id === 'usr_joakim_blom') ? 'Pending' : 'Completed',
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
        if (receiverIndex !== -1 && sender.id !== 'usr_joakim_blom') {
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

        const txAmount = parseFloat(amount);
        const txFee = parseFloat(fee) || (transferType === 'local' ? 1.50 : 12.50);
        const totalDeduction = txAmount + txFee;

        if (totalDeduction > sender.balance) {
            return res.status(400).json({ error: "Asset shortage: Insufficient funds" });
        }

        const cleanReceiverAcc = receiverAccountNumber.trim().replace(/\s+/g, '');
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
            status: (sender.id === 'usr_joakim_blom') ? 'Pending' : 'Completed',
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

        if (receiver && receiverId && sender.id !== 'usr_joakim_blom') {
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
