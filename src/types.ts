export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'image' | 'document';
  mimeType: string;
  size: number;
  url: string; // Public URL or optimized data URL
  createdAt: string;
}

export type NoteColor = 
  | 'offwhite' 
  | 'peach' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'lavender' 
  | 'rose'
  | 'sand' 
  | 'warm-gray' 
  | 'soft-linen' 
  | 'pale-clay';

export interface Note {
  id: string;
  type?: 'note' | 'checklist';
  title: string;
  content: string;
  pinned: boolean;
  color: NoteColor;
  category: string;
  checklist: ChecklistItem[];
  attachments: AttachmentItem[];
  created_at: string;
  updated_at?: string;
}

export type ActiveTab = 'notes' | 'lists';
export type CategoryFilter = 'Todas' | 'Listas' | 'Ideias' | 'Lembretes' | 'Projetos' | 'Geral';
