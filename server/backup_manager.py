
import json
import os
import sys
import zipfile
import tempfile
from datetime import datetime
import shutil

class BackupManager:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'Data')
        self.ensure_data_directory()
        
    def ensure_data_directory(self):
        """Ensure Data directory exists"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def create_backup_zip(self, backup_options=None):
        """Create a ZIP backup file with selected data"""
        try:
            # Create temporary directory for backup files
            with tempfile.TemporaryDirectory() as temp_dir:
                backup_data = {}
                timestamp = datetime.now().isoformat()
                
                # Default options - include everything if no options provided
                if backup_options is None:
                    backup_options = {
                        'includeProjects': True,
                        'includeTasks': True,
                        'includeNotes': True,
                        'includeProjectSteps': True,
                        'includeConnections': True
                    }
                
                # Copy selected data files
                files_to_backup = []
                
                if backup_options.get('includeProjects', True):
                    projects_file = os.path.join(self.data_dir, 'projects.json')
                    if os.path.exists(projects_file):
                        files_to_backup.append(('projects.json', projects_file))
                
                if backup_options.get('includeTasks', True):
                    tasks_file = os.path.join(self.data_dir, 'tasks.json')
                    if os.path.exists(tasks_file):
                        files_to_backup.append(('tasks.json', tasks_file))
                
                if backup_options.get('includeNotes', True):
                    notes_file = os.path.join(self.data_dir, 'notes.json')
                    if os.path.exists(notes_file):
                        files_to_backup.append(('notes.json', notes_file))
                
                if backup_options.get('includeProjectSteps', True):
                    steps_file = os.path.join(self.data_dir, 'project-steps.json')
                    if os.path.exists(steps_file):
                        files_to_backup.append(('project-steps.json', steps_file))
                
                if backup_options.get('includeConnections', True):
                    connections_file = os.path.join(self.data_dir, 'connections.json')
                    if os.path.exists(connections_file):
                        files_to_backup.append(('connections.json', connections_file))
                
                # Create backup info file
                backup_info = {
                    'timestamp': timestamp,
                    'version': '1.0.0',
                    'app': 'TaskSphere',
                    'options': backup_options,
                    'files_included': [f[0] for f in files_to_backup]
                }
                
                info_file_path = os.path.join(temp_dir, 'backup_info.json')
                with open(info_file_path, 'w', encoding='utf-8') as f:
                    json.dump(backup_info, f, ensure_ascii=False, indent=2)
                
                # Create ZIP file
                zip_filename = f"tasksphere-backup-{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
                zip_path = os.path.join(temp_dir, zip_filename)
                
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    # Add backup info
                    zipf.write(info_file_path, 'backup_info.json')
                    
                    # Add all selected data files
                    for filename, filepath in files_to_backup:
                        if os.path.exists(filepath):
                            zipf.write(filepath, filename)
                
                # Read ZIP file as base64 for transfer
                with open(zip_path, 'rb') as f:
                    zip_data = f.read()
                
                import base64
                zip_base64 = base64.b64encode(zip_data).decode('utf-8')
                
                return {
                    'success': True,
                    'filename': zip_filename,
                    'data': zip_base64,
                    'info': backup_info
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def restore_from_zip(self, zip_base64_data, restore_options=None):
        """Restore data from ZIP backup"""
        try:
            import base64
            
            # Decode base64 ZIP data
            zip_data = base64.b64decode(zip_base64_data)
            
            # Create temporary directory for extraction
            with tempfile.TemporaryDirectory() as temp_dir:
                zip_path = os.path.join(temp_dir, 'backup.zip')
                
                # Write ZIP file
                with open(zip_path, 'wb') as f:
                    f.write(zip_data)
                
                # Extract ZIP file
                extract_dir = os.path.join(temp_dir, 'extracted')
                with zipfile.ZipFile(zip_path, 'r') as zipf:
                    zipf.extractall(extract_dir)
                
                # Read backup info
                info_file = os.path.join(extract_dir, 'backup_info.json')
                backup_info = {}
                if os.path.exists(info_file):
                    with open(info_file, 'r', encoding='utf-8') as f:
                        backup_info = json.load(f)
                
                # Default options - restore everything if no options provided
                if restore_options is None:
                    restore_options = {
                        'includeProjects': True,
                        'includeTasks': True,
                        'includeNotes': True,
                        'includeProjectSteps': True,
                        'includeConnections': True
                    }
                
                # Restore selected files
                restored_files = []
                
                file_mappings = {
                    'includeProjects': 'projects.json',
                    'includeTasks': 'tasks.json',
                    'includeNotes': 'notes.json',
                    'includeProjectSteps': 'project-steps.json',
                    'includeConnections': 'connections.json'
                }
                
                for option_key, filename in file_mappings.items():
                    if restore_options.get(option_key, True):
                        source_file = os.path.join(extract_dir, filename)
                        dest_file = os.path.join(self.data_dir, filename)
                        
                        if os.path.exists(source_file):
                            shutil.copy2(source_file, dest_file)
                            restored_files.append(filename)
                
                return {
                    'success': True,
                    'restored_files': restored_files,
                    'backup_info': backup_info
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

def main():
    if len(sys.argv) < 2:
        print("Usage: python backup_manager.py <operation> [args...]", file=sys.stderr)
        sys.exit(1)
    
    operation = sys.argv[1]
    backup_manager = BackupManager()
    
    try:
        if operation == 'create_backup':
            options = None
            if len(sys.argv) > 2:
                options = json.loads(sys.argv[2])
            
            result = backup_manager.create_backup_zip(options)
            print(json.dumps(result, ensure_ascii=False))
        
        elif operation == 'restore_backup':
            if len(sys.argv) < 3:
                print("Usage: python backup_manager.py restore_backup <zip_base64_data> [options]", file=sys.stderr)
                sys.exit(1)
            
            zip_data = sys.argv[2]
            options = None
            if len(sys.argv) > 3:
                options = json.loads(sys.argv[3])
            
            result = backup_manager.restore_from_zip(zip_data, options)
            print(json.dumps(result, ensure_ascii=False))
        
        else:
            print(f"Unknown operation: {operation}", file=sys.stderr)
            sys.exit(1)
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
