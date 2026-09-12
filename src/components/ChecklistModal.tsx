import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  Pin 
} from 'lucide-react';
import { Note, ChecklistItem, NoteColor } from '../types';
import { PASTEL_COLOR_OPTIONS } from '../lib/colors';

interface ChecklistModalProps {
  isOpen: boolean;
  initialNote?: Note | null;
  onClose: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'created_at'>, id?: string) => Promise<void>;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  isOpen,
  initialNote,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState<NoteColor>('offwhite');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialNote) {
        setTitle(initialNote.title || '');
        setPinned(Boolean(initialNote.pinned));
        setColor(initialNote.color || 'offwhite');
        setItems(initialNote.checklist ? [...initialNote.checklist] : []);
      } else {
        setTitle('');
        setPinned(false);
        setColor('offwhite');
        setItems([]);
      }
      setNewItemText('');
      setErrorMsg(null);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newItemText.trim();
    if (!text) return;

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        text,
        completed: false,
      },
    ]);
    setNewItemText('');
    setTimeout(() => {
      itemInputRef.current?.focus();
    }, 30);
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && items.length === 0) {
      setErrorMsg('Adicione ao menos um título ou um item na lista.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSave(
        {
          type: 'checklist',
          title: title.trim(),
          content: '',
          pinned,
          color,
          category: 'Listas',
          checklist: items,
          attachments: initialNote?.attachments || [],
        },
        initialNote?.id
      );
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar lista.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="checklist-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/35 backdrop-blur-2xs p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="checklist-modal-card"
        className="w-full max-w-xl rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] shadow-xl p-5 sm:p-7 relative text-left my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[#F5F5F4]">
          <span className="text-sm font-normal text-[#1C1917] font-times tracking-wide flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />
            <span>{initialNote ? 'Editar Lista' : 'Nova Lista de Tarefas'}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={`p-1.5 rounded-md transition ${
                pinned
                  ? 'bg-[#1C1917] text-[#F9F9F8]'
                  : 'text-[#78716C] hover:bg-[#F5F5F4]'
              }`}
              title={pinned ? 'Fixada no topo' : 'Fixar no topo'}
            >
              <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <input
              ref={titleInputRef}
              type="text"
              placeholder=""
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base sm:text-lg font-normal text-[#1C1917] bg-transparent border-0 border-b border-[#E7E5E4] pb-1.5 focus:outline-none focus:border-[#1C1917] transition font-times"
            />
          </div>

          {/* Items Section */}
          <div className="p-3.5 rounded-xl bg-[#FAF9F8] border border-[#E7E5E4] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#78716C] tracking-wide flex items-center gap-1.5 font-times">
                <span>Itens ({items.length})</span>
                {items.length > 0 && (
                  <span className="text-[11px] text-[#A8A29E]">
                    — {items.filter((i) => i.completed).length} concluído(s)
                  </span>
                )}
              </label>
            </div>

            {/* Input to add new checklist item */}
            <div className="flex items-center gap-2">
              <input
                ref={itemInputRef}
                type="text"
                placeholder=""
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                className="flex-1 text-xs text-[#1C1917] bg-white border border-[#E7E5E4] rounded-md px-3 py-2 focus:outline-none focus:border-[#1C1917] font-times"
              />
              <button
                type="button"
                onClick={() => handleAddItem()}
                disabled={!newItemText.trim()}
                className="px-3.5 py-2 rounded-md bg-[#1C1917] hover:bg-[#292524] disabled:opacity-40 text-xs text-[#F9F9F8] transition cursor-pointer flex items-center gap-1 shrink-0 font-times"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Render items */}
            {items.length > 0 ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white border border-[#E7E5E4] text-xs transition hover:border-[#D6D3D1]"
                  >
                    <div 
                      onClick={() => handleToggleItem(item.id)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-[#1C1917] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A8A29E] shrink-0" />
                      )}
                      <span className={`font-times text-xs break-words ${item.completed ? 'line-through text-[#A8A29E]' : 'text-[#1C1917]'}`}>
                        {item.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#A8A29E] hover:text-red-600 p-1 transition"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[#A8A29E] font-times">
                Digite um item acima e pressione Enter para adicionar à lista.
              </div>
            )}
          </div>

          {/* Pastel Color Selection */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#78716C] font-times">
                Tom da lista
              </label>
              <span className="text-[11px] text-[#57534E] font-times font-medium">
                {PASTEL_COLOR_OPTIONS.find((c) => c.id === color)?.label || 'Branco Neutro'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-0.5 flex-wrap">
              {PASTEL_COLOR_OPTIONS.map((opt) => {
                const isSelected = color === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setColor(opt.id)}
                    title={opt.label}
                    aria-label={opt.label}
                    style={{ backgroundColor: opt.dotBg, borderColor: opt.dotBorder }}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center relative shadow-2xs ${
                      isSelected 
                        ? 'scale-110 ring-2 ring-[#1C1917] ring-offset-2' 
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1917]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F5F5F4]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg border border-[#E7E5E4] text-xs text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] transition cursor-pointer font-times"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] text-xs text-[#F9F9F8] transition cursor-pointer disabled:opacity-50 font-times"
            >
              {isSubmitting ? 'Salvando...' : initialNote ? 'Atualizar Lista' : 'Salvar Lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
