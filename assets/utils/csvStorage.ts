import { AllergyReaction } from '../types/allergy';
import { formatDateToSpreadsheet, getISOWeekNumber } from './dateAndUas';

/**
 * Parses CSV text back into AllergyReaction objects.
 * Supports standard CSV formatting and quotes.
 */
export function parseCSVToReactions(csvContent: string): AllergyReaction[] {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  // Parse CSV line taking care of quotes
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const dataRows = lines.slice(1);
  const reactions: AllergyReaction[] = [];

  dataRows.forEach((row, index) => {
    const cols = parseLine(row);
    if (cols.length < 5) return;

    const fechaFormateada = cols[0] || '';
    const semana = parseInt(cols[1], 10) || 1;
    const ubicacion = cols[2] || '';
    const ubicacionCuerpo = cols[3] || '';
    const ronchas = Math.min(3, Math.max(0, parseInt(cols[4], 10) || 0));
    const prurito = Math.min(3, Math.max(0, parseInt(cols[5], 10) || 0));
    const puntuacionDia = cols[6] ? parseInt(cols[6], 10) : ronchas + prurito;
    const tomoMedicamento = (cols[7] || '').toUpperCase() === 'TRUE' || (cols[7] || '').toUpperCase() === 'SÍ';
    const medicamento = cols[8] || '';
    const tiempoDesaparecer = cols[9] || '';
    const notas = cols[10] || '';

    // Split zones
    const cuerpoZonas = ubicacionCuerpo
      ? ubicacionCuerpo.split(',').map((z) => z.trim()).filter(Boolean)
      : [];

    reactions.push({
      id: `csv-${Date.now()}-${index}`,
      fecha: new Date().toISOString(),
      fechaFormateada,
      semana,
      ubicacion,
      ubicacionCuerpo,
      cuerpoZonasSeleccionadas: cuerpoZonas,
      ronchas,
      prurito,
      puntuacionDia,
      tomoMedicamento,
      medicamento,
      tiempoDesaparecer,
      notas,
      detonantes: [],
      creadoEn: new Date().toISOString(),
    });
  });

  return reactions;
}
