# FoodRelay AI 🥗 🔄

> **Rescue food. Redirect hope.**  
> *AI-Assisted Surplus Food Rescue and Redistribution Coordination Platform*  
> Built for the **PromptWars × Echo Engineers Hackathon** (Hack2Skill submission)  
> Repository: `https://github.com/Naman-k-dev/FoodRelay` · Branch: `main` ONLY  
> Architecture: Next.js 15 App Router · TypeScript · Tailwind CSS · @google/genai

---

## 1. Executive Summary & Problem Statement

Commercial kitchens, wedding banquets, university mess halls, and corporate cafeterias across urban India prepare millions of meals daily. Unpredictable guest turnouts routinely generate clean, high-quality cooked surplus food. Simultaneously, community shelters, night refuges, and orphanages just kilometers away struggle with daily meal shortages.

Traditional food donation channels fail because:
1. **Unstructured Communication**: Donor messages sent via WhatsApp, calls, or voice notes are incomplete, ambiguous, and unstandardized.
2. **Food Safety Risk**: Cooked surplus perishes rapidly without strict time-temperature discipline, violating regulatory standards like the *Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019*.
3. **Logistics Bottlenecks**: Manual distribution relies on ad-hoc phone calls without visibility into shelter demand, dietary constraints, or proximity.

**FoodRelay AI** provides an end-to-end coordination protocol that transforms natural-language donation messages into safety-validated rescue packages, matches them to nearby shelters using an explainable multi-factor algorithm, and tracks them through a tamper-evident dispatch pipeline.

---

## 2. Core Innovations & Advanced AI Capabilities

### A. Multilingual & Multimodal Donation Intake
- **Multilingual Text Intake**: Uses the official `@google/genai` SDK with strict JSON schema enforcement to parse natural-language messages in English, Hindi, and Hinglish. Extracts quantities, food types, timestamps, packaging conditions, and locations into an editable draft with source evidence citations.
- **Multimodal AI Food Scanner (`/api/scanner`)**: Analyzes food imagery to detect packaging integrity, container conditions, and food categories. Accompanied by mandatory regulatory alerts: *computer vision cannot verify internal temperature or microbiological safety*.
- **AI Voice Intake (`VoiceDonationModal`)**: Integrated Web Speech API speech-to-text with bilingual support (English/Hindi) and instant one-click voice samples.

### B. AI Operational Assurance & Communication
- **AI Smart Review (`/api/review`)**: Pre-dispatch audit flagging data ambiguities, narrow pickup windows, and missing cold-chain records before human coordinator sign-off.
- **Relay Copilot (`/api/copilot`)**: Grounded read-only operational assistant answering coordinator questions with clickable record references (`don-...`, `rec-...`).
- **AI Impact Intelligence (`/api/impact-insights`)**: Analyzes real-time rescue metrics to identify demand hotspots, bottleneck hours, and fleet recommendations.
- **AI Communication Drafter (`/api/draft-message`)**: Generates bilingual (English/Hindi) donor receipts, driver dispatch alerts, and recipient ETA notifications with 1-click clipboard copying.

### C. Signature Feature: Food Rescue Digital Twin
- **Operational Planning Sandbox**: An interactive scenario analysis tool allowing coordinators to simulate shocks before committing food.
- **Dynamic Shocks**: Adjust available surplus (-50% to +100%), scale network receiving capacity, inject emergency shelters (+50 or +100 portions), and simulate shelter disruptions (taking specific recipients offline).
- **Zero Record Mutation**: Operates on an isolated clone of active state; real stored records remain 100% untouched.
- **Real-Time Algorithmic Re-routing**: Re-executes the actual RelayMatch engine on every slider shift, showing real-time allocation flow charts, delta ledgers, and AI operational assessments.

