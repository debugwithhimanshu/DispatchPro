import { timeToMinutes, minutesToTime, validateStops } from './validation.js';

export { timeToMinutes, minutesToTime, validateStops };

/**
 * Calculates Manhattan distance between two points (abs(x1 - x2) + abs(y1 - y2))
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number}
 */
export function manhattanDistance(p1, p2) {
  return Math.abs(Number(p1.x) - Number(p2.x)) + Math.abs(Number(p1.y) - Number(p2.y));
}

/**
 * Calculates a complete closed route for an ordered list of stops for a single rider.
 * Closed route means: Depot -> Stop 1 -> ... -> Stop N -> Depot
 *
 * Rules:
 * - Speed: 1 unit per minute (speed = distance / speedMinutesPerUnit)
 * - Service time: 2 minutes per stop
 * - Arrival before window_start: wait until window_start.
 * - Lateness: calculated from actual service start time after waiting (serviceStart > windowEnd ? serviceStart - windowEnd : 0)
 * - Arrival exactly at window_end: ON TIME
 * - Closed route return to depot is included.
 *
 * @param {Array} orderedStops - List of stop objects in visit order
 * @param {Object} options - { depot, departureTime, serviceTime, speed, capacity }
 * @returns {Object} Route result details
 */
export function calculateRoute(orderedStops = [], options = {}) {
  const depot = options.depot || { x: 0, y: 0 };
  const departureTimeStr = options.departureTime || '09:00';
  const serviceDuration = options.serviceTime !== undefined ? options.serviceTime : 2;
  const speed = options.speed !== undefined ? options.speed : 1; // distance units per minute
  const capacity = options.capacity !== undefined ? options.capacity : 4;

  const departureMinutes = timeToMinutes(departureTimeStr);
  let currentTime = departureMinutes;
  let currentPos = { ...depot };
  let cumulativeTravelDistance = 0;

  const legs = [];
  let totalPackages = 0;
  let lateStopsCount = 0;

  orderedStops.forEach((stop, index) => {
    const stopPkgs = Number(stop.packages) || 0;
    totalPackages += stopPkgs;

    const legDist = manhattanDistance(currentPos, stop);
    cumulativeTravelDistance += legDist;
    const travelTime = legDist / speed;
    const rawArrival = currentTime + travelTime;

    const windowStartMins = timeToMinutes(stop.window_start);
    const windowEndMins = timeToMinutes(stop.window_end);

    const waitMinutes = rawArrival < windowStartMins ? windowStartMins - rawArrival : 0;
    const serviceStart = rawArrival + waitMinutes;
    const serviceEnd = serviceStart + serviceDuration;

    // Lateness calculation: serviceStart > windowEnd is LATE
    const isLate = serviceStart > windowEndMins;
    const minutesLate = isLate ? serviceStart - windowEndMins : 0;
    if (isLate) {
      lateStopsCount++;
    }

    let explanation = '';
    if (isLate) {
      explanation = `Late by ${Math.round(minutesLate)} mins (Service began ${minutesToTime(serviceStart)}, deadline ${stop.window_end})`;
    } else if (waitMinutes > 0) {
      explanation = `Arrived early at ${minutesToTime(rawArrival)}; waited ${Math.round(waitMinutes)} mins for window start ${stop.window_start}`;
    } else {
      explanation = `On time: arrived ${minutesToTime(rawArrival)}, service began before deadline ${stop.window_end}`;
    }

    legs.push({
      stepIndex: index + 1,
      stop_id: stop.stop_id,
      stop,
      from: { ...currentPos },
      to: { x: Number(stop.x), y: Number(stop.y) },
      distance: legDist,
      cumulativeDistance: cumulativeTravelDistance,
      departureFromPrevTime: currentTime,
      departureFromPrevTimeFormatted: minutesToTime(currentTime),
      rawArrivalTime: rawArrival,
      rawArrivalTimeFormatted: minutesToTime(rawArrival),
      waitMinutes,
      serviceStartTime: serviceStart,
      serviceStartTimeFormatted: minutesToTime(serviceStart),
      serviceEndTime: serviceEnd,
      serviceEndTimeFormatted: minutesToTime(serviceEnd),
      windowStart: stop.window_start,
      windowEnd: stop.window_end,
      windowStartMinutes: windowStartMins,
      windowEndMinutes: windowEndMins,
      status: isLate ? 'LATE' : 'ON TIME',
      minutesLate,
      departureTime: serviceEnd,
      departureTimeFormatted: minutesToTime(serviceEnd),
      explanation
    });

    currentTime = serviceEnd;
    currentPos = { x: Number(stop.x), y: Number(stop.y) };
  });

  // Closed route return leg to depot
  const returnDist = manhattanDistance(currentPos, depot);
  cumulativeTravelDistance += returnDist;
  const returnTravelTime = returnDist / speed;
  const returnTime = currentTime + returnTravelTime;

  const returnLeg = {
    stepIndex: orderedStops.length + 1,
    isReturn: true,
    stop_id: 'DEPOT',
    from: { ...currentPos },
    to: { ...depot },
    distance: returnDist,
    cumulativeDistance: cumulativeTravelDistance,
    departureTime: currentTime,
    departureTimeFormatted: minutesToTime(currentTime),
    arrivalTime: returnTime,
    arrivalTimeFormatted: minutesToTime(returnTime)
  };

  const isCapacityExceeded = totalPackages > capacity;
  const capacityViolationDetails = isCapacityExceeded
    ? `Capacity exceeded: ${totalPackages} packages carried, max allowed is ${capacity}.`
    : null;

  return {
    orderedStops,
    stopIds: orderedStops.map(s => s.stop_id),
    legs,
    returnLeg,
    travelDistance: cumulativeTravelDistance - returnDist,
    returnDistance: returnDist,
    totalDistance: cumulativeTravelDistance,
    departureTime: departureTimeStr,
    departureMinutes,
    returnTime,
    returnTimeFormatted: minutesToTime(returnTime),
    totalPackages,
    capacity,
    isCapacityExceeded,
    capacityViolationDetails,
    lateStopsCount
  };
}

