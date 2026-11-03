import { AllergyReaction } from '../types/allergy';

/**
 * Calculates the ISO week number for a given date.
 */
export function getISOWeekNumber(dateInput: Date | string): number {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 1;

  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

/**
 * Formats a Date or ISO string into "DD/MM/YYYY HH:mm" (as seen in the user's spreadsheet).
 */
export function formatDateToSpreadsheet(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Formats date into datetime-local input string: "YYYY-MM-DDTHH:mm"
 */
export function formatDateToInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formats seconds into HH:MM:SS or 0:MM:SS (e.g., 900s -> "0:15:00")
 */
export function formatSecondsToDurationString(totalSeconds: number): string {
  if (totalSeconds <= 0) return '';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formats minutes into duration string (e.g., 15 -> "0:15:00", 60 -> "1:00:00")
 */
export function formatMinutesToDurationString(minutes: number): string {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}:${String(remainingMinutes).padStart(2, '0')}:00`;
}

/**
 * Parses duration string like "0:15:00" or "15m" to minutes
 */
export function parseDurationToMinutes(durationStr: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':');
  if (parts.length === 3) {
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const s = parseInt(parts[2], 10) || 0;
    return h * 60 + m + Math.round(s / 60);
  }
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10) || 0;
    const s = parseInt(parts[1], 10) || 0;
    return m + Math.round(s / 60);
  }
  const match = durationStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * UAS score interpretation:
 * 0: Sin actividad
 * 1-2: Urticaria leve
 * 3-4: Urticaria moderada
 * 5-6: Urticaria intensa
 */
export function getUASLevel(score: number): {
  label: string;
  badgeClass: string;
  bgLight: string;
  description: string;
} {
  if (score === 0) {
    return {
      label: 'Control Total (0)',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      bgLight: 'bg-emerald-50/50',
      description: 'Sin ronchas ni prurito.',
    };
  }
  if (score <= 2) {
    return {
      label: 'Leve',
      badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
      bgLight: 'bg-amber-50/40',
      description: 'Pocos habones y picor tolerable.',
    };
  }
  if (score <= 4) {
    return {
      label: 'Moderada',
      badgeClass: 'text-orange-700 bg-orange-50 border-orange-200',
      bgLight: 'bg-orange-50/40',
      description: 'Brotes notables que incomodan las tareas.',
    };
  }
  return {
    label: 'Intensa',
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
    bgLight: 'bg-rose-50/40',
    description: 'Picor severo y ronchas abundantes/confluentes.',
  };
}

/**
 * Generates TSV text formatted identically to the spreadsheet columns in the user's image,
 * ready to paste straight into Google Sheets or Microsoft Excel with Ctrl+V.
 */
export function exportToTSV(reactions: AllergyReaction[]): string {
  const headers = [
    'Fecha',
    'Semana',
    'Ubicacion',
    'UbicaciónCuerpo',
    'NºRonchas (0-3)',
    'Prurito (0-3)',
    'Puntuación Día',
    '¿Tomó medicamento?',
    'Medicamento',
    'Tiempo en desaparecer',
    'Notas',
  ];

  const rows = reactions.map((r) => [
    r.fechaFormateada || formatDateToSpreadsheet(r.fecha),
    r.semana,
    r.ubicacion || '',
    r.ubicacionCuerpo || '',
    r.ronchas,
    r.prurito,
    r.puntuacionDia,
    r.tomoMedicamento ? 'TRUE' : 'FALSE',
    r.medicamento || '',
    r.tiempoDesaparecer || '',
    r.notas || '',
  ]);

  return [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
}

/**
 * Generates CSV text formatted identically to the spreadsheet in the image.
 */
export function exportToCSV(reactions: AllergyReaction[]): string {
  const headers = [
    'Fecha',
    'Semana',
    'Ubicacion',
    'UbicaciónCuerpo',
    'NºRonchas (0-3)',
    'Prurito (0-3)',
    'Puntuación Día',
    '¿Tomó medicamento?',
    'Medicamento',
    'Tiempo en desaparecer',
    'Notas',
  ];

  const escapeCSV = (val: string | number | boolean) => {
    const stringVal = String(val ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const rows = reactions.map((r) => [
    escapeCSV(r.fechaFormateada || formatDateToSpreadsheet(r.fecha)),
    escapeCSV(r.semana),
    escapeCSV(r.ubicacion || ''),
    escapeCSV(r.ubicacionCuerpo || ''),
    escapeCSV(r.ronchas),
    escapeCSV(r.prurito),
    escapeCSV(r.puntuacionDia),
    escapeCSV(r.tomoMedicamento ? 'TRUE' : 'FALSE'),
    escapeCSV(r.medicamento || ''),
    escapeCSV(r.tiempoDesaparecer || ''),
    escapeCSV(r.notas || ''),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
