/**
 * Loads top-level country metrics from data/asean_metrics.csv.
 * Returns a map of { countryKey: { gas, diesel, eH, eP, sub, int, fInf, avgKm, evR, iceR, hybR, hourly, evSh } }
 * If the fetch fails (e.g. opened as a local file), returns an empty object so
 * the dashboard falls back to the baked-in values in const C without breaking.
 */
async function loadAseanMetrics() {
  const response = await fetch('data/asean_metrics.csv');
  if (!response.ok) throw new Error('CSV fetch failed: ' + response.status);
  const text = await response.text();

  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const result = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');
    const country = values[0];
    const row = {};
    for (let j = 1; j < headers.length; j++) {
      row[headers[j]] = parseFloat(values[j]);
    }
    result[country] = row;
  }

  return result;
}

/**
 * Merges loaded CSV data into the existing C object.
 * Only overrides fields that are present in the CSV; all other nested data
 * (cities, vehicle prices, policy text) stays from the original C.
 */
function applyMetricsToC(metrics) {
  for (const [country, row] of Object.entries(metrics)) {
    if (!C[country]) continue;
    if (!isNaN(row.gas))    C[country].gas    = row.gas;
    if (!isNaN(row.diesel)) C[country].diesel = row.diesel;
    if (!isNaN(row.eH))     C[country].eH     = row.eH;
    if (!isNaN(row.eP))     C[country].eP     = row.eP;
    if (!isNaN(row.sub))    C[country].sub    = row.sub;
    if (!isNaN(row.int))    C[country].int    = row.int;
    if (!isNaN(row.fInf))   C[country].fInf   = row.fInf;
    if (!isNaN(row.avgKm))  C[country].avgKm  = row.avgKm;
    if (!isNaN(row.evR))    C[country].evR    = row.evR;
    if (!isNaN(row.iceR))   C[country].iceR   = row.iceR;
    if (!isNaN(row.hybR))   C[country].hybR   = row.hybR;
    if (!isNaN(row.hourly)) C[country].hourly = row.hourly;
    if (!isNaN(row.evSh))   C[country].evSh   = row.evSh;
  }
}
