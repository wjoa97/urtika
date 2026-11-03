import React from 'react';
import {
  FileText,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Pill,
  ShieldAlert,
  FileDown,
} from 'lucide-react';
import { AllergyReaction } from '../types/allergy';
import { parseDurationToMinutes } from '../utils/dateAndUas';
import { generateClinicalReportPDF } from '../utils/pdfGenerator';

interface ClinicalReportViewProps {
  reactions: AllergyReaction[];
}

export const ClinicalReportView: React.FC<ClinicalReportViewProps> = ({
  reactions,
}) => {
  // Group by week
  const weeksMap: { [week: number]: AllergyReaction[] } = {};
  reactions.forEach((r) => {
    if (!weeksMap[r.semana]) {
      weeksMap[r.semana] = [];
    }
    weeksMap[r.semana].push(r);
  });

  const weeksSorted = Object.keys(weeksMap)
    .map(Number)
    .sort((a, b) => b - a);

  // Body areas frequency
  const bodyCounts: { [area: string]: number } = {};
  reactions.forEach((r) => {
    const text = r.ubicacionCuerpo || 'Sin especificar';
    // Match common keywords
    if (/codo/i.test(text)) bodyCounts['Codos'] = (bodyCounts['Codos'] || 0) + 1;
    if (/brazo/i.test(text)) bodyCounts['Brazos'] = (bodyCounts['Brazos'] || 0) + 1;
    if (/pierna/i.test(text)) bodyCounts['Piernas'] = (bodyCounts['Piernas'] || 0) + 1;
    if (/hombro/i.test(text)) bodyCounts['Hombros'] = (bodyCounts['Hombros'] || 0) + 1;
    if (/cuello/i.test(text)) bodyCounts['Cuello'] = (bodyCounts['Cuello'] || 0) + 1;
    if (/espalda/i.test(text)) bodyCounts['Espalda'] = (bodyCounts['Espalda'] || 0) + 1;
  });

  // Location frequency
  const locationCounts: { [loc: string]: number } = {};
  reactions.forEach((r) => {
    const loc = r.ubicacion ? r.ubicacion.trim() : 'Sin ubicación';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  // Calculate average disappearance time
  const timesWithMed: number[] = [];
  const timesWithoutMed: number[] = [];

  reactions.forEach((r) => {
    const mins = parseDurationToMinutes(r.tiempoDesaparecer);
    if (mins > 0) {
      if (r.tomoMedicamento) {
        timesWithMed.push(mins);
      } else {
        timesWithoutMed.push(mins);
      }
    }
  });

  const avgWithMed =
    timesWithMed.length > 0
      ? Math.round(timesWithMed.reduce((a, b) => a + b, 0) / timesWithMed.length)
      : null;

  const avgWithoutMed =
    timesWithoutMed.length > 0
      ? Math.round(
          timesWithoutMed.reduce((a, b) => a + b, 0) / timesWithoutMed.length
        )
      : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            Informe Clínico y Puntuación UAS7 (Urticaria Activity Score)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Resumen médico estructurado para consulta con alergólogo o dermatólogo, basado en la
            escala clínica internacional UAS7.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => generateClinicalReportPDF(reactions)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
            title="Descargar informe médico completo estructurado en PDF para el alergólogo"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>Descargar Informe PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* UAS7 Weekly Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weeksSorted.map((weekNum) => {
          const recs = weeksMap[weekNum];
          const totalUAS7 = recs.reduce((acc, curr) => acc + curr.puntuacionDia, 0);

          let classification = '';
          let badgeColor = '';
          if (totalUAS7 === 0) {
            classification = 'Control total de urticaria';
            badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
          } else if (totalUAS7 <= 6) {
            classification = 'Urticaria bien controlada';
            badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
          } else if (totalUAS7 <= 15) {
            classification = 'Urticaria leve';
            badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
          } else if (totalUAS7 <= 27) {
            classification = 'Urticaria moderada';
            badgeColor = 'text-orange-700 bg-orange-50 border-orange-200';
          } else {
            classification = 'Urticaria severa';
            badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
          }

          return (
            <div
              key={weekNum}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Semana {weekNum}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${badgeColor}`}
                  >
                    UAS7: {totalUAS7} / 42
                  </span>
                </div>

                <div className="text-xs text-slate-600 mb-3 font-medium">
                  Diagnóstico semanal: <strong className="text-slate-900">{classification}</strong>
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span>Brotes registrados en la semana:</span>
                    <strong className="font-mono text-slate-900">{recs.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Promedio ronchas:</span>
                    <strong className="font-mono text-slate-900">
                      {(
                        recs.reduce((a, b) => a + b.ronchas, 0) / recs.length
                      ).toFixed(1)} / 3
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Promedio prurito (picor):</span>
                    <strong className="font-mono text-slate-900">
                      {(
                        recs.reduce((a, b) => a + b.prurito, 0) / recs.length
                      ).toFixed(1)} / 3
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                UAS7 es la suma de los valores diarios de ronchas y prurito recomendada por las guías
                médicas EAACI/GA²LEN/EDF/WAO.
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Patterns & Triggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most affected zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            Zonas más frecuentes
          </h4>
          <div className="space-y-2">
            {Object.keys(bodyCounts).length === 0 ? (
              <p className="text-xs text-slate-500">Sin datos de zonas aún.</p>
            ) : (
              Object.entries(bodyCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([area, count]) => (
                  <div key={area} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{area}</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {count} {count === 1 ? 'vez' : 'veces'}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Environments */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-600" />
            Entornos del brote
          </h4>
          <div className="space-y-2">
            {Object.entries(locationCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([loc, count]) => (
                <div key={loc} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{loc}</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {count} {count === 1 ? 'registro' : 'registros'}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Resolution Time & Medication Efficacy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            Tiempo de resolución
          </h4>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
                <Pill className="w-3 h-3 text-slate-400" />
                Con medicación:
              </div>
              <div className="font-mono text-sm font-bold text-slate-900">
                {avgWithMed !== null ? `~${avgWithMed} minutos` : 'Sin registros suficientes'}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                Sin medicación (espontáneo):
              </div>
              <div className="font-mono text-sm font-bold text-slate-900">
                {avgWithoutMed !== null ? `~${avgWithoutMed} minutos` : 'Sin registros suficientes'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
