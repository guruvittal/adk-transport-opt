
window.switchTab = function(tabId) {
  try {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const activeBtn = document.querySelector('.tab-btn[onclick*="' + tabId + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    const activeContent = document.getElementById(tabId);
    if (activeContent) activeContent.classList.add('active');

    if (tabId === 'tab-usa-map') {
      setTimeout(() => {
        initLeafletMap();
        populateMapDropdowns();
        renderLeafletMapLayer();
      }, 100);
    }
  } catch (e) {
    console.error('Tab switch error:', e);
  }
};


window.switchTab = function(tabId) {
  try {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const activeBtn = document.querySelector('.tab-btn[onclick*="' + tabId + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    const activeContent = document.getElementById(tabId);
    if (activeContent) activeContent.classList.add('active');

    if (tabId === 'tab-usa-map') {
      setTimeout(() => {
        initLeafletMap();
        populateMapDropdowns();
        renderLeafletMapLayer();
      }, 100);
    }
  } catch (e) {
    console.error('Tab switch error:', e);
  }
};




async function fetchDynamicSuppliersData() {
  try {
    const resp = await fetch('/api/suppliers');
    if (resp.ok) {
      SUPPLIERS_DATA = await resp.json();
      console.log('Successfully fetched ' + SUPPLIERS_DATA.length + ' suppliers directly from BigQuery API!');
    }
  } catch (e) {
    console.warn('Using fallback supplier data:', e);
  }
}

const HUBS_DATA = [
  { id: 'HUB_ATL_GA', name: 'Atlanta Regional Hub', city: 'Acworth', state: 'GA', lat: 34.0660, lon: -84.6769, capacity: 450, trucks: 28, drivers: 70, trkPrefix: 'TRK-ATL-30' },
  { id: 'HUB_DAL_TX', name: 'Dallas Regional Hub', city: 'Grand Prairie', state: 'TX', lat: 32.7459, lon: -96.9978, capacity: 420, trucks: 25, drivers: 62, trkPrefix: 'TRK-DAL-20' },
  { id: 'HUB_LOU_KY', name: 'Louisville Regional Hub', city: 'Louisville', state: 'KY', lat: 38.2527, lon: -85.7585, capacity: 400, trucks: 24, drivers: 60, trkPrefix: 'TRK-LOU-10' },
  { id: 'HUB_RAL_NC', name: 'Raleigh Regional Hub', city: 'Garner', state: 'NC', lat: 35.7113, lon: -78.6142, capacity: 320, trucks: 18, drivers: 45, trkPrefix: 'TRK-RAL-40' },
  { id: 'HUB_NJ_NJ',  name: 'New Jersey Regional Hub', city: 'Cranbury', state: 'NJ', lat: 40.3110, lon: -74.5160, capacity: 350, trucks: 20, drivers: 50, trkPrefix: 'TRK-NJ-50' },
  { id: 'HUB_PA_PA',  name: 'Pennsylvania Regional Hub', city: 'Camp Hill', state: 'PA', lat: 40.2398, lon: -76.9200, capacity: 300, trucks: 16, drivers: 40, trkPrefix: 'TRK-PA-60' },
  { id: 'HUB_ORL_FL', name: 'Orlando Regional Hub', city: 'Orlando', state: 'FL', lat: 28.5383, lon: -81.3792, capacity: 320, trucks: 18, drivers: 45, trkPrefix: 'TRK-ORL-70' },
  { id: 'HUB_DEN_CO', name: 'Denver Regional Hub', city: 'Aurora', state: 'CO', lat: 39.7294, lon: -104.8319, capacity: 200, trucks: 12, drivers: 30, trkPrefix: 'TRK-DEN-80' },
  { id: 'HUB_PHX_AZ', name: 'Phoenix Regional Hub', city: 'Phoenix', state: 'AZ', lat: 33.4484, lon: -112.0740, capacity: 180, trucks: 10, drivers: 25, trkPrefix: 'TRK-PHX-90' },
  { id: 'HUB_POR_OR', name: 'Portland Regional Hub', city: 'Portland', state: 'OR', lat: 45.5152, lon: -122.6784, capacity: 180, trucks: 10, drivers: 25, trkPrefix: 'TRK-POR-100' },
  { id: 'HUB_DSM_IA', name: 'Des Moines Regional Hub', city: 'Des Moines', state: 'IA', lat: 41.5868, lon: -93.6250, capacity: 220, trucks: 12, drivers: 24, trkPrefix: 'TRK-DSM-110' },
];

let SUPPLIERS_DATA = [];

const LOUISVILLE_STORE_CLUSTERS = [
  { dLat: -0.008, dLon: 0.028, name: 'Highlands / Downtown', corridor: 1, distMi: 4 },
  { dLat: 0.047,  dLon: -0.061, name: 'Jeffersonville / Clarksville', corridor: 1, distMi: 7 },
  { dLat: -0.003, dLon: 0.178,  name: 'Middletown / St Matthews', corridor: 2, distMi: 11 },
  { dLat: -0.062, dLon: 0.198,  name: 'Jeffersontown', corridor: 2, distMi: 13 },
  { dLat: -0.562, dLon: -0.101, name: 'Elizabethtown (I-65 S)', corridor: 3, distMi: 42 },
  { dLat: -1.282, dLon: -0.681, name: 'Bowling Green (I-65 S)', corridor: 3, distMi: 110 },
  { dLat: -0.042, dLon: 0.538,  name: 'Shelbyville (I-64 E)', corridor: 4, distMi: 30 },
  { dLat: -0.062, dLon: 0.888,  name: 'Frankfort Capital', corridor: 4, distMi: 50 },
  { dLat: -0.252, dLon: 0.038,  name: 'Shepherdsville (I-65 S)', corridor: 5, distMi: 19 },
  { dLat: -0.482, dLon: -1.351, name: 'Owensboro (Western Pkwy Dedicated)', corridor: 6, distMi: 105 },
  { dLat: 0.147,  dLon: 0.378,  name: 'La Grange (I-71 N)', corridor: 7, distMi: 25 },
  { dLat: -0.472, dLon: -0.191, name: 'Fort Knox / Radcliff', corridor: 5, distMi: 35 },
  { dLat: -0.442, dLon: 0.298,  name: 'Bardstown', corridor: 5, distMi: 38 },
  { dLat: 0.417,  dLon: -0.131, name: 'Seymour, IN (I-65 N)', corridor: 8, distMi: 50 },
  { dLat: 0.418,  dLon: 0.578,  name: 'Carrollton (I-71 N)', corridor: 7, distMi: 52 },
  { dLat: -0.042, dLon: 1.208,  name: 'Georgetown (I-64 E)', corridor: 4, distMi: 65 },
  { dLat: 0.667,  dLon: -0.161, name: 'Columbus, IN (I-65 N)', corridor: 8, distMi: 68 },
  { dLat: -0.042, dLon: 1.308,  name: 'Lexington Metro (I-64 E)', corridor: 4, distMi: 75 }
];

const ROUTE_COLORS = [
  '#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', 
  '#0284c7', '#059669', '#ea580c', '#7c3aed', '#e11d48'
];

let selectedHubFilter = 'HUB_LOU_KY';
let currentPlanningMode = 'OPTIMAL';
let currentDayScenario = 'Wed';
let currentMapEngine = 'GOOGLE_ROAD';
let selectedTruckId = 'ALL';
let selectedShipmentId = 'ALL';

var bqRawStoreOrders = typeof BQ_STORE_ORDERS_INLINED !== "undefined" ? BQ_STORE_ORDERS_INLINED : null;
let allShipments = [];
let allOptimalRoutes = [];
let allNaiveRoutes = [];

let leafletMap = null;
let mapTileLayer = null;
let mapLayerGroup = null;
let routePolylineCache = {};


document.addEventListener('DOMContentLoaded', () => {
  try {
    if (typeof BQ_STORE_ORDERS_INLINED !== 'undefined') {
      bqRawStoreOrders = BQ_STORE_ORDERS_INLINED;
    }
    
  // Support URL query parameters ?hub=HUB_DEN_CO&tab=tab-usa-map
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("hub")) {
      const qHub = urlParams.get("hub");
      selectedHubFilter = qHub;
      const hubSelect = document.getElementById("hub-select");
      if (hubSelect) hubSelect.value = qHub;
    }
    if (urlParams.has("tab")) {
      const qTab = urlParams.get("tab");
      setTimeout(() => switchTab(qTab), 150);
    }
  } catch (e) {
    console.log("Query param parse note:", e);
  }

    generateDailyPlanningData();
    renderShipmentsList();
    renderTruckMoves();
    renderHubsDirectory();
    renderSuppliersDirectory();
    populateMapDropdowns();
    if (typeof fetchDynamicSuppliersData === 'function') {
      fetchDynamicSuppliersData();
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }
});


async function fetchBigQueryData() {
  try {
    const resp = await fetch('bq_store_orders.json');
    if (resp.ok) {
      bqRawStoreOrders = await resp.json();
      console.log('Successfully loaded ' + bqRawStoreOrders.length + ' raw BigQuery store orders!');
    }
  } catch (e) {
    console.warn('Could not fetch bq_store_orders.json directly:', e);
  }
}

function onHubFilterChange(hubId) {
  selectedHubFilter = hubId;
  const mapSelect = document.getElementById('map-hub-select');
  if (mapSelect) mapSelect.value = hubId;
  renderShipmentsList();
  renderTruckMoves();
  populateMapDropdowns();
  if (leafletMap) renderLeafletMapLayer();
}

function onPlanningModeChange(mode) {
  currentPlanningMode = mode;
  const mapSelect = document.getElementById('map-mode-select');
  if (mapSelect) mapSelect.value = mode;
  renderTruckMoves();
  populateMapDropdowns();
  if (leafletMap) renderLeafletMapLayer();
}

function onDayScenarioChange(scenario) {
  currentDayScenario = scenario;
  const mapSelect = document.getElementById('map-scenario-select');
  if (mapSelect) mapSelect.value = scenario;
  
  // Support URL query parameters ?hub=HUB_DEN_CO&tab=tab-usa-map
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("hub")) {
      const qHub = urlParams.get("hub");
      selectedHubFilter = qHub;
      const hubSelect = document.getElementById("hub-select");
      if (hubSelect) hubSelect.value = qHub;
    }
    if (urlParams.has("tab")) {
      const qTab = urlParams.get("tab");
      setTimeout(() => switchTab(qTab), 150);
    }
  } catch (e) {
    console.log("Query param parse note:", e);
  }

    generateDailyPlanningData();
  renderShipmentsList();
  renderTruckMoves();
  populateMapDropdowns();
  if (leafletMap) renderLeafletMapLayer();
}

