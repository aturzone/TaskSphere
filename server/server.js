const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure Data directory exists
const dataDir = path.join(__dirname, 'Data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

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
    res.json({ status: 'ok', message: 'TaskFlow Server is running' });
});

app.listen(PORT, () => {
    console.log(`TaskFlow Server is running on port ${PORT}`);
    console.log(`Data directory: ${dataDir}`);
});
