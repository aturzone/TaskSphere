import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Upload, Trash2, AlertCircle } from 'lucide-react';
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
import { exportData, importData, downloadBackupFile, BackupOptions } from '@/services/backupRestoreService';
import { Project } from '@/entities/Project';
import { Task } from '@/entities/Task';
import { Note } from '@/entities/Note';
import { ProjectStep } from '@/entities/ProjectStep';
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

  const handleExport = async (options: BackupOptions) => {
    setLoading({ ...loading, export: true });
    try {
      const data = await exportData(options);
      downloadBackupFile(data);
      toast({
        title: "Backup Created",
        description: "Your data has been backed up successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was a problem creating your backup.",
      });
    } finally {
      setLoading({ ...loading, export: false });
      setShowExportDialog(false);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImportFile(file);
        setShowImportDialog(true);
      }
    };
    
    input.click();
  };

  const handleImport = async (options: BackupOptions) => {
    if (!importFile) return;
    
    setLoading({ ...loading, import: true });
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        
        try {
          const result = await importData(content, options);
          
          if (result.success) {
            toast({
              title: "Import Successful",
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
            description: "There was a problem processing your backup file.",
          });
        } finally {
          setLoading({ ...loading, import: false });
          setShowImportDialog(false);
          setImportFile(null);
        }
      };
      
      reader.readAsText(importFile);
      
    } catch (error) {
      console.error("File reading error:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "There was a problem reading your backup file.",
      });
      setLoading({ ...loading, import: false });
      setShowImportDialog(false);
      setImportFile(null);
    }
  };

  const handleClearData = async () => {
    setLoading({ ...loading, clearData: true });
    
    try {
      // Get all data
      const projects = await Project.list();
      const tasks = await Task.list();
      const notes = await Note.list();
      const projectSteps = await ProjectStep.getAll();
      
      // Delete all data
      for (const project of projects) { await Project.delete(project.id); }
      for (const task of tasks) { await Task.delete(task.id); }
      for (const note of notes) { await Note.delete(note.id); }
      for (const step of projectSteps) { await ProjectStep.delete(step.id); }
      
      // Clear graph connections
      localStorage.removeItem('graph-connections');
      
      toast({
        title: "Data Cleared",
        description: "All application data has been cleared successfully.",
      });
    } catch (error) {
      console.error("Clear data error:", error);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "There was a problem clearing your data.",
      });
    } finally {
      setLoading({ ...loading, clearData: false });
      setShowConfirmClear(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Settings className="mr-3 h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Additional settings can go here in the future */}
              <p className="text-muted-foreground">No appearance settings available in this version.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data-management">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Export or import your application data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Backup Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a backup file containing your projects, tasks, and notes.
                </p>
                <Button 
                  onClick={() => setShowExportDialog(true)} 
                  disabled={loading.export}
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
                  Import data from a previously created backup file.
                </p>
                <Button 
                  onClick={handleImportClick} 
                  disabled={loading.import}
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
                  Clear all application data. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowConfirmClear(true)}
                  disabled={loading.clearData}
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
              This will permanently delete all your projects, tasks, and notes.
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
