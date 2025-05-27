
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const AuthManager = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;
const authManager = new AuthManager();

// Get server IP address for logging
function getServerIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}

const serverIP = getServerIP();

// Enhanced CORS configuration for cross-device access
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow all origins for development/local network access
        return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
    next();
});

// Ensure Data directory exists
const dataDir = path.join(__dirname, 'Data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Authentication middleware
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const validation = authManager.validateToken(token);
    if (!validation.valid) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = { username: validation.username };
    next();
};

// Authentication Routes

// Check if first time setup
app.get('/api/auth/status', (req, res) => {
    res.json({ 
        isFirstTime: authManager.isFirstTime(),
        serverIP: serverIP,
        ports: { frontend: 8080, backend: 3001 }
    });
});

// First time setup
app.post('/api/auth/setup', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const result = authManager.setupFirstUser(username, password);
    res.json(result);
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const result = authManager.login(username, password);
    if (result.success) {
        res.json(result);
    } else {
        res.status(401).json(result);
    }
});

// Logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const result = authManager.logout(token);
    res.json(result);
});

// Validate token
app.get('/api/auth/validate', requireAuth, (req, res) => {
    res.json({ valid: true, username: req.user.username });
});

// Helper function to run Python script
const runPythonScript = (scriptArgs) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, 'backend.py'), ...scriptArgs]);
        
        let dataString = '';
        
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = dataString.trim();
                    resolve(result ? JSON.parse(result) : null);
                } catch (error) {
                    resolve(dataString.trim());
                }
            } else {
                reject(new Error(`Python script exited with code ${code}`));
            }
        });
    });
};

// Protected API Routes (require authentication)

// Get all data for a specific entity type
app.get('/api/:entityType', requireAuth, async (req, res) => {
    try {
        const { entityType } = req.params;
        const result = await runPythonScript(['get', entityType]);
        res.json(result || []);
    } catch (error) {
        console.error('Error getting data:', error);
        res.status(500).json({ error: 'Failed to get data' });
    }
});

// Get specific item by ID
app.get('/api/:entityType/:id', requireAuth, async (req, res) => {
    try {
        const { entityType, id } = req.params;
        const result = await runPythonScript(['get', entityType, id]);
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error('Error getting item:', error);
        res.status(500).json({ error: 'Failed to get item' });
    }
});

// Create new item
app.post('/api/:entityType', requireAuth, async (req, res) => {
    try {
        const { entityType } = req.params;
        const data = JSON.stringify(req.body);
        const result = await runPythonScript(['create', entityType, data]);
        res.json(result);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// Update item
app.put('/api/:entityType/:id', requireAuth, async (req, res) => {
    try {
        const { entityType, id } = req.params;
        const data = JSON.stringify(req.body);
        const result = await runPythonScript(['update', entityType, id, data]);
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item
app.delete('/api/:entityType/:id', requireAuth, async (req, res) => {
    try {
        const { entityType, id } = req.params;
        const result = await runPythonScript(['delete', entityType, id]);
        res.json({ success: result === 'true' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Export all data
app.get('/api/backup/export', requireAuth, async (req, res) => {
    try {
        const result = await runPythonScript(['export']);
        res.json(result);
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Import data
app.post('/api/backup/import', requireAuth, async (req, res) => {
    try {
        const data = JSON.stringify(req.body);
        const result = await runPythonScript(['import', data]);
        res.json({ success: result === 'true' });
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ error: 'Failed to import data' });
    }
});

// Clear all data
app.delete('/api/backup/clear', requireAuth, async (req, res) => {
    try {
        const result = await runPythonScript(['clear']);
        res.json({ success: result === 'true' });
    } catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

// Export all data as ZIP
app.post('/api/backup/export-zip', requireAuth, async (req, res) => {
    try {
        const options = req.body.options || {};
        const optionsJson = JSON.stringify(options);
        const result = await runPythonScript([path.join(__dirname, 'backup_manager.py'), 'create_backup', optionsJson]);
        
        if (result.success) {
            res.json({
                success: true,
                filename: result.filename,
                data: result.data,
                info: result.info
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error || 'Failed to create backup' 
            });
        }
    } catch (error) {
        console.error('Error creating ZIP backup:', error);
        res.status(500).json({ error: 'Failed to create ZIP backup' });
    }
});

// Import data from ZIP
app.post('/api/backup/import-zip', requireAuth, async (req, res) => {
    try {
        const { zipData, options } = req.body;
        const optionsJson = options ? JSON.stringify(options) : '{}';
        
        const result = await runPythonScript([path.join(__dirname, 'backup_manager.py'), 'restore_backup', zipData, optionsJson]);
        
        if (result.success) {
            res.json({
                success: true,
                restored_files: result.restored_files,
                backup_info: result.backup_info
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error || 'Failed to restore backup' 
            });
        }
    } catch (error) {
        console.error('Error restoring ZIP backup:', error);
        res.status(500).json({ error: 'Failed to restore ZIP backup' });
    }
});

// Health check (no auth required)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'TaskFlow Server is running',
        serverIP: serverIP,
        port: PORT,
        isFirstTime: authManager.isFirstTime()
    });
});

// Listen on all network interfaces (0.0.0.0) instead of just localhost
app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow Server is running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://${serverIP}:${PORT}`);
    console.log(`Data directory: ${dataDir}`);
    console.log('');
    console.log('=== Network Setup Instructions ===');
    console.log(`1. Frontend will run on: http://${serverIP}:8080`);
    console.log(`2. Backend is running on: http://${serverIP}:${PORT}`);
    console.log(`3. Other devices can access via: http://${serverIP}:8080`);
    console.log(`4. Make sure ports ${PORT} and 8080 are open in your firewall`);
    if (authManager.isFirstTime()) {
        console.log(`5. First time setup required - visit the app to configure admin user`);
    }
    console.log('===================================');
});
