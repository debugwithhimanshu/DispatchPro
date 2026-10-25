import React, { useMemo } from 'react';

// Swiss palette rider colors:
// Rider 1: Burnt orange (#C65332)
// Rider 2: Muted teal (#2A7A6E)
// Rider 3: Warm olive (#6B8E23)
// Rider 4: Warm saddle (#8B5A2B)
const RIDER_PALETTE = [
  { stroke: '#C65332', bg: 'bg-[#C65332]', text: 'text-[#C65332]', name: 'Rider 1' },
  { stroke: '#2A7A6E', bg: 'bg-[#2A7A6E]', text: 'text-[#2A7A6E]', name: 'Rider 2' },
  { stroke: '#6B8E23', bg: 'bg-[#6B8E23]', text: 'text-[#6B8E23]', name: 'Rider 3' },
  { stroke: '#8B5A2B', bg: 'bg-[#8B5A2B]', text: 'text-[#8B5A2B]', name: 'Rider 4' }
];

export default function RouteMap({
  stops = [],
  strategyData,
  selectedStrategy,
  onSelectStrategy
}) {
  const depot = { x: 0, y: 0 };

  // Calculate SVG bounds with padding
  const { minX, maxX, minY, maxY, scale, width, height, pad } = useMemo(() => {
    let allX = [depot.x, ...stops.map(s => Number(s.x) || 0)];
    let allY = [depot.y, ...stops.map(s => Number(s.y) || 0)];

    let min_x = Math.min(...allX);
    let max_x = Math.max(...allX);
    let min_y = Math.min(...allY);
    let max_y = Math.max(...allY);

    if (max_x - min_x < 6) {
      max_x += 3;
      min_x -= 3;
    }
    if (max_y - min_y < 6) {
      max_y += 3;
      min_y -= 3;
    }

    const svgWidth = 720;
    const svgHeight = 480;
    const padding = 54;

    const spanX = (max_x - min_x) || 1;
    const spanY = (max_y - min_y) || 1;

    const scaleX = (svgWidth - 2 * padding) / spanX;
    const scaleY = (svgHeight - 2 * padding) / spanY;
    const unifiedScale = Math.min(scaleX, scaleY);

    return {
      minX: min_x,
      maxX: max_x,
      minY: min_y,
      maxY: max_y,
      scale: unifiedScale,
      width: svgWidth,
      height: svgHeight,
      pad: padding
    };
  }, [stops]);

  // Transform coordinates to SVG pixels (inverted Y)
  const toSvgX = (x) => pad + (x - minX) * scale;
  const toSvgY = (y) => height - pad - (y - minY) * scale;

  const routes = strategyData?.routes || [];
  const unassigned = strategyData?.metrics?.unassignedStops || [];
  const unassignedIds = new Set(unassigned.map(u => u.stop_id));
  const totalDistance = strategyData?.metrics?.totalDistance !== undefined ? strategyData.metrics.totalDistance : '--';

  // Build grid ticks
  const xTicks = [];
  for (let x = Math.floor(minX); x <= Math.ceil(maxX); x += 2) {
    xTicks.push(x);
  }
  const yTicks = [];
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y += 2) {
    yTicks.push(y);
  }

  return (
    <div className="border border-[#DAD6CC] bg-[#FFFEFA] p-5 h-full flex flex-col justify-between">
      {/* Map Header & Strategy Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DAD6CC] mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C65332] font-semibold">
              01 / CARTESIAN GRID
            </span>
            <span className="text-[#DAD6CC]">|</span>
            <span className="text-xs font-mono text-[#77766F]">
              DEPOT (0,0) → STOPS → DEPOT
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#242520]">
            Interactive Route Plan
          </h2>
        </div>

        {/* Strategy Switcher with Live Distance */}
        <div className="flex items-center border border-[#DAD6CC] bg-[#F5F2EB] p-0.5 text-xs font-mono">
          <button
            onClick={() => onSelectStrategy('baseline')}
            className={`px-3 py-1.5 transition-colors uppercase font-medium ${
              selectedStrategy === 'baseline'
                ? 'bg-[#242520] text-[#FFFEFA] font-bold'
                : 'text-[#77766F] hover:text-[#242520]'
            }`}
          >
            Baseline
          </button>
          <button
            onClick={() => onSelectStrategy('nearestNeighbor')}
            className={`px-3 py-1.5 transition-colors uppercase font-medium ${
              selectedStrategy === 'nearestNeighbor'
                ? 'bg-[#242520] text-[#FFFEFA] font-bold'
                : 'text-[#77766F] hover:text-[#242520]'
            }`}
          >
            Nearest Neighbor
          </button>
          <button
            onClick={() => onSelectStrategy('optimal')}
            className={`px-3 py-1.5 transition-colors uppercase font-medium ${
              selectedStrategy === 'optimal'
                ? 'bg-[#C65332] text-[#FFFEFA] font-bold'
                : 'text-[#77766F] hover:text-[#242520]'
            }`}
          >
            Optimal
          </button>

          {/* Computed Distance Badge */}
          <div className="px-3 py-1.5 font-bold text-[#242520] border-l border-[#DAD6CC] tabular-nums">
            {totalDistance}u
          </div>
        </div>
      </div>

      {/* Charcoal Canvas Map */}
      <div className="relative bg-[#22231F] border border-[#353630] overflow-hidden flex justify-center items-center flex-1 min-h-[380px] sm:min-h-[440px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[500px] select-none"
        >
          <defs>
            {/* Arrowheads for each rider color */}
            {RIDER_PALETTE.map((color, idx) => (
              <marker
                key={idx}
                id={`swiss-arrow-${idx}`}
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={color.stroke} />
              </marker>
            ))}
          </defs>

          {/* Grid lines */}
          {xTicks.map((x) => (
            <line
              key={`gx-${x}`}
              x1={toSvgX(x)}
              y1={pad / 2}
              x2={toSvgX(x)}
              y2={height - pad / 2}
              stroke="#353630"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
          ))}
          {yTicks.map((y) => (
            <line
              key={`gy-${y}`}
              x1={pad / 2}
              y1={toSvgY(y)}
              x2={width - pad / 2}
              y2={toSvgY(y)}
              stroke="#353630"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          <line
            x1={toSvgX(0)}
            y1={pad / 2}
            x2={toSvgX(0)}
            y2={height - pad / 2}
            stroke="#4A4B43"
            strokeWidth="1.5"
          />
          <line
            x1={pad / 2}
            y1={toSvgY(0)}
            x2={width - pad / 2}
            y2={toSvgY(0)}
            stroke="#4A4B43"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          {xTicks.map((x) => (
            <text
              key={`tx-${x}`}
              x={toSvgX(x)}
              y={height - pad / 3}
              fill="#77766F"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {x}
            </text>
          ))}
          {yTicks.map((y) => (
            <text
              key={`ty-${y}`}
              x={pad / 3}
              y={toSvgY(y) + 3}
              fill="#77766F"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {y}
            </text>
          ))}

          {/* Route Vectors for Each Rider */}
          {routes.map((route, rIdx) => {
            const color = RIDER_PALETTE[rIdx % RIDER_PALETTE.length];
            const legs = route.legs || [];
            if (legs.length === 0) return null;

            let pathString = `M ${toSvgX(depot.x)} ${toSvgY(depot.y)} `;
            legs.forEach((leg) => {
              pathString += `L ${toSvgX(leg.to.x)} ${toSvgY(leg.to.y)} `;
            });
            pathString += `L ${toSvgX(depot.x)} ${toSvgY(depot.y)}`;

            return (
              <g key={`route-${rIdx}`}>
                {/* Subtle path glow */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="4"
                  strokeOpacity="0.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main route vector */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={`url(#swiss-arrow-${rIdx % RIDER_PALETTE.length})`}
                />
              </g>
            );
          })}

          {/* Depot Node at (0,0) */}
          <g transform={`translate(${toSvgX(depot.x)}, ${toSvgY(depot.y)})`}>
            <rect x="-7" y="-7" width="14" height="14" fill="#FFFEFA" stroke="#242520" strokeWidth="2" />
            <rect x="-3" y="-3" width="6" height="6" fill="#C65332" />
            <text
              x="0"
              y="-12"
              fill="#FFFEFA"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              DEPOT (0,0)
            </text>
          </g>

          {/* Delivery Stop Nodes */}
          {stops.map((stop) => {
            const isUnassigned = unassignedIds.has(stop.stop_id);
            let isLate = false;
            let assignedRiderIdx = -1;

            routes.forEach((r, idx) => {
              const leg = r.legs.find(l => l.stop_id === stop.stop_id);
              if (leg) {
                assignedRiderIdx = idx;
                if (leg.status === 'LATE') isLate = true;
              }
            });

            const sx = toSvgX(Number(stop.x));
            const sy = toSvgY(Number(stop.y));
            const riderColor = assignedRiderIdx >= 0 ? RIDER_PALETTE[assignedRiderIdx % RIDER_PALETTE.length] : null;

            return (
              <g key={stop.stop_id} transform={`translate(${sx}, ${sy})`}>
                {/* Stop Node */}
                <circle
                  r="7.5"
                  fill={isUnassigned ? '#55544E' : isLate ? '#B83C32' : (riderColor?.stroke || '#77766F')}
                  stroke="#FFFEFA"
                  strokeWidth="1.5"
                />

                {/* Stop Label */}
                <text
                  x="0"
                  y="-11"
                  fill={isLate ? '#FF8A80' : '#FFFEFA'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {stop.stop_id}
                </text>

                {/* Stop Metadata (packages | deadline) */}
                <text
                  x="0"
                  y="17"
                  fill="#A4A299"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {stop.packages}p | {stop.window_end}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#DAD6CC] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 border border-[#242520] bg-[#FFFEFA] inline-flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[#C65332]" />
            </span>
            <span className="text-[#242520]">Depot (0,0)</span>
          </div>

          {routes.map((r, idx) => {
            const color = RIDER_PALETTE[idx % RIDER_PALETTE.length];
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 ${color.bg}`} />
                <span className="text-[#242520]">
                  Rider {idx + 1} ({r.totalPackages} pkgs, {r.totalDistance}u)
                </span>
              </div>
            );
          })}

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B83C32]" />
            <span className="text-[#B83C32]">Late Stop</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55544E]" />
            <span className="text-[#77766F]">Unassigned</span>
          </div>
        </div>

        <div className="text-[11px] text-[#77766F]">
          Closed-Loop Return Leg Vector Counts
        </div>
      </div>
    </div>
  );
}
