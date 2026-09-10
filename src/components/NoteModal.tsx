import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  UploadCloud, 
  Pin, 
  Loader2,
  FileText
} from 'lucide-react';
import { Note, ChecklistItem, AttachmentItem, NoteColor } from '../types';
import { processFileForAttachment } from '../lib/supabase';

interface NoteModalProps {
  isOpen: boolean;
  initialNote?: Note | null;
  onClose: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'created_at'>, id?: string) => Promise<void>;
}

const COLOR_OPTIONS: { id: NoteColor; label: string; bg: string; border: string }[] = [
  { id: 'offwhite', label: 'Off-White', bg: '#FFFFFF', border: '#E7E5E4' },
  { id: 'sand', label: 'Areia Suave', bg: '#FAF8F5', border: '#EAE5DD' },
  { id: 'warm-gray', label: 'Cinza Quente', bg: '#F5F5F4', border: '#E3E0DD' },
  { id: 'soft-linen', label: 'Linho Suave', bg: '#F7F6F0', border: '#E6E3D8' },
  { id: 'pale-clay', label: 'Argila Clara', bg: '#F7F5F3', border: '#E6E1DC' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  initialNote,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState<NoteColor>('offwhite');
  const [category, setCategory] = useState('Geral');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newCheckItemText, setNewCheckItemText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialNote) {
        setTitle(initialNote.title || '');
        setContent(initialNote.content || '');
        setPinned(Boolean(initialNote.pinned));
        setColor(initialNote.color || 'offwhite');
        setCategory(initialNote.category || 'Geral');
        setChecklist(initialNote.checklist ? [...initialNote.checklist] : []);
        setAttachments(initialNote.attachments ? [...initialNote.attachments] : []);
      } else {
        setTitle('');
        setContent('');
        setPinned(false);
        setColor('offwhite');
        setCategory('Geral');
        setChecklist([]);
        setAttachments([]);
      }
      setNewCheckItemText('');
      setErrorMsg(null);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  const handleAddChecklistItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newCheckItemText.trim();
    if (!text) return;

    setChecklist((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        text,
        completed: false,
      },
    ]);
    setNewCheckItemText('');
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveCheckItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    setErrorMsg(null);
    try {
      const newAttachments: AttachmentItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const processed = await processFileForAttachment(file);
        newAttachments.push({
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
          name: processed.name,
          type: processed.type,
          mimeType: processed.mimeType,
          size: processed.size,
          url: processed.url,
          createdAt: new Date().toISOString(),
        });
      }
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch {
      setErrorMsg('Não foi possível processar o arquivo anexado.');
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim() && checklist.length === 0 && attachments.length === 0) {
      setErrorMsg('Adicione ao menos um título, texto, item de lista ou anexo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSave(
        {
          title: title.trim(),
          content: content.trim(),
          pinned,
          color,
          category,
          checklist,
          attachments,
        },
        initialNote?.id
      );
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar nota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="note-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/35 backdrop-blur-2xs p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="note-modal-card"
        className="w-full max-w-xl rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] shadow-xl p-5 sm:p-7 relative text-left my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[#F5F5F4]">
          <span className="text-sm font-normal text-[#1C1917] font-times tracking-wide">
            {initialNote ? 'Editar Anotação' : 'Nova Anotação'}
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
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

          {/* Content */}
          <div>
            <textarea
              rows={3}
              placeholder=""
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm text-[#292524] bg-[#FAF9F8] border border-[#E7E5E4] rounded-lg p-3 focus:outline-none focus:border-[#78716C] transition resize-none leading-relaxed font-times"
            />
          </div>

          {/* Checklist */}
          <div className="p-3 rounded-lg bg-[#FAF9F8] border border-[#E7E5E4]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#78716C] tracking-wide flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Itens da Lista ({checklist.length})</span>
              </label>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-white border border-[#E7E5E4] text-xs"
                  >
                    <div 
                      onClick={() => handleToggleCheckItem(item.id)}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#1C1917] shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                      )}
                      <span className={`font-times ${item.completed ? 'line-through text-[#A8A29E]' : 'text-[#1C1917]'}`}>
                        {item.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCheckItem(item.id)}
                      className="text-[#A8A29E] hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder=""
                value={newCheckItemText}
                onChange={(e) => setNewCheckItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 text-xs text-[#1C1917] bg-white border border-[#E7E5E4] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1C1917] font-times"
              />
              <button
                type="button"
                onClick={() => handleAddChecklistItem()}
                disabled={!newCheckItemText.trim()}
                className="px-3 py-1.5 rounded-md bg-[#1C1917] hover:bg-[#292524] disabled:opacity-40 text-xs text-[#F9F9F8] transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="p-3 rounded-lg bg-[#FAF9F8] border border-[#E7E5E4]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#78716C] tracking-wide flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Anexos ({attachments.length})</span>
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFiles}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-[#F5F5F4] text-xs text-[#1C1917] border border-[#E7E5E4] transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Anexar fotos/docs</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt,.csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            {isProcessingFiles && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#78716C]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Carregando anexo...</span>
              </div>
            )}

            {attachments.length > 0 ? (
              <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-white border border-[#E7E5E4] text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {att.type === 'image' ? (
                        <div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-black/10 bg-black/5">
                          <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-[#78716C]" />
                        </div>
                      )}
                      <span className="truncate font-times text-[#1C1917]">{att.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-[#A8A29E] hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#D6D3D1] rounded-md py-2.5 px-3 text-center cursor-pointer hover:bg-white transition text-xs text-[#A8A29E]"
              >
                Clique para selecionar fotos ou documentos
              </div>
            )}
          </div>

          {/* Pastel Color */}
          <div className="pt-1">
            <label className="block text-xs text-[#78716C] mb-1 font-times">
              Tom da nota
            </label>
            <div className="flex items-center gap-2 pt-1">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColor(opt.id)}
                  title={opt.label}
                  style={{ backgroundColor: opt.bg, borderColor: opt.border }}
                  className={`w-6 h-6 rounded-full border transition cursor-pointer ${
                    color === opt.id ? 'scale-110 ring-2 ring-[#1C1917]' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F5F5F4]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md bg-[#F5F5F4] hover:bg-[#EAEAE9] text-xs text-[#57534E] transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-md bg-[#1C1917] hover:bg-[#292524] text-xs text-[#F9F9F8] transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{initialNote ? 'Atualizar' : 'Salvar'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
