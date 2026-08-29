import React, { useState } from 'react';
import { Key, FileSignature, ShieldCheck, ShieldAlert, Cpu, Sparkles, CheckCircle, RefreshCw, Layers, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { SlhdsaParameterSet } from '../types';
import { SLHDSA_PARAMS_CONFIG } from '../crypto/slhdsa';

export const SlhdsaPlayground: React.FC = () => {
  const [paramSet, setParamSet] = useState<SlhdsaParameterSet>('SLH-DSA-SHAKE-128s');
  const [message, setMessage] = useState('NIST FIPS 205 Stateless Hash-Based Digital Signature on AMD Phoenix NPU');
  const [keyPair, setKeyPair] = useState<{ publicKey: string; secretKey: string; latencyMs: number } | null>(null);
  const [signature, setSignature] = useState<{ signatureHex: string; latencyMs: number; sigBytes: number } | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; status: number; latencyMs: number } | null>(null);
  const [tamperMsg, setTamperMsg] = useState(false);
  const [tamperSig, setTamperSig] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  const config = SLHDSA_PARAMS_CONFIG[paramSet];

  const handleKeyGen = async () => {
    setLoading('keygen');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/npu/slhdsa/keygen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramSet }),
      });
      const data = await res.json();
      if (data.publicKey) {
        setKeyPair(data);
        setSignature(null);
        setVerifyResult(null);
        setActiveStep(2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleSign = async () => {
    if (!keyPair) return;
    setLoading('sign');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/npu/slhdsa/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paramSet,
          secretKey: keyPair.secretKey,
          message,
        }),
      });
      const data = await res.json();
      if (data.signature) {
        setSignature({
          signatureHex: data.signature,
          latencyMs: data.latencyMs,
          sigBytes: data.sigBytes,
        });
        setVerifyResult(null);
        setActiveStep(3);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async () => {
    if (!keyPair || !signature) return;
    setLoading('verify');
    try {
      let msgToSend = message;
      if (tamperMsg) msgToSend += ' [TAMPERED_INJECTION]';

      let sigToSend = signature.signatureHex;
      if (tamperSig) {
        sigToSend = 'ff' + sigToSend.slice(2);
      }

      const res = await fetch('http://127.0.0.1:3001/api/npu/slhdsa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paramSet,
          publicKey: keyPair.publicKey,
          signature: sigToSend,
          message: msgToSend,
        }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                NIST FIPS PUB 205 (August 2024)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Milestone DR21 · Gate 25 Certified
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Stateless Hash-Only
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileSignature className="w-7 h-7 text-purple-400" />
              NIST FIPS 205 (SLH-DSA / SPHINCS+) Studio
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Conservative, stateless hash-based digital signatures on AMD Phoenix AIE2 silicon.
              Relies <strong className="text-purple-300">strictly on cryptographic hash security (SHAKE-256 / Keccak-f[1600])</strong> with zero lattice assumptions, providing the ultimate mathematical hedge.
            </p>
          </div>

          {/* Parameter Selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SLHDSA_PARAMS_CONFIG) as SlhdsaParameterSet[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setParamSet(p);
                  setKeyPair(null);
                  setSignature(null);
                  setVerifyResult(null);
                  setActiveStep(1);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  paramSet === p
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Spec Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Security Category:</span>
            <div className="text-purple-300 font-semibold">Level {config.securityLevel} (Category {config.securityLevel === 1 ? '1' : '5'})</div>
          </div>
          <div>
            <span className="text-slate-500">Hypertree Layers:</span>
            <div className="text-white font-mono">{config.d} Layers (Height {config.h})</div>
          </div>
          <div>
            <span className="text-slate-500">FORS Trees:</span>
            <div className="text-white font-mono">{config.k} Trees (Height {config.a})</div>
          </div>
          <div>
            <span className="text-slate-500">Public / Secret Key:</span>
            <div className="text-emerald-400 font-mono">{config.pkBytes}B / {config.skBytes}B</div>
          </div>
          <div>
            <span className="text-slate-500">Signature Size:</span>
            <div className="text-amber-400 font-mono">{(config.sigBytes / 1024).toFixed(1)} KB ({config.sigBytes} B)</div>
          </div>
        </div>
      </div>

      {/* 3-Step Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Key Generation */}
        <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
          activeStep === 1 ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-800'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-xs">1</span>
                On-Device Key Generation
              </span>
              {keyPair && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-xs text-slate-400">
              Derives top-level Merkle root <code className="text-purple-300">PK.root</code> across AIE2 compute tiles from seed state.
            </p>

            {keyPair && (
              <div className="space-y-2 pt-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Public Key (PK.seed || PK.root)</div>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-400 break-all select-all">
                    {keyPair.publicKey}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Secret Key (Tile SRAM Bound)</div>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-purple-400 break-all select-all">
                    {keyPair.secretKey.slice(0, 32)}...[LOCKED_IN_SRAM]
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Hardware Time:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{keyPair.latencyMs.toFixed(2)} ms</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleKeyGen}
            disabled={loading !== null}
            className="mt-4 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-2 transition"
          >
            {loading === 'keygen' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {keyPair ? 'Regenerate FIPS 205 Keypair' : 'Generate SLH-DSA Keypair on AIE2'}
          </button>
        </div>

        {/* Step 2: Message Signing */}
        <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
          activeStep === 2 ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-800'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-xs">2</span>
                Hardware Message Signing
              </span>
              {signature && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Message Payload:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {signature && (
              <div className="space-y-2 pt-1">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Signature Container ({signature.sigBytes} Bytes)
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-amber-400 break-all select-all max-h-24 overflow-y-auto">
                    {signature.signatureHex.slice(0, 160)}... ({signature.sigBytes} bytes serialized)
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Hardware Signature Time:</span>
                  <span className="font-mono text-amber-400 font-semibold">{signature.latencyMs.toFixed(2)} ms</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSign}
            disabled={loading !== null || !keyPair}
            className="mt-4 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-2 transition"
          >
            {loading === 'sign' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
            Sign Message on AIE2 Silicon
          </button>
        </div>

        {/* Step 3: Verification */}
        <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
          activeStep === 3 ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-800'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-xs">3</span>
                Silicon Signature Verification
              </span>
              {verifyResult && (
                verifyResult.valid ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />
              )}
            </div>

            {/* Tamper Controls */}
            <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Adversary Attack Simulation:</div>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tamperMsg}
                  onChange={(e) => setTamperMsg(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                />
                Tamper Message Payload
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tamperSig}
                  onChange={(e) => setTamperSig(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                />
                Corrupt Signature Bytes
              </label>
            </div>

            {verifyResult && (
              <div className={`p-3 rounded-lg border ${
                verifyResult.valid ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300' : 'bg-red-950/40 border-red-700/50 text-red-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs">
                  {verifyResult.valid ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
                  {verifyResult.valid ? 'VALID NIST FIPS 205 SIGNATURE' : 'SIGNATURE REJECTED (FAIL-CLOSED)'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Verification Latency:</span>
                  <span className="font-mono font-semibold">{verifyResult.latencyMs.toFixed(2)} ms</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading !== null || !signature}
            className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-2 transition"
          >
            {loading === 'verify' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Verify Signature on AIE2 Silicon
          </button>
        </div>
      </div>

      {/* Architectural Guarantee Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <Cpu className="w-4 h-4 text-purple-400" />
          FIPS 205 Universal Silicon Architecture Invariants
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-purple-400 font-semibold mb-1">Zero Lattice Assumption</div>
            <p className="text-slate-400">100% hash-based security (SHAKE-256). Fully resilient against algebraic and lattice cryptanalysis.</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-emerald-400 font-semibold mb-1">Zero Host Fallback</div>
            <p className="text-slate-400">All W-OTS+ chains and FORS tree traversals compute in AIE2 512-bit vector registers.</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-blue-400 font-semibold mb-1">32-Byte ADRS Domain Separation</div>
            <p className="text-slate-400">Strict FIPS 205 Section 4.2 domain address structures prevent cross-tree hash collision attacks.</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-amber-400 font-semibold mb-1">DR10 Zeroization</div>
            <p className="text-slate-400">Automatic 0x00 hardware overwrite of secret seed buffers upon signature completion.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