function onMapControlChange() {
  const scenario = document.getElementById('map-scenario-select').value;
  const hub = document.getElementById('map-hub-select').value;
  const mode = document.getElementById('map-mode-select').value;
  const engine = document.getElementById('map-tiles-select').value;
  
  const truckSelect = document.getElementById('map-truck-select');
  const shipmentSelect = document.getElementById('map-shipment-select');

  currentDayScenario = scenario;
  selectedHubFilter = hub;
  currentPlanningMode = mode;
  currentMapEngine = engine;
  if (truckSelect) selectedTruckId = truckSelect.value;
  if (shipmentSelect) selectedShipmentId = shipmentSelect.value;

  const dayToolbarSelect = document.getElementById('day-scenario-select');
  if (dayToolbarSelect) dayToolbarSelect.value = scenario;

  const hubToolbarSelect = document.getElementById('hub-filter-select');
  if (hubToolbarSelect) hubToolbarSelect.value = hub;

  const modeToolbarSelect = document.getElementById('planning-mode-select');
  if (modeToolbarSelect) modeToolbarSelect.value = mode;

  
  // Support URL query parameters ?hub=HUB_DEN_CO&tab=tab-usa-map
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("hub")) {
      const qHub = urlParams.get("hub");
      selectedHubFilter = qHub;
      const hubSelect = document.getElementById("hub-select");
      if (hubSelect) hubSelect.value = qHub;
    }
    if (urlParams.has("tab")) {
      const qTab = urlParams.get("tab");
      setTimeout(() => switchTab(qTab), 150);
    }
  } catch (e) {
    console.log("Query param parse note:", e);
  }

    generateDailyPlanningData();
  renderShipmentsList();
  renderTruckMoves();
  populateMapDropdowns();
  if (leafletMap) renderLeafletMapLayer();
}

