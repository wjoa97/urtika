import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Sparkles,
  Play,
  Square,
  AlertCircle,
  Pill,
  MapPin,
  Calendar,
} from 'lucide-react';
import { AllergyReaction } from '../types/allergy';
import { BodyMap } from './BodyMap';
import {
  getISOWeekNumber,
  formatDateToSpreadsheet,
  formatDateToInput,
  formatSecondsToDurationString,
  getUASLevel,
} from '../utils/dateAndUas';

interface ReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reaction: AllergyReaction) => void;
  initialData?: AllergyReaction | null;
}

const COMMON_LOCATIONS = [
  'Oficina',
  'Casa',
  'Trabajo',
  'Restaurante',
  'Calle / Exterior',
  'Gimnasio',
  'Coche',
  'Viaje',
];

const COMMON_MEDICATIONS = [
  'Ebastina 10mg',
  'Ebastina 20mg',
  'Bilastina 20mg',
  'Cetirizina 10mg',
  'Desloratadina 5mg',
  'Loratadina 10mg',
  'Polaramine',
  'Prednisona 20mg',
  'Crema corticoide',
];

const DURATION_PRESETS = [
  { label: '10 min', value: '0:10:00' },
  { label: '12 min', value: '0:12:00' },
  { label: '15 min', value: '0:15:00' },
  { label: '20 min', value: '0:20:00' },
  { label: '30 min', value: '0:30:00' },
  { label: '45 min', value: '0:45:00' },
  { label: '1 hora', value: '1:00:00' },
  { label: '2 horas', value: '2:00:00' },
];

const COMMON_TRIGGERS = [
  'Comida / Alimento',
  'Estrés laboral',
  'Calor / Ducha caliente',
  'Frío',
  'Sudor / Ejercicio',
  'Roce con ropa',
  'Contacto químico',
  'Picadura',
];

