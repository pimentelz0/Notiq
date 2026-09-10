import React from 'react';
import { 
  Pin, 
  Trash2, 
  Edit3, 
  FileText, 
  Download, 
  CheckSquare, 
  Square
} from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  onToggleCheckItem: (noteId: string, itemId: string) => void;
  onOpenImage: (url: string, name: string) => void;
}

const colorStyles: Record<string, { bg: string; border: string }> = {
  offwhite: {
    bg: 'bg-[#FFFFFF]',
    border: 'border-[#E7E5E4] hover:border-[#D6D3D1]',
  },
  sand: {
    bg: 'bg-[#FAF8F5]',
    border: 'border-[#EAE5DD] hover:border-[#D9D3C8]',
  },
  'warm-gray': {
    bg: 'bg-[#F5F5F4]',
    border: 'border-[#E3E0DD] hover:border-[#CECAC5]',
  },
  'soft-linen': {
    bg: 'bg-[#F7F6F0]',
    border: 'border-[#E6E3D8] hover:border-[#D3CFBF]',
  },
  'pale-clay': {
    bg: 'bg-[#F7F5F3]',
    border: 'border-[#E6E1DC] hover:border-[#D4CDC6]',
  },
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleCheckItem,
  onOpenImage,
}) => {
  const currentStyle = colorStyles[note.color] || colorStyles.offwhite;

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      if (isToday) {
        return `Hoje, ${timeStr}`;
      }
      return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, ${timeStr}`;
    } catch {
      return '';
    }
  };

  const totalCheck = note.checklist?.length || 0;
  const completedCheck = note.checklist?.filter((c) => c.completed).length || 0;
  const imageAttachments = (note.attachments || []).filter((a) => a.type === 'image');
  const docAttachments = (note.attachments || []).filter((a) => a.type === 'document');

  return (
    <div
      id={`note-card-${note.id}`}
      className={`group relative rounded-xl ${currentStyle.bg} border ${currentStyle.border} p-5 transition-all duration-150 flex flex-col justify-between shadow-2xs hover:shadow-xs`}
    >
      <div>
        {/* Top bar: Pin */}
        <div className="flex items-center justify-end gap-2 mb-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePin(note.id, note.pinned)}
              className={`p-1 rounded-md transition ${
                note.pinned
                  ? 'text-[#1C1917] bg-[#E7E5E4]'
                  : 'text-[#A8A29E] hover:text-[#1C1917] hover:bg-black/[0.04]'
              }`}
              title={note.pinned ? 'Desafixar nota' : 'Fixar no topo'}
              aria-label="Fixar nota"
            >
              <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        {note.title && (
          <h3 className="text-base sm:text-lg font-normal text-[#1C1917] tracking-tight leading-snug mb-2 font-times">
            {note.title}
          </h3>
        )}

        {/* Content */}
        {note.content && (
          <p className="text-xs sm:text-sm text-[#44403C] whitespace-pre-wrap leading-relaxed mb-3 break-words font-times">
            {note.content}
          </p>
        )}

        {/* Checklist */}
        {totalCheck > 0 && (
          <div className="my-3 space-y-1.5 p-2.5 rounded-lg bg-black/[0.02] border border-black/[0.04]">
            <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1">
              <span>Lista ({completedCheck}/{totalCheck})</span>
              {totalCheck > 0 && (
                <span className="text-[10px] text-[#A8A29E]">
                  {Math.round((completedCheck / totalCheck) * 100)}%
                </span>
              )}
            </div>

            {note.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleCheckItem(note.id, item.id)}
                className="flex items-start gap-2 py-0.5 text-xs text-[#292524] cursor-pointer select-none group/item"
              >
                <button
                  type="button"
                  className="mt-0.5 text-[#78716C] group-hover/item:text-[#1C1917] transition shrink-0"
                >
                  {item.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#1C1917]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-[#A8A29E]" />
                  )}
                </button>
                <span
                  className={`flex-1 break-words font-times transition ${
                    item.completed ? 'line-through text-[#A8A29E]' : 'text-[#292524]'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Images */}
        {imageAttachments.length > 0 && (
          <div className="my-3">
            <div className={`grid gap-2 ${imageAttachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {imageAttachments.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onOpenImage(img.url, img.name)}
                  className="relative group/thumb cursor-pointer overflow-hidden rounded-lg border border-black/[0.08] aspect-video bg-black/5 flex items-center justify-center"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition duration-200 group-hover/thumb:opacity-90"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {docAttachments.length > 0 && (
          <div className="my-2.5 space-y-1.5">
            {docAttachments.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                download={doc.name}
                className="flex items-center justify-between p-2 rounded-lg bg-white/80 hover:bg-white border border-black/[0.06] text-xs text-[#44403C] transition"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                  <span className="truncate">{doc.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[#A8A29E]">
                  <span className="text-[10px]">
                    {doc.size ? `${Math.round(doc.size / 1024)} KB` : ''}
                  </span>
                  <Download className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#A8A29E]">
        <span className="text-[11px] font-times">{formatDate(note.created_at)}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-md text-[#78716C] hover:text-[#1C1917] hover:bg-black/[0.04] transition cursor-pointer"
            title="Editar nota"
            aria-label="Editar"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-md text-[#78716C] hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
            title="Excluir nota"
            aria-label="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