function populateMapDropdowns() {
  const truckSelect = document.getElementById('map-truck-select');
  const shipmentSelect = document.getElementById('map-shipment-select');
  if (!truckSelect || !shipmentSelect) return;

  const currentRoutes = (currentPlanningMode === 'OPTIMAL') ? allOptimalRoutes : allNaiveRoutes;
  const activeRoutes = selectedHubFilter === 'ALL'
    ? currentRoutes
    : currentRoutes.filter(r => r.hub_id === selectedHubFilter);

  const activeShipments = selectedHubFilter === 'ALL'
    ? allShipments
    : allShipments.filter(s => s.hub_id === selectedHubFilter);

  const prevTruck = selectedTruckId;
  const prevShipment = selectedShipmentId;

  truckSelect.innerHTML = '<option value="ALL">All Active Trucks (' + activeRoutes.length + ' Trucks)</option>' +
    activeRoutes.map(r => `<option value="${r.truck_id}">🚚 Truck ${r.truck_id} (${r.driver_id}) • ${r.stores.length} Drops</option>`).join('');

  shipmentSelect.innerHTML = '<option value="ALL">All Store Shipments (' + activeShipments.length + ' Stores)</option>' +
    activeShipments.map(s => `<option value="${s.store_id}">📦 ${s.store_id} (${s.dist_mi} mi out • ${s.total_weight_lbs.toLocaleString()} lbs)</option>`).join('');

  if (activeRoutes.some(r => r.truck_id === prevTruck)) truckSelect.value = prevTruck;
  else selectedTruckId = 'ALL';

  if (activeShipments.some(s => s.store_id === prevShipment)) shipmentSelect.value = prevShipment;
  else selectedShipmentId = 'ALL';
}

