import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  imageName?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  imageUrl,
  imageName,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      id="image-lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1A17]/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-[-44px] right-0 flex items-center gap-3">
          <a
            href={imageUrl}
            download={imageName || 'imagem-anotacao.jpg'}
            className="p-2 rounded-full bg-[#2D2A26]/80 text-[#FEFDF6] hover:bg-[#2D2A26] transition"
            title="Baixar imagem"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#2D2A26]/80 text-[#FEFDF6] hover:bg-[#2D2A26] transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <img
          src={imageUrl}
          alt={imageName || 'Imagem anexada'}
          className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
        />

        {imageName && (
          <p className="mt-3 text-xs text-[#E7E5E4] font-medium tracking-wide">
            {imageName}
          </p>
        )}
      </div>
    </div>
  );
};
