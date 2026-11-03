import React from 'react';
import {
  Clock,
  MapPin,
  Pill,
  Edit2,
  Trash2,
  CopyPlus,
  Activity,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { AllergyReaction } from '../types/allergy';
import { getUASLevel } from '../utils/dateAndUas';

interface CardsTimelineViewProps {
  reactions: AllergyReaction[];
  onEdit: (reaction: AllergyReaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (reaction: AllergyReaction) => void;
  onAddNew: () => void;
}

export const CardsTimelineView: React.FC<CardsTimelineViewProps> = ({
  reactions,
  onEdit,
  onDelete,
  onDuplicate,
  onAddNew,
}) => {
  if (reactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
        <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No hay reacciones registradas aún</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Pulsa el botón para registrar tu primer brote alérgico.
        </p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Brote</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reactions.map((r) => {
        const uas = getUASLevel(r.puntuacionDia);

        return (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all"
          >
            <div>
              {/* Header: Date, Week, and UAS Score */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-900">
                    {r.fechaFormateada}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>Semana {r.semana}</span>
                    {r.ubicacion && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {r.ubicacion}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border ${uas.badgeClass} shrink-0`}
                  title={`Ronchas: ${r.ronchas}/3 | Prurito: ${r.prurito}/3`}
                >
                  UAS: {r.puntuacionDia}/6 · {uas.label}
                </div>
              </div>

              {/* Body Location */}
              <div className="mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Zona corporal afectada:
                </span>
                <p className="text-xs font-medium text-slate-800">
                  {r.ubicacionCuerpo || 'No especificada'}
                </p>
              </div>

              {/* Clinical Metrics (Ronchas & Prurito) */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 block font-medium">Nº Ronchas (0-3)</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {r.ronchas}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      {r.ronchas === 0
                        ? '(0)'
                        : r.ronchas === 1
                        ? '(<20)'
                        : r.ronchas === 2
                        ? '(20-50)'
                        : '(>50)'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 block font-medium">Prurito (0-3)</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {r.prurito}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      {r.prurito === 0
                        ? '(Ninguno)'
                        : r.prurito === 1
                        ? '(Leve)'
                        : r.prurito === 2
                        ? '(Moderado)'
                        : '(Intenso)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medication & Duration */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Pill className="w-3.5 h-3.5 text-slate-400" />
                    Medicación:
                  </span>
                  <span className="font-medium text-right truncate max-w-[170px]">
                    {r.tomoMedicamento
                      ? r.medicamento || 'Sí (medicado)'
                      : 'No tomó medicamento'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Tiempo en desaparecer:
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {r.tiempoDesaparecer || 'En curso / No medido'}
                  </span>
                </div>

                {r.notas && (
                  <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded border border-amber-100 mt-2">
                    <strong className="font-semibold text-amber-900">Nota: </strong>
                    {r.notas}
                  </p>
                )}
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => onDuplicate(r)}
                className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Duplicar"
              >
                <CopyPlus className="w-3.5 h-3.5" />
                <span>Duplicar</span>
              </button>
              <button
                onClick={() => onEdit(r)}
                className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="inline-flex items-center gap-1 px-2 py-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