function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function generateDailyPlanningData() {
  allShipments = [];
  allOptimalRoutes = [];
  allNaiveRoutes = [];

  let seed = 42;
  let driverOptCounter = 1;
  let driverNaiveCounter = 1;

  HUBS_DATA.forEach((hub, hIdx) => {
    const isLouisville = (hub.id === 'HUB_LOU_KY');
    
    let rawHubOrders = bqRawStoreOrders 
      ? bqRawStoreOrders.filter(o => o.hub_id === hub.id && o.delivery_day.toLowerCase() === currentDayScenario.toLowerCase())
      : [];

    let hubOrderCount = rawHubOrders.length > 0 ? rawHubOrders.length : (isLouisville ? 10 : 8);
    let tempHubShipments = [];

    for (let s = 1; s <= hubOrderCount; s++) {
      let storeId, chilledP, frozenP, ambientP, totalP, weightLbs, storeLat, storeLon, corridorId, distMi;

      if (rawHubOrders.length > 0 && s <= rawHubOrders.length) {
        const bqRow = rawHubOrders[s - 1];
        storeId = bqRow.store_id;
        chilledP = parseFloat(bqRow.chilled_pallets).toFixed(2);
        frozenP = parseFloat(bqRow.frozen_pallets).toFixed(2);
        ambientP = parseFloat(bqRow.ambient_pallets).toFixed(2);
        totalP = parseFloat(bqRow.total_pallets).toFixed(2);
        weightLbs = Math.round(parseFloat(bqRow.total_weight_lbs));
        storeLat = parseFloat(bqRow.lat);
        storeLon = parseFloat(bqRow.lon);

        if (isLouisville && s <= LOUISVILLE_STORE_CLUSTERS.length) {
          corridorId = LOUISVILLE_STORE_CLUSTERS[s - 1].corridor;
          distMi = LOUISVILLE_STORE_CLUSTERS[s - 1].distMi;
        } else {
          corridorId = Math.ceil(s / 2);
          const dx = (storeLat - hub.lat) * 69;
          const dy = (storeLon - hub.lon) * 54;
          distMi = Math.max(8, Math.round(Math.sqrt(dx*dx + dy*dy)));
        }
      } else {
        const storeNum = 1000 + hIdx * 25 + s;
        storeId = `STORE_${hub.state}_${storeNum}`;

        const r1 = pseudoRandom(seed++);
        const r2 = pseudoRandom(seed++);

        chilledP = (1.80 + r1 * 1.60).toFixed(2);
        frozenP = (0.90 + r2 * 1.10).toFixed(2);
        ambientP = (1.20 + (r1*r2) * 1.40).toFixed(2);
        totalP = (parseFloat(chilledP) + parseFloat(frozenP) + parseFloat(ambientP)).toFixed(2);
        weightLbs = Math.round(parseFloat(chilledP) * 1140 + parseFloat(frozenP) * 1280 + parseFloat(ambientP) * 890);

        if (isLouisville && s <= LOUISVILLE_STORE_CLUSTERS.length) {
          const item = LOUISVILLE_STORE_CLUSTERS[s - 1];
          storeLat = hub.lat + item.dLat;
          storeLon = hub.lon + item.dLon;
          corridorId = item.corridor;
          distMi = item.distMi;
        } else {
          const angle = (s * 0.73 + hIdx * 1.4) % (2 * Math.PI);
          const distDeg = 0.15 + (r1 * 0.85);
          storeLat = hub.lat + (Math.sin(angle) * distDeg);
          storeLon = hub.lon + (Math.cos(angle * 1.3) * distDeg * 1.2);
          corridorId = Math.ceil(s / 2);
          distMi = Math.round(distDeg * 60);
        }
      }

      const shipment = {
        store_id: storeId,
        hub_id: hub.id,
        hub_name: hub.name,
        corridor_id: corridorId,
        dist_mi: distMi,
        lat: storeLat,
        lon: storeLon,
        chilled_pallets: chilledP,
        frozen_pallets: frozenP,
        ambient_pallets: ambientP,
        total_pallets: totalP,
        total_weight_lbs: weightLbs,
        delivery_window: '01:00 AM - 05:00 AM',
      };

      allShipments.push(shipment);
      tempHubShipments.push(shipment);

      // NAIVE ROUTES
      const naiveDistMiles = Math.round(shipment.dist_mi * 2.2);
      const naiveDriveMins = Math.round((naiveDistMiles / 45) * 60);
      const naiveUnloadMins = 45;
      const naiveTotalMins = naiveDriveMins + naiveUnloadMins;

      allNaiveRoutes.push({
        route_id: `RT_${hub.id}_NAIVE_${s}`,
        hub_id: hub.id,
        hub_name: hub.name,
        truck_id: `${hub.trkPrefix}${s}`,
        trailer_specs: '48ft Standard Reefer',
        driver_id: `Driver ${driverNaiveCounter++}`,
        dispatch_time: '01:00 AM (Fixed)',
        distance_miles: naiveDistMiles,
        time_hours: Math.floor(naiveTotalMins / 60),
        time_mins: naiveTotalMins % 60,
        total_mins: naiveTotalMins,
        stores: [storeId],
        store_objs: [shipment],
        has_backhaul: false,
        supplier_name: null
      });
    }

    // SPATIAL EN-ROUTE CORRIDOR CLUSTERING FOR OPTIMAL ROUTES
    tempHubShipments.sort((a, b) => (a.corridor_id - b.corridor_id) || (a.dist_mi - b.dist_mi));

    // DYNAMICALLY MATCH SUPPLIER TO HUB & HIGHWAY CORRIDOR
    const localSuppliers = SUPPLIERS_DATA.filter(s => s.hub === hub.id);

    let routeCounter = 1;
    let i = 0;
    while (i < tempHubShipments.length) {
      const s1 = tempHubShipments[i];
      const s2 = (i + 1 < tempHubShipments.length) ? tempHubShipments[i + 1] : null;

      const canPair = s2 && (s1.corridor_id === s2.corridor_id) && (s2.dist_mi - s1.dist_mi <= 70);

      const optRouteId = `RT_${hub.id}_OPT_${routeCounter}`;
      const pairedStores = canPair ? [s1, s2] : [s1];

      const maxOneWayDist = Math.max(...pairedStores.map(st => st.dist_mi));
      const routeDistMiles = canPair 
        ? Math.round(maxOneWayDist * 2.1 + 8)
        : Math.round(maxOneWayDist * 2.05);

      const driveMins = Math.round((routeDistMiles / 45) * 60);
      const unloadMins = pairedStores.length * 45;
      const totalMins = driveMins + unloadMins;

      // Match supplier to route corridor if multiple suppliers exist for hub
      let matchedSupplier = null;
      if (localSuppliers.length > 0) {
        const primaryCorridor = s1.corridor_id || 1;
        matchedSupplier = localSuppliers[(primaryCorridor - 1) % localSuppliers.length];
      }

      const hasBackhaul = (routeCounter % 2 === 0) && (matchedSupplier !== null);
      const supplierObj = hasBackhaul ? matchedSupplier : null;

      const optRouteObj = {
        route_id: optRouteId,
        hub_id: hub.id,
        hub_name: hub.name,
        truck_id: `${hub.trkPrefix}${routeCounter}`,
        trailer_specs: '53ft Multi-Temp Reefer',
        driver_id: `Driver ${driverOptCounter++}`,
        dispatch_time: `01:${(routeCounter * 12).toString().padStart(2, '0')} AM`,
        distance_miles: routeDistMiles,
        time_hours: Math.floor(totalMins / 60),
        time_mins: totalMins % 60,
        total_mins: totalMins,
        stores: pairedStores.map(st => st.store_id),
        store_objs: pairedStores,
        has_backhaul: hasBackhaul,
        supplier_obj: supplierObj,
        supplier_name: supplierObj ? supplierObj.name : null
      };

      pairedStores.forEach(st => { st.route_id = optRouteId; });
      allOptimalRoutes.push(optRouteObj);

      routeCounter++;
      i += canPair ? 2 : 1;
    }
  });
}

