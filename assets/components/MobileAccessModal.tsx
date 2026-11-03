import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, ExternalLink } from 'lucide-react';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAccessModal: React.FC<MobileAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the real, current active browser URL (works on GitHub Pages, localhost, or any domain)
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Abrir en tu Teléfono Móvil
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          {/* QR Code Container */}
          <div className="inline-block p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
            {currentUrl ? (
              <QRCodeSVG
                value={currentUrl}
                size={180}
                level="M"
                includeMargin={false}
                className="mx-auto"
              />
            ) : null}
          </div>

          <p className="text-xs text-slate-600">
            Apunta con la cámara de tu móvil a este código QR para abrir tu web directamente en tu teléfono.
          </p>

          {/* Direct Link Box */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-left">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent text-xs text-slate-700 font-mono truncate focus:outline-none px-1"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Instructions for Installing on Home Screen */}
          <div className="text-left bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-rose-950 flex items-center gap-1.5">
              <span>💡 Consejo: Guardar como App en tu pantalla de inicio</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <p>
                <strong>En iPhone (Safari):</strong> Pulsa el botón de <em>Compartir</em> (el icono de cuadrado con flecha hacia arriba) y selecciona <em>"Añadir a pantalla de inicio"</em>.
              </p>
              <p>
                <strong>En Android (Chrome):</strong> Pulsa los <em>tres puntos</em> arriba a la derecha y selecciona <em>"Instalar aplicación"</em> o <em>"Añadir a la pantalla principal"</em>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
