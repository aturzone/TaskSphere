
# TaskFlow Server

Backend server for TaskFlow application using Node.js and Python.

## Setup

1. Install Node.js dependencies:
```bash
cd server
npm install
```

2. Make sure Python is installed on your system.

3. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Entity Operations
- `GET /api/{entityType}` - Get all items
- `GET /api/{entityType}/{id}` - Get item by ID
- `POST /api/{entityType}` - Create new item
- `PUT /api/{entityType}/{id}` - Update item
- `DELETE /api/{entityType}/{id}` - Delete item

### Backup Operations
- `GET /api/backup/export` - Export all data
- `POST /api/backup/import` - Import data
- `DELETE /api/backup/clear` - Clear all data

### Health Check
- `GET /api/health` - Server health status

## Entity Types
- `projects` - Project data
- `tasks` - Task data
- `notes` - Note data
- `project-steps` - Project steps data
- `connections` - Graph connections data

## Data Storage
All data is stored in JSON files within the `Data` directory:
- `Data/projects.json`
- `Data/tasks.json`
- `Data/notes.json`
- `Data/project-steps.json`
- `Data/connections.json`

## Server Configuration
The server runs on port 3001 by default. You can change this by setting the `PORT` environment variable.
