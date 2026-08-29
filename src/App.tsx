import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MlkemPlayground } from './components/MlkemPlayground';
import { MldsaPlayground } from './components/MldsaPlayground';
import { KeccakPlayground } from './components/KeccakPlayground';
import { SiliconGateExplorer } from './components/SiliconGateExplorer';
import { HardwareInspector } from './components/HardwareInspector';
import { HybridQkdPlayground } from './components/HybridQkdPlayground';
import { TestRunnerModal } from './components/TestRunnerModal';
import { PqcStandard } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<PqcStandard>('fips203');
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'fips203' && <MlkemPlayground />}
        {currentTab === 'fips204' && <MldsaPlayground />}
        {currentTab === 'fips202' && <KeccakPlayground />}
        {currentTab === 'hybrid_qkd' && <HybridQkdPlayground />}
        {currentTab === 'silicon_gates' && <SiliconGateExplorer />}
        {currentTab === 'hardware_arch' && <HardwareInspector />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-semibold">AMD Phoenix NPU PQC Suite</span>
            <span>·</span>
            <span>100% On-Device Device-Resident PQC (FIPS 202/203/204)</span>
          </div>
          <div>
            <span>Validated across 23 Gates (839/839 PASS) on AIE2 Physical Silicon (PQC + QKD v1.1.0)</span>
          </div>
        </div>
      </footer>

      {/* Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />
    </div>
  );
};

export default App;