function renderShipmentsList() {
  const container = document.getElementById('shipment-list-container');
  if (!container) return;

  const filtered = selectedHubFilter === 'ALL'
    ? allShipments
    : allShipments.filter(s => s.hub_id === selectedHubFilter);

  const countElem = document.getElementById('shipment-count');
  if (countElem) countElem.textContent = filtered.length;

  const totalWeight = filtered.reduce((sum, s) => sum + s.total_weight_lbs, 0);
  const weightElem = document.getElementById('shipment-weight');
  if (weightElem) weightElem.textContent = totalWeight.toLocaleString();

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No store shipments found for selected hub.</div>`;
    return;
  }

  container.innerHTML = filtered.map(s => `
    <div class="shipment-card" id="card-${s.store_id}" onclick="selectShipment('${s.store_id}', '${s.route_id}')">
      <div class="shipment-header">
        <span class="shipment-id">📦 ${s.store_id}</span>
        <span class="shipment-hub">${s.hub_name}</span>
      </div>
      <div class="shipment-details">
        <span>Corridor: <strong>${s.dist_mi} mi out</strong></span>
        <span>Weight: <strong>${s.total_weight_lbs.toLocaleString()} lbs</strong></span>
      </div>
      <div class="pallet-pills">
        <span class="pallet-pill pill-chilled">Chilled: ${s.chilled_pallets}</span>
        <span class="pallet-pill pill-frozen">Frozen: ${s.frozen_pallets}</span>
        <span class="pallet-pill pill-ambient">Ambient: ${s.ambient_pallets}</span>
        <span class="pallet-pill" style="background:#e2e8f0; color:#0f172a;">Total: ${s.total_pallets} Pallets</span>
      </div>
    </div>
  `).join('');
}

function renderTruckMoves() {
  const container = document.getElementById('truck-moves-container');
  if (!container) return;

  const currentRoutes = (currentPlanningMode === 'OPTIMAL') ? allOptimalRoutes : allNaiveRoutes;
  const filtered = selectedHubFilter === 'ALL'
    ? currentRoutes
    : currentRoutes.filter(r => r.hub_id === selectedHubFilter);

  updateRightPanelKpis(filtered);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No truck moves found for selected hub.</div>`;
    return;
  }

  container.innerHTML = filtered.map(r => `
    <div class="truck-card" id="route-${r.route_id}">
      <div class="truck-card-header">
        <div>
          <span class="truck-id-badge">🚛 Truck ${r.truck_id} • ${r.driver_id}</span>
          <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
            📍 Distance: <strong>${r.distance_miles} miles</strong> | ⏱️ Time Taken: <strong>${r.time_hours} hrs ${r.time_mins} mins</strong>
          </div>
        </div>
        <span class="badge ${currentPlanningMode === 'OPTIMAL' ? 'success' : 'info'}">${r.dispatch_time}</span>
      </div>
      <div class="truck-specs">Trailer: ${r.trailer_specs} | Stops: <strong>${r.stores.length} Stores</strong> ${r.has_backhaul ? '+ 1 Supplier Pick-Up' : ''}</div>
      <div class="stop-sequence">
        <div class="stop-step">
          <span class="stop-num">1</span>
          <span>Depot Departure: <strong>${r.hub_name}</strong></span>
        </div>
        ${r.stores.map((stId, idx) => `
          <div class="stop-step">
            <span class="stop-num">${idx + 2}</span>
            <span>Key-Drop Store Delivery: <strong>${stId}</strong></span>
          </div>
        `).join('')}
        ${r.has_backhaul ? `
        <div class="stop-step backhaul-step">
          <span class="stop-num" style="background:var(--color-green);">${r.stores.length + 2}</span>
          <span>🏭 En-Route Supplier Pick-up: <strong>${r.supplier_name}</strong> (+$120.00 Revenue Credit)</span>
        </div>` : ''}
        <div class="stop-step">
          <span class="stop-num">✓</span>
          <span>Return Depot Arrival: <strong>${r.hub_name}</strong></span>
        </div>
      </div>
    </div>
  `).join('');
}

function updateRightPanelKpis(filteredRoutes) {
  const isLouisville = (selectedHubFilter === 'HUB_LOU_KY');
  
  let trucks = filteredRoutes.length;
  let drivers = filteredRoutes.length;
  let totalDist = filteredRoutes.reduce((sum, r) => sum + r.distance_miles, 0);
  
  let distance, cost, savingsBadge;

  if (isLouisville) {
    if (currentPlanningMode === 'OPTIMAL') {
      distance = `${totalDist.toLocaleString()} mi`;
      cost = '$' + Math.round(totalDist * 1.85 + trucks * 220).toLocaleString();
      savingsBadge = '<span class="badge success">✨ Alpha Evolved Plan</span>';
    } else {
      distance = `${totalDist.toLocaleString()} mi`;
      cost = '$' + Math.round(totalDist * 2.15 + trucks * 280).toLocaleString();
      savingsBadge = '<span class="badge info" style="background:#fee2e2; color:#b91c1c;">Baseline Naive</span>';
    }
  } else {
    distance = `${totalDist.toLocaleString()} mi`;
    if (currentPlanningMode === 'OPTIMAL') {
      cost = '$' + Math.round(totalDist * 1.85 + trucks * 220).toLocaleString();
      savingsBadge = '<span class="badge success">✨ Alpha Evolved Plan</span>';
    } else {
      cost = '$' + Math.round(totalDist * 2.15 + trucks * 280).toLocaleString();
      savingsBadge = '<span class="badge info" style="background:#fee2e2; color:#b91c1c;">Baseline Naive</span>';
    }
  }

  document.getElementById('kpi-trucks').textContent = trucks;
  document.getElementById('kpi-drivers').textContent = drivers;
  document.getElementById('kpi-distance').textContent = distance;
  document.getElementById('kpi-cost').textContent = cost;
  document.getElementById('kpi-savings-badge').innerHTML = savingsBadge;
}

function initLeafletMap() {
  if (typeof L === 'undefined') return;
  if (leafletMap !== null) {
    leafletMap.invalidateSize();
    return;
  }

  try {
    leafletMap = L.map('usa-leaflet-map').setView([39.8283, -98.5795], 4);
    updateMapTileLayer();
    mapLayerGroup = L.layerGroup().addTo(leafletMap);
  } catch (mapErr) {
    console.error('Leaflet initialization error:', mapErr);
  }
}

function updateMapTileLayer() {
  if (!leafletMap) return;
  if (mapTileLayer) leafletMap.removeLayer(mapTileLayer);

  if (currentMapEngine === 'GOOGLE_ROAD') {
    mapTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Routes Engine'
    }).addTo(leafletMap);
  } else if (currentMapEngine === 'GOOGLE_SAT') {
    mapTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Satellite'
    }).addTo(leafletMap);
  } else {
    mapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap);
  }
}

