# EventHub SPM Studio

A complete, interactive **Software Project Management Metrics Dashboard** for the [EventHub](https://github.com/mohnish-exe/eventhub) event-management and ticketing platform.

Built as a React + TypeScript SPA demonstrating all 12 SPM metrics from the faculty curriculum, with working calculators, faculty-verified formulas, and interactive visualizations.

---

## Features

- **13 navigation tabs** — Overview & Lifecycle + 12 metric pages
- **Glassmorphic dark UI** — deep blur panels, animated orbs, Framer Motion transitions
- **All 12 calculators** with live reactive inputs and animated number transitions
- **Faculty preset + EventHub preset** on every metric page
- **CPM scheduling engine** — computes project duration, critical paths, and float tables from real network data
- **Interactive AOA SVG network diagram** with critical path highlighting
- **Editable risk register** with probability/impact matrix and category filtering
- **Export modal** — printable executive summary of all 12 metrics with current values
- **51 unit tests** covering every faculty-provided worked example

---

## Running the App

```bash
cd spm-dashboard
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (output: `dist/`) |
| `npm run preview` | Preview production build locally |
| `npx vitest run` | Run all 51 unit tests |
| `npx vitest run --reporter=verbose` | Run tests with full output |
| `npx tsc -p tsconfig.app.json --noEmit` | TypeScript type check |

---

## Architecture

```
src/
├── App.tsx                   # Root SPA — tab state, Framer Motion page transitions
├── main.tsx
├── index.css                 # Tailwind + glass utility classes
├── types/
│   └── index.ts             # Shared MetricStatus, AllMetricsState types
├── calculators/             # Pure calculation functions, no React dependencies
│   ├── cba.ts               # Cost-Benefit Analysis
│   ├── cashflow.ts          # Cash Flow Forecasting
│   ├── paybackRoi.ts        # Payback Period & ROI
│   ├── npv.ts               # Net Present Value & Discount Factor
│   ├── bcr.ts               # Benefit-Cost Ratio
│   ├── irr.ts               # Internal Rate of Return (linear interpolation)
│   ├── risk.ts              # Risk Exposure = Probability × Impact
│   ├── cpm.ts               # CPM forward/backward pass, float computation
│   ├── crashing.ts          # Cost Slope calculation
│   ├── pert.ts              # PERT te / σ / σ² formulas
│   ├── fpa.ts               # Albrecht Function Point Analysis
│   └── objectPoints.ts      # COCOMO II Object Point Estimation
├── components/
│   ├── AmbientOrbs.tsx      # Drifting gradient background orbs
│   ├── AnimatedNumber.tsx   # Framer Motion number counter
│   ├── ExportModal.tsx      # Floating export button + report modal
│   ├── FormulaCard.tsx      # Monospace formula display with variable highlighting
│   ├── GlassCard.tsx        # Reusable glassmorphic panel
│   ├── InputField.tsx       # Styled number input with label
│   ├── MetricPageLayout.tsx # 6-section layout for every metric page
│   ├── Navbar.tsx           # Scrollable nav with Framer Motion sliding pill
│   ├── NominalRangeGauge.tsx# Animated status gauge
│   └── PresetToggle.tsx     # 2-way segmented glass toggle
├── pages/
│   ├── OverviewPage.tsx     # Landing page — lifecycle, SMART, steps 0-9, contracts
│   ├── CBAPage.tsx          # Tab 1: Cost-Benefit Analysis
│   ├── CashFlowPage.tsx     # Tab 2: Cash Flow Forecast
│   ├── PaybackROIPage.tsx   # Tab 3: Payback Period & ROI
│   ├── NPVPage.tsx          # Tab 4: NPV & Discount Factor
│   ├── BCRPage.tsx          # Tab 5: Benefit-Cost Ratio
│   ├── IRRPage.tsx          # Tab 6: Internal Rate of Return
│   ├── RiskPage.tsx         # Tab 7: Risk Exposure Matrix + editable register
│   ├── CPMPage.tsx          # Tab 8: CPM network + AOA SVG diagram + float table
│   ├── CrashingPage.tsx     # Tab 9: Project Crashing & Cost Slope
│   ├── PERTPage.tsx         # Tab 10: PERT Estimation
│   ├── FPAPage.tsx          # Tab 11: Albrecht Function Points
│   └── ObjectPointsPage.tsx # Tab 12: Object Points / COCOMO II
└── tests/
    └── calculators.test.ts  # 51 Vitest tests — all faculty worked examples
```

---

## Test Results

All 51 tests pass. Key verified faculty examples:

| Metric | Faculty Example | Result |
|--------|----------------|--------|
| CBA | Total Cost = 1,150,000 | ✓ |
| CBA | Total Benefits w/ Salvage = 1,300,000 | ✓ |
| CBA | Net Benefits = 150,000 | ✓ |
| Cash Flow | Total Available = 270,000 | ✓ |
| Cash Flow | Total Payment = 155,000 | ✓ |
| Cash Flow | Closing Balance = 115,000 | ✓ |
| Payback A | 4.2 yr, ROI 60% | ✓ |
| Payback B | 4.25 yr, ROI 30% | ✓ |
| Payback C | 4.5 yr, ROI 16.67% | ✓ |
| NPV | Project A NPV ≈ 26,757 at 10% | ✓ |
| BCR | Project A BCR ≈ 1.134 | ✓ |
| IRR | Project A IRR ≈ 14.15% | ✓ |
| CPM | 22-week network duration | ✓ |
| CPM | Critical paths 1→3→6→8→9 and 1→3→7→9 | ✓ |
| Cost Slope | Activity A = 300/day | ✓ |
| Object Points | OPC = 24, NOP = 21.6, Effort ≈ 3.086 P/M | ✓ |

---

## Known Limitations & Ambiguities

1. **NPV precision**: The implementation uses exact fractions (e.g., 1/1.1 = 0.909090…) rather than the faculty's 4-decimal factors (0.9091, 0.8264, …). This causes a ~$6 difference in Project A PV of Benefits (226,762.95 vs faculty's 226,757). The formula is correct; the difference is rounding in the faculty's table.

2. **IRR interpolation**: Yields 14.14% vs the faculty's 14.15% — same 0.01% rounding difference from exact vs. rounded NPV inputs.

3. **Object Point weights for 3GL**: The PDF specifies only Difficult weight (10) for 3GL components. Simple and Medium weights are not stated in the faculty notes; the implementation uses Simple=0, Medium=0, Difficult=10 as the only explicitly given value.

4. **Independent Float formula**: The faculty defines Independent Float conceptually but does not provide a formula in the extracted PDF text. The definition is displayed; no formula is computed for it.

5. **Ten contract-placement stages**: The PDF mentions "10 stages in contract placement" but does not enumerate their names in the extracted text. The application notes this and does not fabricate a list.

6. **CPM Free Float**: Computed as FF = E_j − E_i − d, which correctly gives 0 for critical activities and positive values for non-critical ones.

---

## Tech Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Framer Motion
- Lucide React icons
- Recharts (used in CPM and overview charts)
- Vitest for unit testing
- Google Fonts: Inter + JetBrains Mono
