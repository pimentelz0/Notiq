import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  RefreshCw, 
  WifiOff
} from 'lucide-react';
import { Note } from './types';
import { 
  fetchNotesFromSupabase, 
  insertNoteToSupabase, 
  updateNoteInSupabase, 
  deleteNoteFromSupabase, 
  testSupabaseConnection, 
  subscribeToSupabaseNotes,
  supabase
} from './lib/supabase';
import { Header } from './components/Header';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { ImageLightbox } from './components/ImageLightbox';
import { EmptyState } from './components/EmptyState';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOnlyPinned, setFilterOnlyPinned] = useState(false);
  const [filterOnlyChecklist, setFilterOnlyChecklist] = useState(false);
  const [filterOnlyMedia, setFilterOnlyMedia] = useState(false);

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // Auth State
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Connectivity
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserEmail(session.user.email || 'Usuário');
      }
      setSessionChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserEmail(session.user.email || 'Usuário');
      } else {
        setCurrentUserEmail(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data from Supabase
  const loadData = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);

    const test = await testSupabaseConnection();
    setIsSupabaseReady(test.isReady);

    if (test.isReady) {
      const result = await fetchNotesFromSupabase();
      if (!result.error) {
        setNotes(result.notes);
      }
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time synchronization
  useEffect(() => {
    if (!isSupabaseReady) return;

    const unsubscribe = subscribeToSupabaseNotes(() => {
      loadData();
    });

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [isSupabaseReady, loadData]);

  // Create / Update Note
  const handleSaveNote = async (
    noteData: Omit<Note, 'id' | 'created_at'>,
    id?: string
  ) => {
    if (id) {
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                ...noteData,
                updated_at: new Date().toISOString(),
              }
            : n
        )
      );

      if (isSupabaseReady) {
        await updateNoteInSupabase(id, noteData);
      }
    } else {
      const newId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const newNote: Note = {
        id: newId,
        ...noteData,
        created_at: new Date().toISOString(),
      };

      // Optimistic create
      setNotes((prev) => [newNote, ...prev]);

      if (isSupabaseReady) {
        await insertNoteToSupabase(noteData);
      }
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (isSupabaseReady) {
      await deleteNoteFromSupabase(id);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: newPinned } : n))
    );

    if (isSupabaseReady) {
      await updateNoteInSupabase(id, { pinned: newPinned });
    }
  };

  // Toggle Checklist item
  const handleToggleCheckItem = async (noteId: string, itemId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;

    const updatedChecklist = target.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, checklist: updatedChecklist } : n))
    );

    if (isSupabaseReady) {
      await updateNoteInSupabase(noteId, { checklist: updatedChecklist });
    }
  };

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (filterOnlyPinned && !note.pinned) {
        return false;
      }
      if (filterOnlyChecklist && (!note.checklist || note.checklist.length === 0)) {
        return false;
      }
      if (filterOnlyMedia && (!note.attachments || note.attachments.length === 0)) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const inTitle = note.title?.toLowerCase().includes(query);
        const inContent = note.content?.toLowerCase().includes(query);
        const inChecklist = note.checklist?.some((c) =>
          c.text.toLowerCase().includes(query)
        );
        const inAttachments = note.attachments?.some((a) =>
          a.name.toLowerCase().includes(query)
        );
        return inTitle || inContent || inChecklist || inAttachments;
      }
      return true;
    });
  }, [
    notes,
    filterOnlyPinned,
    filterOnlyChecklist,
    filterOnlyMedia,
    searchTerm,
  ]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.pinned), [filteredNotes]);
  const regularNotes = useMemo(() => filteredNotes.filter((n) => !n.pinned), [filteredNotes]);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUserEmail) {
    return (
      <LoginScreen
        onLoginSuccess={(email) => {
          setCurrentUserEmail(email || 'Usuário');
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-[#1C1917] flex flex-col selection:bg-[#E7E5E4] selection:text-[#1C1917]">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-[#F5F5F4] border-b border-[#E7E5E4] px-4 py-1.5 text-center text-xs text-[#78716C] flex items-center justify-center gap-1.5 font-times">
          <WifiOff className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span>Modo offline. Suas anotações serão sincronizadas automaticamente.</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterOnlyPinned={filterOnlyPinned}
        onTogglePinnedFilter={() => setFilterOnlyPinned(!filterOnlyPinned)}
        filterOnlyChecklist={filterOnlyChecklist}
        onToggleChecklistFilter={() => setFilterOnlyChecklist(!filterOnlyChecklist)}
        filterOnlyMedia={filterOnlyMedia}
        onToggleMediaFilter={() => setFilterOnlyMedia(!filterOnlyMedia)}
        onOpenNewNote={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
        onLogout={handleLogout}
        userEmail={currentUserEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#78716C]" />
            <p className="text-xs text-[#78716C] font-times">Carregando NOTIQ...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            isSearching={Boolean(searchTerm || filterOnlyPinned || filterOnlyChecklist || filterOnlyMedia)}
            onClearSearch={() => {
              setSearchTerm('');
              setFilterOnlyPinned(false);
              setFilterOnlyChecklist(false);
              setFilterOnlyMedia(false);
            }}
            onNewNote={() => {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[11px] font-normal tracking-[0.16em] text-[#78716C] uppercase font-times">
                    Fixadas ({pinnedNotes.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsNoteModalOpen(true);
                      }}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleCheckItem={handleToggleCheckItem}
                      onOpenImage={(url, name) => setLightboxImage({ url, name })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notes Section */}
            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <div className="flex items-center gap-2 mb-2.5 pt-2">
                    <span className="text-[11px] font-normal tracking-[0.16em] text-[#78716C] uppercase font-times">
                      Anotações ({regularNotes.length})
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {regularNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsNoteModalOpen(true);
                      }}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleCheckItem={handleToggleCheckItem}
                      onOpenImage={(url, name) => setLightboxImage({ url, name })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setEditingNote(null);
            setIsNoteModalOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-[#1C1917] hover:bg-[#292524] active:scale-95 text-[#F9F9F8] border border-[#292524] shadow-md flex items-center justify-center cursor-pointer transition"
          aria-label="Nova anotação"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Note Modal (Create / Edit) */}
      <NoteModal
        isOpen={isNoteModalOpen}
        initialNote={editingNote}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
      />

      {/* Image Lightbox Modal */}
      <ImageLightbox
        isOpen={Boolean(lightboxImage)}
        imageUrl={lightboxImage?.url || null}
        imageName={lightboxImage?.name}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
