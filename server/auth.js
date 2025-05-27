
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuthManager {
    constructor() {
        this.authFile = path.join(__dirname, 'Data', 'auth.json');
        this.sessionFile = path.join(__dirname, 'Data', 'sessions.json');
        this.ensureDataDirectory();
    }

    ensureDataDirectory() {
        const dataDir = path.join(__dirname, 'Data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    isFirstTime() {
        return !fs.existsSync(this.authFile);
    }

    setupFirstUser(username, password) {
        if (!this.isFirstTime()) {
            return { success: false, error: 'User already exists' };
        }

        const hashedPassword = this.hashPassword(password);
        const authData = {
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        fs.writeFileSync(this.authFile, JSON.stringify(authData, null, 2));
        return { success: true };
    }

    login(username, password) {
        if (this.isFirstTime()) {
            return { success: false, error: 'No user configured' };
        }

        const authData = JSON.parse(fs.readFileSync(this.authFile, 'utf-8'));
        const hashedPassword = this.hashPassword(password);

        if (authData.username === username && authData.password === hashedPassword) {
            const token = this.generateToken();
            const session = {
                token,
                username,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };

            // Save session
            let sessions = [];
            if (fs.existsSync(this.sessionFile)) {
                sessions = JSON.parse(fs.readFileSync(this.sessionFile, 'utf-8'));
            }
            sessions.push(session);
            fs.writeFileSync(this.sessionFile, JSON.stringify(sessions, null, 2));

            return { success: true, token, username };
        }

        return { success: false, error: 'Invalid credentials' };
    }

    validateToken(token) {
        if (!fs.existsSync(this.sessionFile)) {
            return { valid: false };
        }

        const sessions = JSON.parse(fs.readFileSync(this.sessionFile, 'utf-8'));
        const session = sessions.find(s => s.token === token);

        if (!session) {
            return { valid: false };
        }

        if (new Date() > new Date(session.expiresAt)) {
            return { valid: false, expired: true };
        }

        return { valid: true, username: session.username };
    }

    logout(token) {
        if (!fs.existsSync(this.sessionFile)) {
            return { success: true };
        }

        let sessions = JSON.parse(fs.readFileSync(this.sessionFile, 'utf-8'));
        sessions = sessions.filter(s => s.token !== token);
        fs.writeFileSync(this.sessionFile, JSON.stringify(sessions, null, 2));

        return { success: true };
    }
}

module.exports = AuthManager;