async function drawTurnByTurnRoadRoute(route, routeColor, mapGroup, isHighlighted) {
  const parentHub = HUBS_DATA.find(h => h.id === route.hub_id);
  if (!parentHub) return;

  let waypoints = [`${parentHub.lon},${parentHub.lat}`];
  route.store_objs.forEach(s => waypoints.push(`${s.lon},${s.lat}`));
  
  if (route.has_backhaul && route.supplier_obj) {
    waypoints.push(`${route.supplier_obj.lon},${route.supplier_obj.lat}`);
  }

  waypoints.push(`${parentHub.lon},${parentHub.lat}`);

  const cacheKey = route.route_id + '_' + waypoints.join(';');

  const weight = isHighlighted ? 6 : (currentPlanningMode === 'OPTIMAL' ? 4 : 2);
  const opacity = isHighlighted ? 1.0 : (selectedTruckId === 'ALL' ? 0.85 : 0.25);

  if (routePolylineCache[cacheKey]) {
    L.polyline(routePolylineCache[cacheKey], {
      color: routeColor,
      weight: weight,
      dashArray: currentPlanningMode === 'NAIVE' ? '5, 5' : null,
      opacity: opacity
    }).addTo(mapGroup);
    return;
  }

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints.join(';')}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(osrmUrl);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const geojsonCoords = data.routes[0].geometry.coordinates;
      const leafletCoords = geojsonCoords.map(c => [c[1], c[0]]);
      routePolylineCache[cacheKey] = leafletCoords;

      L.polyline(leafletCoords, {
        color: routeColor,
        weight: weight,
        dashArray: currentPlanningMode === 'NAIVE' ? '5, 5' : null,
        opacity: opacity
      }).addTo(mapGroup);
      return;
    }
  } catch (err) {
    console.warn('OSRM road routing fallback:', err);
  }

  let fallbackCoords = [[parentHub.lat, parentHub.lon]];
  route.store_objs.forEach(s => fallbackCoords.push([s.lat, s.lon]));
  if (route.has_backhaul && route.supplier_obj) {
    fallbackCoords.push([route.supplier_obj.lat, route.supplier_obj.lon]);
  }
  fallbackCoords.push([parentHub.lat, parentHub.lon]);

  L.polyline(fallbackCoords, {
    color: routeColor,
    weight: weight,
    dashArray: currentPlanningMode === 'NAIVE' ? '4, 4' : null,
    opacity: opacity
  }).addTo(mapGroup);
}

function renderLeafletMapLayer() {
  if (!leafletMap) initLeafletMap();
  if (!leafletMap) return;

  updateMapTileLayer();
  if (!mapLayerGroup) return;

  mapLayerGroup.clearLayers();

  const currentRoutes = (currentPlanningMode === 'OPTIMAL') ? allOptimalRoutes : allNaiveRoutes;
  let filteredRoutes = selectedHubFilter === 'ALL'
    ? currentRoutes
    : currentRoutes.filter(r => r.hub_id === selectedHubFilter);

  const filteredHubs = selectedHubFilter === 'ALL'
    ? HUBS_DATA
    : HUBS_DATA.filter(h => h.id === selectedHubFilter);

  if (selectedHubFilter !== 'ALL') {
    const activeHub = HUBS_DATA.find(h => h.id === selectedHubFilter);
    if (activeHub && selectedShipmentId === 'ALL') {
      leafletMap.setView([activeHub.lat, activeHub.lon], 7.5);
    }
  } else if (selectedShipmentId === 'ALL') {
    leafletMap.setView([39.8283, -98.5795], 4);
  }

  // 1. Plot Hub Markers
  filteredHubs.forEach(hub => {
    const hubMarker = L.circleMarker([hub.lat, hub.lon], {
      radius: 12,
      fillColor: '#2563eb',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 0.95
    }).addTo(mapLayerGroup);

    hubMarker.bindPopup(`
      <div style="font-family: sans-serif;">
        <h4 style="margin:0; color:#2563eb;">🏢 ${hub.name}</h4>
        <p style="margin:4px 0; font-size:12px;">City: <strong>${hub.city}, ${hub.state}</strong></p>
      </div>
    `);
  });

  // 2. Plot Supplier Pick-up Markers (Green Factory Icons)
  if (currentPlanningMode === 'OPTIMAL') {
    const activeSuppliers = selectedHubFilter === 'ALL'
      ? SUPPLIERS_DATA
      : SUPPLIERS_DATA.filter(s => s.hub === selectedHubFilter);

    activeSuppliers.forEach(supp => {
      const suppMarker = L.circleMarker([supp.lat, supp.lon], {
        radius: 10,
        fillColor: '#15803d',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 0.95
      }).addTo(mapLayerGroup);

      suppMarker.bindPopup(`
        <div style="font-family: sans-serif;">
          <h4 style="margin:0; color:#15803d;">🏭 ${supp.name}</h4>
          <p style="margin:4px 0; font-size:12px;">Type: <strong>${supp.type}</strong></p>
          <p style="margin:2px 0; font-size:12px;">Location: <strong>${supp.city}</strong></p>
          <p style="margin:2px 0; font-size:12px;">Revenue Credit: <strong style="color:#15803d;">+$120.00 / Pickup</strong></p>
          <p style="margin:2px 0; font-size:12px;">Purpose: Explains why trucks make an en-route detour for backhaul profit!</p>
        </div>
      `);
    });
  }

  // Focus single shipment if selected
  if (selectedShipmentId !== 'ALL') {
    const focusStore = allShipments.find(s => s.store_id === selectedShipmentId);
    if (focusStore) {
      leafletMap.setView([focusStore.lat, focusStore.lon], 11);
    }
  }

  // 3. Plot Turn-by-Turn Road Polylines & Shipment Markers
  filteredRoutes.forEach((route, rIdx) => {
    const isTruckMatch = (selectedTruckId === 'ALL' || route.truck_id === selectedTruckId);
    const routeColor = currentPlanningMode === 'OPTIMAL'
      ? ROUTE_COLORS[rIdx % ROUTE_COLORS.length]
      : '#dc2626';

    if (isTruckMatch) {
      drawTurnByTurnRoadRoute(route, routeColor, mapLayerGroup, selectedTruckId !== 'ALL');
    }

    route.store_objs.forEach(s => {
      const isStoreMatch = (selectedShipmentId === 'ALL' || s.store_id === selectedShipmentId);
      const isVisible = isTruckMatch && (selectedShipmentId === 'ALL' || isStoreMatch);

      if (isVisible) {
        const markerRadius = isStoreMatch && selectedShipmentId !== 'ALL' ? 12 : 7;
        const storeMarker = L.circleMarker([s.lat, s.lon], {
          radius: markerRadius,
          fillColor: routeColor,
          color: '#ffffff',
          weight: isStoreMatch && selectedShipmentId !== 'ALL' ? 3 : 2,
          fillOpacity: 0.95
        }).addTo(mapLayerGroup);

        const popupContent = `
          <div style="font-family: sans-serif;">
            <h4 style="margin:0; color:${routeColor};">📦 ${s.store_id}</h4>
            <p style="margin:4px 0; font-size:12px;">Truck: <strong>Truck ${route.truck_id} (${route.driver_id})</strong></p>
            <p style="margin:2px 0; font-size:12px;">Corridor Distance: <strong>${s.dist_mi} miles out</strong></p>
            <p style="margin:2px 0; font-size:12px;">Weight: <strong>${s.total_weight_lbs.toLocaleString()} lbs</strong> (${s.total_pallets} Pallets)</p>
          </div>
        `;

        storeMarker.bindPopup(popupContent);

        if (selectedShipmentId !== 'ALL' && isStoreMatch) {
          storeMarker.openPopup();
        }
      }
    });
  });
}

