import React from 'react';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  isChecklist?: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  isChecklist = false,
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const itemType = isChecklist ? 'esta lista' : 'esta anotação';
  const displayTitle = title?.trim() ? `"${title.trim()}"` : itemType;

  return (
    <div
      id="confirm-delete-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/35 backdrop-blur-2xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="confirm-delete-modal-card"
        className="w-full max-w-sm rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] shadow-xl p-5 sm:p-6 text-left transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1C1917] font-times tracking-wide">
              {isChecklist ? 'Excluir lista?' : 'Excluir anotação?'}
            </h3>
            <p className="text-xs text-[#78716C] font-times mt-1 leading-relaxed">
              Tem certeza que deseja excluir {displayTitle}? Esta ação removerá o item do Supabase e não pode ser desfeita.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F5F5F4] mt-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-normal text-[#57534E] hover:bg-[#F5F5F4] transition cursor-pointer font-times disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-xs font-medium text-white transition cursor-pointer shadow-xs disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, excluir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
