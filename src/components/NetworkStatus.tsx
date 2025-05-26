
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getApiBaseUrl, getServerIP } from '@/config/networkConfig';
import { apiService } from '@/services/apiService';

const NetworkStatus = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkServerHealth = async () => {
    setServerStatus('checking');
    try {
      const health = await apiService.healthCheck();
      setServerInfo(health);
      setServerStatus('online');
      setLastCheck(new Date());
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerStatus('offline');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkServerHealth();
    // Check every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      default: return 'Checking...';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Network Status
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div>
            <strong>Client IP:</strong> {getServerIP()}
          </div>
          <div>
            <strong>API URL:</strong> {getApiBaseUrl()}
          </div>
          {serverInfo && (
            <div>
              <strong>Server IP:</strong> {serverInfo.serverIP}
            </div>
          )}
          {lastCheck && (
            <div>
              <strong>Last Check:</strong> {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <Button 
          onClick={checkServerHealth} 
          disabled={serverStatus === 'checking'}
          className="w-full"
        >
          {serverStatus === 'checking' ? 'Checking...' : 'Test Connection'}
        </Button>
        
        {serverStatus === 'offline' && (
          <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
            <strong>Connection Failed!</strong>
            <br />
            Make sure the server is running on port 3001
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkStatus;
