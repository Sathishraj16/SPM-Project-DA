import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import ExportModal from './components/ExportModal'
import OverviewPage from './pages/OverviewPage'
import CBAPage from './pages/CBAPage'
import CashFlowPage from './pages/CashFlowPage'
import PaybackROIPage from './pages/PaybackROIPage'
import NPVPage from './pages/NPVPage'
import BCRPage from './pages/BCRPage'
import IRRPage from './pages/IRRPage'
import RiskPage from './pages/RiskPage'
import CPMPage from './pages/CPMPage'
import CrashingPage from './pages/CrashingPage'
import PERTPage from './pages/PERTPage'
import FPAPage from './pages/FPAPage'
import ObjectPointsPage from './pages/ObjectPointsPage'

import { calculateCBA, CBA_EVENTHUB_PRESET } from './calculators/cba'
import { calculateCashFlow, CASHFLOW_EVENTHUB_PRESET } from './calculators/cashflow'
import { calculateNPV, NPV_EVENTHUB_PRESET } from './calculators/npv'
import { calculateBCR } from './calculators/bcr'
import { calculateIRR } from './calculators/irr'
import { calculateCPM, CPM_FACULTY_ACTIVITIES } from './calculators/cpm'
import { calculateFPA, FPA_EVENTHUB_COMPONENTS, FPA_DEFAULT_GSCS } from './calculators/fpa'
import { calculateObjectPoints, OP_EVENTHUB_COMPONENTS } from './calculators/objectPoints'
type CBAResult = ReturnType<typeof calculateCBA>

const _defaultCBA = calculateCBA(CBA_EVENTHUB_PRESET)
const _defaultCF  = calculateCashFlow(CASHFLOW_EVENTHUB_PRESET)
const _defaultNPV = calculateNPV(NPV_EVENTHUB_PRESET)
const _defaultBCR = calculateBCR(NPV_EVENTHUB_PRESET)
const _defaultIRR = calculateIRR(NPV_EVENTHUB_PRESET, 10, 15)
const _defaultCPM = calculateCPM(CPM_FACULTY_ACTIVITIES)
const _defaultFPA = calculateFPA(FPA_EVENTHUB_COMPONENTS, FPA_DEFAULT_GSCS)
const _defaultOP  = calculateObjectPoints(OP_EVENTHUB_COMPONENTS, 20, 'Nominal')

function AppInner() {
  const [activeTab, setActiveTab] = useState(0)

  const [snapshot, setSnapshot] = useState({
    cba:          { netBenefits: _defaultCBA.netBenefits, accepted: _defaultCBA.accepted },
    cashflow:     { closingCashBalance: _defaultCF.closingCashBalance, healthy: _defaultCF.healthy },
    npv:          { npv: _defaultNPV.npv, accepted: _defaultNPV.accepted, pvOfBenefits: _defaultNPV.pvOfBenefits },
    bcr:          { bcr: _defaultBCR.bcr },
    irr:          { irr: _defaultIRR.irr },
    cpm:          { projectDuration: _defaultCPM.projectDuration },
    fpa:          { fp: _defaultFPA.fp },
    objectPoints: { effort: _defaultOP.effort },
  })

  const handleCBAResult = useCallback((r: CBAResult) => {
    setSnapshot(prev => ({ ...prev, cba: { netBenefits: r.netBenefits, accepted: r.accepted } }))
  }, [])

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 0  && <OverviewPage />}
            {activeTab === 1  && <CBAPage onResult={handleCBAResult} />}
            {activeTab === 2  && <CashFlowPage />}
            {activeTab === 3  && <PaybackROIPage />}
            {activeTab === 4  && <NPVPage />}
            {activeTab === 5  && <BCRPage />}
            {activeTab === 6  && <IRRPage />}
            {activeTab === 7  && <RiskPage />}
            {activeTab === 8  && <CPMPage />}
            {activeTab === 9  && <CrashingPage />}
            {activeTab === 10 && <PERTPage />}
            {activeTab === 11 && <FPAPage />}
            {activeTab === 12 && <ObjectPointsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <ExportModal metricsSnapshot={snapshot} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
