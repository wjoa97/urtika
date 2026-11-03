import React, { useState } from 'react';
import {
  Copy,
  Download,
  Filter,
  Search,
  Trash2,
  Edit2,
  CopyPlus,
  Check,
  Plus,
  FileDown,
  Upload,
  Eye,
  Calendar,
  X,
} from 'lucide-react';
import { AllergyReaction } from '../types/allergy';
import { exportToTSV, exportToCSV } from '../utils/dateAndUas';
import { generateSpreadsheetPDF } from '../utils/pdfGenerator';
import { parseCSVToReactions } from '../utils/csvImporter';
import { ReactionDetailModal } from './ReactionDetailModal';

interface SpreadsheetViewProps {
  reactions: AllergyReaction[];
  onEdit: (reaction: AllergyReaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (reaction: AllergyReaction) => void;
  onAddNew: () => void;
  onImportReactions?: (newReactions: AllergyReaction[]) => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  reactions,
  onEdit,
  onDelete,
  onDuplicate,
  onAddNew,
  onImportReactions,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // State for the "Ampliar / Ver detalle" modal
  const [selectedReactionForDetail, setSelectedReactionForDetail] =
    useState<AllergyReaction | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = parseCSVToReactions(text);
        if (imported.length > 0) {
          if (onImportReactions) {
            onImportReactions(imported);
          }
          setImportMessage(`¡Éxito! Se importaron ${imported.length} reacciones.`);
          setTimeout(() => setImportMessage(null), 4000);
        } else {
          alert('No se pudieron encontrar filas válidas en el archivo CSV.');
        }
      } catch (err) {
        console.error(err);
        alert('Error al leer el archivo CSV. Comprueba su formato.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Unique weeks
  const availableWeeks = Array.from(new Set(reactions.map((r) => r.semana))).sort(
    (a, b) => b - a
  );

  // Filtered reactions with full Date / Month / Year / Period / Range logic
  const filtered = reactions.filter((r) => {
    // 1. Week Filter
    if (selectedWeek !== 'all' && String(r.semana) !== selectedWeek) {
      return false;
    }

    // 2. Predefined Time Period Filter
    const reactionDate = new Date(r.fecha);
    const now = new Date();

    if (selectedTimePeriod === 'today') {
      const isToday =
        reactionDate.getFullYear() === now.getFullYear() &&
        reactionDate.getMonth() === now.getMonth() &&
        reactionDate.getDate() === now.getDate();
      if (!isToday) return false;
    } else if (selectedTimePeriod === 'this_month') {
      const isThisMonth =
        reactionDate.getFullYear() === now.getFullYear() &&
        reactionDate.getMonth() === now.getMonth();
      if (!isThisMonth) return false;
    } else if (selectedTimePeriod === 'last_month') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const isLastMonth =
        reactionDate.getFullYear() === prevMonth.getFullYear() &&
        reactionDate.getMonth() === prevMonth.getMonth();
      if (!isLastMonth) return false;
    } else if (selectedTimePeriod === 'this_year') {
      if (reactionDate.getFullYear() !== now.getFullYear()) return false;
    } else if (selectedTimePeriod === 'last_7_days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      if (reactionDate < sevenDaysAgo || reactionDate > now) return false;
    } else if (selectedTimePeriod === 'last_30_days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      if (reactionDate < thirtyDaysAgo || reactionDate > now) return false;
    }

    // 3. Custom Date Range Filter (Desde / Hasta)
    if (customStartDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      if (reactionDate < start) return false;
    }

    if (customEndDate) {
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      if (reactionDate > end) return false;
    }

    // 4. Search Query Term
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.fechaFormateada.toLowerCase().includes(term) ||
      (r.ubicacion && r.ubicacion.toLowerCase().includes(term)) ||
      (r.ubicacionCuerpo && r.ubicacionCuerpo.toLowerCase().includes(term)) ||
      (r.medicamento && r.medicamento.toLowerCase().includes(term)) ||
      (r.notas && r.notas.toLowerCase().includes(term))
    );
  });

