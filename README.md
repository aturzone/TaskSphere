
<div align="center">
  <img src="README-pictures/Screenshot From 2025-05-17 17-04-00.png" width="100" height="100">
  <h1>TaskSphere</h1>
  <p>Your modern server-based productivity and knowledge management hub</p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#installation">Installation</a> •
    <a href="#server-setup">Server Setup</a> •
    <a href="#usage">Usage</a> •
    <a href="#backup-and-restore">Backup</a> •
    <a href="#supported-platforms">Platforms</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

## Features

TaskSphere is a comprehensive productivity app with a Python-based backend for reliable data storage:

- 📋 **Project Management**: Create and manage projects with detailed descriptions and progress tracking
- ✅ **Task Tracking**: Organize tasks with priorities, due dates, and status tracking
- 📝 **Notes Management**: Keep important information with rich note-taking capabilities
- 📅 **Calendar Integration**: View all your tasks and projects in a unified calendar view
- 🔔 **Notifications**: Get reminded of upcoming deadlines and important events
- 💾 **Server-side Storage**: All data stored securely on your local server
- 🔄 **Backup & Restore**: Export/import data with selective options
- 🌌 **Knowledge Galaxy**: Visualize relationships between your tasks, projects and notes
- 📊 **Project Steps**: Break down projects into manageable steps with weight-based progress tracking
- 🐍 **Python Backend**: Robust data management with Python and JSON file storage

## Screenshots

<details open>
<summary><b>Desktop Version</b></summary>
<br>

<div align="center">
  <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-45-30.png" width="400" alt="Knowledge Galaxy" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-45-36.png" width="400" alt="Calendar View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-45-45.png" width="400" alt="Projects View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-45-50.png" width="400" alt="Settings View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-46-02.png" width="400" alt="Tasks View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-46-14.png" width="400" alt="Notes View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-46-33.png" width="400" alt="Additional View" style="border-radius: 8px;">
  </div>
</div>
</details>

<details>
<summary><b>Mobile Version</b></summary>
<br>

<div align="center">
  <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-49-09.png" width="200" alt="Mobile Galaxy View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-49-21.png" width="200" alt="Mobile Tasks View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-49-35.png" width="200" alt="Mobile Calendar View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-49-43.png" width="200" alt="Mobile Notes View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-49-57.png" width="200" alt="Mobile Projects View" style="border-radius: 8px;">
    <img src="README-pictures/Screenshot From 2025-05-17 16-50-03.png" width="200" alt="Mobile Settings View" style="border-radius: 8px;">
  </div>
</div>
</details>

## Installation

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Python 3.7+ (for the backend server)

### Frontend Setup

```sh
# Clone the repository
git clone https://github.com/yourusername/tasksphere.git

# Navigate to the project directory
cd tasksphere

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend app will be available at `http://localhost:5173` by default.

## Server Setup

TaskSphere requires a backend server for data storage and management:

### Starting the Server

```sh
# Navigate to the server directory
cd server

# Install server dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3001` and includes:
- **Node.js Express Server**: Handles API requests and routes
- **Python Backend**: Manages data storage in JSON files
- **Data Storage**: All data stored in `server/Data/` directory

### Server Architecture

```
server/
├── server.js        # Express.js API server
├── backend.py       # Python data management
├── package.json     # Server dependencies
└── Data/           # JSON data storage
    ├── projects.json
    ├── tasks.json
    ├── notes.json
    └── project-steps.json
```

### API Endpoints

The server provides RESTful API endpoints:
- `GET /api/{entity}` - Get all items
- `GET /api/{entity}/{id}` - Get item by ID
- `POST /api/{entity}` - Create new item
- `PUT /api/{entity}/{id}` - Update item
- `DELETE /api/{entity}/{id}` - Delete item
- `GET /api/backup/export` - Export all data
- `POST /api/backup/import` - Import data
- `DELETE /api/backup/clear` - Clear all data

## Usage

### Starting the Application

1. **Start the Backend Server** (Required):
   ```sh
   cd server
   npm start
   ```

2. **Start the Frontend** (in a new terminal):
   ```sh
   npm run dev
   ```

3. **Access the Application**: Open `http://localhost:5173` in your browser

### Projects

Projects are the main organizational units stored on the server:

- Create projects with start/end dates and descriptions
- Track project progress automatically based on task completion
- Set reminders for important project milestones
- Define project steps with weight percentages for accurate progress tracking
- All project data synchronized with the server in real-time

### Tasks

Tasks are actionable items linked to projects:

