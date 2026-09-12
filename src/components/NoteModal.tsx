import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Pin, 
  Loader2,
  FileText
} from 'lucide-react';
import { Note, AttachmentItem, NoteColor } from '../types';
import { processFileForAttachment } from '../lib/supabase';
import { PASTEL_COLOR_OPTIONS } from '../lib/colors';

interface NoteModalProps {
  isOpen: boolean;
  initialNote?: Note | null;
  onClose: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'created_at'>, id?: string) => Promise<void>;
}

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
        setAttachments(initialNote.attachments ? [...initialNote.attachments] : []);
      } else {
        setTitle('');
        setContent('');
        setPinned(false);
        setColor('offwhite');
        setCategory('Geral');
        setAttachments([]);
      }
      setErrorMsg(null);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

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
    if (!title.trim() && !content.trim() && attachments.length === 0) {
      setErrorMsg('Adicione ao menos um título, texto ou anexo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSave(
        {
          type: 'note',
          title: title.trim(),
          content: content.trim(),
          pinned,
          color,
          category,
          checklist: [],
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
              rows={6}
              placeholder=""
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm text-[#292524] bg-[#FAF9F8] border border-[#E7E5E4] rounded-lg p-3 focus:outline-none focus:border-[#78716C] transition resize-none leading-relaxed font-times"
            />
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

          {/* Pastel Color Selection */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#78716C] font-times">
                Tom da nota
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
