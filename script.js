// ============================================================
// CSV DATA LOADER  –  loads all data/ CSVs and patches globals
// ============================================================

// ---- Generic CSV parser -----
// Returns an array of objects keyed by the header row.
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
  });
}

function safeNum(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }

// ---- Load all CSVs in parallel ----
async function loadAllCSVs() {
  const files = [
    'data/country_metrics.csv',
    'data/vehicle_prices.csv',
    'data/city_data.csv',
    'data/charge_specs.csv',
    'data/use_case_multipliers.csv',
    'data/phased_deployment_ramp.csv',
    'data/marketplace_segment_defaults.csv',
    'data/model_assumptions.csv',
  ];
  const results = await Promise.all(
    files.map(f =>
      fetch(f)
        .then(r => { if (!r.ok) throw new Error(f + ' not found'); return r.text(); })
        .catch(() => null)          // graceful: null means skip this file
    )
  );
  return {
    countryMetrics:  results[0] ? parseCSV(results[0]) : null,
    vehiclePrices:   results[1] ? parseCSV(results[1]) : null,
    cityData:        results[2] ? parseCSV(results[2]) : null,
    chargeSpecs:     results[3] ? parseCSV(results[3]) : null,
    useCaseMults:    results[4] ? parseCSV(results[4]) : null,
    phasedRamp:      results[5] ? parseCSV(results[5]) : null,
    mktDefaults:     results[6] ? parseCSV(results[6]) : null,
    modelAssumptions:results[7] ? parseCSV(results[7]) : null,
  };
}

// ---- 1. Country-level metrics → C[country] ----
function applyMetricsToC(rows) {
  if (!rows) return;
  rows.forEach(r => {
    const cc = C[r.country];
    if (!cc) return;
    const f = k => safeNum(r[k]);
    if (f('gas')  !== null) cc.gas  = f('gas');
    if (f('diesel')!==null) cc.diesel= f('diesel');
    if (f('eH')   !== null) cc.eH   = f('eH');
    if (f('eP')   !== null) cc.eP   = f('eP');
    if (f('sub')  !== null) cc.sub  = f('sub');
    if (f('int')  !== null) cc.int  = f('int');
    if (f('fInf') !== null) cc.fInf = f('fInf');
    if (f('avgKm')!== null) cc.avgKm= f('avgKm');
    if (f('evR')  !== null) cc.evR  = f('evR');
    if (f('iceR') !== null) cc.iceR = f('iceR');
    if (f('hybR') !== null) cc.hybR = f('hybR');
    if (f('hourly')!==null) cc.hourly=f('hourly');
    if (f('evSh') !== null) cc.evSh = f('evSh');
  });
}

// ---- 2. Vehicle prices → C[country].v[segment][type] ----
function applyVehiclePricesToC(rows) {
  if (!rows) return;
  rows.forEach(r => {
    const cc = C[r.country];
    if (!cc?.v?.[r.segment]?.[r.type]) return;
    const v = cc.v[r.segment][r.type];
    if (r.name)                        v.name  = r.name;
    if (safeNum(r.price)  !== null)    v.price = safeNum(r.price);
    if (safeNum(r.eff)    !== null)    v.eff   = safeNum(r.eff);
    if (safeNum(r.kpl)    !== null)    v.kpl   = safeNum(r.kpl);
    if (safeNum(r.m_annual)!== null)   v.m     = safeNum(r.m_annual);
    if (safeNum(r.i_annual)!== null)   v.i     = safeNum(r.i_annual);
    if (safeNum(r.t_annual)!== null)   v.t     = safeNum(r.t_annual);
  });
}

// ---- 3. City data → C[country].cities[] ----
function applyCityDataToC(rows) {
  if (!rows) return;
  const byCountry = {};
  rows.forEach(r => {
    if (!byCountry[r.country]) byCountry[r.country] = [];
    const city = {
      id: r.city_id,
      name: r.city_name,
      f: safeNum(r.fuel_multiplier)  ?? 1,
      e: safeNum(r.elec_multiplier)  ?? 1,
      k: safeNum(r.km_intensity)     ?? 1,
      c: safeNum(r.charging_score)   ?? 0.5,
      dc: safeNum(r.dc_chargers)     ?? 0,
      ac: safeNum(r.ac_chargers)     ?? 0,
    };
    const sw = safeNum(r.swap_stations);
    if (sw !== null && sw > 0) city.sw = sw;
    byCountry[r.country].push(city);
  });
  Object.entries(byCountry).forEach(([country, cities]) => {
    if (C[country]) C[country].cities = cities;
  });
}