- Create tasks with title, description, priority levels
- Set due dates, start/end times, and reminders
- Track task status (To Do, In Progress, Done)
- Associate tasks with specific projects
- Filter and sort tasks by various criteria
- Server-side persistence ensures data reliability

### Notes

Notes for storing important information:

- Rich text note creation and editing
- Associate notes with specific projects
- Set date-based reminders for important notes
- Organize and filter notes by date or project
- Full-text search capabilities
- Secure server-side storage

### Calendar View

Unified calendar interface showing all data:

- View projects, tasks, and notes in a single calendar
- Toggle between day, month, and year views
- Navigate easily to specific dates
- Visual representation of workload and deadlines
- Real-time synchronization with server data

### Knowledge Galaxy

Dynamic graph visualization of your workflow:

- Interactive relationship mapping between projects, tasks, and notes
- Create custom connections between different entities
- Zoom and navigate through your knowledge network
- Filter by different entity types for focused views
- Server-side connection storage with local caching

## Backup and Restore

TaskSphere provides comprehensive backup and restore functionality:

### Creating Backups

1. Go to **Settings > Data Management**
2. Click **Export Data**
3. Select data types to include:
   - Projects and project steps
   - Tasks with all details
   - Notes and content
   - Knowledge graph connections
4. Download the generated JSON backup file

### Restoring from Backup

1. Use the **Import Data** option in Settings
2. Select your backup JSON file
3. Choose which data types to restore
4. Confirm the import operation

### Selective Backup Options

- **Projects Only**: Export project data and steps
- **Tasks Only**: Export all task information
- **Notes Only**: Export notes and content
- **Custom Selection**: Choose specific data types
- **Full Backup**: Complete system backup including connections

### Server Data Management

- All backups are created from server-side data
- Import operations directly update server storage
- Data consistency maintained across all operations
- Automatic timestamp and version tracking

## Supported Platforms

TaskSphere runs on multiple platforms with server-client architecture:

- **Desktop**: Windows, macOS, and Linux (with server)
- **Web**: Any modern browser with server backend
- **Mobile**: Progressive Web App support (requires running server)
- **Network**: Multi-device access to single server instance

### System Requirements

#### Server Requirements
- **OS**: Windows, macOS, or Linux
- **Node.js**: v14.0.0 or later
- **Python**: 3.7 or later
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB free disk space for application and data

#### Client Requirements
- **Browser**: Chrome 70+, Firefox 63+, Safari 12+, Edge 79+
- **Network**: Access to server (localhost or network)
- **RAM**: 1GB for browser operation
- **Storage**: Minimal (data stored on server)

### Network Configuration

- **Local Use**: Server and client on same machine
- **Network Use**: Configure server IP for remote access
- **Port Configuration**: Default ports 3001 (server) and 5173 (client)
- **Security**: Local network operation recommended

## Data Storage

### File-based Storage
- **Format**: JSON files for each entity type
- **Location**: `server/Data/` directory
- **Backup**: Regular filesystem backups recommended
- **Migration**: Simple JSON format for easy data migration

### Data Structure
```
server/Data/
├── projects.json      # Project definitions and metadata
├── tasks.json         # Task details and assignments
├── notes.json         # Note content and associations
├── project-steps.json # Project step definitions
└── connections.json   # Knowledge graph relationships
```

## Contributing

Contributions to TaskSphere are welcome!

### Development Setup

1. Fork the repository
2. Set up both frontend and backend:
   ```sh
   # Frontend setup
   npm install
   npm run dev
   
   # Backend setup (new terminal)
   cd server
   npm install
   npm start
   ```
3. Create your feature branch: `git checkout -b feature/amazing-feature`
4. Test with both server and client
5. Commit your changes: `git commit -m 'Add some amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Maintain compatibility between frontend and backend
- Test all API endpoints with the Python backend
- Ensure data consistency across server restarts
- Update documentation for API changes
- Follow TypeScript best practices for frontend
- Use proper error handling for server communication

## Troubleshooting

### Common Issues

**Server Connection Failed**
- Ensure the server is running: `cd server && npm start`
- Check if port 3001 is available
- Verify Python is installed and accessible

**Data Not Persisting**
- Confirm server is running before creating data
- Check `server/Data/` directory permissions
- Verify API endpoints are responding

**Backup/Restore Issues**
- Ensure server connection is active
- Check JSON file format for imports
- Verify sufficient disk space for exports

## License

This project is licensed under the MIT License - see the LICENSE file for details.

<div align="center">
  <br>
  <a href="https://www.buymeacoffee.com/tasksphere" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</div>
