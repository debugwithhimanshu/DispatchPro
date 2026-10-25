import React, { useRef } from 'react';
import { Plus, RotateCcw, Upload, Download, Trash2, Ban, CheckCircle } from 'lucide-react';
import { exportToCSV, exportToJSON, parseCSV, parseJSON } from '../utils/csv.js';

export default function StopsEditor({
  stops,
  onUpdateStop,
  onAddStop,
  onDeleteStop,
  onResetStops,
  onImportStops,
  validationErrors,
  failedStopIds,
  onToggleFailed
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        let parsedStops = [];
        if (file.name.endsWith('.json')) {
          parsedStops = parseJSON(text);
        } else {
          parsedStops = parseCSV(text);
        }
        onImportStops(parsedStops);
      } catch (err) {
        alert(`Failed to import file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(stops);
    downloadFile(csv, 'dispatch_stops.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(stops);
    downloadFile(json, 'dispatch_stops.json', 'application/json');
  };

  return (
    <section className="mb-8 border border-[#DAD6CC] bg-[#FFFEFA]">
      {/* Table Header and Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[#DAD6CC] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F5F2EB]/60">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#C65332] font-semibold mb-0.5">
            05 / DELIVERY MATRIX
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#242520]">
            Delivery Stops
          </h2>
          <p className="text-xs font-mono text-[#77766F] mt-0.5">
            Edit coordinates, demand, and delivery windows. Route calculations respond immediately.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 bg-[#FFFEFA] border border-[#DAD6CC] hover:bg-[#EAE6DC] text-[#242520] font-medium"
          >
            Import
          </button>
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-[#FFFEFA] border border-[#DAD6CC] hover:bg-[#EAE6DC] text-[#242520] font-medium"
          >
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1.5 bg-[#FFFEFA] border border-[#DAD6CC] hover:bg-[#EAE6DC] text-[#242520] font-medium"
          >
            JSON
          </button>
          <button
            onClick={onResetStops}
            className="px-2.5 py-1.5 bg-[#FFFEFA] border border-[#DAD6CC] hover:bg-[#FCECEB] text-[#B83C32] font-medium"
          >
            Reset
          </button>
          <button
            onClick={onAddStop}
            className="px-3 py-1.5 bg-[#242520] hover:bg-[#353630] text-[#FFFEFA] font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stop</span>
          </button>
        </div>
      </div>

      {/* Validation Errors banner */}
      {validationErrors && validationErrors.length > 0 && (
        <div className="p-3 bg-[#FCECEB] border-b border-[#B83C32] text-xs font-mono text-[#B83C32]">
          <strong>Validation Errors:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Stops Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#F5F2EB] text-[#77766F] uppercase border-b border-[#DAD6CC]">
            <tr>
              <th className="px-3 py-2.5">Stop ID</th>
              <th className="px-3 py-2.5">X Coord</th>
              <th className="px-3 py-2.5">Y Coord</th>
              <th className="px-3 py-2.5">Packages</th>
              <th className="px-3 py-2.5">Window Start</th>
              <th className="px-3 py-2.5">Window End</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DAD6CC]">
            {stops.map((stop, index) => {
              const isFailed = failedStopIds?.has(stop.stop_id);
              return (
                <tr
                  key={index}
                  className={`hover:bg-[#F5F2EB]/50 transition-colors ${
                    isFailed ? 'bg-[#FCECEB]/50 opacity-60' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={stop.stop_id}
                      onChange={(e) => onUpdateStop(index, 'stop_id', e.target.value)}
                      className="w-20 px-2 py-1 font-bold text-[#242520] border border-[#DAD6CC] bg-[#FFFEFA] focus:border-[#C65332] focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={stop.x}
                      onChange={(e) => onUpdateStop(index, 'x', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-[#242520] border border-[#DAD6CC] bg-[#FFFEFA] focus:border-[#C65332] focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={stop.y}
                      onChange={(e) => onUpdateStop(index, 'y', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-[#242520] border border-[#DAD6CC] bg-[#FFFEFA] focus:border-[#C65332] focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      value={stop.packages}
                      onChange={(e) => onUpdateStop(index, 'packages', parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1 font-bold text-[#C65332] border border-[#DAD6CC] bg-[#FFFEFA] focus:border-[#C65332] focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      value={stop.window_start}
                      onChange={(e) => onUpdateStop(index, 'window_start', e.target.value)}
                      className="w-24 px-2 py-1 text-[#242520] border border-[#DAD6CC] bg-[#FFFEFA] focus:border-[#C65332] focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      value={stop.window_end}
                      onChange={(e) => onUpdateStop(index, 'window_end', e.target.value)}
                      className="w-24 px-2 py-1 text-[#242520] border border-[#DAD6CC] bg-[#FFFEFA] focus:border-[#C65332] focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleFailed(stop.stop_id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        isFailed
                          ? 'border-[#B83C32] bg-[#B83C32] text-[#FFFEFA]'
                          : 'border-[#287653] bg-[#EAE6DC] text-[#287653] hover:bg-[#DAD6CC]'
                      }`}
                      title={isFailed ? 'Restore to planning' : 'Mark as failed delivery'}
                    >
                      {isFailed ? (
                        <>
                          <Ban className="w-3 h-3" />
                          <span>FAILED</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => onDeleteStop(index)}
                      className="p-1 text-[#77766F] hover:text-[#B83C32] transition-colors"
                      title="Delete Stop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
