import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Note } from '../types';

// Clean Supabase endpoint URL
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://ymwgmxdhysksvnzxetaj.supabase.co').trim();
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'sb_publishable_Gcc0XMDRcdI_SKFjvCTYZQ_zC-NmBeN'
).trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const SQL_SETUP_SCRIPT = `-- Execute no SQL Editor do seu projeto Supabase:
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  title text not null default '',
  content text default '',
  pinned boolean default false,
  color text default 'offwhite',
  category text default 'Geral',
  checklist jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb
);

-- Ativar RLS e liberar acesso sem login para o casal
alter table public.notes enable row level security;

create policy "Acesso compartilhado NOTIQ"
  on public.notes
  for all
  using (true)
  with check (true);

-- Ativar tempo real
alter publication supabase_realtime add table public.notes;
`;

// Test connectivity silently
export async function testSupabaseConnection(): Promise<{ isReady: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notes')
      .select('id')
      .limit(1);

    if (error) {
      return { isReady: false, error: error.message };
    }
    return { isReady: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao conectar';
    return { isReady: false, error: message };
  }
}

// Fetch all notes from Supabase
export async function fetchNotesFromSupabase(): Promise<{ notes: Note[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { notes: [], error: error.message };
    }

    const formatted: Note[] = (data || []).map((row) => ({
      id: row.id,
      title: row.title || '',
      content: row.content || '',
      pinned: Boolean(row.pinned),
      color: row.color || 'offwhite',
      category: row.category || 'Geral',
      checklist: Array.isArray(row.checklist) ? row.checklist : [],
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at,
    }));

    return { notes: formatted };
  } catch (err: unknown) {
    return { notes: [], error: err instanceof Error ? err.message : 'Erro inesperado' };
  }
}

// Create a new note in Supabase
export async function insertNoteToSupabase(note: Omit<Note, 'id' | 'created_at'>): Promise<{ note?: Note; error?: string }> {
  try {
    const payload = {
      title: note.title,
      content: note.content,
      pinned: note.pinned,
      color: note.color,
      category: note.category,
      checklist: note.checklist,
      attachments: note.attachments,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    const inserted: Note = {
      id: data.id,
      title: data.title,
      content: data.content,
      pinned: data.pinned,
      color: data.color,
      category: data.category,
      checklist: data.checklist || [],
      attachments: data.attachments || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { note: inserted };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Erro ao salvar' };
  }
}

// Update existing note in Supabase
export async function updateNoteInSupabase(id: string, updates: Partial<Note>): Promise<{ error?: string }> {
  try {
    const payload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    delete payload.id;
    delete payload.created_at;

    const { error } = await supabase
      .from('notes')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar' };
  }
}

// Delete note from Supabase
export async function deleteNoteFromSupabase(id: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Erro ao excluir' };
  }
}

// Real-time synchronization
export function subscribeToSupabaseNotes(onUpdate: () => void): () => void {
  let channel: RealtimeChannel | null = null;
  try {
    channel = supabase
      .channel('notiq-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          onUpdate();
        }
      )
      .subscribe();
  } catch {
    // Fail silently in background
  }

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}

// Process attachments (Images and Documents)
export async function processFileForAttachment(file: File): Promise<{
  name: string;
  type: 'image' | 'document';
  mimeType: string;
  size: number;
  url: string;
}> {
  const isImage = file.type.startsWith('image/');
  
  if (isImage) {
    const compressedUrl = await compressImageToDataUrl(file);
    return {
      name: file.name,
      type: 'image',
      mimeType: file.type || 'image/jpeg',
      size: file.size,
      url: compressedUrl,
    };
  }

  const dataUrl = await fileToDataUrl(file);
  return {
    name: file.name,
    type: 'document',
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    url: dataUrl,
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