/**
 * Calculates complete metrics across multiple rider routes
 * @param {Array} riderRoutes - Array of route objects returned by calculateRoute
 * @param {Array} allStops - All available input stops
 * @param {Array} unassignedStops - Stops not included in any route
 * @returns {Object} Strategy metrics
 */
export function calculateRouteMetrics(riderRoutes = [], allStops = [], unassignedStops = []) {
  let totalDistance = 0;
  let totalLateStops = 0;
  let totalAssignedPackages = 0;
  let totalAssignedStops = 0;
  let hasCapacityViolation = false;
  const violations = [];

  const assignedStopIds = [];

  riderRoutes.forEach((route, idx) => {
    totalDistance += route.totalDistance;
    totalLateStops += route.lateStopsCount;
    totalAssignedPackages += route.totalPackages;
    totalAssignedStops += route.orderedStops.length;
    assignedStopIds.push(...route.stopIds);

    if (route.isCapacityExceeded) {
      hasCapacityViolation = true;
      violations.push(`Rider ${idx + 1}: ${route.capacityViolationDetails}`);
    }
  });

  const totalDemandPackages = allStops.reduce((sum, s) => sum + (Number(s.packages) || 0), 0);

  return {
    riderRoutes,
    totalDistance,
    totalLateStops,
    totalAssignedPackages,
    totalAssignedStops,
    totalDemandPackages,
    totalStopsCount: allStops.length,
    assignedStopIds,
    unassignedStops,
    hasCapacityViolation,
    violations
  };
}

/**
 * Calculates improvement percentage of proposed versus baseline
 * improvementPercent = ((baselineDistance - proposedDistance) / baselineDistance) * 100
 * @param {number} baselineDistance
 * @param {number} proposedDistance
 * @param {boolean} isBaselineValid
 * @param {boolean} isProposedValid
 * @returns {{ percent: number|null, formatted: string, explanation: string }}
 */
export function calculateImprovement(baselineDistance, proposedDistance, isBaselineValid = true, isProposedValid = true) {
  if (!isBaselineValid) {
    return {
      percent: null,
      formatted: 'N/A',
      explanation: 'Baseline configuration is invalid (e.g. capacity violation or missing stops).'
    };
  }
  if (!isProposedValid) {
    return {
      percent: null,
      formatted: 'N/A',
      explanation: 'Proposed route is invalid.'
    };
  }
  if (typeof baselineDistance !== 'number' || isNaN(baselineDistance) || baselineDistance <= 0) {
    return {
      percent: null,
      formatted: 'N/A',
      explanation: 'Baseline distance is zero or invalid.'
    };
  }
  if (typeof proposedDistance !== 'number' || isNaN(proposedDistance) || proposedDistance < 0) {
    return {
      percent: null,
      formatted: 'N/A',
      explanation: 'Proposed distance is invalid.'
    };
  }

  const rawPercent = ((baselineDistance - proposedDistance) / baselineDistance) * 100;
  const formatted = `${rawPercent.toFixed(1)}%`;
  return {
    percent: rawPercent,
    formatted,
    explanation: `${formatted} distance reduction vs baseline (${baselineDistance} -> ${proposedDistance})`
  };
}

