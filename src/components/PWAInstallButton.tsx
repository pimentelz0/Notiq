import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          id="btn-install-pwa"
          onClick={install}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F5F4] hover:bg-[#EAEAE9] active:scale-95 text-xs text-[#292524] border border-[#E7E5E4] transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#78716C]" />
          <span>Instalar App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F5F4] hover:bg-[#EAEAE9] active:scale-95 text-xs text-[#292524] border border-[#E7E5E4] transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#78716C]" />
          <span>Instalar no Celular</span>
        </button>
      )}

      {/* Modal guide for iOS Safari */}
      {showIOSGuide && (
        <div 
          id="ios-install-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/35 backdrop-blur-2xs p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] p-6 shadow-xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#F9F9F8] border border-[#E7E5E4] flex items-center justify-center shadow-2xs">
                <img src="/icon.svg" alt="NOTIQ" className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-normal text-[#1C1917] font-times">Instalar NOTIQ</h3>
                <p className="text-xs text-[#78716C] font-times">Adicionar ícone à tela de início</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#44403C]">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FAF9F8] border border-[#E7E5E4]">
                <div className="w-6 h-6 rounded bg-[#F5F5F4] flex items-center justify-center shrink-0 mt-0.5 border border-[#E7E5E4]">
                  <Share className="w-3.5 h-3.5 text-[#1C1917]" />
                </div>
                <div>
                  <p className="font-medium text-[#1C1917]">1. Compartilhar</p>
                  <p className="text-[#78716C]">
                    Toque no botão de <strong>Compartilhar</strong> na barra inferior do Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FAF9F8] border border-[#E7E5E4]">
                <div className="w-6 h-6 rounded bg-[#F5F5F4] flex items-center justify-center shrink-0 mt-0.5 border border-[#E7E5E4]">
                  <PlusSquare className="w-3.5 h-3.5 text-[#1C1917]" />
                </div>
                <div>
                  <p className="font-medium text-[#1C1917]">2. Tela de Início</p>
                  <p className="text-[#78716C]">
                    Role as opções e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FAF9F8] border border-[#E7E5E4]">
                <div className="w-6 h-6 rounded bg-[#F5F5F4] flex items-center justify-center shrink-0 mt-0.5 border border-[#E7E5E4]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1C1917]" />
                </div>
                <div>
                  <p className="font-medium text-[#1C1917]">3. Concluir</p>
                  <p className="text-[#78716C]">
                    Toque em <strong>Adicionar</strong> no canto superior. O ícone do NOTIQ aparecerá no celular!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2 rounded-lg bg-[#1C1917] hover:bg-[#292524] text-xs font-normal text-[#F9F9F8] transition cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </div>
      )}
    </>
  );
};