### D. Explainable, Constraint-Aware RelayMatch Engine
- **Zero black-box allocation**: AI extracts facts, but deterministic algorithms calculate allocations.
- **Stage-based pipeline**: Hard constraint filtering (dietary, allergens, capacity, storage) $\rightarrow$ Haversine geodesic distance $\rightarrow$ Configurable 4-part weighted scoring (Urgency 40%, Proximity 30%, Demand 20%, Readiness 10%) $\rightarrow$ Multi-recipient portion distribution with stable tie-breaking.

### E. Deterministic Food Safety Gate (FSSAI 2019)
- Aligned directly with the Indian *Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019*.
- Enforces time elapsed, use-by limits, sealed packaging rules, and mandatory human-in-the-loop coordinator approval before food becomes allocatable.

### F. Traceable Dispatch Pipeline & Digital Handover
- Guarded state machine: `Proposed` $\rightarrow$ `Reserved` $\rightarrow$ `Accepted` $\rightarrow$ `Ready for Pickup` $\rightarrow$ `Collected` $\rightarrow$ `Delivered`.
- Generates verifiable digital handover receipts with printable QR codes containing non-sensitive audit references.

---

## 3. Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Intake["1. Multimodal & Multilingual Intake Layer"]
        A1[Text Message<br/>English / Hindi / Hinglish] --> B[Server-side /api/intake]
        A2[Food Image Upload] --> B2[Server-side /api/scanner]
        A3[Voice Recording] --> B
        B --> C{Gemini Configured?}
        B2 --> C
        C -->|Yes| D[@google/genai SDK<br/>gemini-2.5-flash / gemini-3.5-flash-lite]
        C -->|No / Quota Fail| E[Deterministic Rule-Based<br/>Multilingual Fallback]
        D --> F[Strict Extracted Draft<br/>with Evidence Excerpts]
        E --> F
        F --> G[Editable Verification Form<br/>AI Smart Review Audit]
    end

    subgraph Safety["2. Safety & Regulatory Gate (FSSAI 2019)"]
        G --> H[Safety Gate Evaluation]
        H -->|Fail: Loose / Expired / Missing Time| I[Status: Held / Blocked / Expired]
        H -->|Pass: Sealed + Cold-Chain OK| J[Coordinator Inspection<br/>Simulated Approval]
        J --> K[Status: Eligible for Matching]
    end

    subgraph Matching["3. RelayMatch Allocation Engine & Digital Twin"]
        K --> L[Stage A: Hard Constraints Filter<br/>Dietary, Allergens, Storage, Demand]
        L --> M[Stage B: Haversine Geodesic Distance]
        M --> N[Stage C: 4-Factor Weighted Ranking<br/>Urgency 40% + Proximity 30% + Demand 20% + Readiness 10%]
        N --> O[Stage D: Portion Balance Allocation<br/>Split Distributions across Top Shelters]
        O <--> DT[Rescue Digital Twin<br/>Operational Scenario Sandbox]
    end

    subgraph Dispatch["4. Traceable Dispatch & Impact"]
        O --> P[Coordinator Plan Reservation]
        P --> Q[Dispatch Pipeline<br/>Reserved → Accepted → In Transit → Delivered]
        Q --> R[Handover Receipt & QR Code]
        R --> S[Real-Time Impact Dashboard<br/>Recharts Analytics & CSV/JSON Export]
        S --> T[AI Impact Intelligence & Copilot]
    end
