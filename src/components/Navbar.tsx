import React from 'react';
import { Plus, Smartphone, LogIn, LogOut, Lock } from 'lucide-react';
import { ViewMode } from '../types/allergy';
import { ViewTabs } from './ViewTabs';
import { UrtikaLogo } from './UrtikaLogo';
import { useAuth } from '../firebase/AuthContext';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenNewModal: () => void;
  onOpenMobileModal: () => void;
  totalRecords: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  onOpenNewModal,
  onOpenMobileModal,
  totalRecords,
}) => {
  const { user, loginWithGoogle, logout, loading: authLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      {/* Main Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Wordmark with Shield-Leaf Allergy Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs p-1">
            <UrtikaLogo className="w-6 h-6 text-rose-700" size={24} />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Urtika · UAS7
          </span>
        </div>

        {/* Actions: Google Multi-user Profile, Mobile QR & Primary New Reaction Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-slate-200/80 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 transition-colors">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuario'}
                    className="w-6 h-6 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                  {user.displayName?.split(' ')[0] || 'Mi Perfil'}
                </span>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                title="Modo local activo (los datos no están en la nube). Haz clic para iniciar sesión con Google y sincronizar."
              >
                <span className="relative flex shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {/* Subtle amber pulse dot warning that it's local */}
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 border border-white"></span>
                  </span>
                </span>
                <span className="hidden sm:inline">Iniciar sesión</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )
          )}

          <button
            onClick={onOpenMobileModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Abrir en el móvil mediante código QR o enlace directo"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-600" />
            <span>Móvil (QR)</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Reacción</span>
            <span className="sm:hidden">Reacción</span>
          </button>
        </div>
      </div>

      {/* Pestañas (Tabs) Bar for Mobile & Tablets */}
      <div className="lg:hidden px-3 sm:px-6 pb-2.5 pt-1.5 bg-slate-100/90 border-t border-slate-200">
        <ViewTabs viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </header>
  );
};
