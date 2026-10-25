/**
 * Helper to convert "HH:MM" string to minutes from midnight
 * @param {string} timeStr - "HH:MM"
 * @returns {number} minutes
 */
export function timeToMinutes(timeStr) {
  if (typeof timeStr !== 'string') return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
}

/**
 * Helper to convert minutes from midnight to "HH:MM"
 * @param {number} totalMinutes
 * @returns {string} "HH:MM"
 */
export function minutesToTime(totalMinutes) {
  if (isNaN(totalMinutes) || totalMinutes === null || totalMinutes === undefined) return '--:--';
  const minsInDay = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(minsInDay / 60);
  const m = minsInDay % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Validates stop objects and configuration
 * @param {Array} stops
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStops(stops) {
  const errors = [];
  if (!Array.isArray(stops)) {
    return { valid: false, errors: ['Stops list must be an array.'] };
  }

  const seenIds = new Set();

  stops.forEach((stop, index) => {
    const prefix = `Row ${index + 1} (${stop?.stop_id || 'unnamed'}): `;

    if (!stop || typeof stop !== 'object') {
      errors.push(`${prefix}Invalid stop entry.`);
      return;
    }

    if (!stop.stop_id || String(stop.stop_id).trim() === '') {
      errors.push(`${prefix}Missing stop ID.`);
    } else {
      const idStr = String(stop.stop_id).trim();
      if (seenIds.has(idStr)) {
        errors.push(`${prefix}Duplicate stop ID "${idStr}". Each stop ID must be unique.`);
      }
      seenIds.add(idStr);
    }

    const x = Number(stop.x);
    const y = Number(stop.y);
    if (isNaN(x) || !Number.isFinite(x)) {
      errors.push(`${prefix}X coordinate must be a valid number.`);
    }
    if (isNaN(y) || !Number.isFinite(y)) {
      errors.push(`${prefix}Y coordinate must be a valid number.`);
    }

    const pkgs = Number(stop.packages);
    if (!Number.isInteger(pkgs) || pkgs <= 0) {
      errors.push(`${prefix}Packages must be a positive integer (>= 1).`);
    }

    const startMins = timeToMinutes(stop.window_start);
    const endMins = timeToMinutes(stop.window_end);
    if (startMins > endMins) {
      errors.push(`${prefix}window_start (${stop.window_start}) cannot be later than window_end (${stop.window_end}).`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
