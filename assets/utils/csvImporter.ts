import { AllergyReaction } from '../types/allergy';
import { getISOWeekNumber } from './dateAndUas';

/**
 * Parses CSV text into AllergyReaction records.
 * Supports standard CSV format, comma or semicolon separated.
 */
export function parseCSVToReactions(csvContent: string): AllergyReaction[] {
  // Normalize line endings
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Determine separator (comma or semicolon)
  const headerLine = lines[0];
  const separator = headerLine.includes(';') ? ';' : ',';

  // Helper to split a CSV line handling quoted fields
  const splitLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === separator && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return result;
  };

  const headers = splitLine(lines[0]).map((h) =>
    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  );

  const parsedReactions: AllergyReaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c)) continue;

    // Find indices by matching common header variations
    const getVal = (matches: string[]): string => {
      for (const m of matches) {
        const idx = headers.findIndex((h) => h.includes(m));
        if (idx !== -1 && cols[idx] !== undefined) return cols[idx].trim();
      }
      return '';
    };

    const fechaRaw = getVal(['fecha', 'date', 'timestamp', 'hora']) || cols[0] || '';
    const semanaRaw = parseInt(getVal(['semana', 'week']) || '0', 10);
    const ubicacion = getVal(['donde', 'ubicacion', 'location', 'lugar']) || (cols[2] || '');
    const ubicacionCuerpo = getVal(['cuerpo', 'zona', 'body', 'ubicacioncuerpo']) || (cols[3] || '');
    const ronchasRaw = parseInt(getVal(['roncha', 'habon', 'wheal']) || '0', 10);
    const pruritoRaw = parseInt(getVal(['prurito', 'picor', 'itch']) || '0', 10);
    const puntuacionDiaRaw = parseInt(getVal(['puntuacion', 'uas', 'score', 'total']) || '0', 10);
    const tomoMedRaw = getVal(['tomo', 'medicamento', 'med', 'antihistaminico']).toLowerCase();
    const nombreMed = getVal(['nombre', 'farmaco', 'medicamento']) || '';
    const tiempoDesaparecer = getVal(['tiempo', 'desaparecer', 'duracion', 'remision']) || '';
    const notas = getVal(['nota', 'observacion', 'comentario']) || '';

    // Calculate score
    const ronchas = isNaN(ronchasRaw) ? 0 : Math.min(3, Math.max(0, ronchasRaw));
    const prurito = isNaN(pruritoRaw) ? 0 : Math.min(3, Math.max(0, pruritoRaw));
    const puntuacionDia = !isNaN(puntuacionDiaRaw) && puntuacionDiaRaw > 0
      ? puntuacionDiaRaw
      : ronchas + prurito;

    const tomoMedicamento =
      tomoMedRaw === 'true' ||
      tomoMedRaw === 'si' ||
      tomoMedRaw === 'sí' ||
      tomoMedRaw === '1' ||
      nombreMed.length > 0;

    // Parse date safely
    let dateObj = new Date();
    let fechaISO = '';
    let fechaFormateada = fechaRaw;

    if (fechaRaw) {
      // Check formats: dd/mm/yyyy hh:mm or yyyy-mm-dd
      const parts = fechaRaw.split(/[\sT]+/);
      const datePart = parts[0] || '';
      const timePart = parts[1] || '12:00';

      if (datePart.includes('/')) {
        const [d, m, y] = datePart.split('/');
        dateObj = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${timePart.slice(0, 5)}`);
      } else {
        dateObj = new Date(fechaRaw);
      }

      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }
      fechaISO = dateObj.toISOString().slice(0, 16);
    } else {
      fechaISO = new Date().toISOString().slice(0, 16);
    }

    const semana = semanaRaw > 0 ? semanaRaw : getISOWeekNumber(dateObj);

    // Clean medication name (prevent 'FALSE' or 'NO' from appearing as medication name)
    const cleanedMed =
      nombreMed.toUpperCase() === 'FALSE' ||
      nombreMed.toUpperCase() === 'NO' ||
      nombreMed.toUpperCase() === 'TRUE'
        ? ''
        : nombreMed;

    parsedReactions.push({
      id: `imp-${Date.now()}-${i}`,
      fecha: fechaISO,
      fechaFormateada: fechaFormateada || dateObj.toLocaleString('es-ES'),
      semana,
      ubicacion,
      ubicacionCuerpo,
      cuerpoZonasSeleccionadas: [],
      ronchas,
      prurito,
      puntuacionDia,
      tomoMedicamento,
      medicamento: cleanedMed || (tomoMedicamento ? 'Antihistamínico' : ''),
      tiempoDesaparecer,
      notas,
      detonantes: [],
      creadoEn: new Date().toISOString(),
    });
  }

  return parsedReactions;
}
