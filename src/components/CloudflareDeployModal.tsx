import React from 'react';
import { X, Cloud, Download, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Publicar en Cloudflare Pages
              </h3>
              <p className="text-[11px] text-orange-800 font-medium">
                100% Gratis para siempre · Sin Git · Sin terminal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Download Zip */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <span>Descarga tu web ya compilada</span>
            </div>
            <p className="text-slate-600 text-xs">
              He generado el archivo con todos los archivos listos para producción:
            </p>
            <a
              href="/dist.zip"
              download="urtika-cloudflare.zip"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Descargar paquete ZIP (urtika-cloudflare.zip)</span>
            </a>
            <p className="text-[11px] text-slate-500">
              *Descomprime este archivo .zip en tu ordenador para obtener la carpeta lista para arrastrar.
            </p>
          </div>

          {/* Step 2: Open Cloudflare */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <span>Abre Cloudflare Pages (Gratis)</span>
            </div>
            <p className="text-slate-600">
              Crea tu cuenta gratuita (sin tarjeta de crédito requerida) o inicia sesión:
            </p>
            <a
              href="https://dash.cloudflare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-orange-600 hover:text-orange-700 underline"
            >
              <span>Abrir Cloudflare Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 3: Drag & Drop */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <span>Arrastra la carpeta y publica</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
              <li>
                En el menú de Cloudflare, ve a <strong>Workers & Pages</strong>.
              </li>
              <li>
                Pulsa en <strong>Crear aplicación (Create application)</strong> y selecciona la pestaña <strong>Pages</strong>.
              </li>
              <li>
                Elige la opción <strong>Subir recursos (Upload assets)</strong>.
              </li>
              <li>
                Escribe un nombre para el proyecto (ej: <code>urtika-app</code>).
              </li>
              <li>
                <strong>Arrastra la carpeta descomprimida</strong> dentro del recuadro de subida y pulsa <strong>Implementar sitio (Deploy site)</strong>.
              </li>
            </ol>
          </div>

          {/* Free Tier confirmation */}
          <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Totalmente gratis para siempre:</strong> Cloudflare Pages incluye ancho de banda ilimitado, certificado SSL (HTTPS) gratuito y dominio <code>.pages.dev</code> sin ningún coste.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
