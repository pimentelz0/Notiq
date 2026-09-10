import React from 'react';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Pin, 
  Paperclip,
  X,
  LogOut
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filterOnlyPinned: boolean;
  onTogglePinnedFilter: () => void;
  filterOnlyChecklist: boolean;
  onToggleChecklistFilter: () => void;
  filterOnlyMedia: boolean;
  onToggleMediaFilter: () => void;
  onOpenNewNote: () => void;
  onLogout?: () => void;
  userEmail?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  filterOnlyPinned,
  onTogglePinnedFilter,
  filterOnlyChecklist,
  onToggleChecklistFilter,
  filterOnlyMedia,
  onToggleMediaFilter,
  onOpenNewNote,
  onLogout,
  userEmail,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F9F9F8]/95 backdrop-blur-md border-b border-[#E7E5E4] pt-4 pb-3 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-3.5">
        {/* Top bar: Brand + Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl sm:text-2xl font-normal tracking-[0.22em] text-[#1C1917] font-times uppercase select-none">
              NOTIQ
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />

            <button
              onClick={onOpenNewNote}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] active:scale-95 text-xs font-normal text-[#F9F9F8] transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Anotação</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title={userEmail ? `Conectado como ${userEmail} (Clique para sair)` : 'Sair da conta'}
                aria-label="Sair da conta"
                className="p-1.5 rounded-lg border border-[#E7E5E4] bg-white text-[#78716C] hover:text-[#1C1917] hover:border-[#1C1917] transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder=""
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs text-[#1C1917] bg-[#F5F5F4] hover:bg-[#EFEFEF] focus:bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#78716C] transition"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick attribute filter toggles */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
            <button
              onClick={onTogglePinnedFilter}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer border ${
                filterOnlyPinned
                  ? 'bg-[#1C1917] text-[#F9F9F8] border-[#1C1917]'
                  : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917]'
              }`}
            >
              <Pin className={`w-3 h-3 ${filterOnlyPinned ? 'fill-current' : ''}`} />
              <span>Fixadas</span>
            </button>

            <button
              onClick={onToggleChecklistFilter}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer border ${
                filterOnlyChecklist
                  ? 'bg-[#1C1917] text-[#F9F9F8] border-[#1C1917]'
                  : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917]'
              }`}
            >
              <CheckSquare className="w-3 h-3" />
              <span>Listas</span>
            </button>

            <button
              onClick={onToggleMediaFilter}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer border ${
                filterOnlyMedia
                  ? 'bg-[#1C1917] text-[#F9F9F8] border-[#1C1917]'
                  : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917]'
              }`}
            >
              <Paperclip className="w-3 h-3" />
              <span>Anexos</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
