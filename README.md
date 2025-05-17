
<div align="center">
  <img src="https://lovable-uploads.s3.amazonaws.com/685724c3-7745-404b-b44c-c406a957019b.png" width="100" height="100">
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
    <img src="https://lovable-uploads.s3.amazonaws.com/0b6232f9-e50e-4abc-8796-cf352cd5b28e.png" width="400" alt="Knowledge Galaxy" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/f1a24e13-d1dc-48bc-9284-5d68497cd0ad.png" width="400" alt="Calendar View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/61dc7e64-0e52-42b8-ad17-9eaeb4016943.png" width="400" alt="Projects View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/39eb6209-683f-431e-b287-b8fc9401cb96.png" width="400" alt="Settings View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/e3499cb6-8ffe-4b4f-adb9-fabe3c9b205f.png" width="400" alt="Tasks View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/2b8084ed-d1a4-4870-a7ce-e4fa3782876a.png" width="400" alt="Notes View" style="border-radius: 8px;">
  </div>
</div>
</details>

<details>
<summary><b>Mobile Version</b></summary>
<br>

<div align="center">
  <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="https://lovable-uploads.s3.amazonaws.com/7b0b30aa-8e70-4095-bc16-aa2a45873d77.png" width="200" alt="Mobile Galaxy View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/5017a8eb-7b93-473c-83dd-6f86e4e64f1a.png" width="200" alt="Mobile Tasks View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/a9173481-0f3f-4ef3-982e-72e9b1446a90.png" width="200" alt="Mobile Calendar View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/4310e6c0-ac6c-469f-b2e1-f06aa83d1e6e.png" width="200" alt="Mobile Notes View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/f5a7a0ca-ca0e-4af9-b01e-afe8049c5896.png" width="200" alt="Mobile Projects View" style="border-radius: 8px;">
    <img src="https://lovable-uploads.s3.amazonaws.com/6aab43f5-2199-4ba6-a00d-de1d892258d8.png" width="200" alt="Mobile Settings View" style="border-radius: 8px;">
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

<div align="center">
  <br>
  <a href="https://www.buymeacoffee.com/tasksphere" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</div>
