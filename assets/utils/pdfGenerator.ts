import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AllergyReaction } from '../types/allergy';
import { parseDurationToMinutes } from './dateAndUas';

/**
 * Generates and downloads a complete, professional PDF of the entire spreadsheet
 * in Landscape format matching the user's Google Sheet columns.
 */
export function generateSpreadsheetPDF(reactions: AllergyReaction[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Document Header
  doc.setFillColor(244, 63, 94); // rose-500
  doc.rect(0, 0, pageWidth, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('REGISTRO DE REACCIONES ALÉRGICAS Y URTICARIA', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 14, 12, { align: 'right' });

  // Summary Metrics Bar
  const total = reactions.length;
  const avgScore = total > 0
    ? (reactions.reduce((sum, r) => sum + r.puntuacionDia, 0) / total).toFixed(1)
    : '0.0';
  const medCount = reactions.filter((r) => r.tomoMedicamento).length;
  const medPercent = total > 0 ? Math.round((medCount / total) * 100) : 0;

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Clínico:', 14, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Total de brotes registrados: ${total}  |  Puntuación Media UAS: ${avgScore}/6 por brote  |  Brotes con medicación: ${medCount} (${medPercent}%)`,
    48,
    27
  );

  // Table Columns
  const headers = [
    'Fecha',
    'Sem.',
    'Ubicación',
    'Ubicación Cuerpo',
    'Ronchas',
    'Prurito',
    'UAS',
    'Medic.',
    'Medicamento',
    'Duración',
    'Notas',
  ];

  // Table Rows
  const rows = reactions.map((r) => [
    r.fechaFormateada || r.fecha,
    r.semana,
    r.ubicacion || '-',
    r.ubicacionCuerpo || '-',
    r.ronchas,
    r.prurito,
    r.puntuacionDia,
    r.tomoMedicamento ? 'SÍ' : 'NO',
    r.medicamento || '-',
    r.tiempoDesaparecer || '-',
    r.notas || '-',
  ]);

  autoTable(doc, {
    startY: 32,
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' }, // Fecha
      1: { cellWidth: 12, halign: 'center' }, // Semana
      2: { cellWidth: 26 }, // Ubicación
      3: { cellWidth: 44 }, // Ubicación Cuerpo
      4: { cellWidth: 14, halign: 'center' }, // Ronchas
      5: { cellWidth: 14, halign: 'center' }, // Prurito
      6: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }, // UAS
      7: { cellWidth: 14, halign: 'center' }, // Medicado
      8: { cellWidth: 26 }, // Medicamento
      9: { cellWidth: 18, halign: 'center' }, // Duración
      10: { cellWidth: 'auto' }, // Notas
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageStr = `Página ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(pageStr, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
      doc.text('AlergiaLog · Estructura estandarizada UAS7 para seguimiento de urticaria', 14, doc.internal.pageSize.getHeight() - 8);
    },
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`registro_reacciones_alergicas_${dateStr}.pdf`);
}

/**
 * Generates and downloads a clinical consultation PDF report for the doctor / allergist
 * in Portrait format with UAS7 weekly evaluations and pattern analysis.
 */
export function generateClinicalReportPDF(reactions: AllergyReaction[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INFORME CLÍNICO DE CONTROL DE URTICARIA (UAS7)', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento médico estructurado según criterios EAACI / GA²LEN', 14, 19);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 14, 19, { align: 'right' });

  let cursorY = 32;

  // General Patient Statistics
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. RESUMEN EPIDEMIOLÓGICO Y CONTROL', 14, cursorY);

  cursorY += 5;

  const total = reactions.length;
  const avgScore = total > 0
    ? (reactions.reduce((sum, r) => sum + r.puntuacionDia, 0) / total).toFixed(1)
    : '0.0';
  const medCount = reactions.filter((r) => r.tomoMedicamento).length;

  autoTable(doc, {
    startY: cursorY,
    head: [['Métrica', 'Resultado', 'Interpretación Clínica']],
    body: [
      ['Total Brotes Evaluados', `${total} episodios`, 'Registro acumulado en historial'],
      ['Puntuación Diaria Media', `${avgScore} / 6`, Number(avgScore) <= 2 ? 'Control Leve' : Number(avgScore) <= 4 ? 'Afectación Moderada' : 'Afectación Intensa'],
      ['Requerimiento de Fármacos', `${medCount} de ${total} (${total > 0 ? Math.round((medCount / total) * 100) : 0}%)`, medCount === 0 ? 'Sin uso de rescate' : 'Uso de antihistamínicos'],
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // Weekly UAS7 Scores
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. EVALUACIÓN SEMANAL UAS7 (URTICARIA ACTIVITY SCORE 7)', 14, cursorY);

  cursorY += 5;

  // Group by week
  const weeksMap: { [week: number]: AllergyReaction[] } = {};
  reactions.forEach((r) => {
    if (!weeksMap[r.semana]) weeksMap[r.semana] = [];
    weeksMap[r.semana].push(r);
  });

  const weeksSorted = Object.keys(weeksMap).map(Number).sort((a, b) => b - a);

  const weeklyRows = weeksSorted.map((w) => {
    const recs = weeksMap[w];
    const totalUAS7 = recs.reduce((sum, r) => sum + r.puntuacionDia, 0);
    let diag = '';
    if (totalUAS7 === 0) diag = 'Control total (0)';
    else if (totalUAS7 <= 6) diag = 'Urticaria bien controlada (1-6)';
    else if (totalUAS7 <= 15) diag = 'Urticaria leve (7-15)';
    else if (totalUAS7 <= 27) diag = 'Urticaria moderada (16-27)';
    else diag = 'Urticaria severa (28-42)';

    return [
      `Semana ${w}`,
      `${recs.length} brotes`,
      `${totalUAS7} / 42 pts`,
      diag,
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [['Semana del Año', 'Nº de Brotes', 'Puntuación Semanal (UAS7)', 'Estado de Control Clínico']],
    body: weeklyRows,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [244, 63, 94], textColor: [255, 255, 255] },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // Most Recent 10 Brotes Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. DETALLE DE BROTES REGISTRADOS', 14, cursorY);

  cursorY += 5;

  const detailRows = reactions.slice(0, 15).map((r) => [
    r.fechaFormateada || r.fecha,
    r.ubicacion || '-',
    r.ubicacionCuerpo || '-',
    `${r.ronchas}/3`,
    `${r.prurito}/3`,
    `${r.puntuacionDia}/6`,
    r.tiempoDesaparecer || '-',
    r.notas || '-',
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['Fecha', 'Lugar', 'Zona Cuerpo', 'Ronchas', 'Picor', 'UAS', 'Duración', 'Notas / Factores']],
    body: detailRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 24 },
      2: { cellWidth: 38 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Página ${data.pageNumber}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
      doc.text('Informe para consulta médica · Alergología y Dermatología', 14, doc.internal.pageSize.getHeight() - 8);
    },
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`informe_medico_alergologo_UAS7_${dateStr}.pdf`);
}
