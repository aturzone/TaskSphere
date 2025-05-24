import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Upload, Trash2, AlertCircle, Server } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportData, importData, downloadBackupFile, BackupOptions, backupRestoreService } from '@/services/backupRestoreService';
import { exportDataAsZip, importDataFromZip, downloadBackupZip } from '@/services/backupRestoreService';
import SelectBackupDialog from '@/components/SelectBackupDialog';

const AppSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({
    export: false,
    import: false,
    clearData: false,
  });
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  React.useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const isConnected = await backupRestoreService.checkServerConnection();
      setServerStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const handleExport = async (options: BackupOptions) => {
    setLoading({ ...loading, export: true });
    try {
      const result = await exportDataAsZip(options);
      downloadBackupZip(result.filename, result.data);
      toast({
        title: "ZIP Backup Created",
        description: `Your data has been backed up as ${result.filename}.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was a problem creating your ZIP backup. Make sure the server is running.",
      });
    } finally {
      setLoading({ ...loading, export: false });
      setShowExportDialog(false);
    }
  };

  const handleImportClick = async () => {
    try {
      const zipBase64Data = await backupRestoreService.uploadBackupZip();
      setImportFile({ name: 'backup.zip', data: zipBase64Data } as any);
      setShowImportDialog(true);
    } catch (error) {
      console.error("File selection error:", error);
      toast({
        variant: "destructive",
        title: "File Selection Failed",
        description: "There was a problem selecting your backup file.",
      });
    }
  };

  const handleImport = async (options: BackupOptions) => {
    if (!importFile || !(importFile as any).data) return;
    
    setLoading({ ...loading, import: true });
    
    try {
      const result = await importDataFromZip((importFile as any).data, options);
      
      if (result.success) {
        toast({
          title: "ZIP Import Successful",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Import processing error:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "There was a problem processing your ZIP backup file.",
      });
    } finally {
      setLoading({ ...loading, import: false });
      setShowImportDialog(false);
      setImportFile(null);
    }
  };

  const handleClearData = async () => {
    setLoading({ ...loading, clearData: true });
    
    try {
      await backupRestoreService.clearAllData();
      
      toast({
        title: "Data Cleared",
        description: "All application data has been cleared successfully.",
      });
    } catch (error) {
      console.error("Clear data error:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "There was a problem clearing your data. Make sure the server is running.",
      });
    } finally {
      setLoading({ ...loading, clearData: false });
      setShowConfirmClear(false);
    }
  };

  const getServerStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'connected': return 'Server Connected';
      case 'disconnected': return 'Server Disconnected';
      default: return 'Checking Server...';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="mr-3 h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Server className={`h-5 w-5 ${getServerStatusColor()}`} />
          <span className={`text-sm font-medium ${getServerStatusColor()}`}>
            {getServerStatusText()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={checkServerStatus}
            disabled={serverStatus === 'checking'}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>General application preferences and configurations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Data Storage</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All data is stored securely on the server in the Data folder within the application directory.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Storage Location: server/Data/</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data-management">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Export or import your application data from the server storage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {serverStatus === 'disconnected' && (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Server Not Connected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The server is not running. Please start the server with: <code>cd server && npm start</code>
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-2">Backup Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a backup file containing your projects, tasks, notes, and other data from the server.
                </p>
                <Button 
                  onClick={() => setShowExportDialog(true)} 
                  disabled={loading.export || serverStatus === 'disconnected'}
                  className="flex items-center"
                >
                  {loading.export ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Export Data
                    </>
                  )}
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Restore Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import data from a previously created backup file to the server storage.
                </p>
                <Button 
                  onClick={handleImportClick} 
                  disabled={loading.import || serverStatus === 'disconnected'}
                  className="flex items-center"
                >
                  {loading.import ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Import Data
                    </>
                  )}
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-5 w-5" /> Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clear all application data from the server storage. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowConfirmClear(true)}
                  disabled={loading.clearData || serverStatus === 'disconnected'}
                  className="flex items-center"
                >
                  {loading.clearData ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your projects, tasks, notes, and project steps from the server storage.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearData}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <SelectBackupDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleExport}
        type="export"
      />
      
      <SelectBackupDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onConfirm={handleImport}
        type="import"
        importFileName={importFile?.name}
      />
    </div>
  );
};

export default AppSettings;