/**
 * Builds the exact fixed Baseline strategy:
 * Rider 1: D1 -> D2 -> D3 -> Depot
 * Rider 2: D4 -> D5 -> D6 -> Depot
 *
 * Checks capacity and validates presence of stops.
 */
export function buildBaseline(stops = [], options = {}) {
  const stopMap = new Map();
  stops.forEach(s => stopMap.set(s.stop_id, s));

  const r1Ids = ['D1', 'D2', 'D3'];
  const r2Ids = ['D4', 'D5', 'D6'];

  const r1Stops = [];
  const r2Stops = [];
  const missingBaselineIds = [];

  r1Ids.forEach(id => {
    if (stopMap.has(id)) r1Stops.push(stopMap.get(id));
    else missingBaselineIds.push(id);
  });

  r2Ids.forEach(id => {
    if (stopMap.has(id)) r2Stops.push(stopMap.get(id));
    else missingBaselineIds.push(id);
  });

  // Check stops that are not in the fixed baseline
  const baselineIdsSet = new Set([...r1Ids, ...r2Ids]);
  const unassigned = [];

  stops.forEach(s => {
    if (!baselineIdsSet.has(s.stop_id)) {
      unassigned.push({
        stop: s,
        stop_id: s.stop_id,
        reason: 'Stop not part of the fixed baseline definition (D1-D3 for Rider 1, D4-D6 for Rider 2).'
      });
    }
  });

  const r1Route = calculateRoute(r1Stops, options);
  const r2Route = calculateRoute(r2Stops, options);

  const metrics = calculateRouteMetrics([r1Route, r2Route], stops, unassigned);

  const isValid = missingBaselineIds.length === 0 && !metrics.hasCapacityViolation;
  const notes = [];
  if (missingBaselineIds.length > 0) {
    notes.push(`Missing default baseline stops: ${missingBaselineIds.join(', ')}.`);
  }
  if (metrics.hasCapacityViolation) {
    notes.push(`Baseline exceeds rider package capacity limit.`);
  }

  return {
    strategyName: 'Baseline (Fixed)',
    strategyType: 'fixed',
    isExact: true,
    isValid,
    notes,
    routes: [r1Route, r2Route],
    metrics,
    missingBaselineIds
  };
}

/**
 * Builds a solution using Greedy Nearest-Neighbor heuristic:
 * Iteratively assigns the nearest feasible stop to available riders, respecting capacity.
 * Closed route distance and tie-breaking by stop_id.
 */
export function buildNearestNeighborSolution(stops = [], options = {}) {
  const numRiders = options.riderCount || 2;
  const capacity = options.capacity !== undefined ? options.capacity : 4;
  const depot = options.depot || { x: 0, y: 0 };

  // Track rider state
  const riderCurrentPositions = Array.from({ length: numRiders }, () => ({ ...depot }));
  const riderLoads = Array.from({ length: numRiders }, () => 0);
  const riderAssignedStops = Array.from({ length: numRiders }, () => []);

  // Sort stops deterministically by stop_id initially
  const remainingStops = [...stops].sort((a, b) => String(a.stop_id).localeCompare(String(b.stop_id)));

  while (remainingStops.length > 0) {
    let bestCandidate = null;

    // Search for closest stop across all riders that has capacity
    for (let r = 0; r < numRiders; r++) {
      const currentLoad = riderLoads[r];
      const pos = riderCurrentPositions[r];

      for (let sIdx = 0; sIdx < remainingStops.length; sIdx++) {
        const stop = remainingStops[sIdx];
        const pkgs = Number(stop.packages) || 0;

        if (currentLoad + pkgs <= capacity) {
          const dist = manhattanDistance(pos, stop);

          if (
            bestCandidate === null ||
            dist < bestCandidate.dist ||
            (dist === bestCandidate.dist && String(stop.stop_id).localeCompare(String(bestCandidate.stop.stop_id)) < 0)
          ) {
            bestCandidate = {
              riderIndex: r,
              stopIndex: sIdx,
              stop,
              dist
            };
          }
        }
      }
    }

    if (!bestCandidate) {
      // No remaining stop fits in any rider's capacity
      break;
    }

    const { riderIndex, stopIndex, stop } = bestCandidate;
    riderAssignedStops[riderIndex].push(stop);
    riderLoads[riderIndex] += Number(stop.packages) || 0;
    riderCurrentPositions[riderIndex] = { x: Number(stop.x), y: Number(stop.y) };
    remainingStops.splice(stopIndex, 1);
  }

  const unassigned = remainingStops.map(s => ({
    stop: s,
    stop_id: s.stop_id,
    reason: `Capacity constraint: Package demand (${s.packages}) exceeds remaining rider capacity.`
  }));

  const routes = riderAssignedStops.map(stList => calculateRoute(stList, options));
  const metrics = calculateRouteMetrics(routes, stops, unassigned);

  return {
    strategyName: 'Nearest Neighbor',
    strategyType: 'heuristic',
    isExact: false,
    isValid: true,
    notes: ['Greedy heuristic with deterministic tie-breaking. Return legs included.'],
    routes,
    metrics
  };
}

