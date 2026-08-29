import React, { useState, useEffect, useRef } from 'react';
import { Cpu, ShieldCheck, Key, FileSignature, Hash, Terminal, Server, ChevronLeft, ChevronRight } from 'lucide-react';
import { PqcStandard } from '../types';

interface NavbarProps {
  currentTab: PqcStandard;
  onSelectTab: (tab: PqcStandard) => void;
  onOpenTestRunner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenTestRunner }) => {
  const [isBridgeOnline, setIsBridgeOnline] = useState<boolean>(false);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  const navScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkBridge = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/status');
        if (res.ok) {
          const data = await res.json();
          setIsBridgeOnline(data.pqc_repo_ready === true);
        } else {
          setIsBridgeOnline(false);
        }
      } catch {
        setIsBridgeOnline(false);
      }
    };
    checkBridge();
    const interval = setInterval(checkBridge, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkScroll = () => {
    if (navScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      const offset = direction === 'left' ? -250 : 250;
      navScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (navScrollRef.current && e.deltaY !== 0) {
      navScrollRef.current.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
      checkScroll();
    }
  };

  const tabs = [
    { id: 'fips203' as PqcStandard, label: 'ML-KEM (FIPS 203)', icon: Key, badge: 'Key Encapsulation' },
    { id: 'fips204' as PqcStandard, label: 'ML-DSA (FIPS 204)', icon: FileSignature, badge: 'Digital Signatures' },
    { id: 'fips202' as PqcStandard, label: 'SHA-3 / SHAKE (FIPS 202)', icon: Hash, badge: 'Keccak Permutations' },
    { id: 'hybrid_qkd' as PqcStandard, label: 'Hybrid QKD + PQC', icon: ShieldCheck, badge: 'DR16–DR20 v1.2.0' },
    { id: 'silicon_gates' as PqcStandard, label: '25 Silicon Gates', icon: Cpu, badge: '851/851 PASS' },
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
                Device-Resident PQC (FIPS 202 / 203 / 204)
              </p>
            </div>
          </div>

          {/* Silicon Status Badge & Test Runner Trigger */}
          <div className="flex items-center space-x-3">
            {isBridgeOnline ? (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-xs font-mono text-emerald-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">NPU Silicon: Connected</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Browser Emulation</span>
              </div>
            )}

            <button
              id="btn-run-silicon-suite"
              onClick={onOpenTestRunner}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-white font-mono text-xs font-medium transition shadow-md active:scale-95 cursor-pointer ${
                isBridgeOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{isBridgeOnline ? 'Run Silicon Suite' : 'Open Test Runner'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation with Scroll Controls */}
        <div className="relative border-t border-slate-900 flex items-center">
          {/* Scroll Left Button */}
          {showLeftArrow && (
            <button
              onClick={() => scrollNav('left')}
              className="absolute left-0 z-10 p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-md text-cyan-400 shadow-lg cursor-pointer transition-all hover:scale-105"
              title="Scroll Tabs Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Tabs Track */}
          <nav
            ref={navScrollRef}
            onScroll={checkScroll}
            onWheel={handleWheelScroll}
            className="flex space-x-1.5 overflow-x-auto py-2.5 scroll-smooth w-full select-none"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#0891b2 #0f172a',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700 font-semibold'
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

          {/* Scroll Right Button */}
          {showRightArrow && (
            <button
              onClick={() => scrollNav('right')}
              className="absolute right-0 z-10 p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-md text-cyan-400 shadow-lg cursor-pointer transition-all hover:scale-105"
              title="Scroll Tabs Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
