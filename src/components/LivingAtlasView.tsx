import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useAtlas } from '../context/AtlasContext';
import { Asset, Finding } from '../types/atlas';

export const LivingAtlasView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const terrainLayerRef = useRef<L.LayerGroup | null>(null);
  const populationLayerRef = useRef<L.LayerGroup | null>(null);
  const climateLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    assets,
    findings,
    selectedAssetId,
    setSelectedAssetId,
    setSelectedFindingId,
    setActiveTab,
  } = useAtlas();

  // Primary Side Panel Tab: 'layers' or 'asset'
  const [activeSideTab, setActiveSideTab] = useState<'layers' | 'asset'>('layers');

  // Filters & Base Layer
  const [selectedHazard, setSelectedHazard] = useState<string>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');
  const [mapTheme, setMapTheme] = useState<'dark' | 'positron' | 'satellite'>('dark');

  // Core Analytical Layers State
  const [showTerrain, setShowTerrain] = useState<boolean>(true);
  const [terrainOpacity, setTerrainOpacity] = useState<number>(65);

  const [showPopulation, setShowPopulation] = useState<boolean>(true);
  const [populationOpacity, setPopulationOpacity] = useState<number>(60);

  const [showClimateHeatmap, setShowClimateHeatmap] = useState<boolean>(true);
  const [climateOpacity, setClimateOpacity] = useState<number>(70);

  const [showCatchments, setShowCatchments] = useState<boolean>(true);
  const [showRoadCorridors, setShowRoadCorridors] = useState<boolean>(true);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;
  const relatedFinding = findings.find((f) => f.assetId === selectedAsset?.id);

  // Automatically switch to asset inspection tab if user clicks an asset
  useEffect(() => {
    if (selectedAssetId) {
      setActiveSideTab('asset');
    }
  }, [selectedAssetId]);

  // 1. Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on the Great Rift Valley Corridor: Nakuru - Naivasha - Mai Mahiu
      const map = L.map(mapContainerRef.current, {
        center: [-0.65, 36.42],
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      });

      const tileUrl =
        mapTheme === 'positron'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : mapTheme === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO / Esri',
        maxZoom: 19,
      }).addTo(map);

      // Create dedicated layer groups in specific z-order
      terrainLayerRef.current = L.layerGroup().addTo(map);
      populationLayerRef.current = L.layerGroup().addTo(map);
      climateLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Base tile update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileUrl =
      mapTheme === 'positron'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : mapTheme === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO / Esri',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [mapTheme]);

  // 3. Terrain Elevation Layer rendering
  useEffect(() => {
    if (!terrainLayerRef.current) return;
    terrainLayerRef.current.clearLayers();

    if (!showTerrain) return;

    const op = terrainOpacity / 100;

    // High Escarpment Ridge (>2,400m a.s.l. - Kijabe / Kinangop crest)
    const highEscarpment = L.polygon(
      [
        [-0.88, 36.60],
        [-0.92, 36.68],
        [-1.08, 36.69],
        [-1.02, 36.58],
      ],
      {
        color: '#d97706',
        weight: 1.5,
        fillColor: '#b45309',
        fillOpacity: 0.28 * op,
      }
    );
    highEscarpment.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-amber-400 font-mono">High Escarpment Ridge</strong>
        <div class="text-[10px] text-slate-300">Elevation: 2,400m - 2,750m a.s.l.</div>
        <div class="text-[10px] text-slate-400">Slope: 28° - 42° steep volcanic scarp</div>
      </div>`,
      { sticky: true }
    );
    terrainLayerRef.current.addLayer(highEscarpment);

    // Mid Escarpment Slopes (2,000m - 2,400m a.s.l. - Mai Mahiu descent)
    const midSlope = L.polygon(
      [
        [-0.78, 36.45],
        [-0.84, 36.58],
        [-1.04, 36.57],
        [-0.98, 36.42],
      ],
      {
        color: '#f59e0b',
        weight: 1.5,
        fillColor: '#d97706',
        fillOpacity: 0.22 * op,
      }
    );
    midSlope.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-amber-300 font-mono">Mid-Slope Escarpment Corridor</strong>
        <div class="text-[10px] text-slate-300">Elevation: 2,000m - 2,400m a.s.l.</div>
        <div class="text-[10px] text-slate-400">Dispersive pyroclastic alluvium & high erosion energy</div>
      </div>`,
      { sticky: true }
    );
    terrainLayerRef.current.addLayer(midSlope);

    // Rift Valley Floor (1,800m - 2,000m a.s.l. - Naivasha plain / Suswa basin)
    const riftFloor = L.polygon(
      [
        [-0.60, 36.26],
        [-0.68, 36.44],
        [-0.92, 36.41],
        [-0.88, 36.22],
      ],
      {
        color: '#84cc16',
        weight: 1,
        fillColor: '#65a30d',
        fillOpacity: 0.16 * op,
      }
    );
    riftFloor.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-lime-300 font-mono">Central Rift Valley Graben Floor</strong>
        <div class="text-[10px] text-slate-300">Elevation: 1,850m - 1,980m a.s.l.</div>
        <div class="text-[10px] text-slate-400">Porous volcanic silt & flat alluvial outwash</div>
      </div>`,
      { sticky: true }
    );
    terrainLayerRef.current.addLayer(riftFloor);

    // Topographic Elevation Contour Lines
    const contourLines = [
      [[-0.96, 36.55], [-0.98, 36.60], [-1.02, 36.62]],
      [[-0.92, 36.52], [-0.94, 36.58], [-0.99, 36.59]],
      [[-0.82, 36.36], [-0.85, 36.40], [-0.89, 36.43]],
    ];
    contourLines.forEach((pts, idx) => {
      const line = L.polyline(pts as [number, number][], {
        color: '#d97706',
        weight: 1,
        dashArray: '3, 4',
        opacity: 0.6 * op,
      });
      line.bindTooltip(`Index Contour: ${2200 - idx * 200}m`, { sticky: true });
      terrainLayerRef.current?.addLayer(line);
    });
  }, [showTerrain, terrainOpacity]);

  // 4. Population Density Layer rendering
  useEffect(() => {
    if (!populationLayerRef.current) return;
    populationLayerRef.current.clearLayers();

    if (!showPopulation) return;

    const op = populationOpacity / 100;

    // High Density Urban Core: Nakuru East & Bondeni (>4,200 inhab/km²)
    const nakuruCore = L.circle([-0.2872, 36.0825], {
      radius: 3800,
      color: '#e11d48',
      fillColor: '#be123c',
      fillOpacity: 0.35 * op,
      weight: 1.5,
    });
    nakuruCore.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-rose-400 font-mono">High Urban Density: Nakuru East</strong>
        <div class="text-[10px] text-slate-200">Density: ~4,600 / km² · 185,000 residents</div>
        <div class="text-[10px] text-rose-300">Exposure: High flash surcharge risk into informal housing</div>
      </div>`,
      { sticky: true }
    );
    populationLayerRef.current.addLayer(nakuruCore);

    // Peri-Urban Node: Mai Mahiu Town Center (~1,850 inhab/km²)
    const maiMahiuNode = L.circle([-0.9856, 36.5912], {
      radius: 2600,
      color: '#f97316',
      fillColor: '#ea580c',
      fillOpacity: 0.32 * op,
      weight: 1.5,
    });
    maiMahiuNode.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-orange-400 font-mono">Mai Mahiu Mixed Transit Settlement</strong>
        <div class="text-[10px] text-slate-200">Density: ~1,850 / km² · 34,000 residents</div>
        <div class="text-[10px] text-amber-300">Critical exposure: Heavy freight transit & market stalls</div>
      </div>`,
      { sticky: true }
    );
    populationLayerRef.current.addLayer(maiMahiuNode);

    // Naivasha Sub-County Urban Hub (~2,400 inhab/km²)
    const naivashaHub = L.circle([-0.718, 36.431], {
      radius: 4200,
      color: '#f59e0b',
      fillColor: '#d97706',
      fillOpacity: 0.28 * op,
      weight: 1.5,
    });
    naivashaHub.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-amber-300 font-mono">Naivasha Urban / Flower Farm Corridor</strong>
        <div class="text-[10px] text-slate-200">Density: ~2,400 / km² · 122,000 residents</div>
        <div class="text-[10px] text-slate-400">High agricultural workforce density near lake littoral</div>
      </div>`,
      { sticky: true }
    );
    populationLayerRef.current.addLayer(naivashaHub);
  }, [showPopulation, populationOpacity]);

  // 5. Historical Climate Heatmap rendering
  useEffect(() => {
    if (!climateLayerRef.current) return;
    climateLayerRef.current.clearLayers();

    if (!showClimateHeatmap) return;

    const op = climateOpacity / 100;

    // Heat Zone 1: Mai Mahiu Extreme Cloudburst Surge Corridor (>85 mm/24h)
    const surgeZone = L.circle([-0.97, 36.57], {
      radius: 5200,
      color: '#3b82f6',
      fillColor: '#2563eb',
      fillOpacity: 0.38 * op,
      weight: 2,
    });
    surgeZone.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-sky-300 font-mono">Historic Cloudburst Surge Zone</strong>
        <div class="text-[10px] text-slate-200">Peak 24h Rainfall: 98.4mm (KMD Naivasha Station)</div>
        <div class="text-[10px] text-sky-400">Rapid catchment concentration: 22 minutes</div>
      </div>`,
      { sticky: true }
    );
    climateLayerRef.current.addLayer(surgeZone);

    // Heat Zone 2: Naivasha - Suswa Volcanic Gulley Anomaly (60 - 85 mm/24h)
    const suswaGully = L.circle([-0.86, 36.40], {
      radius: 4800,
      color: '#06b6d4',
      fillColor: '#0891b2',
      fillOpacity: 0.28 * op,
      weight: 1.5,
    });
    suswaGully.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-cyan-300 font-mono">Suswa Silt Migration Funnel</strong>
        <div class="text-[10px] text-slate-200">Peak 24h Rainfall: 74.2mm</div>
        <div class="text-[10px] text-slate-400">Extreme sub-surface piping in volcanic ash</div>
      </div>`,
      { sticky: true }
    );
    climateLayerRef.current.addLayer(suswaGully);

    // Heat Zone 3: Nakuru Lake Basin Urban Runoff (45 - 60 mm/24h)
    const nakuruStorm = L.circle([-0.29, 36.09], {
      radius: 4200,
      color: '#0284c7',
      fillColor: '#0369a1',
      fillOpacity: 0.25 * op,
      weight: 1.5,
    });
    nakuruStorm.bindTooltip(
      `<div class="font-sans text-xs">
        <strong class="text-blue-300 font-mono">Nakuru Municipal Storm Surge Isohyet</strong>
        <div class="text-[10px] text-slate-200">Peak 24h Rainfall: 68.0mm</div>
        <div class="text-[10px] text-slate-400">Drainage throttle due to solid waste in Bondeni box culvert</div>
      </div>`,
      { sticky: true }
    );
    climateLayerRef.current.addLayer(nakuruStorm);
  }, [showClimateHeatmap, climateOpacity]);

  // 6. Base Infrastructure & Asset Markers rendering
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // Catchment boundaries
    if (showCatchments) {
      const catchmentPolygon = L.polygon(
        [
          [-0.75, 36.30],
          [-0.72, 36.52],
          [-1.05, 36.68],
          [-1.02, 36.45],
        ],
        {
          color: '#38bdf8',
          weight: 1.5,
          opacity: 0.5,
          fillColor: '#0284c7',
          fillOpacity: 0.05,
          dashArray: '4, 4',
        }
      );
      catchmentPolygon.bindTooltip('Mai Mahiu - Suswa Catchment Zone', {
        sticky: true,
        className: 'font-mono text-xs',
      });
      markersLayerRef.current.addLayer(catchmentPolygon);
    }

    // Road corridors
    if (showRoadCorridors) {
      const highwayCorridor = L.polyline(
        [
          [-1.23, 36.69],
          [-0.9856, 36.5912],
          [-0.8521, 36.3892],
          [-0.4932, 36.2918],
          [-0.2872, 36.0825],
        ],
        {
          color: '#f59e0b',
          weight: 3,
          opacity: 0.75,
        }
      );
      highwayCorridor.bindTooltip('A104 / B3 National Highway Corridor', { sticky: true });
      markersLayerRef.current.addLayer(highwayCorridor);
    }

    // Filter assets
    const filteredAssets = assets.filter((asset) => {
      if (selectedCriticality !== 'all' && asset.criticality !== selectedCriticality) {
        return false;
      }
      if (selectedHazard !== 'all') {
        const f = findings.find((find) => find.assetId === asset.id);
        if (!f || f.hazardType !== selectedHazard) return false;
      }
      return true;
    });

    // Asset Markers
    filteredAssets.forEach((asset) => {
      const isSelected = asset.id === selectedAssetId;
      const f = findings.find((find) => find.assetId === asset.id);

      const color =
        asset.conditionRating === 'critical_defect'
          ? '#f43f5e'
          : asset.conditionRating === 'moderate_decay'
          ? '#f59e0b'
          : '#10b981';

      const icon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            background: ${color};
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${color};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: isSelected ? [32, 32] : [24, 24],
        iconAnchor: isSelected ? [16, 16] : [12, 12],
      });

      const marker = L.marker(asset.location, { icon });

      marker.on('click', () => {
        setSelectedAssetId(asset.id);
        if (f) setSelectedFindingId(f.id);
      });

      marker.bindTooltip(
        `<div class="font-sans">
          <div class="font-bold text-xs">${asset.name}</div>
          <div class="text-[10px] text-slate-300 font-mono">${asset.code} · ${asset.type}</div>
          <div class="text-[10px] text-amber-300">${asset.conditionRating.replace('_', ' ')}</div>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      markersLayerRef.current?.addLayer(marker);
    });

    if (selectedAsset) {
      mapInstanceRef.current.flyTo(selectedAsset.location, 13, { duration: 1.2 });
    }
  }, [
    assets,
    findings,
    selectedAssetId,
    selectedHazard,
    selectedCriticality,
    showCatchments,
    showRoadCorridors,
  ]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-105px)] overflow-hidden bg-[#0a0e14]">
      {/* Main Map Viewport */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top-Left Floating Controls */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 bg-[#101722]/90 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-lg text-xs">
          {/* Map Base Layer Switcher */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded">
            <button
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapTheme === 'dark' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Dark Matter
            </button>
            <button
              onClick={() => setMapTheme('positron')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapTheme === 'positron' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Positron
            </button>
            <button
              onClick={() => setMapTheme('satellite')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapTheme === 'satellite' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Quick Filter Select */}
          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-black/60 text-slate-200 border border-white/10 rounded px-2.5 py-1 text-xs outline-none"
          >
            <option value="all">All Hazard Types</option>
            <option value="flash_flood">Flash Flood</option>
            <option value="slope_failure">Slope Failure</option>
            <option value="scour_erosion">Scour Erosion</option>
            <option value="debris_siltation">Debris Siltation</option>
            <option value="urban_waterlogging">Urban Waterlogging</option>
          </select>

          {/* Active Layers Indicator Badge */}
          <button
            onClick={() => setActiveSideTab('layers')}
            className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>
              Layers Panel (
              {[showTerrain, showPopulation, showClimateHeatmap, showCatchments, showRoadCorridors].filter(Boolean).length} Active)
            </span>
          </button>
        </div>

        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Bottom-Left Mini Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-[#101722]/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-white/10 text-[11px] text-slate-300 space-y-1.5 shadow-md">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">
            Asset Status
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical Defect (Imminent Failure)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Moderate Decay (Throttled Capacity)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Good / Nominal</span>
          </div>
        </div>
      </div>

      {/* Right Interactive Side Panel with Toggleable Layers & Asset Inspection */}
      <div className="w-full lg:w-[440px] bg-[#0e141c] border-l border-white/10 flex flex-col h-full overflow-hidden">
        {/* Side Panel Tab Header */}
        <div className="flex items-center border-b border-white/10 bg-[#121924] px-4 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveSideTab('layers')}
            className={`px-3 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors ${
              activeSideTab === 'layers'
                ? 'text-amber-400 border-amber-400 bg-[#0e141c]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Geospatial Layers
          </button>
          <button
            onClick={() => setActiveSideTab('asset')}
            className={`px-3 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors ${
              activeSideTab === 'asset'
                ? 'text-amber-400 border-amber-400 bg-[#0e141c]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Asset Dossier {selectedAsset ? `[${selectedAsset.code}]` : ''}
          </button>
        </div>

        {/* Tab 1: Analytical Toggleable Layers Panel */}
        {activeSideTab === 'layers' && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                Layer Observatory // Geospatial Overlays
              </div>
              <h3 className="text-base font-bold text-white">
                Terrain, Demography & Climate Models
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Toggle multi-source analytical layers to evaluate spatial intersections between steep topography, human density, and extreme rainfall events.
              </p>
            </div>

            {/* 1. Terrain Elevation Layer */}
            <div className="bg-[#121924] border border-white/10 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                    Terrain Elevation & Slopes
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Hypsometric bands & topographic scarp contours
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTerrain}
                    onChange={(e) => setShowTerrain(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400" />
                </label>
              </div>

              {showTerrain && (
                <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Layer Opacity</span>
                      <span className="font-mono text-slate-200">{terrainOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={terrainOpacity}
                      onChange={(e) => setTerrainOpacity(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  {/* Elevation Legend */}
                  <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1.5 text-[11px]">
                    <div className="font-semibold text-slate-300 text-[10px] uppercase">
                      Elevation Bands (SRTM 30m DEM):
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-amber-600 inline-block" />
                        Escarpment Crest
                      </span>
                      <span className="font-mono text-slate-400">&gt;2,400m a.s.l.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-amber-500 inline-block" />
                        Mai Mahiu Slopes
                      </span>
                      <span className="font-mono text-slate-400">2,000m - 2,400m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-lime-600 inline-block" />
                        Rift Valley Floor
                      </span>
                      <span className="font-mono text-slate-400">1,800m - 2,000m</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Population Density Layer */}
            <div className="bg-[#121924] border border-white/10 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                    Population Density & Exposure
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Settlement intensity & peri-urban clusters
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPopulation}
                    onChange={(e) => setShowPopulation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
                </label>
              </div>

              {showPopulation && (
                <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Layer Opacity</span>
                      <span className="font-mono text-slate-200">{populationOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={populationOpacity}
                      onChange={(e) => setPopulationOpacity(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Population Legend */}
                  <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1.5 text-[11px]">
                    <div className="font-semibold text-slate-300 text-[10px] uppercase">
                      Census Density Tiers (KNBS 2019 / WorldPop):
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-rose-600 inline-block" />
                        Nakuru East Urban Core
                      </span>
                      <span className="font-mono text-slate-400">&gt;4,200 inhab/km²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-orange-500 inline-block" />
                        Mai Mahiu Highway Transit Hub
                      </span>
                      <span className="font-mono text-slate-400">~1,850 inhab/km²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-amber-500 inline-block" />
                        Naivasha Littoral Zone
                      </span>
                      <span className="font-mono text-slate-400">~2,400 inhab/km²</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Historical Climate Heatmap Layer */}
            <div className="bg-[#121924] border border-white/10 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
                    Historical Climate & Surge Heatmap
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Precipitation anomaly & cloudburst isohyets
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showClimateHeatmap}
                    onChange={(e) => setShowClimateHeatmap(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
                </label>
              </div>

              {showClimateHeatmap && (
                <div className="space-y-3 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Layer Opacity</span>
                      <span className="font-mono text-slate-200">{climateOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={climateOpacity}
                      onChange={(e) => setClimateOpacity(Number(e.target.value))}
                      className="w-full accent-sky-400"
                    />
                  </div>

                  {/* Climate Legend */}
                  <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1.5 text-[11px]">
                    <div className="font-semibold text-slate-300 text-[10px] uppercase">
                      Precipitation Intensity (KMD Station Archive):
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-blue-600 inline-block" />
                        Mai Mahiu Orographic Surge
                      </span>
                      <span className="font-mono text-slate-400">&gt;85 mm / 24h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-cyan-600 inline-block" />
                        Suswa Runoff Funnel
                      </span>
                      <span className="font-mono text-slate-400">60 - 85 mm / 24h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-2 rounded bg-sky-700 inline-block" />
                        Nakuru Lake Watershed
                      </span>
                      <span className="font-mono text-slate-400">45 - 60 mm / 24h</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Basemap Overlays */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Hydrological Boundaries
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Catchment Watershed Polygons</span>
                <input
                  type="checkbox"
                  checked={showCatchments}
                  onChange={(e) => setShowCatchments(e.target.checked)}
                  className="accent-amber-400"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Highway A104/B3 Corridors</span>
                <input
                  type="checkbox"
                  checked={showRoadCorridors}
                  onChange={(e) => setShowRoadCorridors(e.target.checked)}
                  className="accent-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Selected Asset Detail Inspection Dossier */}
        {activeSideTab === 'asset' && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {selectedAsset ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                      {selectedAsset.code}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        selectedAsset.conditionRating === 'critical_defect'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {selectedAsset.conditionRating.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {selectedAsset.name}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Agency: {selectedAsset.responsibleAgency}
                  </div>
                </div>

                {/* Quick Geotechnical Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/30 p-2.5 rounded border border-white/5">
                    <div className="text-slate-400 text-[10px]">Type & Material</div>
                    <div className="font-medium text-slate-200 capitalize mt-0.5">{selectedAsset.type.replace('_', ' ')}</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded border border-white/5">
                    <div className="text-slate-400 text-[10px]">Elevation</div>
                    <div className="font-mono text-slate-200 mt-0.5">{selectedAsset.elevationMeters}m a.s.l.</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded border border-white/5 col-span-2">
                    <div className="text-slate-400 text-[10px]">Hydraulic / Design Capacity</div>
                    <div className="font-mono text-slate-200 mt-0.5">{selectedAsset.designCapacity}</div>
                  </div>
                </div>

                {/* Connected Finding & Grounded Evidence */}
                {relatedFinding ? (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Associated Finding
                      </span>
                      <span className="text-[11px] font-mono text-rose-400">
                        {relatedFinding.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 bg-black/25 p-3 rounded-lg border border-white/5 space-y-2">
                      <div className="font-medium text-slate-100">{relatedFinding.title}</div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        {relatedFinding.summary}
                      </p>

                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <div className="text-[10px] uppercase font-semibold text-amber-300">
                          Material Claims ({relatedFinding.materialClaims.length}):
                        </div>
                        {relatedFinding.materialClaims.map((claim) => (
                          <div key={claim.id} className="text-[11px] text-slate-300 bg-black/40 p-2 rounded">
                            <div>{claim.claimText}</div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>Ref: {claim.pageOrRecordRef}</span>
                              <span className="text-emerald-400 font-semibold">{claim.confidence} confidence</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {relatedFinding.unresolvedGaps.length > 0 && (
                        <div className="pt-2 border-t border-white/5 text-[10px] text-amber-400/90">
                          <strong>Unresolved Gaps:</strong> {relatedFinding.unresolvedGaps.join('; ')}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No unresolved vulnerability recorded for this asset.</div>
                )}

                {/* Action Bar */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => {
                      if (relatedFinding) setSelectedFindingId(relatedFinding.id);
                      setActiveTab('risk_observatory');
                    }}
                    className="w-full py-2 px-3 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-center"
                  >
                    Inspect Risk Scoring Model
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('action_centre');
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors text-center"
                  >
                    Open Action Plan & Approvals
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 font-mono text-sm">
                  📍
                </div>
                <div className="text-sm font-medium text-slate-200">No Asset Selected</div>
                <p className="text-xs max-w-xs leading-relaxed">
                  Click any marker on the map to inspect its geotechnical attributes, historical baseline, connected material claims, and risk breakdown.
                </p>
                <button
                  onClick={() => setActiveSideTab('layers')}
                  className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300"
                >
                  ← Return to Layers Panel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
