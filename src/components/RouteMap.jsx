import React, { useMemo } from 'react';
import { Navigation, Info } from 'lucide-react';

const RIDER_COLORS = [
  { stroke: '#4f46e5', fill: '#818cf8', bg: 'bg-indigo-600', label: 'Rider 1' },
  { stroke: '#059669', fill: '#34d399', bg: 'bg-emerald-600', label: 'Rider 2' },
  { stroke: '#d97706', fill: '#fbbf24', bg: 'bg-amber-500', label: 'Rider 3' },
  { stroke: '#db2777', fill: '#f472b6', bg: 'bg-pink-600', label: 'Rider 4' },
];

export default function RouteMap({ stops = [], strategyData, selectedStrategy, onSelectStrategy }) {
  const depot = { x: 0, y: 0 };

  const { minX, maxX, minY, maxY, scale, width, height, pad } = useMemo(() => {
    const allX = [depot.x, ...stops.map(s => Number(s.x) || 0)];
    const allY = [depot.y, ...stops.map(s => Number(s.y) || 0)];
    let min_x = Math.min(...allX), max_x = Math.max(...allX);
    let min_y = Math.min(...allY), max_y = Math.max(...allY);
    if (max_x - min_x < 6) { max_x += 3; min_x -= 3; }
    if (max_y - min_y < 6) { max_y += 3; min_y -= 3; }
    const svgW = 650, svgH = 420, padding = 52;
    const scaleX = (svgW - 2 * padding) / ((max_x - min_x) || 1);
    const scaleY = (svgH - 2 * padding) / ((max_y - min_y) || 1);
    return { minX: min_x, maxX: max_x, minY: min_y, maxY: max_y, scale: Math.min(scaleX, scaleY), width: svgW, height: svgH, pad: padding };
  }, [stops]);

  const toX = x => pad + (x - minX) * scale;
  const toY = y => height - pad - (y - minY) * scale;

  const routes = strategyData?.routes || [];
  const unassignedIds = new Set((strategyData?.metrics?.unassignedStops || []).map(u => u.stop_id));

  const xTicks = [], yTicks = [];
  for (let x = Math.floor(minX); x <= Math.ceil(maxX); x += 2) xTicks.push(x);
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y += 2) yTicks.push(y);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-indigo-600" />
            Route Map
          </h3>
          <p className="text-xs text-slate-400">Closed-loop Manhattan grid — Depot at (0,0)</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {['baseline', 'nearestNeighbor', 'optimal'].map(id => (
            <button
              key={id}
              onClick={() => onSelectStrategy(id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedStrategy === id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {id === 'nearestNeighbor' ? 'Nearest N.' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* SVG */}
      <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950 flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[460px] select-none">
          <defs>
            {RIDER_COLORS.map((c, i) => (
              <marker key={i} id={`arr-${i}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill={c.stroke} />
              </marker>
            ))}
          </defs>

          {/* Grid */}
          {xTicks.map(x => <line key={`gx${x}`} x1={toX(x)} y1={pad/2} x2={toX(x)} y2={height-pad/2} stroke="#1e293b" strokeDasharray="2,3" strokeWidth="1" />)}
          {yTicks.map(y => <line key={`gy${y}`} x1={pad/2} y1={toY(y)} x2={width-pad/2} y2={toY(y)} stroke="#1e293b" strokeDasharray="2,3" strokeWidth="1" />)}

          {/* Axes */}
          <line x1={toX(0)} y1={pad/2} x2={toX(0)} y2={height-pad/2} stroke="#334155" strokeWidth="1.5" />
          <line x1={pad/2} y1={toY(0)} x2={width-pad/2} y2={toY(0)} stroke="#334155" strokeWidth="1.5" />

          {/* Axis labels */}
          {xTicks.map(x => <text key={`tx${x}`} x={toX(x)} y={height-pad/3} fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle">{x}</text>)}
          {yTicks.map(y => <text key={`ty${y}`} x={pad/3} y={toY(y)+3} fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle">{y}</text>)}

          {/* Routes */}
          {routes.map((route, rIdx) => {
            const c = RIDER_COLORS[rIdx % RIDER_COLORS.length];
            if (!route.legs?.length) return null;
            let d = `M ${toX(depot.x)} ${toY(depot.y)}`;
            route.legs.forEach(leg => { d += ` L ${toX(leg.to.x)} ${toY(leg.to.y)}`; });
            d += ` L ${toX(depot.x)} ${toY(depot.y)}`;
            return (
              <g key={rIdx}>
                <path d={d} fill="none" stroke={c.stroke} strokeWidth="4" strokeOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
                <path d={d} fill="none" stroke={c.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" markerEnd={`url(#arr-${rIdx % RIDER_COLORS.length})`} />
              </g>
            );
          })}

          {/* Depot */}
          <g transform={`translate(${toX(0)},${toY(0)})`}>
            <circle r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2.5" />
            <rect x="-4" y="-4" width="8" height="8" fill="#38bdf8" rx="1" />
            <text x="0" y="-14" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">DEPOT</text>
          </g>

          {/* Stops */}
          {stops.map(stop => {
            const isUnassigned = unassignedIds.has(stop.stop_id);
            let isLate = false, riderIdx = -1;
            routes.forEach((r, i) => {
              const leg = r.legs.find(l => l.stop_id === stop.stop_id);
              if (leg) { riderIdx = i; if (leg.status === 'LATE') isLate = true; }
            });
            const c = riderIdx >= 0 ? RIDER_COLORS[riderIdx % RIDER_COLORS.length] : null;
            const sx = toX(Number(stop.x)), sy = toY(Number(stop.y));
            const fillColor = isUnassigned ? '#64748b' : isLate ? '#ef4444' : (c?.stroke || '#64748b');
            return (
              <g key={stop.stop_id} transform={`translate(${sx},${sy})`}>
                <circle r="7" fill={fillColor} stroke="#f8fafc" strokeWidth="2" />
                <text x="0" y="-11" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">{stop.stop_id}</text>
                <text x="0" y="17" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">({stop.packages}p)</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-sky-400 border border-slate-300" />
            <span>Depot (0,0)</span>
          </div>
          {routes.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${RIDER_COLORS[i % RIDER_COLORS.length].bg}`} />
              <span>Rider {i+1} ({r.totalPackages} pkgs)</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span>Unassigned</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
          <Info className="w-3.5 h-3.5" />
          Includes return leg to Depot
        </div>
      </div>
    </div>
  );
}
