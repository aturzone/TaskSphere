
<div align="center">
  <img src="README-pictures/Screenshot From 2025-05-17 17-04-00.png" width="100" height="100">
  <h1>TaskSphere</h1>
  <p>Your modern offline productivity and knowledge management hub</p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#backup-and-restore">Backup</a> •
    <a href="#supported-platforms">Platforms</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

## Features

TaskSphere is a comprehensive productivity app designed to help you manage your projects, tasks, and notes in an organized way:

- 📋 **Project Management**: Create and manage projects with detailed descriptions
- ✅ **Task Tracking**: Organize tasks with priorities, due dates, and status tracking
- 📝 **Notes Management**: Keep important information with rich note-taking
- 📅 **Calendar Integration**: View all your tasks and projects in a calendar view
- 🔔 **Notifications**: Get reminded of upcoming deadlines and important events
- 💾 **Selective Backup**: Export/import only the data you need
- 🌌 **Knowledge Galaxy**: Visualize relationships between your tasks, projects and notes
- 📊 **Project Steps**: Break down projects into manageable steps with progress tracking

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

### Setup

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

The app will be available at `http://localhost:5173` by default.

## Usage

### Projects

Projects are the main organizational units. Each project can contain multiple tasks and notes.

- Create projects with start/end dates
- Track project progress automatically based on task completion
- Set reminders for important project milestones
- Define project steps with weight percentages
- Visualize project relationships in the Knowledge Galaxy

### Tasks

Tasks are actionable items that can be assigned to projects.

- Create tasks with title, description, and priority
- Set due dates and reminders
- Track task status (To Do, In Progress, Done)
- Organize tasks by projects
- Filter and sort tasks by various criteria

### Notes

Notes allow you to keep important information associated with your tasks or projects.

- Create notes with a rich text editor
- Associate notes with projects
- Set date-based reminders for notes
- Organize and filter notes by date or project

### Calendar View

The calendar view provides a comprehensive overview of your schedule:

- View projects, tasks, and notes in a unified calendar
- Toggle between day, month, and year views
- Easily navigate to specific dates
- Get a visual representation of busy periods

### Knowledge Galaxy

The Knowledge Galaxy provides a dynamic graph visualization of your workflow:

- View relationships between projects, tasks, and notes
- Create custom connections between different entities
- Zoom and navigate through your knowledge network
- Filter by different entity types
- Focus on specific nodes to highlight relationships

## Backup and Restore

TaskSphere allows you to selectively back up and restore your data:

1. Go to **Settings > Data Management**
2. Choose **Export Data** to create a backup
3. Select which data types to include (Projects, Tasks, Notes)
4. To restore from a backup, use the **Import Data** option
5. Select which parts of the backup to restore

## Supported Platforms

TaskSphere is built with web technologies and can run on multiple platforms:

- **Desktop**: Windows, macOS, and Linux via Electron packaging
- **Web**: Any modern browser (Chrome, Firefox, Safari, Edge)
- **Mobile**: Progressive Web App support for iOS and Android
- **Offline**: Full functionality available without internet connection

### System Requirements

- **Desktop**: 4GB RAM, 250MB free disk space
- **Mobile**: Modern smartphone with updated browser
- **Browser**: Chrome 70+, Firefox 63+, Safari 12+, Edge 79+

## Contributing

Contributions to TaskSphere are welcome! 

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Thank you

1. 
A big shout-out to GPT-Engineer and lovable.dev for their fantastic platforms that speed up AI development and help build lovable AI projects effortlessly. We sincerely thank them for helping me as a programmer to complete my tasks faster in such projects. (lovable.dev) 

<div align="center">
  <br>
  <a href="https://www.buymeacoffee.com/tasksphere" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</div>