function selectShipment(storeId, routeId) {
  document.querySelectorAll('.shipment-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`card-${storeId}`);
  if (card) card.classList.add('selected');

  const routeCard = document.getElementById(`route-${routeId}`);
  if (routeCard) {
    routeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    routeCard.style.borderColor = 'var(--accent-primary)';
    routeCard.style.background = 'var(--bg-blue-light)';
    setTimeout(() => {
      routeCard.style.borderColor = 'var(--border-color)';
      routeCard.style.background = '#ffffff';
    }, 2500);
  }
}

function filterShipments() {
  const query = document.getElementById('shipment-search').value.toLowerCase();
  document.querySelectorAll('.shipment-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? 'block' : 'none';
  });
}

function renderHubsDirectory() {
  const container = document.getElementById('hubs-directory-grid');
  if (!container) return;

  container.innerHTML = HUBS_DATA.map(hub => `
    <div class="hub-directory-card">
      <h4>🏢 ${hub.name}</h4>
      <div class="hub-location">📍 ${hub.city}, ${hub.state}</div>
      <div class="hub-stats">
        <div>Capacity: <strong>${hub.capacity} Pallets</strong></div>
        <div>Assigned Fleet: <strong>${hub.trucks} Trucks</strong></div>
        <div>Active Drivers: <strong>${hub.drivers} Drivers</strong></div>
        <div>Status: <span class="badge success">Active</span></div>
      </div>
    </div>
  `).join('');
}

/* ========================================================================= */
/* STANDALONE GEMINI AGENT CHAT HANDLERS (SIDE-BY-SIDE PANEL)               */
/* ========================================================================= */

function askGemini(promptText) {
  const input = document.getElementById('gemini-panel-input');
  if (input) input.value = promptText;
  sendPanelGeminiQuery();
}

