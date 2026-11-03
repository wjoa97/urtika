import React, { useState } from 'react';
import { Check } from 'lucide-react';

export interface BodyRegion {
  id: string;
  name: string;
  view: 'front' | 'back' | 'both';
  group: 'Brazos' | 'Torso' | 'Piernas' | 'Cabeza/Cuello';
}

export const BODY_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: 'cara', name: 'Cara / Cabeza', view: 'front', group: 'Cabeza/Cuello' },
  { id: 'cuello', name: 'Cuello', view: 'both', group: 'Cabeza/Cuello' },

  // Arms & Shoulders
  { id: 'hombro_izq', name: 'Hombro Izq.', view: 'both', group: 'Brazos' },
  { id: 'hombro_der', name: 'Hombro Der.', view: 'both', group: 'Brazos' },
  { id: 'brazo_izq', name: 'Brazo Izq.', view: 'both', group: 'Brazos' },
  { id: 'brazo_der', name: 'Brazo Der.', view: 'both', group: 'Brazos' },
  { id: 'codo_izq', name: 'Codo Izq.', view: 'both', group: 'Brazos' },
  { id: 'codo_der', name: 'Codo Der.', view: 'both', group: 'Brazos' },
  { id: 'antebrazo_izq', name: 'Antebrazo Izq.', view: 'both', group: 'Brazos' },
  { id: 'antebrazo_der', name: 'Antebrazo Der.', view: 'both', group: 'Brazos' },
  { id: 'manos', name: 'Manos / Dedos', view: 'both', group: 'Brazos' },

  // Torso
  { id: 'pecho', name: 'Pecho / Tórax', view: 'front', group: 'Torso' },
  { id: 'abdomen', name: 'Abdomen', view: 'front', group: 'Torso' },
  { id: 'espalda_alta', name: 'Espalda Alta', view: 'back', group: 'Torso' },
  { id: 'espalda_baja', name: 'Espalda Baja / Lumbar', view: 'back', group: 'Torso' },
  { id: 'gluteos', name: 'Glúteos', view: 'back', group: 'Torso' },

  // Legs
  { id: 'muslo_izq', name: 'Muslo Izq.', view: 'both', group: 'Piernas' },
  { id: 'muslo_der', name: 'Muslo Der.', view: 'both', group: 'Piernas' },
  { id: 'rodilla_izq', name: 'Rodilla Izq.', view: 'front', group: 'Piernas' },
  { id: 'rodilla_der', name: 'Rodilla Der.', view: 'front', group: 'Piernas' },
  { id: 'pierna_izq', name: 'Pierna / Gemelo Izq.', view: 'both', group: 'Piernas' },
  { id: 'pierna_der', name: 'Pierna / Gemelo Der.', view: 'both', group: 'Piernas' },
  { id: 'pies', name: 'Pies / Tobillos', view: 'both', group: 'Piernas' },
];

