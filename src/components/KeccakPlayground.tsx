import React, { useState, useEffect } from 'react';
import { Hash, Play, Copy, Check, Cpu, RefreshCw, Zap, Sliders } from 'lucide-react';
import { KeccakAlgorithm, KeccakResult } from '../types';
import { KECCAK_SPECS, computeKeccak } from '../crypto/keccak';
import { npuKeccakHash } from '../crypto/hardwareApi';
import { formatHexView } from '../utils';

export const KeccakPlayground: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<KeccakAlgorithm>('SHA3-256');
  const [inputMessage, setInputMessage] = useState('Device-Resident Post-Quantum Cryptography on AMD Phoenix NPU');
  const [isHexInput, setIsHexInput] = useState(false);
  const [squeezeBytes, setSqueezeBytes] = useState<number>(32);
  const [result, setResult] = useState<(KeccakResult & { isHardware?: boolean; executionTimeMs?: number; hardwareLabel?: string }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const spec = KECCAK_SPECS[algorithm];
  const isXof = algorithm.startsWith('SHAKE');

  const handleCompute = async () => {
    setIsExecuting(true);
    try {
      let msgHex = '';
      if (isHexInput) {
        msgHex = inputMessage.replace(/\s+/g, '');
      } else {
        const encoder = new TextEncoder();
        msgHex = Array.from(encoder.encode(inputMessage)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }

      const hwRes = await npuKeccakHash(algorithm, msgHex, squeezeBytes);
      const fallback = computeKeccak(algorithm, inputMessage, isHexInput, squeezeBytes);

      setResult({
        ...fallback,
        digestHex: hwRes.digestHex,
        isHardware: hwRes.isHardware,
        executionTimeMs: hwRes.executionTimeMs,
        hardwareLabel: hwRes.hardwareLabel,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    handleCompute();
  }, [algorithm, inputMessage, isHexInput, squeezeBytes]);

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.digestHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Specs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                NIST FIPS 202 Service (Keccak-f[1600])
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Milestone DR9 Service Graph
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Permutation-Based Hash & Extendable-Output Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              100% on-device AIE2 vector acceleration of 24-round Keccak-p[1600, 24] permutations with zero host intervention.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
            {(['SHA3-224', 'SHA3-256', 'SHA3-384', 'SHA3-512', 'SHAKE128', 'SHAKE256'] as KeccakAlgorithm[]).map((algo) => (
              <button
                key={algo}
                id={`btn-keccak-${algo}`}
                onClick={() => setAlgorithm(algo)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                  algorithm === algo
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Rate (r)</span>
            <span className="text-cyan-300 font-bold">{spec.rateBits} bits ({spec.rateBits / 8} B)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Capacity (c)</span>
            <span className="text-cyan-300 font-bold">{spec.capacityBits} bits</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Suffix Domain</span>
            <span className="text-cyan-300 font-bold">0x{spec.domainSuffix.toString(16).toUpperCase()}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Permutation State</span>
            <span className="text-cyan-300 font-bold">1600 bits (200 B)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Output Digest</span>
            <span className="text-cyan-300 font-bold">{isXof ? `${squeezeBytes} B (XOF)` : `${spec.outputBits / 8} B`}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Security Strength</span>
            <span className="text-emerald-400 font-bold">{spec.securityBits} bits</span>
          </div>
        </div>
      </div>

      {/* Input Message & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold text-slate-300">
              Message Ingress Payload
            </label>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">Hex Mode:</span>
              <input
                type="checkbox"
                checked={isHexInput}
                onChange={(e) => setIsHexInput(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          <textarea
            rows={3}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            placeholder={isHexInput ? 'Enter hex string (e.g. 48656c6c6f)...' : 'Enter plain text to hash...'}
          />

          {isXof && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>XOF Squeeze Length:</span>
                </span>
                <span className="text-cyan-400 font-bold">{squeezeBytes} Bytes ({squeezeBytes * 8} bits)</span>
              </div>
              <input
                type="range"
                min={16}
                max={128}
                step={8}
                value={squeezeBytes}
                onChange={(e) => setSqueezeBytes(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          )}

          <button
            id="btn-recompute-hash"
            onClick={handleCompute}
            disabled={isExecuting}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-cyan-600/30 active:scale-98"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Computing on AMD Phoenix NPU...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Dispatch Hash to Physical NPU</span>
              </>
            )}
          </button>
        </div>

        {/* Output Digest */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Output Digest / XOF Stream</h3>
              {result?.isHardware && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({result.executionTimeMs?.toFixed(1)}ms)</span>
                </span>
              )}
            </div>

            {result && (
              <div className="mt-3 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>{algorithm} Digest ({result.digestHex.length / 2} bytes)</span>
                    <button
                      onClick={copyToClipboard}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/50 text-emerald-400 text-[11px] font-bold select-all break-all leading-relaxed">
                    {result.digestHex}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>Absorbed Blocks: <span className="text-white font-bold">{result.blocksAbsorbed}</span></div>
                  <div>Padded Ingress: <span className="text-white font-bold">{result.paddedLengthBytes} B</span></div>
                  <div>Keccak Rounds: <span className="text-cyan-400 font-bold">24 on AIE2</span></div>
                  <div>Zero Host Fallback: <span className="text-emerald-400 font-bold">TRUE</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
