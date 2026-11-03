import React, { useState, useEffect, useRef } from 'react';
import {
  Wind,
  ChevronDown,
  ChevronUp,
  MapPin,
  X,
  Search,
  AlertCircle,
  Globe,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { searchGlobalCity, CityCoordinates } from '../utils/geoSearch';

export interface PollenLevel {
  name: string;
  category: string;
  level: 'Muy Bajo' | 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  description: string;
}

export interface GlobalStation {
  name: string;
  locationLabel: string;
  country: string;
  items: PollenLevel[];
}

/**
 * Complete list of allergenic plants & environmental triggers (10 species/allergens)
 */
export function calculateAllAllergens(
  cityName: string,
  country: string,
  latitude: number,
  admin1?: string
): PollenLevel[] {
  const currentMonth = new Date().getMonth(); // 0 = Enero, 10 = Noviembre
  const isTropical = Math.abs(latitude) < 23.5;
  const isSouthernHemisphere = latitude < 0;

  // 1. TROPICAL ZONES (e.g. Caracas, Bogotá, Santo Domingo, Panamá)
  if (isTropical) {
    return [
      {
        name: 'Ácaros del Polvo (Dermatophagoides)',
        category: 'Humedad tropical',
        level: 'Muy Alto',
        badgeBg: 'bg-rose-50 border-rose-200',
        badgeText: 'text-rose-700',
        dotColor: 'bg-rose-500',
        description: `Humedad constante y clima cálido en ${cityName}: máxima actividad en colchones y tejidos.`,
      },
      {
        name: 'Esporas de Moho (Hongos)',
        category: 'Humedad ambiental',
        level: 'Alto',
        badgeBg: 'bg-rose-50 border-rose-200',
        badgeText: 'text-rose-700',
        dotColor: 'bg-rose-500',
        description: 'Aspergillus y Cladosporium abundantes tras lluvias tropicales y nieblas.',
      },
      {
        name: 'Gramíneas y Pastizales',
        category: 'Gramíneas',
        level: 'Moderado',
        badgeBg: 'bg-orange-50 border-orange-200',
        badgeText: 'text-orange-700',
        dotColor: 'bg-orange-500',
        description: 'Pastos perennes en cerros, montañas y bordes de carreteras.',
      },
      {
        name: 'Parietaria / Urticáceas',
        category: 'Maleza',
        level: 'Bajo',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Familia de las ortigas en paredes, muros viejos y solares.',
      },
      {
        name: 'Artemisia / Malezas compuestas',
        category: 'Maleza',
        level: 'Bajo',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Plantas silvestres en terrenos baldíos.',
      },
      {
        name: 'Plátano de Sombra',
        category: 'Árbol urbano',
        level: 'Muy Bajo',
        badgeBg: 'bg-emerald-50 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        description: 'Arbolado de parques con baja incidencia.',
      },
      {
        name: 'Ciprés (Cupresáceas)',
        category: 'Conífera',
        level: 'Muy Bajo',
        badgeBg: 'bg-emerald-50 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        description: 'Setos ornamentales aislados.',
      },
      {
        name: 'Olivo',
        category: 'Olivo',
        level: 'Muy Bajo',
        badgeBg: 'bg-emerald-50 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        description: 'Sin cultivo agrícola en esta latitud.',
      },
      {
        name: 'Abedul / Aliso',
        category: 'Árbol frío',
        level: 'Muy Bajo',
        badgeBg: 'bg-emerald-50 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        description: 'Especie ausente en el trópico.',
      },
      {
        name: 'Polvo sahariano / Calima',
        category: 'Ambiental',
        level: 'Bajo',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Partículas en suspensión e inversión térmica.',
      },
    ];
  }

  // 2. SOUTHERN HEMISPHERE (e.g. Buenos Aires, Santiago, Montevideo, Lima) -> Primavera/Verano en Noviembre
  if (isSouthernHemisphere) {
    return [
      {
        name: 'Gramíneas (Pastos)',
        category: 'Gramíneas',
        level: 'Alto',
        badgeBg: 'bg-rose-50 border-rose-200',
        badgeText: 'text-rose-700',
        dotColor: 'bg-rose-500',
        description: `Plena primavera en ${cityName}: máximo pico anual de polen de pastizales.`,
      },
      {
        name: 'Plátano de Sombra',
        category: 'Árbol urbano',
        level: 'Alto',
        badgeBg: 'bg-rose-50 border-rose-200',
        badgeText: 'text-rose-700',
        dotColor: 'bg-rose-500',
        description: 'Floración masiva en avenidas arboladas y plazas.',
      },
      {
        name: 'Parietaria / Malezas',
        category: 'Maleza',
        level: 'Moderado',
        badgeBg: 'bg-orange-50 border-orange-200',
        badgeText: 'text-orange-700',
        dotColor: 'bg-orange-500',
        description: 'Crecimiento vegetal acelerado con las temperaturas templadas.',
      },
      {
        name: 'Ácaros ambientales',
        category: 'Humedad',
        level: 'Moderado',
        badgeBg: 'bg-orange-50 border-orange-200',
        badgeText: 'text-orange-700',
        dotColor: 'bg-orange-500',
        description: 'Proliferan con el calor y humedad primaveral.',
      },
      {
        name: 'Ciprés (Cupresáceas)',
        category: 'Conífera',
        level: 'Bajo',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Remisión tras la floración de finales de invierno.',
      },
      {
        name: 'Artemisia / Compuestas',
        category: 'Maleza',
        level: 'Bajo',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Inicio de floración en terrenos abiertos.',
      },
      {
        name: 'Olivo',
        category: 'Olivo',
        level: 'Bajo',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Presente en regiones agrícolas del cono sur.',
      },
      {
        name: 'Esporas de Moho',
        category: 'Humedad',
        level: 'Bajo',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Alternaria tras jornadas húmedas.',
      },
      {
        name: 'Abedul / Aliso',
        category: 'Árbol',
        level: 'Muy Bajo',
        badgeBg: 'bg-emerald-50 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        description: 'Inactivo.',
      },
      {
        name: 'Ceñiglos (Chenopodium)',
        category: 'Maleza',
        level: 'Muy Bajo',
        badgeBg: 'bg-emerald-50 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        description: 'Sin brotes destacados.',
      },
    ];
  }

  // 3. NORTHERN TEMPERATE ZONES (Spain, Portugal, Europe, USA) -> Otoño / Invierno
  return [
    {
      name: 'Cupresáceas (Ciprés / Tuya)',
      category: 'Conífera',
      level: 'Bajo',
      badgeBg: 'bg-amber-50 border-amber-200',
      badgeText: 'text-amber-700',
      dotColor: 'bg-amber-500',
      description: `Temporada fría en ${cityName}: inicio de polinización en setos y cementerios.`,
    },
    {
      name: 'Parietaria (Urticácea)',
      category: 'Maleza',
      level: 'Moderado',
      badgeBg: 'bg-orange-50 border-orange-200',
      badgeText: 'text-orange-700',
      dotColor: 'bg-orange-500',
      description: 'Familia de las ortigas, activa en muros húmedos y costas.',
    },
    {
      name: 'Ácaros y Humedad interior',
      category: 'Humedad',
      level: 'Moderado',
      badgeBg: 'bg-orange-50 border-orange-200',
      badgeText: 'text-orange-700',
      dotColor: 'bg-orange-500',
      description: 'Encendido de calefacciones e interiores con poca ventilación.',
    },
    {
      name: 'Esporas de Moho (Cladosporium)',
      category: 'Humedad',
      level: 'Bajo',
      badgeBg: 'bg-amber-50 border-amber-200',
      badgeText: 'text-amber-700',
      dotColor: 'bg-amber-500',
      description: 'Hojarasca caída en descomposición por lluvias otoñales.',
    },
    {
      name: 'Artemisia',
      category: 'Maleza',
      level: 'Bajo',
      badgeBg: 'bg-amber-50 border-amber-200',
      badgeText: 'text-amber-700',
      dotColor: 'bg-amber-500',
      description: 'Últimos granos de la floración de otoño.',
    },
    {
      name: 'Gramíneas silvestres',
      category: 'Gramíneas',
      level: 'Muy Bajo',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      description: 'En reposo total durante el otoño e invierno.',
    },
    {
      name: 'Olivo',
      category: 'Olivo',
      level: 'Muy Bajo',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      description: 'Sin polinización hasta mayo.',
    },
    {
      name: 'Plátano de Sombra',
      category: 'Árbol urbano',
      level: 'Muy Bajo',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      description: 'Árboles sin hojas, brote esperado en marzo.',
    },
    {
      name: 'Abedul (Betula)',
      category: 'Árbol norteño',
      level: 'Muy Bajo',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      description: 'Brote invernal tardío hacia febrero/marzo.',
    },
    {
      name: 'Ceñiglos (Chenopodium)',
      category: 'Maleza',
      level: 'Muy Bajo',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      description: 'Inactiva.',
    },
  ];
}

const DEFAULT_STATION: GlobalStation = {
  name: 'Madrid',
  locationLabel: 'Madrid, España',
  country: 'España',
  items: calculateAllAllergens('Madrid', 'España', 40.41),
};

const STORAGE_KEY = 'urtika_global_pollen_all_v4';

export const PollenWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Active Station
  const [activeStation, setActiveStation] = useState<GlobalStation>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.items) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_STATION;
  });

  // Search input state
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<CityCoordinates[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Pagination for cards: window startIndex
  const [startIndex, setStartIndex] = useState<number>(0);

  const pollenItems = activeStation.items;

  // Move carousel window by 1
  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : pollenItems.length - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % pollenItems.length);
  };

  // Handle station selection
  const handleSelectCity = (city: CityCoordinates) => {
    const items = calculateAllAllergens(city.name, city.country, city.latitude, city.admin1);
    const locationLabel = `${city.name}${city.admin1 ? `, ${city.admin1}` : ''} (${city.country})`;

    const newStation: GlobalStation = {
      name: city.name,
      locationLabel,
      country: city.country,
      items,
    };

    setActiveStation(newStation);
    setCurrentIndex(0);
    setStartIndex(0);
    setSearchInput('');
    setSearchResults([]);
    setSearchError(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStation));
    } catch (e) {
      // ignore
    }
  };

  // Live worldwide search when typing
  useEffect(() => {
    const query = searchInput.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const delay = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchGlobalCity(query);
      setIsSearching(false);

      if (results.length > 0) {
        setSearchResults(results);
        setSearchError(null);
      } else {
        setSearchResults([]);
        setSearchError(`No encontramos resultados para "${query}". Intenta escribir el nombre completo.`);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [searchInput]);

  // Auto-carousel when collapsed
  useEffect(() => {
    if (isExpanded || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pollenItems.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isExpanded, isPaused, pollenItems.length]);

  const activeItem = pollenItems[currentIndex] || pollenItems[0];

  // Helper to get visible items in cyclic window: shows 4 on desktop, 2 on tablet, 1 on small mobile
  const getVisibleItems = () => {
    const items: { item: PollenLevel; index: number }[] = [];
    const count = 4; // Max visible in window
    for (let i = 0; i < count; i++) {
      const idx = (startIndex + i) % pollenItems.length;
      items.push({ item: pollenItems[idx], index: idx });
    }
    return items;
  };

  const visibleCards = getVisibleItems();

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-slate-50 border-b border-slate-200 text-xs select-none transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2">
        {/* CASE 1: COLLAPSED (Clean single line rotating through ALL plants) */}
        {!isExpanded ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Wind className="w-3 h-3" />
              </span>

              <span className="font-bold text-slate-700 text-xs shrink-0">
                Polen:
              </span>

              <div
                key={`${activeStation.name}-${activeItem.name}`}
                className="inline-flex items-center gap-1.5 min-w-0 animate-in fade-in slide-in-from-right-2 duration-300"
              >
                <span className="font-semibold text-slate-800 text-xs truncate max-w-[130px] sm:max-w-none">
                  {activeItem.name}
                </span>

                <span
                  className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full border ${activeItem.badgeBg} ${activeItem.badgeText} shrink-0`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeItem.dotColor}`}></span>
                  <span>{activeItem.level}</span>
                </span>

                <span className="hidden md:inline text-slate-500 text-[11px] truncate">
                  📍 {activeStation.name} · {activeItem.description}
                </span>
              </div>

              {/* Counter Pill */}
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded shrink-0">
                {currentIndex + 1}/{pollenItems.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setStartIndex(currentIndex);
                setIsExpanded(true);
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 transition-colors shrink-0 shadow-2xs"
            >
              <span>Ver todas ({pollenItems.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        ) : (
          /* CASE 2: EXPANDED (Ultra-compact, slim profile: ~160px height, space-efficient) */
          <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-2.5 space-y-2 shadow-xs animate-in fade-in duration-150">
            {/* Top Bar: Compact City badge + Search Input inline + Close button */}
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              {/* Location Tag */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-900 truncate max-w-[150px] sm:max-w-[200px]">
                  {activeStation.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  ({startIndex + 1}-{Math.min(startIndex + 4, pollenItems.length)} de {pollenItems.length})
                </span>
              </div>

              {/* Compact Inline Search Box */}
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Escribe otra ciudad..."
                    className="w-full pl-7 pr-6 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  {isSearching ? (
                    <Loader2 className="w-3 h-3 text-slate-400 animate-spin absolute right-2 top-2" />
                  ) : searchInput ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setSearchResults([]);
                      }}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : null}
                </div>

                {/* Live Worldwide Results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden divide-y divide-slate-100">
                    {searchResults.map((city) => (
                      <button
                        key={`${city.name}-${city.latitude}-${city.longitude}`}
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors"
                      >
                        <span className="font-semibold text-slate-800 truncate">
                          {city.name} {city.admin1 ? `(${city.admin1})` : ''}
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium shrink-0 ml-1">
                          {city.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Alert */}
            {searchError && (
              <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[10px] flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* COMPACT MULTI-CARD STEPPER CAROUSEL */}
            <div className="flex items-center gap-1.5 py-0.5">
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-12 sm:w-8 sm:h-14 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 transition-colors shrink-0 shadow-2xs"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Multi-card display (Compact cards) */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 overflow-hidden">
                {visibleCards.map(({ item, index }, cardPos) => (
                  <div
                    key={`${item.name}-${index}`}
                    className={`p-2 rounded-lg border bg-slate-50/70 border-slate-200 space-y-1 shadow-2xs transition-all ${
                      cardPos > 0 ? 'hidden sm:block' : ''
                    } ${cardPos > 1 ? 'hidden lg:block' : ''}`}
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold border-b border-slate-200/50 pb-0.5">
                      <span className="uppercase tracking-wider truncate max-w-[100px]">
                        {item.category}
                      </span>
                      <span className="font-mono text-slate-500 shrink-0">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-bold text-slate-900 text-[11px] truncate" title={item.name}>
                        {item.name}
                      </h5>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${item.badgeBg} ${item.badgeText} shrink-0`}
                      >
                        <span className={`w-1 h-1 rounded-full ${item.dotColor}`}></span>
                        <span>{item.level}</span>
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-12 sm:w-8 sm:h-14 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 transition-colors shrink-0 shadow-2xs"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
