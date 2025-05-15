
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export interface BackupOptions {
  includeProjects: boolean;
  includeTasks: boolean;
  includeNotes: boolean;
}

interface SelectBackupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: BackupOptions) => void;
  type: 'export' | 'import';
  importFileName?: string;
}

const SelectBackupDialog: React.FC<SelectBackupDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  importFileName
}) => {
  const [options, setOptions] = useState<BackupOptions>({
    includeProjects: true,
    includeTasks: true,
    includeNotes: true
  });
  const { toast } = useToast();

  const handleToggleOption = (option: keyof BackupOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleConfirm = () => {
    // Ensure at least one option is selected
    if (!options.includeProjects && !options.includeTasks && !options.includeNotes) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one data type to backup',
      });
      return;
    }
    
    onConfirm(options);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'export' ? 'Select Data to Export' : 'Select Data to Import'}
          </DialogTitle>
          <DialogDescription>
            {type === 'export' 
              ? 'Choose which data you want to include in your backup file.'
              : `Choose which data you want to import from ${importFileName || 'the backup file'}.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="projects" 
              checked={options.includeProjects}
              onCheckedChange={() => handleToggleOption('includeProjects')}
            />
            <Label htmlFor="projects">Projects</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="tasks" 
              checked={options.includeTasks}
              onCheckedChange={() => handleToggleOption('includeTasks')}
            />
            <Label htmlFor="tasks">Tasks</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notes" 
              checked={options.includeNotes}
              onCheckedChange={() => handleToggleOption('includeNotes')}
            />
            <Label htmlFor="notes">Notes</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>
            {type === 'export' ? 'Export' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectBackupDialog;
