import { apiService } from './apiService';

export interface BackupData {
  projects: any[];
  tasks: any[];
  notes: any[];
  'project-steps': any[];
  connections: any[];
  timestamp: string;
  version: string;
}

export interface BackupOptions {
  includeProjects: boolean;
  includeTasks: boolean;
  includeNotes: boolean;
  includeConnections: boolean;
  includeProjectSteps: boolean;
}

class BackupRestoreService {
  async exportDataAsZip(options?: BackupOptions): Promise<{ filename: string; data: string; info: any }> {
    try {
      console.log('Creating ZIP backup with options:', options);
      
      const response = await fetch('/api/backup/export-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: options || {} })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create backup');
      }
      
      return {
        filename: result.filename,
        data: result.data,
        info: result.info
      };
    } catch (error) {
      console.error('Export ZIP failed:', error);
      throw new Error('Failed to export data as ZIP');
    }
  }

  async importDataFromZip(zipBase64Data: string, options?: BackupOptions): Promise<boolean> {
    try {
      console.log('Importing ZIP backup with options:', options);
      
      const response = await fetch('/api/backup/import-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          zipData: zipBase64Data,
          options: options || {} 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to restore backup');
      }
      
      console.log('Successfully restored files:', result.restored_files);
      return true;
    } catch (error) {
      console.error('Import ZIP failed:', error);
      throw new Error('Failed to import data from ZIP');
    }
  }

  async exportData(options?: BackupOptions): Promise<BackupData> {
    try {
      const data = await apiService.exportData();
      
      // Filter data based on options if provided
      if (options) {
        const filteredData: any = {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        };
        
        if (options.includeProjects) filteredData.projects = data.projects || [];
        else filteredData.projects = [];
        
        if (options.includeTasks) filteredData.tasks = data.tasks || [];
        else filteredData.tasks = [];
        
        if (options.includeNotes) filteredData.notes = data.notes || [];
        else filteredData.notes = [];
        
        if (options.includeProjectSteps) filteredData['project-steps'] = data['project-steps'] || [];
        else filteredData['project-steps'] = [];
        
        if (options.includeConnections) {
          const connections = localStorage.getItem('graph-connections');
          filteredData.connections = connections ? JSON.parse(connections) : [];
        } else {
          filteredData.connections = [];
        }
        
        return filteredData;
      }
      
      // Include connections from localStorage
      const connections = localStorage.getItem('graph-connections');
      return {
        ...data,
        connections: connections ? JSON.parse(connections) : [],
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  async importData(backupData: BackupData, options?: BackupOptions): Promise<boolean> {
    try {
      // Prepare data to import based on options
      const dataToImport: any = {};
      
      if (!options || options.includeProjects) {
        dataToImport.projects = backupData.projects || [];
      }
      
      if (!options || options.includeTasks) {
        dataToImport.tasks = backupData.tasks || [];
      }
      
      if (!options || options.includeNotes) {
        dataToImport.notes = backupData.notes || [];
      }
      
      if (!options || options.includeProjectSteps) {
        dataToImport['project-steps'] = backupData['project-steps'] || [];
      }
      
      const result = await apiService.importData(dataToImport);
      
      // Import connections to localStorage if included
      if ((!options || options.includeConnections) && backupData.connections) {
        localStorage.setItem('graph-connections', JSON.stringify(backupData.connections));
      }
      
      return result;
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import data');
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      const result = await apiService.clearAllData();
      // Also clear graph connections
      localStorage.removeItem('graph-connections');
      return result.success || false;
    } catch (error) {
      console.error('Clear data failed:', error);
      throw new Error('Failed to clear all data');
    }
  }

  downloadBackup(data: BackupData, filename?: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `tasksphere-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  uploadBackup(): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };
      
      input.click();
    });
  }

  downloadBackupZip(filename: string, zipBase64Data: string): void {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(zipBase64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download backup file');
    }
  }

  uploadBackupZip(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.zip';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            resolve(base64);
          } catch (error) {
            reject(new Error('Failed to process ZIP file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      };
      
      input.click();
    });
  }

  async checkServerConnection(): Promise<boolean> {
    try {
      await apiService.healthCheck();
      return true;
    } catch (error) {
      console.error('Server connection failed:', error);
      return false;
    }
  }
}

export const backupRestoreService = new BackupRestoreService();

// Export functions for ZIP backup
export const exportDataAsZip = async (options: BackupOptions): Promise<{ filename: string; data: string; info: any }> => {
  console.log('Export ZIP options:', options);
  return await backupRestoreService.exportDataAsZip(options);
};

export const importDataFromZip = async (zipBase64Data: string, options: BackupOptions): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Import ZIP options:', options);
    const result = await backupRestoreService.importDataFromZip(zipBase64Data, options);
    return {
      success: result,
      message: result ? 'Data imported successfully from ZIP' : 'Import failed'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};

export const downloadBackupZip = (filename: string, zipBase64Data: string): void => {
  backupRestoreService.downloadBackupZip(filename, zipBase64Data);
};

// Export standalone functions that AppSettings.tsx expects
export const exportData = async (options: BackupOptions): Promise<BackupData> => {
  console.log('Export options:', options);
  return await backupRestoreService.exportData(options);
};

export const importData = async (content: string, options: BackupOptions): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Import options:', options);
    const data = JSON.parse(content);
    const result = await backupRestoreService.importData(data, options);
    return {
      success: result,
      message: result ? 'Data imported successfully' : 'Import failed'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};

export const downloadBackupFile = (data: BackupData, filename?: string): void => {
  backupRestoreService.downloadBackup(data, filename);
};
