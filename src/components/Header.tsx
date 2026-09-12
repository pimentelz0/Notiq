import React from 'react';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  FileText, 
  X,
  LogOut
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenNewItem: () => void;
  onLogout?: () => void;
  userEmail?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  onOpenNewItem,
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
              onClick={onOpenNewItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] active:scale-95 text-xs font-normal text-[#F9F9F8] transition cursor-pointer shadow-xs font-times"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{activeTab === 'notes' ? 'Nova Anotação' : 'Nova Lista'}</span>
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

        {/* Search and Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder=""
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs text-[#1C1917] bg-[#F5F5F4] hover:bg-[#EFEFEF] focus:bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#78716C] transition font-times"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917] p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Two distinct tabs: Notas and Listas */}
          <div className="flex items-center p-0.5 bg-[#EFECE6] border border-[#E7E5E4] rounded-lg self-start sm:self-auto">
            <button
              type="button"
              id="tab-btn-notes"
              onClick={() => onTabChange('notes')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-normal transition cursor-pointer font-times ${
                activeTab === 'notes'
                  ? 'bg-[#1C1917] text-[#F9F9F8] shadow-2xs font-medium'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notas</span>
            </button>

            <button
              type="button"
              id="tab-btn-lists"
              onClick={() => onTabChange('lists')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-normal transition cursor-pointer font-times ${
                activeTab === 'lists'
                  ? 'bg-[#1C1917] text-[#F9F9F8] shadow-2xs font-medium'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Listas</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
