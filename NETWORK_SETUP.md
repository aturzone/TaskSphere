
# Network Setup Guide

This guide explains how to run TaskFlow on your local network so multiple devices can access it.

## Quick Start

1. **Start the Backend Server:**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the Frontend (in another terminal):**
   ```bash
   npm install
   npm run dev
   ```

3. **Find Your Server IP:**
   - Windows: Open Command Prompt and run `ipconfig`
   - Mac/Linux: Open Terminal and run `ifconfig` or `ip addr`
   - Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)

4. **Access from Other Devices:**
   - Open browser on any device on the same network
   - Go to: `http://YOUR_SERVER_IP:8080`
   - Example: `http://192.168.1.100:8080`

## Ports Used

- **Frontend (Vite):** Port 8080
- **Backend (Express):** Port 3001

## Automatic Configuration

The app automatically detects your network setup:

- When accessed via `localhost` → connects to `localhost:3001`
- When accessed via IP address → connects to `SAME_IP:3001`

## Custom Server IP (Optional)

If you need to specify a custom server IP:

1. Create a `.env` file in the project root:
   ```
   VITE_SERVER_IP=192.168.1.100
   ```

2. Restart the frontend development server

## Firewall Configuration

Make sure these ports are open in your firewall:
- Port 8080 (Frontend)
- Port 3001 (Backend)

### Windows Firewall:
```bash
netsh advfirewall firewall add rule name="TaskFlow Frontend" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="TaskFlow Backend" dir=in action=allow protocol=TCP localport=3001
```

### Linux (ufw):
```bash
sudo ufw allow 8080
sudo ufw allow 3001
```

## Troubleshooting

### Can't Access from Other Devices?

1. **Check your IP:** Make sure you're using the correct IP address
2. **Check firewall:** Ensure ports 8080 and 3001 are open
3. **Check network:** Make sure all devices are on the same WiFi/network
4. **Check server logs:** The backend will show the correct IP address when it starts

### Server Not Connecting?

1. **Check backend logs:** Look for any Python or database errors
2. **Check browser console:** Open Developer Tools → Console for frontend errors
3. **Test backend directly:** Visit `http://YOUR_IP:3001/api/health` in browser

## Network Security Note

This setup is intended for local network use only. Do not expose these ports to the internet without proper security measures.

## Mobile App (Capacitor)

When building the mobile app, the configuration will automatically use your network IP. Make sure the server is running when you build and test the mobile app.
