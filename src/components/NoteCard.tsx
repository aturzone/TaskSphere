
import React from 'react';
import { formatDate } from '@/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CalendarDays } from 'lucide-react';

interface NoteCardProps {
  note: any;
  projectName?: string;
  onEdit: (note: any) => void;
  onDelete: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, projectName, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4" onClick={() => onEdit(note)}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{note.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-4">
          {note.content || 'No content'}
        </p>
        
        {projectName && (
          <div className="mt-2 text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {projectName}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-secondary/50 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 mr-1" />
          <span>{formatDate(note.updatedAt || note.createdAt)}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(note); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
