// Network configuration for cross-device connectivity
export const FRONTEND_PORT = 8080;
export const BACKEND_PORT = 3001;

// Function to detect the server IP automatically
export const getServerIP = (): string => {
  // Check if we're in development mode and have a custom server IP
  const customServerIP = import.meta.env.VITE_SERVER_IP;
  if (customServerIP) {
    return customServerIP;
  }

  // Get the current page's hostname
  const currentHost = window.location.hostname;
  
  // If we're on localhost, keep it as localhost for development
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'localhost';
  }
  
  // Otherwise, use the current hostname (this will be the server's IP when accessed from other devices)
  return currentHost;
};

export const getApiBaseUrl = (): string => {
  const serverIP = getServerIP();
  return `http://${serverIP}:${BACKEND_PORT}/api`;
};

// Export configuration for Capacitor mobile app
export const getCapacitorServerUrl = (): string => {
  const serverIP = getServerIP();
  return `http://${serverIP}:${FRONTEND_PORT}`;
};
