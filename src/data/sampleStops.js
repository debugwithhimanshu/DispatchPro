export const DEFAULT_DEPOT = { x: 0, y: 0 };
export const DEFAULT_RIDERS = 2;
export const DEFAULT_CAPACITY = 4;
export const DEFAULT_DEPARTURE_TIME = '09:00';
export const DEFAULT_SERVICE_TIME = 2; // minutes per stop
export const DEFAULT_SPEED = 1; // distance unit per minute

export const INITIAL_STOPS = [
  { stop_id: 'D1', x: 1, y: 2, packages: 1, window_start: '09:00', window_end: '11:00' },
  { stop_id: 'D2', x: 4, y: 2, packages: 1, window_start: '09:00', window_end: '10:30' },
  { stop_id: 'D3', x: 5, y: 5, packages: 2, window_start: '10:00', window_end: '12:00' },
  { stop_id: 'D4', x: 2, y: 6, packages: 1, window_start: '09:30', window_end: '11:30' },
  { stop_id: 'D5', x: 7, y: 1, packages: 1, window_start: '09:00', window_end: '10:00' },
  { stop_id: 'D6', x: 3, y: 4, packages: 1, window_start: '10:00', window_end: '12:00' },
];
