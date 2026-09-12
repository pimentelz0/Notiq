// Storage utilities
// Note: As requested, notes are NOT saved locally in localStorage.
// The single source of truth is the Supabase database.

const LEGACY_STORAGE_KEYS = [
  'notiq_saved_notes_v2',
  'notiq_notes',
  'notiq_notes_backup_v1',
];

export function clearLegacyLocalNotes(): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('Erro ao limpar cache legado:', err);
  }
}
