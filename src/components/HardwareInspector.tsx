import React, { useState } from 'react';
import { Cpu, Server, ShieldCheck, Zap, Lock, RefreshCw, Trash2, ArrowDownUp, CheckCircle, Database } from 'lucide-react';

export const HardwareInspector: React.FC = () => {
  const [activeTile, setActiveTile] = useState<number>(0);
  const [isZeroized, setIsZeroized] = useState<boolean>(false);
  const [qkdKeyHex, setQkdKeyHex] = useState<string>('E7C3A1F90D28B46C5E3F91A0B2C4D6E8F0123456789ABCDEF0123456789ABCDE');
  const [zeroizeLog, setZeroizeLog] = useState<string>('State Sealed & Protected: Hardware memory scrub barrier ready.');

  const tiles = Array.from({ length: 16 }, (_, idx) => {
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    const isShim = row === 0;
    const isWorker = row >= 1;
    let label = `Tile [${row},${col}]`;
    let type = isShim ? 'SHIM DMA / NOC' : 'AIE2 Compute ML';
    let memUsage = isShim ? 12 : 28 + (idx * 2) % 24;
    let status = isZeroized ? 'SCRUBBED (0x00)' : 'ACTIVE PQC FIFO';

    return { id: idx, row, col, label, type, isShim, isWorker, memUsage, status };
  });

  const handleZeroize = () => {
    setIsZeroized(true);
    setZeroizeLog('ZEROIZATION TRIGGERED: All 16 AIE2 tile RAM buffers (64 KiB each), registers, and token ObjectFIFOs wiped to 0x00 via hardware DMA barrier.');
  };

  const handleResetZeroize = () => {
    setIsZeroized(false);
    setZeroizeLog('State Reinitialized: Fresh cryptographic session bounds restored.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                Microarchitecture & Tiled Silicon Layout
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                AMD XDNA1 AIE2 (Ryzen AI NPU1)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              AIE2 Tiled Compute Array & Sealed Lifecycle (DR10)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              2D Array of AI Engine-ML (AIE2) tiles interconnected via 512-bit point-to-point stream switches,
              ObjectFIFOs, and hardware memory zeroization controllers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isZeroized ? (
              <button
                id="btn-reinit-silicon"
                onClick={handleResetZeroize}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Arm Silicon Array</span>
              </button>
            ) : (
              <button
                id="btn-zeroize-silicon"
                onClick={handleZeroize}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-medium transition cursor-pointer shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trigger Hardware Zeroization</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2D Array Visualizer & Selected Tile Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4x4 AIE2 Tile Array */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>4×4 Physical AIE2 / SHIM NOC Tile Array</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" />
                <span>Shim NOC</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-cyan-600 inline-block" />
                <span>Compute Tile</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {tiles.map((t) => {
              const isSelected = activeTile === t.id;
              return (
                <div
                  key={t.id}
                  id={`aie2-tile-${t.id}`}
                  onClick={() => setActiveTile(t.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800 shadow-md shadow-cyan-500/20'
                      : t.isShim
                      ? 'border-blue-900/60 bg-blue-950/20 hover:border-blue-700'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="font-bold text-white">R{t.row}C{t.col}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        t.isShim ? 'bg-blue-950 text-blue-300' : 'bg-cyan-950 text-cyan-300'
                      }`}
                    >
                      {t.isShim ? 'SHIM' : 'AIE2'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono mb-2 truncate">
                    {t.type}
                  </div>

                  {/* Tile RAM Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>RAM</span>
                      <span className={isZeroized ? 'text-rose-400' : 'text-slate-300'}>
                        {isZeroized ? '0 KiB' : `${t.memUsage} / 64 KiB`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isZeroized ? 'w-0' : 'bg-cyan-500'
                        }`}
                        style={{ width: isZeroized ? '0%' : `${(t.memUsage / 64) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold block mb-1">Zero-Copy Point-to-Point ObjectFIFO Bus:</span>
            Direct hardware DMAs interconnect adjacent AIE2 cores. Cryptographic intermediates are never pushed to the host CPU DDR5/LPDDR5 memory hierarchy.
          </div>
        </div>

        {/* Right Col: Selected Tile & Invariants */}
        <div className="space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white">
                Tile [Row {tiles[activeTile].row}, Col {tiles[activeTile].col}] Specs
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Core ID #{activeTile}
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs text-slate-300">
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-900">
                <span className="text-slate-500">Tile Type</span>
                <span className="font-semibold text-white">{tiles[activeTile].type}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-900">
                <span className="text-slate-500">Instruction Text</span>
                <span className="text-emerald-400 font-semibold">&lt; 16 KiB Hard Cap</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-900">
                <span className="text-slate-500">Local Data Memory</span>
                <span className="text-emerald-400 font-semibold">64 KiB High-Speed SRAM</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-900">
                <span className="text-slate-500">SIMD Vector Width</span>
                <span className="text-cyan-400 font-semibold">512-bit (16 × 32-bit INT/MOD)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-900">
                <span className="text-slate-500">State Scrub Status</span>
                <span className={isZeroized ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                  {tiles[activeTile].status}
                </span>
              </div>
            </div>
          </div>

          {/* Sealed Hardware Lifecycle (DR10) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center space-x-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sealed Hardware Lifecycle & QKD Ingress</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Quantum Key Distribution (QKD) external key adapter with anti-replay CRC32 checksums:
            </p>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">QKD Key Container (DR10 Ingress):</span>
              <span className="text-[11px] text-cyan-300 break-all">{qkdKeyHex}</span>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold block mb-0.5">Hardware Zeroization Log:</span>
              <span>{zeroizeLog}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