interface BodyMapProps {
  selectedRegions: string[];
  onChange: (regions: string[], suggestedText: string) => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  selectedRegions,
  onChange,
  customText,
  onCustomTextChange,
}) => {
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

  const toggleRegion = (id: string) => {
    let next: string[];
    if (selectedRegions.includes(id)) {
      next = selectedRegions.filter((r) => r !== id);
    } else {
      next = [...selectedRegions, id];
    }

    const regionNames = next.map((rId) => {
      const found = BODY_REGIONS.find((b) => b.id === rId);
      return found ? found.name : rId;
    });

    const newSuggested = regionNames.join(', ');
    onChange(next, newSuggested);
  };

  const isSelected = (id: string) => selectedRegions.includes(id);

  const getFill = (id: string) =>
    isSelected(id) ? '#f43f5e' : '#e2e8f0'; // rose-500 when active, slate-200 when inactive
  const getStroke = (id: string) =>
    isSelected(id) ? '#be123c' : '#94a3b8'; // rose-700 active, slate-400 inactive

  return (
    <div className="space-y-4">
      {/* Front / Back Toggle Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('front')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'front'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vista Frontal (Delante)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('back')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'back'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vista Posterior (Detrás)
          </button>
        </div>

        {selectedRegions.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([], '')}
            className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
          >
            Limpiar selección ({selectedRegions.length})
          </button>
        )}
      </div>

      {/* Interactive Silhouette Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Silhouette graphic column */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
          <p className="text-[11px] text-slate-500 mb-1 font-medium">
            Haz clic directamente en la zona afectada:
          </p>

          <svg
            viewBox="0 0 200 360"
            className="w-48 h-80 drop-shadow-xs select-none"
            aria-label="Mapa anatómico interactivo"
          >
            {activeTab === 'front' ? (
              // FRONT VIEW SVG
              <g id="front-body" className="cursor-pointer">
                {/* Head / Face */}
                <circle
                  cx="100"
                  cy="32"
                  r="20"
                  fill={getFill('cara')}
                  stroke={getStroke('cara')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('cara')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Cara / Cabeza</title>
                </circle>

                {/* Neck */}
                <rect
                  x="93"
                  y="52"
                  width="14"
                  height="12"
                  rx="3"
                  fill={getFill('cuello')}
                  stroke={getStroke('cuello')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('cuello')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Cuello</title>
                </rect>

                {/* Chest / Pecho */}
                <path
                  d="M 68 66 L 132 66 L 126 105 L 74 105 Z"
                  fill={getFill('pecho')}
                  stroke={getStroke('pecho')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('pecho')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Pecho / Tórax</title>
                </path>

                {/* Abdomen */}
                <path
                  d="M 74 107 L 126 107 L 122 145 L 78 145 Z"
                  fill={getFill('abdomen')}
                  stroke={getStroke('abdomen')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('abdomen')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Abdomen</title>
                </path>

                {/* Left Shoulder (from viewer: right side = anatomical left) */}
                <path
                  d="M 132 66 C 145 68, 150 78, 148 90 L 132 85 Z"
                  fill={getFill('hombro_izq')}
                  stroke={getStroke('hombro_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('hombro_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Hombro Izquierdo</title>
                </path>

                {/* Right Shoulder (from viewer: left side = anatomical right) */}
                <path
                  d="M 68 66 C 55 68, 50 78, 52 90 L 68 85 Z"
                  fill={getFill('hombro_der')}
                  stroke={getStroke('hombro_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('hombro_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Hombro Derecho</title>
                </path>

                {/* Right Arm (upper) */}
                <rect
                  x="45"
                  y="92"
                  width="18"
                  height="34"
                  rx="6"
                  fill={getFill('brazo_der')}
                  stroke={getStroke('brazo_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('brazo_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Brazo Derecho</title>
                </rect>

                {/* Right Elbow */}
                <rect
                  x="43"
                  y="128"
                  width="18"
                  height="16"
                  rx="4"
                  fill={getFill('codo_der')}
                  stroke={getStroke('codo_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('codo_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Codo Derecho</title>
                </rect>

                {/* Right Forearm */}
                <rect
                  x="40"
                  y="146"
                  width="17"
                  height="36"
                  rx="5"
                  fill={getFill('antebrazo_der')}
                  stroke={getStroke('antebrazo_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('antebrazo_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Antebrazo Derecho</title>
                </rect>

                {/* Right Hand */}
                <circle
                  cx="46"
                  cy="192"
                  r="9"
                  fill={getFill('manos')}
                  stroke={getStroke('manos')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('manos')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Mano Derecha</title>
                </circle>

                {/* Left Arm (upper) */}
                <rect
                  x="137"
                  y="92"
                  width="18"
                  height="34"
                  rx="6"
                  fill={getFill('brazo_izq')}
                  stroke={getStroke('brazo_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('brazo_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Brazo Izquierdo</title>
                </rect>

                {/* Left Elbow */}
                <rect
                  x="139"
                  y="128"
                  width="18"
                  height="16"
                  rx="4"
                  fill={getFill('codo_izq')}
                  stroke={getStroke('codo_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('codo_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Codo Izquierdo</title>
                </rect>

                {/* Left Forearm */}
                <rect
                  x="143"
                  y="146"
                  width="17"
                  height="36"
                  rx="5"
                  fill={getFill('antebrazo_izq')}
                  stroke={getStroke('antebrazo_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('antebrazo_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Antebrazo Izquierdo</title>
                </rect>

                {/* Left Hand */}
                <circle
                  cx="154"
                  cy="192"
                  r="9"
                  fill={getFill('manos')}
                  stroke={getStroke('manos')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('manos')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Mano Izquierda</title>
                </circle>

                {/* Pelvis Area */}
                <path
                  d="M 78 147 L 122 147 L 118 168 L 82 168 Z"
                  fill="#e2e8f0"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />

                {/* Right Thigh */}
                <path
                  d="M 76 170 L 97 170 L 95 230 L 73 230 Z"
                  fill={getFill('muslo_der')}
                  stroke={getStroke('muslo_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('muslo_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Muslo Derecho</title>
                </path>

                {/* Left Thigh */}
                <path
                  d="M 103 170 L 124 170 L 127 230 L 105 230 Z"
                  fill={getFill('muslo_izq')}
                  stroke={getStroke('muslo_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('muslo_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Muslo Izquierdo</title>
                </path>

                {/* Knees */}
                <circle
                  cx="84"
                  cy="240"
                  r="9"
                  fill={getFill('rodilla_der')}
                  stroke={getStroke('rodilla_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('rodilla_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Rodilla Derecha</title>
                </circle>
                <circle
                  cx="116"
                  cy="240"
                  r="9"
                  fill={getFill('rodilla_izq')}
                  stroke={getStroke('rodilla_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('rodilla_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Rodilla Izquierda</title>
                </circle>

                {/* Right Leg / Calf */}
                <rect
                  x="75"
                  y="252"
                  width="18"
                  height="65"
                  rx="6"
                  fill={getFill('pierna_der')}
                  stroke={getStroke('pierna_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('pierna_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Pierna Derecha</title>
                </rect>

                {/* Left Leg / Calf */}
                <rect
                  x="107"
                  y="252"
                  width="18"
                  height="65"
                  rx="6"
                  fill={getFill('pierna_izq')}
                  stroke={getStroke('pierna_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('pierna_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Pierna Izquierda</title>
                </rect>

                {/* Feet */}
                <path
                  d="M 70 320 C 70 320, 78 335, 93 335 L 72 335 Z"
                  fill={getFill('pies')}
                  stroke={getStroke('pies')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('pies')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Pie Derecho</title>
                </path>
                <path
                  d="M 130 320 C 130 320, 122 335, 107 335 L 128 335 Z"
                  fill={getFill('pies')}
                  stroke={getStroke('pies')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('pies')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Pie Izquierdo</title>
                </path>
              </g>
            ) : (
              // BACK VIEW SVG
              <g id="back-body" className="cursor-pointer">
                {/* Back of Head */}
                <circle
                  cx="100"
                  cy="32"
                  r="20"
                  fill={getFill('cara')}
                  stroke={getStroke('cara')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('cara')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Nuca / Cabeza</title>
                </circle>

                {/* Neck (back) */}
                <rect
                  x="93"
                  y="52"
                  width="14"
                  height="12"
                  rx="3"
                  fill={getFill('cuello')}
                  stroke={getStroke('cuello')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('cuello')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Cuello posterior</title>
                </rect>

                {/* Upper Back / Espalda Alta */}
                <path
                  d="M 68 66 L 132 66 L 126 108 L 74 108 Z"
                  fill={getFill('espalda_alta')}
                  stroke={getStroke('espalda_alta')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('espalda_alta')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Espalda Alta</title>
                </path>

                {/* Lower Back / Lumbar */}
                <path
                  d="M 74 110 L 126 110 L 122 138 L 78 138 Z"
                  fill={getFill('espalda_baja')}
                  stroke={getStroke('espalda_baja')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('espalda_baja')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Espalda Baja / Zona Lumbar</title>
                </path>

                {/* Gluteus */}
                <path
                  d="M 78 140 L 122 140 L 125 168 L 75 168 Z"
                  fill={getFill('gluteos')}
                  stroke={getStroke('gluteos')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('gluteos')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Glúteos</title>
                </path>

                {/* Left Shoulder (back view: left side = left) */}
                <path
                  d="M 68 66 C 55 68, 50 78, 52 90 L 68 85 Z"
                  fill={getFill('hombro_izq')}
                  stroke={getStroke('hombro_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('hombro_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Hombro Izquierdo (posterior)</title>
                </path>

                {/* Right Shoulder (back view: right side = right) */}
                <path
                  d="M 132 66 C 145 68, 150 78, 148 90 L 132 85 Z"
                  fill={getFill('hombro_der')}
                  stroke={getStroke('hombro_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('hombro_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Hombro Derecho (posterior)</title>
                </path>

                {/* Left Arm (back) */}
                <rect
                  x="45"
                  y="92"
                  width="18"
                  height="34"
                  rx="6"
                  fill={getFill('brazo_izq')}
                  stroke={getStroke('brazo_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('brazo_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Brazo Izquierdo</title>
                </rect>

                {/* Left Elbow (back) */}
                <rect
                  x="43"
                  y="128"
                  width="18"
                  height="16"
                  rx="4"
                  fill={getFill('codo_izq')}
                  stroke={getStroke('codo_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('codo_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Codo Izquierdo</title>
                </rect>

                {/* Right Arm (back) */}
                <rect
                  x="137"
                  y="92"
                  width="18"
                  height="34"
                  rx="6"
                  fill={getFill('brazo_der')}
                  stroke={getStroke('brazo_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('brazo_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Brazo Derecho</title>
                </rect>

                {/* Right Elbow (back) */}
                <rect
                  x="139"
                  y="128"
                  width="18"
                  height="16"
                  rx="4"
                  fill={getFill('codo_der')}
                  stroke={getStroke('codo_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('codo_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Codo Derecho</title>
                </rect>

                {/* Legs back */}
                <path
                  d="M 76 170 L 97 170 L 95 240 L 73 240 Z"
                  fill={getFill('muslo_izq')}
                  stroke={getStroke('muslo_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('muslo_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Parte trasera muslo izq</title>
                </path>
                <path
                  d="M 103 170 L 124 170 L 127 240 L 105 240 Z"
                  fill={getFill('muslo_der')}
                  stroke={getStroke('muslo_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('muslo_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Parte trasera muslo der</title>
                </path>

                {/* Calves back */}
                <rect
                  x="75"
                  y="244"
                  width="18"
                  height="72"
                  rx="6"
                  fill={getFill('pierna_izq')}
                  stroke={getStroke('pierna_izq')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('pierna_izq')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Gemelo Izquierdo</title>
                </rect>
                <rect
                  x="107"
                  y="244"
                  width="18"
                  height="72"
                  rx="6"
                  fill={getFill('pierna_der')}
                  stroke={getStroke('pierna_der')}
                  strokeWidth="2"
                  onClick={() => toggleRegion('pierna_der')}
                  className="hover:opacity-80 transition-all"
                >
                  <title>Gemelo Derecho</title>
                </rect>
              </g>
            )}
          </svg>
        </div>

        {/* Quick select tags and custom description input */}
        <div className="md:col-span-7 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción en la hoja (UbicaciónCuerpo)
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => onCustomTextChange(e.target.value)}
              placeholder="Ej: Brazo izquierdo, zona codo / Entre codo y hombro..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Puedes escribir libremente o tocar los botones anatómicos abajo para rellenar
              automáticamente.
            </p>
          </div>

          {/* Quick anatomical buttons grouped */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Zonas rápidas frecuentes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BODY_REGIONS.map((region) => {
                const selected = isSelected(region.id);
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => toggleRegion(region.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                      selected
                        ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-rose-600 shrink-0" />}
                    <span>{region.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
