
// This file is a utility to update the package.json scripts
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add or update scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "electron:start": "concurrently \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:8080 && electron electron/main.js\"",
  "electron:build": "npm run build && electron-builder build --win",
  "capacitor:init": "npx cap init TaskSphere com.tasksphere.app",
  "capacitor:add:android": "npx cap add android",
  "capacitor:sync": "npx cap sync",
  "capacitor:build": "npm run build && npm run capacitor:sync",
  "capacitor:open:android": "npx cap open android"
};

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Scripts updated in package.json');
