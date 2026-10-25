/**
 * CSV Import and Export Utilities for DispatchPro
 */

export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('CSV content is empty.');
  }

  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row.');
  }

  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const requiredFields = ['stop_id', 'x', 'y', 'packages', 'window_start', 'window_end'];
  for (const rf of requiredFields) {
    if (!headers.includes(rf)) {
      throw new Error(`CSV missing required column: "${rf}". Expected columns: ${requiredFields.join(', ')}`);
    }
  }

  const idCol = headers.indexOf('stop_id');
  const xCol = headers.indexOf('x');
  const yCol = headers.indexOf('y');
  const pkgCol = headers.indexOf('packages');
  const wsCol = headers.indexOf('window_start');
  const weCol = headers.indexOf('window_end');

  const stops = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (rawCols.length < headers.length) {
      throw new Error(`Row ${i + 1} has insufficient columns (found ${rawCols.length}, expected ${headers.length}).`);
    }

    stops.push({
      stop_id: rawCols[idCol],
      x: Number(rawCols[xCol]),
      y: Number(rawCols[yCol]),
      packages: Number(rawCols[pkgCol]),
      window_start: rawCols[wsCol],
      window_end: rawCols[weCol]
    });
  }

  return stops;
}

export function exportToCSV(stops) {
  const headers = ['stop_id', 'x', 'y', 'packages', 'window_start', 'window_end'];
  const rows = stops.map(s => [
    s.stop_id,
    s.x,
    s.y,
    s.packages,
    s.window_start,
    s.window_end
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function exportToJSON(stops) {
  return JSON.stringify(stops, null, 2);
}

export function parseJSON(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON data must be an array of stop objects.');
    }
    return parsed;
  } catch (err) {
    throw new Error(`Invalid JSON format: ${err.message}`);
  }
}
