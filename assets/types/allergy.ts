export interface AllergyReaction {
  id: string;
  fecha: string; // ISO format "YYYY-MM-DDTHH:mm" for inputs and sorting
  fechaFormateada: string; // "DD/MM/YYYY HH:mm" matching the spreadsheet
  semana: number; // ISO Week number (e.g. 33, 34)
  ubicacion: string; // "Oficina PSN", "Casa", etc.
  ubicacionCuerpo: string; // "Brazo izquierdo, zona codo"
  cuerpoZonasSeleccionadas: string[]; // ["brazo_izq", "codo_izq"]
  ronchas: number; // 0, 1, 2, 3 (UAS standard)
  prurito: number; // 0, 1, 2, 3 (UAS standard)
  puntuacionDia: number; // ronchas + prurito (0 to 6)
  tomoMedicamento: boolean; // TRUE / FALSE
  medicamento: string; // e.g. "Ebastina 10mg"
  tiempoDesaparecer: string; // e.g. "0:15:00", "0:12:00", "0:10:00"
  notas: string; // notes / observations
  detonantes?: string[]; // Triggers e.g. ["Comida", "Estrés"]
  creadoEn: string;
}

export type ViewMode = 'hoja' | 'tarjetas' | 'uas7';
