
import json
import os
import sys
from datetime import datetime
import uuid

class DataManager:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'Data')
        self.ensure_data_directory()
        
    def ensure_data_directory(self):
        """Ensure Data directory exists"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def get_file_path(self, entity_type):
        """Get file path for entity type"""
        return os.path.join(self.data_dir, f"{entity_type}.json")
    
    def load_data(self, entity_type):
        """Load data from file"""
        file_path = self.get_file_path(entity_type)
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                return []
        return []
    
    def save_data(self, entity_type, data):
        """Save data to file"""
        file_path = self.get_file_path(entity_type)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def generate_id(self):
        """Generate unique ID"""
        return str(uuid.uuid4())
    
    def get_current_timestamp(self):
        """Get current timestamp"""
        return datetime.now().isoformat()
    
    def get_all(self, entity_type):
        """Get all items of entity type"""
        return self.load_data(entity_type)
    
    def get_by_id(self, entity_type, item_id):
        """Get item by ID"""
        data = self.load_data(entity_type)
        for item in data:
            if item.get('id') == item_id:
                return item
        return None
    
    def create(self, entity_type, item_data):
        """Create new item"""
        data = self.load_data(entity_type)
        
        # Generate ID if not provided
        if 'id' not in item_data:
            item_data['id'] = self.generate_id()
        
        # Set timestamps
        current_time = self.get_current_timestamp()
        if 'createdAt' not in item_data:
            item_data['createdAt'] = current_time
        item_data['updatedAt'] = current_time
        
        data.append(item_data)
        self.save_data(entity_type, data)
        return item_data
    
    def update(self, entity_type, item_id, update_data):
        """Update existing item"""
        data = self.load_data(entity_type)
        
        for i, item in enumerate(data):
            if item.get('id') == item_id:
                # Update item with new data
                data[i].update(update_data)
                data[i]['updatedAt'] = self.get_current_timestamp()
                self.save_data(entity_type, data)
                return data[i]
        
        return None
    
    def delete(self, entity_type, item_id):
        """Delete item by ID"""
        data = self.load_data(entity_type)
        original_length = len(data)
        
        data = [item for item in data if item.get('id') != item_id]
        
        if len(data) < original_length:
            self.save_data(entity_type, data)
            return True
        return False
    
    def export_all(self):
        """Export all data"""
        export_data = {}
        entity_types = ['projects', 'tasks', 'notes', 'project-steps', 'connections']
        
        for entity_type in entity_types:
            export_data[entity_type] = self.load_data(entity_type)
        
        return export_data
    
    def import_all(self, import_data):
        """Import all data"""
        try:
            for entity_type, data in import_data.items():
                if isinstance(data, list):
                    self.save_data(entity_type, data)
            return True
        except Exception as e:
            print(f"Error importing data: {e}", file=sys.stderr)
            return False
    
    def clear_all(self):
        """Clear all data"""
        try:
            entity_types = ['projects', 'tasks', 'notes', 'project-steps', 'connections']
            for entity_type in entity_types:
                file_path = self.get_file_path(entity_type)
                if os.path.exists(file_path):
                    os.remove(file_path)
            return True
        except Exception as e:
            print(f"Error clearing data: {e}", file=sys.stderr)
            return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python backend.py <operation> [args...]", file=sys.stderr)
        sys.exit(1)
    
    operation = sys.argv[1]
    data_manager = DataManager()
    
    try:
        if operation == 'get':
            if len(sys.argv) < 3:
                print("Usage: python backend.py get <entity_type> [id]", file=sys.stderr)
                sys.exit(1)
            
            entity_type = sys.argv[2]
            if len(sys.argv) > 3:
                # Get by ID
                item_id = sys.argv[3]
                result = data_manager.get_by_id(entity_type, item_id)
            else:
                # Get all
                result = data_manager.get_all(entity_type)
            
            print(json.dumps(result, ensure_ascii=False))
        
        elif operation == 'create':
            if len(sys.argv) < 4:
                print("Usage: python backend.py create <entity_type> <json_data>", file=sys.stderr)
                sys.exit(1)
            
            entity_type = sys.argv[2]
            json_data = json.loads(sys.argv[3])
            result = data_manager.create(entity_type, json_data)
            print(json.dumps(result, ensure_ascii=False))
        
        elif operation == 'update':
            if len(sys.argv) < 5:
                print("Usage: python backend.py update <entity_type> <id> <json_data>", file=sys.stderr)
                sys.exit(1)
            
            entity_type = sys.argv[2]
            item_id = sys.argv[3]
            json_data = json.loads(sys.argv[4])
            result = data_manager.update(entity_type, item_id, json_data)
            print(json.dumps(result, ensure_ascii=False))
        
        elif operation == 'delete':
            if len(sys.argv) < 4:
                print("Usage: python backend.py delete <entity_type> <id>", file=sys.stderr)
                sys.exit(1)
            
            entity_type = sys.argv[2]
            item_id = sys.argv[3]
            result = data_manager.delete(entity_type, item_id)
            print(str(result).lower())
        
        elif operation == 'export':
            result = data_manager.export_all()
            print(json.dumps(result, ensure_ascii=False))
        
        elif operation == 'import':
            if len(sys.argv) < 3:
                print("Usage: python backend.py import <json_data>", file=sys.stderr)
                sys.exit(1)
            
            json_data = json.loads(sys.argv[2])
            result = data_manager.import_all(json_data)
            print(str(result).lower())
        
        elif operation == 'clear':
            result = data_manager.clear_all()
            print(str(result).lower())
        
        else:
            print(f"Unknown operation: {operation}", file=sys.stderr)
            sys.exit(1)
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