// ---- 4. Charge specs → CHARGE_SPECS ----
function applyChargeSpecs(rows) {
  if (!rows) return;
  rows.forEach(r => {
    if (!CHARGE_SPECS[r.segment]) return;
    const s = CHARGE_SPECS[r.segment];
    if (safeNum(r.range_km)      !== null) s.range  = safeNum(r.range_km);
    if (safeNum(r.dc_charge_min) !== null) s.dcMin  = safeNum(r.dc_charge_min);
    if (safeNum(r.ac_charge_hrs) !== null) s.acHrs  = safeNum(r.ac_charge_hrs);
    if (safeNum(r.battery_kwh)   !== null) s.battKwh= safeNum(r.battery_kwh);
  });
}

// ---- 5. Use-case multipliers → UC ----
function applyUseCaseMults(rows) {
  if (!rows) return;
  rows.forEach(r => {
    if (!UC[r.use_case]) return;
    const u = UC[r.use_case];
    if (safeNum(r.km_multiplier)          !== null) u.km = safeNum(r.km_multiplier);
    if (safeNum(r.home_charging_multiplier)!== null) u.hc = safeNum(r.home_charging_multiplier);
    if (safeNum(r.maintenance_multiplier) !== null) u.mt = safeNum(r.maintenance_multiplier);
    if (r.downtime_applies !== '') u.dt = r.downtime_applies === 'true' ? 1 : 0;
  });
}

// ---- 6. Phased deployment ramp → RAMP[] ----
function applyPhasedRamp(rows) {
  if (!rows) return;
  const newRamp = [];
  rows.forEach(r => {
    const yr  = safeNum(r.year);
    const pct = safeNum(r.fleet_pct_converted);
    if (yr !== null && pct !== null) newRamp[yr] = pct;
  });
  if (newRamp.length) {
    RAMP.splice(0, RAMP.length, ...newRamp);
  }
}

// ---- 7. Marketplace segment defaults → MKT_DEFAULTS ----
function applyMktDefaults(rows) {
  if (!rows) return;
  rows.forEach(r => {
    if (!MKT_DEFAULTS[r.segment]) MKT_DEFAULTS[r.segment] = {};
    const d = MKT_DEFAULTS[r.segment];
    if (safeNum(r.trips_per_day)       !== null) d.trips  = safeNum(r.trips_per_day);
    if (safeNum(r.avg_trip_km)         !== null) d.dist   = safeNum(r.avg_trip_km);
    if (safeNum(r.ev_premium_usd)      !== null) d.prem   = safeNum(r.ev_premium_usd);
    if (safeNum(r.dc_charger_cost_usd) !== null) d.dcCost = safeNum(r.dc_charger_cost_usd);
    if (safeNum(r.ac_charger_cost_usd) !== null) d.acCost = safeNum(r.ac_charger_cost_usd);
    if (safeNum(r.default_fleet_size)  !== null) d.fleet  = safeNum(r.default_fleet_size);
  });
}

// ---- 8. Model assumptions → MA ----
// Maps snake_case CSV keys to camelCase MA property names
const MA_KEY_MAP = {
  swap_session_time:                 'swapSessionMin',
  bike_ac_charge_ratio:              'bikeAcChargeRatio',
  ice_range_per_tank:                'iceRangeKm',
  ice_refuel_time:                   'iceRefuelMin',
  fleet_taxi_work_days_per_year:     'workDaysYr',
  battery_degradation_rate:          'battDegradation',
  ev_subsidy_price_floor:            'evSubsidyPriceFloor',
  financing_cost_factor:             'finCostFactor',
  maintenance_annual_growth:         'maintenanceGrowthRate',
  insurance_floor:                   'insuranceFloor',
  insurance_annual_reduction:        'insuranceDecayRate',
  residual_decay_rate:               'residualDecayRate',
  dc_sessions_per_day:               'dcSessionsDay',
  ac_sessions_per_day:               'acSessionsDay',
  swap_sessions_per_day:             'swapSessionsDay',
  infra_healthy_utilisation_threshold:'infraHealthyUtil',
  infra_moderate_threshold:          'contentionLow',
  infra_high_threshold:              'contentionModerate',
  infra_critical_threshold:          'contentionHigh',
  fleet_home_charging_ratio:         'fleetHomeChargingRatio',
  grid_connection_cost_car:          'gridCostCar',
  grid_connection_cost_bike:         'gridCostBike',
  driver_ev_training_cost:           'driverTrainingCost',
  dc_charger_annual_maintenance:     'dcMaintPct',
  ac_charger_annual_maintenance:     'acMaintPct',
  fleet_mgmt_overhead_car:           'fleetMgmtCostCar',
  fleet_mgmt_overhead_bike:          'fleetMgmtCostBike',
  ev_loan_premium:                   'evLoanPremium',
};

function applyModelAssumptions(rows) {
  if (!rows) return;
  rows.forEach(r => {
    const maKey = MA_KEY_MAP[r.assumption_key];
    if (!maKey) return;
    const val = safeNum(r.value);
    if (val !== null) MA[maKey] = val;
  });
}
