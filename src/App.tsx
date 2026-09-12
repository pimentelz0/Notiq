import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  RefreshCw, 
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { Note, ActiveTab } from './types';
import { 
  fetchNotesFromSupabase, 
  insertNoteToSupabase, 
  updateNoteInSupabase, 
  deleteNoteFromSupabase, 
  testSupabaseConnection, 
  subscribeToSupabaseNotes,
  supabase
} from './lib/supabase';
import { clearLegacyLocalNotes } from './lib/storage';
import { Header } from './components/Header';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { ChecklistModal } from './components/ChecklistModal';
import { ImageLightbox } from './components/ImageLightbox';
import { EmptyState } from './components/EmptyState';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  // Direct state from Supabase (no local storage persistence for user data)
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Active Tab: 'notes' (Notas) or 'lists' (Listas)
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Note | null>(null);

  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // Auth State
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Connectivity
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Clear any legacy local cache on start as requested
  useEffect(() => {
    clearLegacyLocalNotes();
  }, []);

  // Monitor auth status
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
    setNotes([]);
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

  // Fetch data directly from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const connTest = await testSupabaseConnection();
      if (!connTest.isReady && connTest.error) {
        setSupabaseError(connTest.error);
      }

      const result = await fetchNotesFromSupabase();
      if (result.error) {
        setSupabaseError(result.error);
      } else {
        setNotes(result.notes || []);
        setSupabaseError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar ao Supabase';
      setSupabaseError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load when session is checked
  useEffect(() => {
    if (sessionChecked && currentUserEmail) {
      loadData();
    }
  }, [sessionChecked, currentUserEmail, loadData]);

  // Real-time synchronization directly with Supabase
  useEffect(() => {
    if (!currentUserEmail) return;

    const unsubscribe = subscribeToSupabaseNotes(() => {
      loadData();
    });

    // Auto-refresh when tab gains visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUserEmail, loadData]);

  // Create / Update Note or Checklist directly in Supabase
  const handleSaveItem = async (
    itemData: Omit<Note, 'id' | 'created_at'>,
    id?: string
  ) => {
    if (id) {
      // Update existing item in Supabase
      const res = await updateNoteInSupabase(id, itemData);
      if (res.error) {
        setSupabaseError(res.error);
        throw new Error(`Erro ao atualizar no Supabase: ${res.error}`);
      }

      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                ...itemData,
                updated_at: new Date().toISOString(),
              }
            : n
        )
      );
      setSupabaseError(null);
    } else {
      // Create new item in Supabase
      const res = await insertNoteToSupabase(itemData);
      if (res.error) {
        setSupabaseError(res.error);
        throw new Error(`Erro ao salvar no Supabase: ${res.error}`);
      }

      if (res.note) {
        setNotes((prev) => [res.note!, ...prev]);
        setSupabaseError(null);
      }
    }
  };

  // Delete note or checklist directly from Supabase
  const handleDeleteNote = async (id: string) => {
    const res = await deleteNoteFromSupabase(id);
    if (res.error) {
      setSupabaseError(res.error);
      alert(`Falha ao excluir no Supabase: ${res.error}`);
      return;
    }

    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSupabaseError(null);
  };

  // Toggle Pin directly in Supabase
  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;
    const res = await updateNoteInSupabase(id, { pinned: newPinned });
    if (res.error) {
      setSupabaseError(res.error);
      alert(`Erro ao alterar fixação no Supabase: ${res.error}`);
      return;
    }

    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: newPinned } : n)));
    setSupabaseError(null);
  };

  // Toggle Checklist item directly in Supabase
  const handleToggleCheckItem = async (noteId: string, itemId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;

    const updatedChecklist = target.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const res = await updateNoteInSupabase(noteId, { checklist: updatedChecklist });
    if (res.error) {
      setSupabaseError(res.error);
      alert(`Erro ao atualizar item no Supabase: ${res.error}`);
      return;
    }

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, checklist: updatedChecklist } : n))
    );
    setSupabaseError(null);
  };

  // Handle Edit click from NoteCard
  const handleEditItem = (item: Note) => {
    const isChecklist = item.type === 'checklist' || item.category === 'Listas' || (item.checklist && item.checklist.length > 0);
    if (isChecklist) {
      setEditingChecklist(item);
      setIsChecklistModalOpen(true);
    } else {
      setEditingNote(item);
      setIsNoteModalOpen(true);
    }
  };

  // Filtered list by activeTab and searchTerm
  const filteredItems = useMemo(() => {
    return notes.filter((note) => {
      const isChecklist = note.type === 'checklist' || note.category === 'Listas' || (note.checklist && note.checklist.length > 0);

      // Separate into two distinct tabs
      if (activeTab === 'notes' && isChecklist) {
        return false;
      }
      if (activeTab === 'lists' && !isChecklist) {
        return false;
      }

      // Search matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const inTitle = note.title?.toLowerCase().includes(query);
        const inContent = note.content?.toLowerCase().includes(query);
        const inChecklistItems = note.checklist?.some((c) =>
          c.text.toLowerCase().includes(query)
        );
        const inAttachments = note.attachments?.some((a) =>
          a.name.toLowerCase().includes(query)
        );
        return inTitle || inContent || inChecklistItems || inAttachments;
      }

      return true;
    });
  }, [notes, activeTab, searchTerm]);

  const pinnedItems = useMemo(() => filteredItems.filter((n) => n.pinned), [filteredItems]);
  const regularItems = useMemo(() => filteredItems.filter((n) => !n.pinned), [filteredItems]);

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
          <span>Sem conexão com a internet. Conecte-se para sincronizar com o Supabase.</span>
        </div>
      )}

      {/* Supabase Error Banner if any */}
      {supabaseError && (
        <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-4 py-2 text-center text-xs text-[#991B1B] flex flex-wrap items-center justify-center gap-2 font-times">
          <AlertCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
          <span>Supabase: {supabaseError}</span>
        </div>
      )}

      {/* Main Header with two distinct tabs: Notas and Listas */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchTerm('');
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenNewItem={() => {
          if (activeTab === 'notes') {
            setEditingNote(null);
            setIsNoteModalOpen(true);
          } else {
            setEditingChecklist(null);
            setIsChecklistModalOpen(true);
          }
        }}
        onLogout={handleLogout}
        userEmail={currentUserEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#78716C]" />
            <p className="text-xs text-[#78716C] font-times">Carregando do Supabase...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            activeTab={activeTab}
            isSearching={Boolean(searchTerm)}
            onClearSearch={() => setSearchTerm('')}
            onNewNote={() => {
              if (activeTab === 'notes') {
                setEditingNote(null);
                setIsNoteModalOpen(true);
              } else {
                setEditingChecklist(null);
                setIsChecklistModalOpen(true);
              }
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Pinned Items Section */}
            {pinnedItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[11px] font-normal tracking-[0.16em] text-[#78716C] uppercase font-times">
                    Fixadas ({pinnedItems.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {pinnedItems.map((item) => (
                    <NoteCard
                      key={item.id}
                      note={item}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleCheckItem={handleToggleCheckItem}
                      onOpenImage={(url, name) => setLightboxImage({ url, name })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Items Section */}
            {regularItems.length > 0 && (
              <div>
                {pinnedItems.length > 0 && (
                  <div className="flex items-center gap-2 mb-2.5 pt-2">
                    <span className="text-[11px] font-normal tracking-[0.16em] text-[#78716C] uppercase font-times">
                      {activeTab === 'notes'
                        ? `Anotações (${regularItems.length})`
                        : `Listas (${regularItems.length})`}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {regularItems.map((item) => (
                    <NoteCard
                      key={item.id}
                      note={item}
                      onEdit={handleEditItem}
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
            if (activeTab === 'notes') {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            } else {
              setEditingChecklist(null);
              setIsChecklistModalOpen(true);
            }
          }}
          className="w-12 h-12 rounded-full bg-[#1C1917] hover:bg-[#292524] active:scale-95 text-[#F9F9F8] border border-[#292524] shadow-md flex items-center justify-center cursor-pointer transition"
          aria-label={activeTab === 'notes' ? 'Nova anotação' : 'Nova lista'}
          title={activeTab === 'notes' ? 'Nova anotação' : 'Nova lista'}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Note Modal (Create / Edit for regular Notes) */}
      <NoteModal
        isOpen={isNoteModalOpen}
        initialNote={editingNote}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveItem}
      />

      {/* Checklist Modal (Create / Edit for Checklists) */}
      <ChecklistModal
        isOpen={isChecklistModalOpen}
        initialNote={editingChecklist}
        onClose={() => {
          setIsChecklistModalOpen(false);
          setEditingChecklist(null);
        }}
        onSave={handleSaveItem}
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
