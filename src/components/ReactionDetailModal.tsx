import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Pill,
  FileText,
  AlertCircle,
  Copy,
  Printer,
  Edit2,
  Trash2,
  Share2,
} from 'lucide-react';
import { AllergyReaction } from '../types/allergy';

interface ReactionDetailModalProps {
  reaction: AllergyReaction | null;
  onClose: () => void;
  onEdit: (reaction: AllergyReaction) => void;
  onDelete: (id: string) => void;
}

export const ReactionDetailModal: React.FC<ReactionDetailModalProps> = ({
  reaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!reaction) return null;

  const getSeverityBadge = (score: number) => {
    if (score === 0) {
      return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Sin síntomas (0/6)' };
    }
    if (score <= 2) {
      return { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: `Leve (${score}/6)` };
    }
    if (score <= 4) {
      return { bg: 'bg-orange-50 text-orange-800 border-orange-200', label: `Moderado (${score}/6)` };
    }
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', label: `Severo (${score}/6)` };
  };

  const badge = getSeverityBadge(reaction.puntuacionDia);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
              S{reaction.semana}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Detalle del Registro Clínico
              </h3>
              <p className="text-[11px] text-slate-500">
                {reaction.fechaFormateada}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Severity Banner */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${badge.bg}`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Puntuación UAS Diaria
              </span>
              <span className="text-base font-extrabold font-mono">
                {reaction.puntuacionDia} / 6 puntos
              </span>
            </div>
            <span className="font-bold px-2.5 py-1 rounded-full bg-white/80 border border-current text-[11px]">
              {badge.label}
            </span>
          </div>

          {/* Clinical Scores Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Nº de Ronchas (Habones)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">
                  {reaction.numHabones}
                </span>
                <span className="text-[11px] text-slate-500">
                  {reaction.numHabones === 0
                    ? 'Sin ronchas'
                    : reaction.numHabones === 1
                    ? 'Leve (<20)'
                    : reaction.numHabones === 2
                    ? 'Moderado (20-50)'
                    : 'Severo (>50)'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Intensidad Prurito (Picor)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono text-slate-900">
                  {reaction.prurito}
                </span>
                <span className="text-[11px] text-slate-500">
                  {reaction.prurito === 0
                    ? 'Sin picor'
                    : reaction.prurito === 1
                    ? 'Leve'
                    : reaction.prurito === 2
                    ? 'Moderado'
                    : 'Intenso'}
                </span>
              </div>
            </div>
          </div>

          {/* Anatomical Locations & Environment */}
          <div className="space-y-2.5 bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">Zonas afectadas del cuerpo:</span>
                <p className="text-slate-900 font-semibold mt-0.5">
                  {reaction.ubicacionCuerpo || 'No especificadas'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
              <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">Lugar / Entorno del brote:</span>
                <p className="text-slate-900 font-semibold mt-0.5">
                  {reaction.ubicacion || 'No indicado'}
                </p>
              </div>
            </div>
          </div>

          {/* Medication details */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">Tratamiento Farmacológico:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  reaction.tomoMedicamento
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {reaction.tomoMedicamento ? 'Sí tomó medicación' : 'No tomó'}
              </span>
            </div>

            {reaction.tomoMedicamento && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Fármaco / Antihistamínico:</span>
                  <span className="font-bold text-slate-800">{reaction.medicamento || '-'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Dosis tomada:</span>
                  <span className="font-bold text-slate-800">{reaction.dosis || '-'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Notes & Observations */}
          {reaction.notas && (
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Observaciones clínicas y factores detonantes:</span>
              </div>
              <p className="text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                "{reaction.notas}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => onDelete(reaction.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(reaction);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
