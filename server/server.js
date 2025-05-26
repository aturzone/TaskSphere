const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Function to detect available Python command
function getPythonCommand() {
    const { execSync } = require('child_process');
    
    // Try different Python commands
    const pythonCommands = ['python3', 'python'];
    
    for (const cmd of pythonCommands) {
        try {
            execSync(`${cmd} --version`, { stdio: 'ignore' });
            return cmd;
        } catch (error) {
            // Command not found, try next
        }
    }
    
    throw new Error('Python is not installed or not accessible. Please install Python3.');
}

let pythonCommand;
try {
    pythonCommand = getPythonCommand();
    console.log(`Using Python command: ${pythonCommand}`);
} catch (error) {
    console.error('Python Error:', error.message);
    console.error('Please install Python3 on your server:');
    console.error('  Ubuntu/Debian: sudo apt install python3');
    console.error('  CentOS/RHEL: sudo yum install python3');
    process.exit(1);
}

// Helper function to run Python script
const runPythonScript = (scriptArgs) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonCommand, [path.join(__dirname, 'backend.py'), ...scriptArgs]);
        
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

// API Routes

// Get all data for a specific entity type
app.get('/api/:entityType', async (req, res) => {
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
app.get('/api/:entityType/:id', async (req, res) => {
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
app.post('/api/:entityType', async (req, res) => {
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
app.put('/api/:entityType/:id', async (req, res) => {
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
app.delete('/api/:entityType/:id', async (req, res) => {
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
app.get('/api/backup/export', async (req, res) => {
    try {
        const result = await runPythonScript(['export']);
        res.json(result);
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Import data
app.post('/api/backup/import', async (req, res) => {
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
app.delete('/api/backup/clear', async (req, res) => {
    try {
        const result = await runPythonScript(['clear']);
        res.json({ success: result === 'true' });
    } catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

// Export all data as ZIP
app.post('/api/backup/export-zip', async (req, res) => {
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
app.post('/api/backup/import-zip', async (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'TaskFlow Server is running',
        serverIP: serverIP,
        port: PORT
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
    console.log('===================================');
});
