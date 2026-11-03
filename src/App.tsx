/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SpreadsheetView } from './components/SpreadsheetView';
import { CardsTimelineView } from './components/CardsTimelineView';
import { ClinicalReportView } from './components/ClinicalReportView';
import { ReactionModal } from './components/ReactionModal';
import { MobileAccessModal } from './components/MobileAccessModal';
import { AllergyReaction, ViewMode } from './types/allergy';
import { Plus, Smartphone, Lock, RefreshCw, Trash2 } from 'lucide-react';
import { ViewTabs } from './components/ViewTabs';
import { PollenWidget } from './components/PollenWidget';
import { useAuth } from './firebase/AuthContext';
import { useUserReactions } from './firebase/useUserReactions';

export default function App() {
  const { user, loginWithGoogle } = useAuth();
  const {
    reactions,
    loading,
    saveReaction,
    deleteReaction,
    importMultipleReactions,
    clearAllReactions,
  } = useUserReactions();

  const [viewMode, setViewMode] = useState<ViewMode>('hoja');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [editingReaction, setEditingReaction] = useState<AllergyReaction | null>(null);
  const [saveToast, setSaveToast] = useState<{ visible: boolean; isLocal: boolean } | null>(null);

  const handleSaveReaction = (reaction: AllergyReaction) => {
    saveReaction(reaction);
    // Show smart contextual notification
    setSaveToast({ visible: true, isLocal: !user });
    setTimeout(() => {
      setSaveToast(null);
    }, 4500);
  };

  const handleDeleteReaction = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este registro?')) {
      deleteReaction(id);
    }
  };

  const handleEditReaction = (reaction: AllergyReaction) => {
    setEditingReaction(reaction);
    setIsModalOpen(true);
  };

  const handleDuplicateReaction = (reaction: AllergyReaction) => {
    const copy: AllergyReaction = {
      ...reaction,
      id: `rec-${Date.now()}`,
      fecha: new Date().toISOString().slice(0, 16),
      fechaFormateada: new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setEditingReaction(copy);
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingReaction(null);
    setIsModalOpen(true);
  };

  const handleImportReactions = (imported: AllergyReaction[]) => {
    importMultipleReactions(imported);
  };

  const handleClearAll = () => {
    if (window.confirm('¿Deseas vaciar todos tus registros para dejarlos a 0?')) {
      clearAllReactions();
    }
  };

  // KPI Calculations
  const totalReactions = reactions.length;
  const avgUas =
    totalReactions > 0
      ? (
          reactions.reduce((sum, r) => sum + r.puntuacionDia, 0) /
          totalReactions
        ).toFixed(1)
      : '0.0';

  const medCount = reactions.filter((r) => r.tomoMedicamento).length;
  const medPercent =
    totalReactions > 0 ? Math.round((medCount / totalReactions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Bar Navigation */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenNewModal={handleOpenNewModal}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        totalRecords={totalReactions}
      />

      {/* Discreet Seasonal Pollen & Allergen Level Banner */}
      <PollenWidget />

      {/* Mode Status Notification (Informative, single line, no buttons) */}
      {!user && (
        <div className="bg-amber-50/80 border-b border-amber-200/70 text-amber-900 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-2">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-200/90 text-amber-800 shrink-0">
              <Lock className="w-2.5 h-2.5" />
            </span>
            <p className="text-[11px] sm:text-xs text-amber-900">
              <span className="font-bold">Modo local activo:</span> Los datos se guardan solo en este dispositivo.
              <span className="hidden sm:inline text-amber-800/80 ml-1">
                (Borrar el historial o la caché del navegador puede eliminarlos).
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* KPI Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
              Total Registros
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {totalReactions}
              </span>
              <span className="text-xs text-slate-500">reacciones</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
              Puntuación Media UAS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {avgUas}
              </span>
              <span className="text-xs text-slate-500">/ 6 por brote</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
              Uso de Medicación
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {medPercent}%
              </span>
              <span className="text-xs text-slate-500">
                ({medCount} de {totalReactions})
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
              Hoja de Cálculo
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                11 Columnas
              </span>
              {totalReactions > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-rose-600 hover:text-rose-800 underline font-medium flex items-center gap-1"
                  title="Borrar todos los registros de la hoja"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vaciar a 0</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Desktop View Switcher Tabs Bar */}
        <div className="hidden lg:flex items-center justify-between gap-4 pb-1">
          <div className="max-w-md w-full">
            <ViewTabs viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {viewMode === 'hoja' && '📊 Vista tipo Google Sheets con 11 columnas'}
            {viewMode === 'tarjetas' && '⏱️ Vista cronológica de brotes'}
            {viewMode === 'uas7' && '📋 Informe médico para consulta'}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-6 text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
            <span>Sincronizando registros en la nube...</span>
          </div>
        )}

        {/* View Switcher Content */}
        {!loading && viewMode === 'hoja' && (
          <SpreadsheetView
            reactions={reactions}
            onEdit={handleEditReaction}
            onDelete={handleDeleteReaction}
            onDuplicate={handleDuplicateReaction}
            onAddNew={handleOpenNewModal}
            onImportReactions={handleImportReactions}
          />
        )}

        {!loading && viewMode === 'tarjetas' && (
          <CardsTimelineView
            reactions={reactions}
            onEdit={handleEditReaction}
            onDelete={handleDeleteReaction}
            onDuplicate={handleDuplicateReaction}
            onAddNew={handleOpenNewModal}
          />
        )}

        {!loading && viewMode === 'uas7' && <ClinicalReportView reactions={reactions} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Urtika · Sistema multiusuario con aislamiento de perfil privado y cálculo UAS7.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-600" />
              <span>Ver en el móvil</span>
            </button>
            <span>·</span>
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo brote</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Guided Reaction Registration Modal */}
      <ReactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReaction(null);
        }}
        onSave={handleSaveReaction}
        initialData={editingReaction}
      />

      {/* Mobile QR & Instructions Modal */}
      <MobileAccessModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </div>
  );
}
