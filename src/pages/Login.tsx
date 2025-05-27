
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Key, Shield, Server, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authService.isLoggedIn()) {
        const isValid = await authService.validateToken();
        if (isValid) {
          navigate('/');
          return;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const status = await authService.getAuthStatus();
        clearTimeout(timeoutId);
        setIsFirstTime(status.isFirstTime);
        setServerInfo(status);
        setConnectionError(false);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to check auth status:', error);
        
        setIsFirstTime(true);
        setConnectionError(true);
        setServerInfo(null);
        
        toast({
          title: "⚠️ Server Connection Failed",
          description: "Cannot connect to server. If this is your first time, please start the server first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsFirstTime(true);
      setConnectionError(true);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFirstTime) {
        const setupResult = await authService.setupFirstUser(username, password);
        if (setupResult.success) {
          toast({
            title: "✨ Congratulations!",
            description: "Your account has been created successfully. Logging in...",
          });
          
          setTimeout(async () => {
            try {
              const loginResult = await authService.login(username, password);
              if (loginResult.success) {
                navigate('/');
              }
            } catch (loginError) {
              console.error('Login after setup failed:', loginError);
              toast({
                title: "Login Error",
                description: "Account created but login failed. Please try again.",
                variant: "destructive",
              });
            }
          }, 1000);
        } else {
          throw new Error(setupResult.error || 'Setup failed');
        }
      } else {
        const result = await authService.login(username, password);
        if (result.success) {
          toast({
            title: "Welcome! 🎉",
            description: `Successfully logged in, ${result.username}`,
          });
          navigate('/');
        } else {
          throw new Error(result.error || 'Login failed');
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Incorrect username or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = () => {
    setIsCheckingStatus(true);
    setConnectionError(false);
    checkAuthStatus();
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg text-muted-foreground animate-pulse">Checking server status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/5 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Header with logo and title */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TaskSphere
          </h1>
          <p className="text-muted-foreground mt-2">
            {isFirstTime ? 'Initial System Setup' : 'Login to System'}
          </p>
        </div>

        {/* Connection error warning */}
        {connectionError && (
          <Card className="mb-6 border-orange-200 bg-orange-50 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Server connection unavailable</p>
                  <p className="text-xs mt-1">If this is your first time, please start the server on port 3001 first</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRetryConnection}
                  className="border-orange-300 text-orange-800 hover:bg-orange-100"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm animate-slide-in-right">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              {isFirstTime ? (
                <>
                  <Server className="h-6 w-6 text-primary" />
                  Initial Setup
                </>
              ) : (
                <>
                  <User className="h-6 w-6 text-primary" />
                  Account Login
                </>
              )}
            </CardTitle>
            <CardDescription className="text-base">
              {isFirstTime 
                ? 'For the first time, set the system administrator username and password'
                : 'Log in with your username and password'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isFirstTime ? "Choose administrator username" : "Enter your username"}
                  className="h-12 text-center"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isFirstTime ? "Set administrator password" : "Enter your password"}
                    className="h-12 text-center pr-12"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold relative overflow-hidden group"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      {isFirstTime ? 'Create Admin Account' : 'Login to System'}
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Button>
            </form>

            {/* Server info */}
            {serverInfo && !connectionError && (
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg border animate-fade-in delay-500">
                <p className="text-sm text-muted-foreground text-center">
                  <Server className="h-4 w-4 inline mr-1" />
                  Server: {serverInfo.serverIP}:{serverInfo.ports.backend} | 
                  Frontend: Port {serverInfo.ports.frontend}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 animate-fade-in delay-1000">
          <p className="text-sm text-muted-foreground">
            {isFirstTime 
              ? 'After setup, you can log in with the same credentials'
              : 'Welcome to the task management system'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