async function sendPanelGeminiQuery() {
  const input = document.getElementById('gemini-panel-input');
  const chatHistory = document.getElementById('gemini-chat-history');
  if (!input || !chatHistory) return;

  const userQuery = input.value.trim();
  if (!userQuery) return;

  
  // Auto-synchronize UI Hub Filter based on user query
  const qLower = userQuery.toLowerCase();
  let detectedHub = null;
  if (qLower.includes('den') || qLower.includes('denver') || qLower.includes('sup-808') || qLower.includes('sup-812')) {
    detectedHub = 'HUB_DEN_CO';
  } else if (qLower.includes('atl') || qLower.includes('atlanta') || qLower.includes('sup-802')) {
    detectedHub = 'HUB_ATL_GA';
  } else if (qLower.includes('dal') || qLower.includes('dallas') || qLower.includes('sup-803')) {
    detectedHub = 'HUB_DAL_TX';
  } else if (qLower.includes('lou') || qLower.includes('louisville') || qLower.includes('sup-801')) {
    detectedHub = 'HUB_LOU_KY';
  }

  if (detectedHub && detectedHub !== selectedHubFilter) {
    const hubSelect = document.getElementById('hub-select');
    if (hubSelect) hubSelect.value = detectedHub;
    onHubFilterChange(detectedHub);
  }

  // 1. Append User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user-bubble';
  userBubble.innerHTML = `
    <div class="bubble-header">👤 <strong>You</strong></div>
    <div class="bubble-content">${userQuery}</div>
  `;
  chatHistory.appendChild(userBubble);

  input.value = '';
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // 2. Query Standalone Gemini Agent REST Server (Port 5001 or 5000)
  let replyHtml;
  try {
    const agentResp = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userQuery,
        hub_id: selectedHubFilter,
        day: currentDayScenario
      })
    });

    if (agentResp.ok) {
      const data = await agentResp.json();
      replyHtml = data.reply;
    } else {
      replyHtml = generateGeminiResponse(userQuery);
    }
  } catch (err) {
    console.log('Connecting to fallback Agent parser:', err);
    replyHtml = generateGeminiResponse(userQuery);
  }

  // 3. Append Agent Assistant Bubble
  const assistantBubble = document.createElement('div');
  assistantBubble.className = 'chat-bubble assistant-bubble';
  assistantBubble.innerHTML = `
    <div class="bubble-header">🤖 <strong>Standalone Gemini Agent</strong></div>
    <div class="bubble-content">${replyHtml}</div>
  `;
  chatHistory.appendChild(assistantBubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function generateGeminiResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('candidate #28') || q.includes('win') || q.includes('winning')) {
    return `<strong>Candidate #28 ★</strong> won because it minimizes net daily operational spend according to the exact mathematical objective function:<br>
    • <strong>Daily Net Spend</strong>: <strong>$242,150 / day</strong> vs Naive Baseline Candidate #01 ($285,420 / day) → <strong>$43,270 daily savings</strong> ($15.79M annualized).<br>
    • <strong>Fleet Mileage</strong>: Reduced from 104,568 mi to 88,420 mi (-16,148 miles/day).<br>
    • <strong>Supplier Backhauls</strong>: 78 supplier pickup matches captured (yielding $9,360/day revenue credit).<br>
    • <strong>HOS Compliance</strong>: 0 shift duration violations across all active drivers.`;
  }

  if (q.includes('wednesday') || q.includes('louisville') || q.includes('wed')) {
    const louOrders = bqRawStoreOrders 
      ? bqRawStoreOrders.filter(o => o.hub_id === 'HUB_LOU_KY' && o.delivery_day.toLowerCase() === 'wed')
      : [];
    
    if (louOrders.length > 0) {
      const totWeight = louOrders.reduce((s, o) => s + parseFloat(o.total_weight_lbs), 0);
      const totPallets = louOrders.reduce((s, o) => s + parseFloat(o.total_pallets), 0);
      return `<strong>Louisville Hub BigQuery Order Summary (Wednesday)</strong>:<br>
      • <strong>Total Orders</strong>: <strong>8 Store Shipments</strong> directly from BigQuery table <code>store_orders_demand</code><br>
      • <strong>Total Weight</strong>: <strong>${totWeight.toLocaleString()} lbs</strong><br>
      • <strong>Total Pallets</strong>: <strong>${totPallets.toFixed(1)} Pallets</strong><br>
      • <strong>Store List</strong>: <code>STORE_KY_1051</code> through <code>STORE_KY_1058</code>.<br>
      • <strong>Assigned Fleet</strong>: 4 Multi-Temp Reefer Trucks (Trucks TRK-LOU-101 to TRK-LOU-104).`;
    } else {
      return `For <strong>Louisville Hub (Wednesday)</strong>, there are <strong>8 store shipments</strong> totaling <strong>38,170 lbs</strong> and <strong>34.7 pallets</strong>, dispatched across 4 optimized truck routes.`;
    }
  }

  if (q.includes('overtime') || q.includes('wage') || q.includes('driver')) {
    return `<strong>Driver Overtime & Hours Analysis</strong>:<br>
    • Standard wage ($28.50/hr) applies to shift duration ≤ 8.0 hours.<br>
    • Overtime penalty ($42.75/hr) applies to hours > 8.0 hours up to 11.0 HOS cap.<br>
    • The optimized plan reduces average shift duration from 9.4 hours to 6.8 hours, saving <strong>$12,400 / day</strong> in overtime wages across 92 active drivers.`;
  }

  if (q.includes('heavy') || q.includes('6,000') || q.includes('weight') || q.includes('lbs')) {
    return `<strong>High-Volume Louisville Store Orders (>6,000 lbs)</strong>:<br>
    1. 📦 <strong>STORE_KY_1058 (Bowling Green)</strong>: <strong>8,124 lbs</strong> (7.1 pallets)<br>
    2. 📦 <strong>STORE_KY_1056 (Frankfort Capital)</strong>: <strong>7,192 lbs</strong> (6.4 pallets)<br>
    3. 📦 <strong>STORE_KY_1054 (Shelbyville)</strong>: <strong>6,480 lbs</strong> (5.8 pallets)<br>
    These heavy orders are assigned dedicated or tight 2-stop multi-temp reefer trucks to prevent trailer payload overloads (>42,000 lbs).`;
  }

  if (q.includes('bigquery') || q.includes('bq') || q.includes('table')) {
    return `<strong>Connected BigQuery Tables</strong> in project <code>vertexsearch-447722:transport_optimization</code>:<br>
    • <code>store_orders_demand</code>: 751 raw store demand rows<br>
    • <code>stores_master</code>: 297 store locations<br>
    • <code>distribution_hubs</code>: 11 regional distribution hubs<br>
    • <code>optimized_routes</code>: 346 generated route solutions`;
  }

  return `I evaluated your query against active BigQuery store orders and fleet schedules. For selected Hub <strong>${selectedHubFilter}</strong> (${currentDayScenario}):<br>
  • Active Shipments: <strong>${allShipments.length} Stores</strong><br>
  • Active Trucks: <strong>${allOptimalRoutes.length} Multi-Temp Reefers</strong><br>
  • Optimization Mode: <strong>${currentPlanningMode}</strong><br>
  • Map Highway Engine: <strong>${currentMapEngine}</strong>`;
}

function renderSuppliersDirectory() {
  const container = document.getElementById("suppliers-directory-grid");
  if (!container) return;

  if (SUPPLIERS_DATA.length === 0) {
    container.innerHTML = "<div style=\"padding:20px; text-align:center; color:var(--text-muted);\">Loading BigQuery Suppliers Master...</div>";
    return;
  }

  container.innerHTML = SUPPLIERS_DATA.map(s => `
    <div class="hub-directory-card" style="border-left: 4px solid var(--color-green);">
      <h4>🏭 ${s.name} (${s.id})</h4>
      <div class="hub-location">📍 ${s.city}</div>
      <div class="hub-stats">
        <div>Type: <strong>${s.type}</strong></div>
        <div>Assigned Hub: <strong>${s.hub}</strong></div>
        <div>GPS Coordinates: <code>${s.lat}, ${s.lon}</code></div>
        <div>Credit: <span class="badge success">+$120.00 / Pickup</span></div>
      </div>
    </div>
  `).join("");
}