  const clearAllFilters = () => {
    setSelectedWeek('all');
    setSelectedTimePeriod('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchTerm('');
  };

  const hasActiveFilters =
    selectedWeek !== 'all' ||
    selectedTimePeriod !== 'all' ||
    Boolean(customStartDate) ||
    Boolean(customEndDate) ||
    Boolean(searchTerm.trim());

  const handleCopyForSheets = async () => {
    const tsvData = exportToTSV(filtered);
    try {
      await navigator.clipboard.writeText(tsvData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadCSV = () => {
    const csvData = exportToCSV(filtered);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registro_reacciones_alergicas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Table Toolbar & Advanced Filters */}
      <div className="flex flex-col gap-2.5 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
        {/* Row 1: Search Box + Dedicated "Filtrar" Button */}
        <div className="flex items-center gap-2 w-full">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por zona, notas, medicamento..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-medium"
            />
          </div>

          {/* Dedicated "Filtrar" Button with Active Filter Count Badge */}
          <button
            type="button"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0 select-none shadow-2xs ${
              isFilterPanelOpen || hasActiveFilters
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar</span>
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                !
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel: Opens smoothly upon clicking "Filtrar" */}
        {isFilterPanelOpen && (
          <div className="p-3 bg-slate-50/90 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Filtros por Fecha y Semana
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Limpiar todos los filtros</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Period Dropdown */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                  Período Temporal:
                </label>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={selectedTimePeriod}
                    onChange={(e) => {
                      setSelectedTimePeriod(e.target.value);
                      if (e.target.value !== 'custom') {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="all">Todo el tiempo</option>
                    <option value="today">Hoy</option>
                    <option value="last_7_days">Últimos 7 días</option>
                    <option value="this_month">Este mes</option>
                    <option value="last_month">Mes anterior</option>
                    <option value="this_year">Este año</option>
                    <option value="custom">📅 Elegir rango de fechas (Desde / Hasta)...</option>
                  </select>
                </div>
              </div>

              {/* Week Dropdown */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                  Filtrar por Semana:
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                >
                  <option value="all">Todas las semanas ({reactions.length})</option>
                  {availableWeeks.map((w) => (
                    <option key={w} value={String(w)}>
                      Semana {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Range: Dates Pickers */}
            {selectedTimePeriod === 'custom' && (
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-600">Desde:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-600">Hasta:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Row 3: Action Buttons (Copy, CSV, Import, PDF, New Row) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={handleCopyForSheets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Copia los datos con formato tabulado para pegar directamente con Ctrl+V en Google Sheets o Excel"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">¡Copiado! Listo para Sheets</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar para Sheets</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Descargar archivo .CSV compatible con Excel y Drive"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Descargar CSV</span>
          </button>

          {/* Import CSV Button */}
          <label
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            title="Subir tu propio archivo CSV con reacciones anteriores"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Importar CSV</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => generateSpreadsheetPDF(filtered)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
            title="Descargar archivo PDF estructurado listo para imprimir o enviar"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
            >
              Restablecer filtros ({filtered.length} de {reactions.length})
            </button>
          )}

          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva fila</span>
          </button>
        </div>
      </div>

      {/* Success Notification on CSV Import */}
      {importMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importMessage}</span>
        </div>
      )}

      {/* Spreadsheet Container with horizontal scrollbar */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-300 font-bold text-slate-800 tracking-tight">
                {/* Ampliar / Ver Detalle Action Header */}
                <th className="py-2.5 px-2.5 border-r border-slate-200 text-center whitespace-nowrap w-10" title="Ver detalle completo de la fila">
                  Ver
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap min-w-[130px]">
                  Fecha
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap min-w-[65px]">
                  Semana
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap min-w-[110px]">
                  Ubicacion
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap min-w-[180px]">
                  UbicaciónCuerpo
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap min-w-[110px]">
                  NºRonchas (0-3)
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap min-w-[95px]">
                  Prurito (0-3)
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap min-w-[100px]">
                  Puntuación Día
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap min-w-[140px]">
                  ¿Tomó medicamento?
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap min-w-[130px]">
                  Medicamento
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap min-w-[90px]">
                  Dosis
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap min-w-[120px]">
                  Tiempo Desaparición
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap min-w-[200px]">
                  Notas
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[110px]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500">
                    <p className="font-medium text-slate-600">
                      No se encontraron registros con los filtros seleccionados
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Prueba a cambiar el rango de fechas o añade una nueva reacción.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        // Prevent triggering detail modal when clicking row action buttons
                        const target = e.target as HTMLElement;
                        if (target.closest('button')) return;
                        setSelectedReactionForDetail(r);
                      }}
                    >
                      {/* Button to Expand / View Full Detail */}
                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReactionForDetail(r);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Ampliar y ver todos los detalles de este registro"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Fecha */}
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-900 whitespace-nowrap font-medium">
                        {r.fechaFormateada}
                      </td>

                      {/* Semana */}
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {r.semana}
                      </td>

                      {/* Ubicación */}
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-800 whitespace-nowrap">
                        {r.ubicacion || (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Ubicación en el cuerpo */}
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-800 whitespace-nowrap max-w-[200px] truncate" title={r.ubicacionCuerpo}>
                        {r.ubicacionCuerpo || (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Nº Ronchas */}
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                        {r.numHabones}
                      </td>

                      {/* Prurito */}
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                        {r.prurito}
                      </td>

                      {/* Puntuación Día (0-6) */}
                      <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                        <span
                          className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            r.puntuacionDia === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.puntuacionDia <= 2
                              ? 'bg-amber-100 text-amber-800'
                              : r.puntuacionDia <= 4
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.puntuacionDia} / 6
                        </span>
                      </td>

                      {/* ¿Tomó medicamento? */}
                      <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            r.tomoMedicamento
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {r.tomoMedicamento ? 'SÍ' : 'NO'}
                        </span>
                      </td>

                      {/* Medicamento */}
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-800 whitespace-nowrap">
                        {r.medicamento || (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Dosis */}
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-800 whitespace-nowrap">
                        {r.dosis ? (
                          <span className="font-mono">{r.dosis}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Tiempo en desaparecer */}
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums text-slate-800 whitespace-nowrap">
                        {r.tiempoDesaparecer || (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Notas */}
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-700 max-w-[200px] truncate" title={r.notas}>
                        {r.notas || <span className="text-slate-300">-</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedReactionForDetail(r)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                            title="Ampliar y ver detalle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEdit(r)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                            title="Editar fila"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicate(r)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                            title="Duplicar como nueva reacción"
                          >
                            <CopyPlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Stats */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span>
              Total filas:{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {filtered.length}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Puntuación promedio:{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {filtered.length > 0
                  ? (
                      filtered.reduce((acc, curr) => acc + curr.puntuacionDia, 0) /
                      filtered.length
                    ).toFixed(1)
                  : '0.0'}
              </strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Haz clic en cualquier fila o en el icono 👁️ para ampliar todos sus detalles.
          </div>
        </div>
      </div>

      {/* REACTION DETAIL MODAL (AMPLIAR) */}
      <ReactionDetailModal
        reaction={selectedReactionForDetail}
        onClose={() => setSelectedReactionForDetail(null)}
        onEdit={(reaction) => {
          setSelectedReactionForDetail(null);
          onEdit(reaction);
        }}
        onDelete={(id) => {
          setSelectedReactionForDetail(null);
          onDelete(id);
        }}
      />
    </div>
  );
};
