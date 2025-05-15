import React, { useState, useEffect, useMemo } from 'react';
import { Note } from '@/entities/Note';
import { Project } from '@/entities/Project';
import NoteCard from '@/components/NoteCard';
import NoteFormDialog from '@/components/NoteFormDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, StickyNote, Loader2, Search, Filter, ArrowDownUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProjectId, setFilterProjectId] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt:desc');

  const { toast } = useToast();
  const { isFirstLoad, currentUser } = useAppLevelAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialProjectId = new URLSearchParams(location.search).get('projectId');

  useEffect(() => {
    if (currentUser) {
      fetchNotesAndProjects();
      if (initialProjectId) {
        setFilterProjectId(initialProjectId);
      }
    }
  }, [currentUser, initialProjectId]);

  const fetchNotesAndProjects = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const [noteList, projectList] = await Promise.all([
        Note.list(sortBy as any),
        Project.list()
      ]);
      setNotes(noteList);
      setProjects(projectList);
    } catch (error) {
      console.error("Failed to fetch notes or projects:", error);
      toast({ title: "Error", description: "Could not load notes or projects.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Re-fetch or re-sort locally. For simplicity, re-fetch.
    fetchNotesAndProjects();
  }

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleDeleteNoteAttempt = (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;
    try {
      await Note.delete(noteToDelete);
      toast({ title: "Note Deleted", description: "The note has been successfully deleted." });
      fetchNotesAndProjects(); // Refresh list
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({ title: "Error", description: "Could not delete the note.", variant: "destructive" });
    } finally {
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    }
  };

  const openNewNoteForm = () => {
    setEditingNote(null);
    setShowNoteForm(true);
  };

  const projectMap = useMemo(() => {
    return projects.reduce((acc, project) => {
      acc[project.id] = project.title;
      return acc;
    }, {} as Record<string, string>);
  }, [projects]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => 
        (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(note => 
        filterProjectId === 'all' ? true : 
        filterProjectId === 'none' ? !note.projectId : 
        note.projectId === filterProjectId
      );
  }, [notes, searchTerm, filterProjectId]);

  if (isFirstLoad) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser && !isFirstLoad) {
     return (
      <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)] text-center">
        <StickyNote size={64} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Please log in to manage your notes.</p>
        <Button onClick={() => navigate(createPageUrl('login'))}>Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          <StickyNote className="mr-3 h-8 w-8 text-primary" />
          Notes
        </h1>
        <Button onClick={openNewNoteForm}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add Note
        </Button>
      </div>

      <div className="mb-6 p-4 bg-card rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-input border-border"
              />
            </div>
          </div>
          <div>
            <Select value={filterProjectId} onValueChange={setFilterProjectId}>
              <SelectTrigger className="bg-input border-border">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
                <SelectItem value="none">No Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="bg-input border-border">
                <ArrowDownUp className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:desc">Created: Newest</SelectItem>
                <SelectItem value="createdAt:asc">Created: Oldest</SelectItem>
                <SelectItem value="updatedAt:desc">Updated: Newest</SelectItem>
                <SelectItem value="updatedAt:asc">Updated: Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {filteredNotes.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <StickyNote size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            {notes.length === 0 ? 'No notes yet!' : 'No notes match your filters.'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {notes.length === 0 ? 'Get started by adding your first note.' : 'Try adjusting your search or filters.'}
          </p>
          {notes.length === 0 && <Button onClick={openNewNoteForm}><PlusCircle className="mr-2 h-5 w-5" /> Add Note</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              projectName={note.projectId ? projectMap[note.projectId] : undefined}
              onEdit={handleEditNote}
              onDelete={handleDeleteNoteAttempt}
            />
          ))}
        </div>
      )}

      <NoteFormDialog
        isOpen={showNoteForm}
        onOpenChange={setShowNoteForm}
        note={editingNote}
        onSave={() => {
          fetchNotesAndProjects();
          setShowNoteForm(false);
          setEditingNote(null);
        }}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesPage;
