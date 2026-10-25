import React, { useRef } from 'react';
import { Plus, Trash2, RotateCcw, Upload, Download, AlertCircle, FileSpreadsheet, Ban, CheckCircle } from 'lucide-react';
import { exportToCSV, exportToJSON, parseCSV, parseJSON } from '../utils/csv.js';

const inputCls =
  'w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono transition-colors';

export default function StopsEditor({
  stops, onUpdateStop, onAddStop, onDeleteStop, onResetStops,
  onImportStops, validationErrors, failedStopIds, onToggleFailed,
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = ev.target?.result;
        onImportStops(file.name.endsWith('.json') ? parseJSON(text) : parseCSV(text));
      } catch (err) { alert(`Import failed: ${err.message}`); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const download = (content, name, type) => {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type })),
      download: name,
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            Delivery Stops Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Edit stops, coordinates, demand and time windows. Routes update live.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.json" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button onClick={() => download(exportToCSV(stops), 'dispatch_stops.csv', 'text/csv')} className="btn-secondary">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={() => download(exportToJSON(stops), 'dispatch_stops.json', 'application/json')} className="btn-secondary">
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button onClick={onResetStops} className="btn-secondary text-amber-600 hover:text-amber-700">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={onAddStop} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Stop
          </button>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors?.length > 0 && (
        <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700">Validation Errors</p>
            <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5 mt-0.5">
              {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              {['Stop ID', 'X', 'Y', 'Pkgs', 'Win Start', 'Win End', 'Status', ''].map(h => (
                <th key={h} className="px-3 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stops.map((stop, index) => {
              const isFailed = failedStopIds?.has(stop.stop_id);
              return (
                <tr key={index} className={`transition-colors ${isFailed ? 'bg-red-50/60 opacity-70' : 'hover:bg-slate-50'}`}>
                  <td className="px-3 py-2">
                    <input type="text" value={stop.stop_id}
                      onChange={e => onUpdateStop(index, 'stop_id', e.target.value)}
                      className={`${inputCls} w-20 font-bold text-slate-900`} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={stop.x}
                      onChange={e => onUpdateStop(index, 'x', Number(e.target.value))}
                      className={`${inputCls} w-16`} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={stop.y}
                      onChange={e => onUpdateStop(index, 'y', Number(e.target.value))}
                      className={`${inputCls} w-16`} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="1" value={stop.packages}
                      onChange={e => onUpdateStop(index, 'packages', parseInt(e.target.value, 10) || 1)}
                      className={`${inputCls} w-16`} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="time" value={stop.window_start}
                      onChange={e => onUpdateStop(index, 'window_start', e.target.value)}
                      className={`${inputCls} w-26`} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="time" value={stop.window_end}
                      onChange={e => onUpdateStop(index, 'window_end', e.target.value)}
                      className={`${inputCls} w-26`} />
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => onToggleFailed(stop.stop_id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase border transition-colors ${
                        isFailed
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}>
                      {isFailed
                        ? <><Ban className="w-3 h-3" /> Failed</>
                        : <><CheckCircle className="w-3 h-3" /> Active</>}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => onDeleteStop(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
