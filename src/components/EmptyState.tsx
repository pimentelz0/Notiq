import React from 'react';
import { Plus, SearchX, FileText, CheckSquare } from 'lucide-react';
import { ActiveTab } from '../types';

interface EmptyStateProps {
  isSearching: boolean;
  activeTab?: ActiveTab;
  onClearSearch: () => void;
  onNewNote: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearching,
  activeTab = 'notes',
  onClearSearch,
  onNewNote,
}) => {
  const isList = activeTab === 'lists';

  if (isSearching) {
    return (
      <div 
        id="empty-state-search"
        className="py-20 px-4 text-center max-w-sm mx-auto"
      >
        <div className="w-10 h-10 rounded-lg bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center mx-auto mb-3 text-[#78716C]">
          <SearchX className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-normal text-[#1C1917] mb-1 font-times">
          {isList ? 'Nenhuma lista encontrada' : 'Nenhuma anotação encontrada'}
        </h3>
        <p className="text-xs text-[#78716C] mb-4 font-times">
          Tente buscar por outros termos ou limpe a busca.
        </p>
        <button
          onClick={onClearSearch}
          className="px-3 py-1.5 rounded-md bg-[#F5F5F4] hover:bg-[#EAEAE9] text-xs font-normal text-[#292524] border border-[#E7E5E4] transition cursor-pointer font-times"
        >
          Limpar busca
        </button>
      </div>
    );
  }

  return (
    <div 
      id="empty-state-start"
      className="py-24 px-4 text-center max-w-md mx-auto"
    >
      <div className="w-11 h-11 rounded-lg bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center mx-auto mb-3 text-[#78716C]">
        {isList ? <CheckSquare className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
      </div>
      <h3 className="text-base font-normal text-[#1C1917] mb-1 font-times">
        {isList ? 'Nenhuma lista criada' : 'Nenhuma anotação criada'}
      </h3>
      <p className="text-xs text-[#78716C] mb-5 font-times leading-relaxed max-w-xs mx-auto">
        {isList
          ? 'Crie listas de tarefas, compras ou afazeres com caixas de seleção práticas.'
          : 'Tudo o que for anotado aqui fica salvo no seu aparelho e sincronizado na nuvem.'}
      </p>
      <button
        onClick={onNewNote}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#1C1917] hover:bg-[#292524] active:scale-95 text-xs font-normal text-[#F9F9F8] transition cursor-pointer font-times"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{isList ? 'Criar Primeira Lista' : 'Criar Primeira Anotação'}</span>
      </button>
    </div>
  );
};
