import { NoteColor } from '../types';

export interface ColorOption {
  id: NoteColor;
  label: string;
  dotBg: string;
  dotBorder: string;
  cardBg: string;
  cardBorder: string;
}

export const PASTEL_COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'offwhite',
    label: 'Branco Neutro',
    dotBg: '#FFFFFF',
    dotBorder: '#D6D3D1',
    cardBg: 'bg-[#FFFFFF]',
    cardBorder: 'border-[#E7E5E4] hover:border-[#D6D3D1]',
  },
  {
    id: 'peach',
    label: 'Pêssego Pastel',
    dotBg: '#FED7AA',
    dotBorder: '#F97316',
    cardBg: 'bg-[#FFF7ED]',
    cardBorder: 'border-[#FED7AA] hover:border-[#FDBA74]',
  },
  {
    id: 'yellow',
    label: 'Amarelo Manteiga',
    dotBg: '#FEF08A',
    dotBorder: '#EAB308',
    cardBg: 'bg-[#FEFCE8]',
    cardBorder: 'border-[#FEF08A] hover:border-[#FDE047]',
  },
  {
    id: 'green',
    label: 'Verde Sálvia / Menta',
    dotBg: '#BBF7D0',
    dotBorder: '#22C55E',
    cardBg: 'bg-[#F0FDF4]',
    cardBorder: 'border-[#BBF7D0] hover:border-[#86EFAC]',
  },
  {
    id: 'blue',
    label: 'Azul Celeste',
    dotBg: '#BAE6FD',
    dotBorder: '#0EA5E9',
    cardBg: 'bg-[#F0F9FF]',
    cardBorder: 'border-[#BAE6FD] hover:border-[#7DD3FC]',
  },
  {
    id: 'lavender',
    label: 'Lavanda Suave',
    dotBg: '#E9D5FF',
    dotBorder: '#A855F7',
    cardBg: 'bg-[#FAF5FF]',
    cardBorder: 'border-[#E9D5FF] hover:border-[#D8B4FE]',
  },
  {
    id: 'rose',
    label: 'Rosa Blush',
    dotBg: '#FECDD3',
    dotBorder: '#F43F5E',
    cardBg: 'bg-[#FFF1F2]',
    cardBorder: 'border-[#FECDD3] hover:border-[#FDA4AF]',
  },
];

export function getCardColorStyle(color?: NoteColor): { bg: string; border: string } {
  const found = PASTEL_COLOR_OPTIONS.find((c) => c.id === color);
  if (found) {
    return { bg: found.cardBg, border: found.cardBorder };
  }

  // Legacy mappings for older notes saved with previous IDs
  if (color === 'sand') return { bg: 'bg-[#FFF7ED]', border: 'border-[#FED7AA] hover:border-[#FDBA74]' };
  if (color === 'warm-gray') return { bg: 'bg-[#F0F9FF]', border: 'border-[#BAE6FD] hover:border-[#7DD3FC]' };
  if (color === 'soft-linen') return { bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0] hover:border-[#86EFAC]' };
  if (color === 'pale-clay') return { bg: 'bg-[#FAF5FF]', border: 'border-[#E9D5FF] hover:border-[#D8B4FE]' };

  return { bg: 'bg-[#FFFFFF]', border: 'border-[#E7E5E4] hover:border-[#D6D3D1]' };
}
