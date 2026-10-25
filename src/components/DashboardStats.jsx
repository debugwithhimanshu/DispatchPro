import React from 'react';
import { Package, Navigation, Clock, AlertOctagon, TrendingUp, ShieldCheck } from 'lucide-react';

function StatCard({ title, value, sub, icon: Icon, status }) {
  const iconColors = {
    default: 'bg-slate-100 text-slate-500',
    good: 'bg-emerald-50 text-emerald-600',
    warn: 'bg-amber-50 text-amber-600',
    bad: 'bg-red-50 text-red-600',
    info: 'bg-indigo-50 text-indigo-600',
  };
  const colorCls = iconColors[status] || iconColors.default;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${colorCls}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

export default function DashboardStats({
  selectedStrategyData,
  baselineData,
  improvement,
  totalStopsCount,
  activeStopsCount,
}) {
  const metrics = selectedStrategyData?.metrics || {};
  const totalPackages = metrics.totalAssignedPackages || 0;
  const totalDemand = metrics.totalDemandPackages || 0;
  const totalDistance = metrics.totalDistance || 0;
  const lateStops = metrics.totalLateStops || 0;
  const unassignedCount = metrics.unassignedStops?.length || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Packages Delivered"
        value={`${totalPackages} / ${totalDemand}`}
        icon={Package}
        status={totalPackages === totalDemand ? 'good' : 'warn'}
        sub={
          totalPackages === totalDemand
            ? '100% demand satisfied'
            : `${totalDemand - totalPackages} unassigned`
        }
      />
      <StatCard
        title="Total Distance"
        value={`${totalDistance} units`}
        icon={Navigation}
        status="info"
        sub={
          improvement?.percent > 0
            ? `${improvement.formatted} vs baseline (${baselineData?.metrics?.totalDistance ?? '—'})`
            : 'Closed Manhattan loop'
        }
      />
      <StatCard
        title="Late Deliveries"
        value={lateStops}
        icon={Clock}
        status={lateStops > 0 ? 'bad' : 'good'}
        sub={lateStops === 0 ? 'All stops on-time' : 'Schedule adjustment needed'}
      />
      <StatCard
        title="Unassigned Stops"
        value={unassignedCount}
        icon={AlertOctagon}
        status={unassignedCount > 0 ? 'warn' : 'default'}
        sub={unassignedCount === 0 ? 'All stops assigned' : 'Capacity / feasibility limit'}
      />
    </div>
  );
}