export const ReactionModal: React.FC<ReactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [fechaInput, setFechaInput] = useState<string>('');
  const [semana, setSemana] = useState<number>(1);
  const [ubicacion, setUbicacion] = useState<string>('');
  const [ubicacionCuerpo, setUbicacionCuerpo] = useState<string>('');
  const [cuerpoZonas, setCuerpoZonas] = useState<string[]>([]);
  const [ronchas, setRonchas] = useState<number>(1);
  const [prurito, setPrurito] = useState<number>(1);
  const [tomoMedicamento, setTomoMedicamento] = useState<boolean>(false);
  const [medicamento, setMedicamento] = useState<string>('');
  const [tiempoDesaparecer, setTiempoDesaparecer] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [detonantes, setDetonantes] = useState<string[]>([]);

  // Stopwatch state for live disappearing measurement
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Initialize form state
  useEffect(() => {
    if (!isOpen) {
      setIsTimerRunning(false);
      return;
    }

    if (initialData) {
      setFechaInput(initialData.fecha);
      setSemana(initialData.semana);
      setUbicacion(initialData.ubicacion || '');
      setUbicacionCuerpo(initialData.ubicacionCuerpo || '');
      setCuerpoZonas(initialData.cuerpoZonasSeleccionadas || []);
      setRonchas(initialData.ronchas ?? 1);
      setPrurito(initialData.prurito ?? 1);
      setTomoMedicamento(Boolean(initialData.tomoMedicamento));
      setMedicamento(initialData.medicamento || '');
      setTiempoDesaparecer(initialData.tiempoDesaparecer || '');
      setNotas(initialData.notas || '');
      setDetonantes(initialData.detonantes || []);
    } else {
      // Default to now
      const now = new Date();
      const inputStr = formatDateToInput(now);
      setFechaInput(inputStr);
      setSemana(getISOWeekNumber(now));
      setUbicacion('');
      setUbicacionCuerpo('');
      setCuerpoZonas([]);
      setRonchas(1);
      setPrurito(1);
      setTomoMedicamento(false);
      setMedicamento('');
      setTiempoDesaparecer('');
      setNotas('');
      setDetonantes([]);
    }
  }, [isOpen, initialData]);

  // Recalculate week when date changes
  const handleDateChange = (newVal: string) => {
    setFechaInput(newVal);
    if (newVal) {
      const calculatedWeek = getISOWeekNumber(newVal);
      setSemana(calculatedWeek);
    }
  };

  const handleSetCurrentDate = () => {
    const now = new Date();
    setFechaInput(formatDateToInput(now));
    setSemana(getISOWeekNumber(now));
  };

  // Stopwatch effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const formatted = formatSecondsToDurationString(timerSeconds);
    setTiempoDesaparecer(formatted);
  };

  const handleStartTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const handleToggleTrigger = (trigger: string) => {
    if (detonantes.includes(trigger)) {
      setDetonantes(detonantes.filter((t) => t !== trigger));
    } else {
      setDetonantes([...detonantes, trigger]);
      // Also optionally append to notes if not already mentioned
      if (!notas.includes(trigger)) {
        setNotas((prev) => (prev ? `${prev}. Detonante sospechoso: ${trigger}` : `Detonante sospechoso: ${trigger}`));
      }
    }
  };

  // UAS calculation: Ronchas + Prurito
  const puntuacionDia = ronchas + prurito;
  const uasInfo = getUASLevel(puntuacionDia);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateObj = new Date(fechaInput);
    const formatted = formatDateToSpreadsheet(dateObj);

    const record: AllergyReaction = {
      id: initialData?.id || `rec-${Date.now()}`,
      fecha: fechaInput,
      fechaFormateada: formatted,
      semana: semana || getISOWeekNumber(dateObj),
      ubicacion: ubicacion.trim(),
      ubicacionCuerpo: ubicacionCuerpo.trim(),
      cuerpoZonasSeleccionadas: cuerpoZonas,
      ronchas,
      prurito,
      puntuacionDia,
      tomoMedicamento,
      medicamento: tomoMedicamento ? medicamento.trim() : '',
      tiempoDesaparecer: tiempoDesaparecer.trim(),
      notas: notas.trim(),
      detonantes,
      creadoEn: initialData?.creadoEn || new Date().toISOString(),
    };

    onSave(record);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? 'Editar Reacción Alérgica' : 'Registrar Nueva Reacción Alérgica'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rellena de forma guiada los datos para tu hoja de registro clínico y UAS7
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* Step 1: Momento y Ubicación Ambiental */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-600" />
                1. Momento y Entorno
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
                  Semana {semana}
                </span>
                <button
                  type="button"
                  onClick={handleSetCurrentDate}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Poner ahora mismo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fechaInput}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  ¿Dónde estás? (Ubicación)
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Oficina, Casa, Gimnasio..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {COMMON_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setUbicacion(loc)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                        ubicacion === loc
                          ? 'bg-slate-900 text-white border-slate-900 font-medium'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Ubicación en el Cuerpo */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/70">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
              2. Ubicación en el Cuerpo (UbicaciónCuerpo)
            </span>
            <BodyMap
              selectedRegions={cuerpoZonas}
              onChange={(regions, suggested) => {
                setCuerpoZonas(regions);
                if (suggested && (!ubicacionCuerpo || ubicacionCuerpo.trim() === '')) {
                  setUbicacionCuerpo(suggested);
                } else if (suggested) {
                  setUbicacionCuerpo(suggested);
                }
              }}
              customText={ubicacionCuerpo}
              onCustomTextChange={(txt) => setUbicacionCuerpo(txt)}
            />
          </div>

          {/* Step 3: Evaluación UAS (Ronchas + Prurito = Puntuación Día) */}
          <div className="space-y-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                3. Intensidad Clínica (Escala Estándar UAS 0-3)
              </span>
              <div
                className={`text-xs px-3 py-1 font-bold rounded-lg border flex items-center gap-1.5 ${uasInfo.badgeClass}`}
              >
                <span>Puntuación Día: {puntuacionDia} / 6</span>
                <span>·</span>
                <span>{uasInfo.label}</span>
              </div>
            </div>

            {/* Nº de Ronchas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Nº Ronchas / Habones (0-3)
                </label>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  Seleccionado: {ronchas}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 0, title: '0 - Ninguna', desc: 'Sin ronchas ni habones' },
                  { value: 1, title: '1 - Leve', desc: '< 20 ronchas en 24h' },
                  { value: 2, title: '2 - Moderado', desc: '20 a 50 ronchas' },
                  { value: 3, title: '3 - Intenso', desc: '> 50 ronchas o placas confluentes' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRonchas(item.value)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      ronchas === item.value
                        ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 mb-0.5">{item.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prurito / Picor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Prurito / Picazón (0-3)
                </label>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  Seleccionado: {prurito}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 0, title: '0 - Ninguno', desc: 'No pica en absoluto' },
                  { value: 1, title: '1 - Leve', desc: 'Presente pero no molesto' },
                  { value: 2, title: '2 - Moderado', desc: 'Molesto, no interfiere con el día' },
                  { value: 3, title: '3 - Intenso', desc: 'Severo, interfiere con sueño/tareas' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPrurito(item.value)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      prurito === item.value
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-200 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 mb-0.5">{item.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: ¿Tomó medicamento? */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-slate-600" />
                4. Medicación
              </span>
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTomoMedicamento(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    !tomoMedicamento
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  No tomé (NO)
                </button>
                <button
                  type="button"
                  onClick={() => setTomoMedicamento(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    tomoMedicamento
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sí tomé (SÍ)
                </button>
              </div>
            </div>

            {tomoMedicamento && (
              <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-slate-700">
                  ¿Qué medicamento y dosis tomaste?
                </label>
                <input
                  type="text"
                  value={medicamento}
                  onChange={(e) => setMedicamento(e.target.value)}
                  placeholder="Ej: Ebastina 10mg / Bilastina 20mg / Prednisona..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_MEDICATIONS.map((med) => (
                    <button
                      key={med}
                      type="button"
                      onClick={() => setMedicamento(med)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        medicamento === med
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {med}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Tiempo en desaparecer */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                5. Tiempo en Desaparecer (hh:mm:ss)
              </span>
              {tiempoDesaparecer && (
                <button
                  type="button"
                  onClick={() => setTiempoDesaparecer('')}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Borrar tiempo
                </button>
              )}
            </div>

            {/* Live Stopwatch Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-3 bg-white border border-slate-200 rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Cronómetro en vivo:</span>
                </div>
                <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {formatSecondsToDurationString(timerSeconds) || '0:00:00'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isTimerRunning ? (
                  <button
                    type="button"
                    onClick={handleStartTimer}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-700 fill-slate-700" />
                    Iniciar medición
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopTimer}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    Ha desaparecido (Guardar tiempo)
                  </button>
                )}
              </div>
            </div>

            {/* Quick Presets & Manual Input */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Tiempos habituales en tu registro:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((dp) => (
                    <button
                      key={dp.value}
                      type="button"
                      onClick={() => setTiempoDesaparecer(dp.value)}
                      className={`text-xs px-2.5 py-1 rounded-md border font-mono tabular-nums transition-colors ${
                        tiempoDesaparecer === dp.value
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dp.label} ({dp.value})
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  O escribe formato exacto (H:MM:SS):
                </label>
                <input
                  type="text"
                  value={tiempoDesaparecer}
                  onChange={(e) => setTiempoDesaparecer(e.target.value)}
                  placeholder="0:15:00"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Step 6: Notas y Posibles Detonantes */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/70">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
              6. Notas y Factores Desencadenantes
            </span>

            {/* Quick triggers */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                ¿Qué crees que pudo causarlo? (Añadir a notas):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TRIGGERS.map((trigger) => {
                  const active = detonantes.includes(trigger);
                  return (
                    <button
                      key={trigger}
                      type="button"
                      onClick={() => handleToggleTrigger(trigger)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        active
                          ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {trigger}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas y observaciones
              </label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Comenzó con picazón leve tras comida / ducha caliente..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
            >
              {initialData ? 'Guardar Cambios' : 'Registrar en la Hoja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
