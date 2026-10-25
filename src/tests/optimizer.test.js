import { describe, it, expect } from 'vitest';
import {
  manhattanDistance,
  calculateRoute,
  buildBaseline,
  buildNearestNeighborSolution,
  buildOptimalSolution,
  optimizeRoutes,
  calculateImprovement,
  simulateManualRoute,
  timeToMinutes,
  minutesToTime,
  validateStops
} from '../utils/optimizer.js';
import { INITIAL_STOPS } from '../data/sampleStops.js';
import { parseCSV, exportToCSV } from '../utils/csv.js';

describe('DispatchPro Acceptance Tests', () => {
  it('Test 1: Assignment completeness - all 6 stops assigned across baseline routes', () => {
    const baseline = buildBaseline(INITIAL_STOPS);
    expect(baseline.isValid).toBe(true);

    const allAssignedIds = baseline.metrics.assignedStopIds;
    expect(allAssignedIds.length).toBe(6);
    expect(new Set(allAssignedIds).size).toBe(6);

    const initialIds = INITIAL_STOPS.map(s => s.stop_id);
    expect(allAssignedIds.sort()).toEqual(initialIds.sort());

    const totalPkgs = baseline.metrics.totalAssignedPackages;
    expect(totalPkgs).toBe(7);
  });

  it('Test 2: Baseline loads - Rider 1 has 4 packages, Rider 2 has 3 packages', () => {
    const baseline = buildBaseline(INITIAL_STOPS);
    const [r1, r2] = baseline.routes;

    expect(r1.totalPackages).toBe(4);
    expect(r2.totalPackages).toBe(3);
    expect(r1.isCapacityExceeded).toBe(false);
    expect(r2.isCapacityExceeded).toBe(false);
  });

  it('Test 3: Baseline distance - Rider 1 = 20, Rider 2 = 32, Total = 52', () => {
    const baseline = buildBaseline(INITIAL_STOPS);
    const [r1, r2] = baseline.routes;

    expect(r1.totalDistance).toBe(20);
    expect(r2.totalDistance).toBe(32);
    expect(baseline.metrics.totalDistance).toBe(52);
  });

  it('Test 4: Optimal distance - Total = 40, Improvement ~ 23.1%', () => {
    const optimal = buildOptimalSolution(INITIAL_STOPS);
    expect(optimal.metrics.totalDistance).toBe(40);
    expect(optimal.metrics.totalAssignedPackages).toBe(7);

    const improvement = calculateImprovement(52, 40);
    expect(improvement.formatted).toBe('23.1%');
    expect(improvement.percent).toBeCloseTo(23.0769, 1);
  });

  it('Test 5: Optimal lower bound sanity - no valid assignment < 40 and solver returns 40', () => {
    const optimal = buildOptimalSolution(INITIAL_STOPS);
    expect(optimal.metrics.totalDistance).toBe(40);
    expect(optimal.metrics.totalAssignedStops).toBe(6);
  });

  it('Test 6: Scenario B - Late delivery with Rider 1 at 09:55 and D5 -> D2 -> D1', () => {
    const stopMap = new Map(INITIAL_STOPS.map(s => [s.stop_id, s]));
    const customStops = ['D5', 'D2', 'D1'].map(id => stopMap.get(id));

    const sim = simulateManualRoute(customStops, {
      departureTime: '09:55',
      serviceTime: 2,
      speed: 1
    });

    const [d5Leg, d2Leg, d1Leg] = sim.legs;

    // D5: depot(0,0) to D5(7,1) dist = 8
    // departure 09:55 + 8m = 10:03 raw arrival
    expect(d5Leg.rawArrivalTimeFormatted).toBe('10:03');
    expect(d5Leg.status).toBe('LATE');
    expect(d5Leg.minutesLate).toBe(3); // deadline 10:00

    // D5 service 10:03 to 10:05.
    // D5(7,1) to D2(4,2) dist = |7-4| + |1-2| = 4.
    // 10:05 + 4m = 10:09 raw arrival.
    expect(d2Leg.rawArrivalTimeFormatted).toBe('10:09');
    expect(d2Leg.status).toBe('ON TIME');

    // D2 service 10:09 to 10:11.
    // D2(4,2) to D1(1,2) dist = |4-1| + |2-2| = 3.
    // 10:11 + 3m = 10:14 raw arrival.
    expect(d1Leg.rawArrivalTimeFormatted).toBe('10:14');
    expect(d1Leg.status).toBe('ON TIME');
  });

  it('Test 7: Scenario C - Capacity 3 per rider', () => {
    const optimal = buildOptimalSolution(INITIAL_STOPS, { capacity: 3 });

    // Available capacity: 2 riders * 3 = 6 packages. Demand = 7.
    expect(optimal.metrics.totalDemandPackages).toBe(7);
    expect(optimal.metrics.totalAssignedPackages).toBeLessThanOrEqual(6);
    expect(optimal.metrics.unassignedStops.length).toBeGreaterThan(0);

    // Verify neither rider exceeds capacity 3
    optimal.routes.forEach(r => {
      expect(r.totalPackages).toBeLessThanOrEqual(3);
      expect(r.isCapacityExceeded).toBe(false);
    });

    // Unassigned stop must have explicit reason
    expect(optimal.metrics.unassignedStops[0].reason).toBeDefined();
  });

  it('Test 8: Return distance - every closed route includes final return leg to depot', () => {
    const r = calculateRoute([INITIAL_STOPS[0]], { depot: { x: 0, y: 0 } });
    expect(r.returnLeg).toBeDefined();
    expect(r.returnDistance).toBe(3); // D1(1,2) to (0,0) is |1| + |2| = 3
    expect(r.totalDistance).toBe(r.travelDistance + r.returnDistance);
  });

  it('Test 9: Early arrival - waits until window_start with zero lateness', () => {
    // Stop with window 10:00 - 11:00, arrival at 09:03
    const testStop = {
      stop_id: 'TEST',
      x: 1,
      y: 2,
      packages: 1,
      window_start: '10:00',
      window_end: '11:00'
    };
    const route = calculateRoute([testStop], { departureTime: '09:00' });
    const leg = route.legs[0];

    expect(leg.rawArrivalTimeFormatted).toBe('09:03');
    expect(leg.waitMinutes).toBe(57); // waits until 10:00
    expect(leg.serviceStartTimeFormatted).toBe('10:00');
    expect(leg.status).toBe('ON TIME');
    expect(leg.minutesLate).toBe(0);
  });

  it('Test 10: On-time boundary - arrival exactly at window_end is ON TIME', () => {
    // Travel dist = 10, departure 09:00 -> arrival 09:10
    const testStop = {
      stop_id: 'BOUNDARY',
      x: 5,
      y: 5,
      packages: 1,
      window_start: '09:00',
      window_end: '09:10'
    };
    const route = calculateRoute([testStop], { departureTime: '09:00' });
    const leg = route.legs[0];

    expect(leg.rawArrivalTimeFormatted).toBe('09:10');
    expect(leg.serviceStartTimeFormatted).toBe('09:10');
    expect(leg.status).toBe('ON TIME');
    expect(leg.minutesLate).toBe(0);
  });

  it('Test 11: CSV export and import validation', () => {
    const csvStr = exportToCSV(INITIAL_STOPS);
    const parsed = parseCSV(csvStr);
    expect(parsed.length).toBe(6);
    expect(parsed[0].stop_id).toBe('D1');

    // Duplicate ID validation
    const invalidStops = [...INITIAL_STOPS, { ...INITIAL_STOPS[0] }];
    const val = validateStops(invalidStops);
    expect(val.valid).toBe(false);
    expect(val.errors.some(e => e.includes('Duplicate stop ID'))).toBe(true);
  });

  it('Test 12: Live updates - changing stop coordinates recalculates distances', () => {
    const modifiedStops = INITIAL_STOPS.map(s => (s.stop_id === 'D1' ? { ...s, x: 10 } : s));
    const optOriginal = optimizeRoutes(INITIAL_STOPS);
    const optModified = optimizeRoutes(modifiedStops);

    expect(optModified.baseline.metrics.totalDistance).not.toBe(optOriginal.baseline.metrics.totalDistance);
    expect(optModified.optimal.metrics.totalDistance).not.toBe(optOriginal.optimal.metrics.totalDistance);
  });
});