```

---

## 4. AI Transparency Center: Responsibility Matrix

| Dimension | WHAT AI DOES (Probabilistic) | WHAT DETERMINISTIC CODE DOES | WHAT HUMANS CONTROL (Authority) |
|---|---|---|---|
| **Intake & Scanning** | Extracts facts from natural language; analyzes visible food photo containers. | Validates quantity formats & enforces positive integers via Zod. | Confirms extracted data before entering queue. |
| **Safety Governance** | Identifies potential ambiguities and missing handling records. | Evaluates FSSAI 2019 rules (time elapsed, use-by limits, tamper-evident seals). | **Physical safety inspection, temperature check & coordinator sign-off.** |
| **Allocation & Ranking** | Summarizes operational records and explains scenario impacts. | Computes Haversine distances, applies multi-factor weights, balances portions. | **Approves or adjusts the allocation plan.** |
| **Dispatch & Handover** | Drafts bilingual dispatch updates & arrival notices for drivers and NGOs. | Enforces linear state transitions; guards against double-allocations; issues QR vouchers. | **Supervisors accept delivery; drivers confirm vehicle transit; recipient signs receipt.** |

> [!IMPORTANT]  
> **Non-Negotiable Food Safety Boundary**: Computer vision and large language models CANNOT certify food safety, detect microbial loads, assess unseen spoilage, or verify internal cooking temperatures. Visual analysis and AI smart review are strictly operational aids—physical inspection and temperature monitoring remain mandatory under Indian law.

---

## 5. RelayMatch Scoring & Benchmark Methodology

### Distance Computation
Straight-line distance is computed via the spherical Haversine formula:
$$\Delta\sigma = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$\text{Distance (km)} = R \cdot \Delta\sigma \quad (R = 6371\text{ km})$$

### Weighted Score Breakdown (0 to 100)
1. **Urgency Score ($S_{\text{urgency}}$)**: Critical: 100, High: 75, Moderate: 50, Low: 25
2. **Proximity Score ($S_{\text{proximity}}$)**:
   $$S_{\text{proximity}} = \max\left(0, 100 - \left(\frac{\text{Distance (km)}}{30\text{ km}}\right) \times 100\right)$$
3. **Demand Fit Score ($S_{\text{demand}}$)**:
   $$S_{\text{demand}} = \min\left(100, \text{round}\left(\frac{\text{Recipient Remaining Demand}}{\text{Donation Quantity}} \times 100\right)\right)$$
4. **Readiness Score ($S_{\text{readiness}}$)**: Evaluated from transport capability and verification status.

$$\text{Composite Score} = \frac{40 \cdot S_{\text{urgency}} + 30 \cdot S_{\text{proximity}} + 20 \cdot S_{\text{demand}} + 10 \cdot S_{\text{readiness}}}{100}$$

### 4 Reproducible Standard Benchmark Scenarios
In the Match Center (`/matches`), coordinators can compare RelayMatch against First-Come-First-Served (FCFS) across 4 reproducible scenarios with downloadable audit reports (JSON and CSV):
1. **Scenario 1: Balanced Supply & Demand**: 180 portions offered against 180 capacity. Verified property: Zero over-allocation (180 allocated, 0 unallocated).
2. **Scenario 2: Insufficient Capacity Bottleneck**: 250 portions offered against 120 capacity. Verified property: Allocates exactly 120 portions, reporting precisely 130 unallocated portions.
3. **Scenario 3: Recipient Disruption**: Primary critical shelter abruptly goes offline. Verified property: RelayMatch safely skips the unavailable shelter and rebalances all food across active recipients.
4. **Scenario 4: FSSAI Safety Blocker**: Food stored loose in open pans. Verified property: Safety Gate halts 100% of portions (0 allocated) across both algorithms.

---

## 6. Technology Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript with strict mode enabled
- **Styling & Design System**: Tailwind CSS, custom sustainability palette (`#123B2B` forest green, `#15803D` emerald, `#DCFCE7` light mint, `#F7F8F2` cream)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (bar charts, status distributions, trend lines)
- **Mapping**: Leaflet & OpenStreetMap (client-only dynamic loading with schematic fallback)
- **AI Integration**: Official `@google/genai` SDK with automatic model cascade (`gemini-2.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.5-flash`)
- **Schema Validation**: Zod
- **Persistence**: Typed versioned repository backed by LocalStorage with hydration protection
- **QR Code Generation**: `qrcode` library
- **Testing**: Vitest 3.0

---

