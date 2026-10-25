import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HeroSection({
  scenarioName,
  riderCount,
  activeStopsCount,
  onOptimize,
  onVerify
}) {
  return (
    <section className="mb-6 pt-2 border-b border-[#DAD6CC] pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {/* Eyebrow */}
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#C65332] font-semibold mb-1">
            SOBHASARIA HACKFEST 2026 / TRACK H04
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#242520] leading-none mb-2">
            Every stop. A smarter route.
          </h1>

          {/* Supporting Text */}
          <p className="text-sm text-[#77766F] max-w-2xl font-sans leading-relaxed">
            Optimize multi-rider delivery assignments, respect strict package capacity limits,
            and evaluate dynamic time windows with transparent, closed-loop Manhattan calculations.
          </p>

          {/* Status Line */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono text-[#77766F]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#C65332]" />
              Scenario: <strong className="text-[#242520]">{scenarioName}</strong>
            </span>
            <span className="text-[#DAD6CC]">|</span>
            <span>
              Active Fleet: <strong className="text-[#242520]">{riderCount} Riders</strong>
            </span>
            <span className="text-[#DAD6CC]">|</span>
            <span>
              Stops: <strong className="text-[#242520]">{activeStopsCount} Deliveries</strong>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOptimize}
            className="inline-flex items-center gap-2 bg-[#242520] hover:bg-[#353630] text-[#FFFEFA] px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
          >
            <span>Optimize Routes</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C65332]" />
          </button>
          <button
            onClick={onVerify}
            className="inline-flex items-center gap-1.5 bg-[#FFFEFA] hover:bg-[#EAE6DC] text-[#242520] border border-[#DAD6CC] px-3.5 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#287653]" />
            <span>Run Verification</span>
          </button>
        </div>
      </div>
    </section>
  );
}