/**
 * Helper to generate all permutations of an array
 */
function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    const remainingPerms = getPermutations(remaining);
    for (let p of remainingPerms) {
      result.push([current, ...p]);
    }
  }
  return result;
}

/**
 * 2-opt local search optimization for a single route
 */
function apply2Opt(stops, options) {
  if (stops.length <= 3) return stops;
  let bestStops = [...stops];
  let bestRoute = calculateRoute(bestStops, options);
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 0; i < bestStops.length - 1; i++) {
      for (let j = i + 1; j < bestStops.length; j++) {
        const candidate = [
          ...bestStops.slice(0, i),
          ...bestStops.slice(i, j + 1).reverse(),
          ...bestStops.slice(j + 1)
        ];
        const candidateRoute = calculateRoute(candidate, options);
        if (candidateRoute.totalDistance < bestRoute.totalDistance) {
          bestStops = candidate;
          bestRoute = candidateRoute;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }
  return bestStops;
}

/**
 * Builds Optimal strategy:
 * If stops.length <= 8: Exhaustive exact search across all assignments and permutations.
 * Lexicographical objective:
 * 1. Maximum total assigned packages
 * 2. Minimum total route distance
 * 3. Fewest late stops
 * Deterministic tie-breaking.
 *
 * If stops.length > 8:
 * Nearest neighbor + 2-opt local search, clearly labeled "Heuristic, not guaranteed optimal".
 */
export function buildOptimalSolution(stops = [], options = {}) {
  const numRiders = options.riderCount || 2;
  const capacity = options.capacity !== undefined ? options.capacity : 4;

  if (stops.length > 8) {
    // Large problem: Use NN + 2-opt local search
    const nnSolution = buildNearestNeighborSolution(stops, options);
    const optimizedRoutes = nnSolution.routes.map(r => {
      const optStops = apply2Opt(r.orderedStops, options);
      return calculateRoute(optStops, options);
    });
    const metrics = calculateRouteMetrics(optimizedRoutes, stops, nnSolution.metrics.unassignedStops);

    return {
      strategyName: 'Optimal (2-Opt Heuristic)',
      strategyType: 'heuristic',
      isExact: false,
      isHeuristicMode: true,
      notes: [
        'Heuristic, not guaranteed optimal: Stop count exceeds exact-search limit of 8 stops. Computed using Nearest Neighbor + 2-opt route refinement.'
      ],
      routes: optimizedRoutes,
      metrics
    };
  }

  // Exact search for <= 8 stops
  // Each stop can be assigned to Rider 0, 1, ..., numRiders-1, or -1 (unassigned)
  const n = stops.length;
  const totalAssignments = Math.pow(numRiders + 1, n);

  let bestSolution = null;

  for (let code = 0; code < totalAssignments; code++) {
    // Decode assignment
    let temp = code;
    const riderStops = Array.from({ length: numRiders }, () => []);
    const unassigned = [];
    let isCapacityFeasible = true;

    // Check package capacity during assignment
    const riderLoadSums = Array.from({ length: numRiders }, () => 0);

    for (let i = 0; i < n; i++) {
      const assignment = temp % (numRiders + 1);
      temp = Math.floor(temp / (numRiders + 1));

      if (assignment < numRiders) {
        const pkgs = Number(stops[i].packages) || 0;
        riderLoadSums[assignment] += pkgs;
        if (riderLoadSums[assignment] > capacity) {
          isCapacityFeasible = false;
          break;
        }
        riderStops[assignment].push(stops[i]);
      } else {
        unassigned.push(stops[i]);
      }
    }

    if (!isCapacityFeasible) continue;

    // For each rider, find the best permutation of their assigned stops
    let totalAssignedPkgs = 0;
    let totalDist = 0;
    let totalLate = 0;
    const bestRiderRoutes = [];

    for (let r = 0; r < numRiders; r++) {
      const rStops = riderStops[r];
      if (rStops.length === 0) {
        const emptyRoute = calculateRoute([], options);
        bestRiderRoutes.push(emptyRoute);
        continue;
      }

      const perms = getPermutations(rStops);
      let bestRRoute = null;

      // Lexicographical comparison:
      // 1. Maximize totalAssignedPkgs
      // 2. Minimize totalLate (late stops)
      // 3. Minimize totalDist
      for (let p of perms) {
        const rRoute = calculateRoute(p, options);
        if (
          bestRRoute === null ||
          rRoute.lateStopsCount < bestRRoute.lateStopsCount ||
          (rRoute.lateStopsCount === bestRRoute.lateStopsCount && rRoute.totalDistance < bestRRoute.totalDistance)
        ) {
          bestRRoute = rRoute;
        }
      }

      bestRiderRoutes.push(bestRRoute);
      totalDist += bestRRoute.totalDistance;
      totalLate += bestRRoute.lateStopsCount;
      totalAssignedPkgs += bestRRoute.totalPackages;
    }

    // Lexicographical comparison:
    // 1. Maximize totalAssignedPkgs
    // 2. Minimize lateStops
    // 3. Minimize distance
    const candidateScore = {
      assignedPackages: totalAssignedPkgs,
      lateStops: totalLate,
      distance: totalDist,
      routes: bestRiderRoutes,
      unassigned
    };

    if (bestSolution === null) {
      bestSolution = candidateScore;
    } else {
      if (candidateScore.assignedPackages > bestSolution.assignedPackages) {
        bestSolution = candidateScore;
      } else if (candidateScore.assignedPackages === bestSolution.assignedPackages) {
        if (candidateScore.lateStops < bestSolution.lateStops) {
          bestSolution = candidateScore;
        } else if (candidateScore.lateStops === bestSolution.lateStops) {
          if (candidateScore.distance < bestSolution.distance) {
            bestSolution = candidateScore;
          }
        }
      }
    }
  }

  const unassignedList = bestSolution.unassigned.map(s => ({
    stop: s,
    stop_id: s.stop_id,
    reason: `Capacity limit or route tradeoff: Excluding stop achieves higher package throughput or optimal route distance within rider limits.`
  }));

  const metrics = calculateRouteMetrics(bestSolution.routes, stops, unassignedList);

  return {
    strategyName: 'Optimal (Exact Search)',
    strategyType: 'exact',
    isExact: true,
    isHeuristicMode: false,
    notes: [
      'Exhaustive exact optimization covering all rider partitions and stop permutations.',
      'Lexicographical priority: 1. Max packages, 2. Min distance, 3. Min late deliveries.'
    ],
    routes: bestSolution.routes,
    metrics
  };
}

/**
 * Runs full optimization suite across all strategies
 * @param {Array} stops
 * @param {Object} options
 * @returns {Object} Complete optimization report
 */
export function optimizeRoutes(stops = [], options = {}) {
  const validation = validateStops(stops);
  if (!validation.valid) {
    return {
      isValid: false,
      errors: validation.errors,
      baseline: null,
      nearestNeighbor: null,
      optimal: null,
      improvement: null
    };
  }

  const baseline = buildBaseline(stops, options);
  const nearestNeighbor = buildNearestNeighborSolution(stops, options);
  const optimal = buildOptimalSolution(stops, options);

  const baselineDistance = baseline.isValid ? baseline.metrics.totalDistance : null;
  const optimalDistance = optimal ? optimal.metrics.totalDistance : null;

  const improvement = calculateImprovement(
    baselineDistance,
    optimalDistance,
    baseline.isValid,
    optimal !== null
  );

  return {
    isValid: true,
    errors: [],
    baseline,
    nearestNeighbor,
    optimal,
    improvement
  };
}

/**
 * Simulates a custom manual route for Scenario B or user testing
 * @param {Array} orderedStops
 * @param {Object} options - { departureTime, riderLabel, etc. }
 * @returns {Object} Route result
 */
export function simulateManualRoute(orderedStops = [], options = {}) {
  return calculateRoute(orderedStops, options);
}

/**
 * Filters out failed stops from candidate list for future planning
 * @param {Array} stops
 * @param {Set|Array} failedStopIds
 * @returns {{ activeStops: Array, failedStops: Array }}
 */
export function applyFailedStops(stops = [], failedStopIds = []) {
  const failedSet = new Set(Array.isArray(failedStopIds) ? failedStopIds : Array.from(failedStopIds));
  const activeStops = [];
  const failedStops = [];

  stops.forEach(s => {
    if (failedSet.has(s.stop_id)) {
      failedStops.push({ ...s, isFailed: true });
    } else {
      activeStops.push({ ...s, isFailed: false });
    }
  });

  return {
    activeStops,
    failedStops
  };
}