## 7. Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with custom SVG favicon and Leaflet styles
│   ├── page.tsx                   # High-converting landing page with visual workflow
│   ├── dashboard/page.tsx         # Operations dashboard, KPIs, urgent review queue
│   ├── demo/page.tsx              # Guided 8-step evaluator journey with Digital Twin
│   ├── donate/page.tsx            # AI Smart Intake (Text, Multimodal Scanner, Voice)
│   ├── donations/page.tsx         # Donations listing & simulated safety review gate
│   ├── recipients/page.tsx        # Recipient network management & capacity filters
│   ├── matches/page.tsx           # RelayMatch center, Digital Twin & Benchmark tabs
│   ├── map/page.tsx               # Leaflet geographic map & schematic network view
│   ├── dispatch/page.tsx          # Dispatch Kanban board, transitions & QR receipt
│   ├── impact/page.tsx            # Impact analytics, AI intelligence, CSV/JSON export
│   ├── about/page.tsx             # AI Transparency Center & FSSAI compliance
│   └── api/
│       ├── intake/route.ts        # Server-side Gemini multilingual intake
│       ├── scanner/route.ts       # Server-side Multimodal food image scanner
│       ├── review/route.ts        # Server-side AI Smart Review auditor
│       ├── copilot/route.ts       # Server-side Relay Copilot grounded assistant
│       ├── impact-insights/route.ts# Server-side AI Impact Intelligence
│       └── draft-message/route.ts # Server-side AI communication drafter
├── components/
│   ├── ai/
│   │   ├── FoodScannerModal.tsx   # Multimodal image scanner modal with sample photo
│   │   ├── VoiceDonationModal.tsx # Web Speech API voice intake with samples
│   │   ├── SmartReviewPanel.tsx   # AI Smart Review audit panel
│   │   ├── RelayCopilotDrawer.tsx # Grounded conversational assistant drawer
│   │   ├── ImpactInsightsCard.tsx # AI strategic recommendations card
│   │   └── CommunicationDraftModal.tsx # Bilingual message drafter modal
│   ├── matching/
│   │   ├── MatchingBenchmarkUI.tsx# Benchmark UI with 4 standard reproducible scenarios
│   │   └── RescueDigitalTwinUI.tsx# Digital Twin interactive scenario sandbox
│   ├── layout/AppShell.tsx        # Reusable desktop sidebar & mobile drawer shell
│   └── ui/Logo.tsx                # Custom lightweight FoodRelay SVG logo
├── lib/
│   ├── ai/
│   │   ├── geminiClient.ts        # Centralized server-side Gemini client with timeout
│   │   ├── geminiExtractor.ts     # Multilingual structured extraction
│   │   └── fallbackExtractor.ts   # Deterministic multilingual rule-based parser
│   ├── matching/
│   │   ├── benchmarkScenarios.ts  # 4 standardized hackathon benchmark scenarios
│   │   ├── benchmark.ts           # Strategy benchmark logic (RelayMatch vs FCFS)
│   │   ├── distance.ts            # Haversine geodesic distance calculation
│   │   └── relayMatch.ts          # Pure deterministic allocation engine
│   ├── safety/safetyGate.ts       # FSSAI 2019 compliance validator
│   └── storage/repository.ts      # Versioned local repository abstraction
├── tests/
│   ├── analytics.test.ts          # Metric computation & zero double-counting tests
│   ├── benchmark.test.ts          # Strategy benchmark tests
│   ├── digital_twin_and_benchmarks.test.ts # Digital twin & 4 benchmark scenarios
│   ├── dispatch.test.ts           # State transition & QR receipt generation tests
│   ├── intake.test.ts             # Multilingual intake & Zod parsing tests
│   ├── matching.test.ts           # RelayMatch allocation & split portion tests
│   ├── phase4_ai_schemas.test.ts  # Phase 4 AI schemas & safety disclaimer tests
│   └── safety.test.ts             # Food safety gate & expiration tests
├── package.json
└── README.md
```

---

## 8. Installation & Local Development

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/Naman-k-dev/FoodRelay.git
cd FoodRelay

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional — offline fallback active)
cp .env.example .env.local
# Edit .env.local and insert your GEMINI_API_KEY

# 4. Run automated test suite
npm test

# 5. Build production bundle
npm run build

# 6. Start production server
npm start
```
The application will be accessible at `http://localhost:3000`.

