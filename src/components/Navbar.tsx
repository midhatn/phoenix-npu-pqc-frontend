import React from 'react';
import { Cpu, ShieldCheck, Key, FileSignature, Hash, Terminal, Server, Sparkles } from 'lucide-react';
import { PqcStandard } from '../types';

interface NavbarProps {
  currentTab: PqcStandard;
  onSelectTab: (tab: PqcStandard) => void;
  onOpenTestRunner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenTestRunner }) => {
  const tabs = [
    { id: 'fips203' as PqcStandard, label: 'ML-KEM (FIPS 203)', icon: Key, badge: 'Key Encapsulation' },
    { id: 'fips204' as PqcStandard, label: 'ML-DSA (FIPS 204)', icon: FileSignature, badge: 'Digital Signatures' },
    { id: 'fips202' as PqcStandard, label: 'SHA-3 / SHAKE (FIPS 202)', icon: Hash, badge: 'Keccak Permutations' },
    { id: 'silicon_gates' as PqcStandard, label: '19 Silicon Gates', icon: Cpu, badge: '736/736 PASS' },
    { id: 'hardware_arch' as PqcStandard, label: 'AIE2 Architecture', icon: Server, badge: 'Tile Memory' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hardware Target */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                  AMD Phoenix NPU
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  XDNA1 · AIE2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                100% Device-Resident PQC (FIPS 202 / 203 / 204)
              </p>
            </div>
          </div>

          {/* Silicon Status Badge & Test Runner Trigger */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Silicon Certified: 736/736 PASS</span>
            </div>

            <button
              id="btn-run-silicon-suite"
              onClick={onOpenTestRunner}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-medium transition shadow-md shadow-cyan-600/30 active:scale-95 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Run Silicon Suite</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