---

## 9. Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (kept strictly server-side) | No (Fallback active) | `""` |
| `GEMINI_MODEL` | Google GenAI model identifier | No | `gemini-2.5-flash` |
| `AI_ENABLED` | Toggle live AI service on or off | No | `true` |
| `AI_REQUEST_TIMEOUT_MS` | Server-side API request timeout in milliseconds | No | `15000` |

> [!NOTE]  
> If `GEMINI_API_KEY` is not provided or quota is exhausted, FoodRelay automatically engages its built-in multilingual rule-based extractor and deterministic fallbacks. The application operates with 100% functionality in offline mode.

---

## 10. Automated Test Verification

All automated unit tests pass with zero errors:

```bash
$ npm test

 RUN  v3.2.7

 ✓ tests/analytics.test.ts (1 test)
 ✓ tests/safety.test.ts (8 tests)
 ✓ tests/dispatch.test.ts (4 tests)
 ✓ tests/matching.test.ts (8 tests)
 ✓ tests/benchmark.test.ts (4 tests)
 ✓ tests/digital_twin_and_benchmarks.test.ts (5 tests)
 ✓ tests/phase4_ai_schemas.test.ts (5 tests)
 ✓ tests/intake.test.ts (4 tests)

 Test Files  8 passed (8)
      Tests  39 passed (39)
   Duration  302ms
```

---

## 11. Guided Judge Demonstration (`/demo`)

Evaluators can execute the guided **2-Minute Demo**:
1. Click **"Experience FoodRelay — 2 Minute Demo"** on the landing page header.
2. **Step 1: The Problem**: Greenfield College Canteen has 180 surplus vegetarian meal portions.
3. **Step 2: AI Intake**: Run live Gemini extraction or offline sample. Inspect evidence excerpts and missing fields.
4. **Step 3: Responsible AI**: Verify that missing temperature records halt matching; perform simulated FSSAI 2019 coordinator sign-off.
5. **Step 4: Intelligent Matching**: Execute RelayMatch. Inspect 0–100 scores and excluded recipients.
6. **Step 5: Visual Food Flow**: Observe portion allocation split (80 portions to Shelter A, 60 portions to Shelter B, 40 portions to Shelter C).
7. **Step 6: Rescue Digital Twin**: Simulate operational disruption by toggling a shelter offline; watch allocations re-balance instantly, then restore the scenario.
8. **Step 7: Confirm & Dispatch**: Progress through audited transitions (`Reserved` $\rightarrow$ `Accepted` $\rightarrow$ `Collected` $\rightarrow$ `Delivered`) and preview the digital QR receipt.
9. **Step 8: Impact Reveal**: Review final metrics (+180 meals, 450 kg CO2e diverted, 0 unallocated waste).

---

## 12. Vercel Deployment Instructions

FoodRelay is 100% Vercel-compatible:
1. Push to GitHub (`main` branch only).
2. Import project into Vercel Dashboard.
3. Configure Environment Variables in Vercel Project Settings:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `AI_ENABLED`: `true`
4. Click **Deploy**. Build completes in under 2.5 minutes.

---

## 13. Presentation Pitch

> *"Every day, delicious, fresh food from banquets and canteens is discarded simply because coordinators lack the 15 minutes required to call five different shelters and verify food safety. FoodRelay AI solves this coordination breakdown: an event manager texts a 20-word Hindi or English message, Gemini structures the rescue batch, our FSSAI safety gate validates the time window, and our transparent RelayMatch algorithm assigns the meal to the closest shelter in need within seconds. No black box, no waste, 100% accountable."*

---

**Tagline**: *Rescue food. Redirect hope.*  
**License**: MIT  
**Authors**: PromptWars × Echo Engineers Hackathon Team
