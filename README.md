# FoodRelay AI 🥗 🔄

> **Rescue food. Redirect hope.**  
> *AI-Assisted Surplus Food Rescue and Redistribution Coordination Platform*  
> Built for the **PromptWars × Echo Engineers Hackathon**

---

## 1. Executive Summary & Problem Statement

Commercial kitchens, wedding venues, university mess halls, and corporate cafeterias across urban India prepare millions of meals daily. Unpredictable guest turnouts routinely generate clean, high-quality cooked surplus food. Simultaneously, community shelters, night refuges, and orphanages just kilometers away struggle with meal shortages.

Traditional food donation channels fail because:
1. **Unstructured Communication**: Donor messages sent via WhatsApp or calls are incomplete, ambiguous, and unstandardized.
2. **Food Safety Risk**: Cooked surplus perishes rapidly without time-temperature discipline, violating regulatory standards like the *Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019*.
3. **Logistics Bottlenecks**: Manual distribution relies on ad-hoc phone calls without visibility into shelter demand, dietary constraints, or proximity.

**FoodRelay AI** provides an end-to-end coordination protocol that transforms natural-language donation messages into safety-validated rescue packages, matches them to nearby shelters using an explainable multi-factor algorithm, and tracks them through a tamper-evident dispatch pipeline.

---

## 2. Core Innovations

1. **Multilingual AI-Powered Donation Intake**:
   - Uses the official `@google/genai` SDK with strict JSON schema enforcement to parse natural-language messages in English, Hindi, and Hinglish.
   - Extracts quantities, food types, timestamps, packaging conditions, and locations into an editable draft with source evidence citations.
   - Treats donor messages strictly as untrusted data—never as prompt instructions—and provides an instantaneous deterministic fallback when offline.

2. **Explainable, Constraint-Aware RelayMatch Engine**:
   - **Zero black-box allocation**: AI extracts facts, but deterministic algorithms calculate allocations.
   - Stage-based pipeline: Hard constraint filtering (dietary, allergens, capacity, storage) $\rightarrow$ Haversine geodesic distance $\rightarrow$ Configurable 4-part weighted scoring (Urgency 40%, Proximity 30%, Demand 20%, Readiness 10%) $\rightarrow$ Multi-recipient portion distribution with stable tie-breaking.

3. **Deterministic Food Safety Gate**:
   - Aligned directly with the Indian Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019.
   - Enforces time elapsed, use-by limits, sealed packaging rules, and mandatory human-in-the-loop coordinator approval before food becomes allocatable.

4. **Traceable Dispatch Pipeline & Digital Handover**:
   - Guarded state machine: `Proposed` $\rightarrow$ `Reserved` $\rightarrow$ `Accepted` $\rightarrow$ `Ready for Pickup` $\rightarrow$ `Collected` $\rightarrow$ `Delivered`.
   - Generates verifiable digital handover receipts with printable QR codes containing non-sensitive audit references.

---

## 3. Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Intake["1. Multilingual Intake Layer"]
        A[Untrusted Message<br/>English / Hindi / Hinglish] --> B[Server-side /api/intake<br/>Zod Input Validation]
        B --> C{Gemini Configured?}
        C -->|Yes| D[@google/genai SDK<br/>gemini-2.5-flash]
        C -->|No / Quota Fail| E[Deterministic Rule-Based<br/>Multilingual Fallback]
        D --> F[Strict Extracted Draft<br/>with Evidence Excerpts]
        E --> F
        F --> G[Editable Verification Form<br/>Explicit User Sign-Off]
    end

    subgraph Safety["2. Safety & Regulatory Gate (FSSAI 2019)"]
        G --> H[Safety Gate Evaluation]
        H -->|Fail: Loose / Expired / Missing Time| I[Status: Held / Blocked / Expired]
        H -->|Pass: Sealed + Cold-Chain OK| J[Coordinator Inspection<br/>Simulated Approval]
        J --> K[Status: Eligible for Matching]
    end

    subgraph Matching["3. RelayMatch Allocation Engine"]
        K --> L[Stage A: Hard Constraints Filter<br/>Dietary, Allergens, Storage, Demand]
        L --> M[Stage B: Haversine Geodesic Distance]
        M --> N[Stage C: 4-Factor Weighted Ranking<br/>Urgency 40% + Proximity 30% + Demand 20% + Readiness 10%]
        N --> O[Stage D: Portion Balance Allocation<br/>Split Distributions across Top Shelters]
    end

    subgraph Dispatch["4. Traceable Dispatch & Impact"]
        O --> P[Coordinator Plan Reservation]
        P --> Q[Dispatch Pipeline<br/>Reserved → Accepted → In Transit → Delivered]
        Q --> R[Handover Receipt & QR Code]
        R --> S[Real-Time Impact Dashboard<br/>Recharts Analytics & CSV/JSON Export]
    end
```

---

## 4. RelayMatch Scoring & Allocation Formulas

### Distance Computation
Estimated straight-line distance is computed via the spherical Haversine formula:
$$\Delta\sigma = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$\text{Distance (km)} = R \cdot \Delta\sigma \quad (R = 6371\text{ km})$$

### Weighted Score Breakdown (0 to 100)
1. **Urgency Score ($S_{\text{urgency}}$)**:
   - Critical: 100
   - High: 75
   - Moderate: 50
   - Low: 25
2. **Proximity Score ($S_{\text{proximity}}$)**:
   $$S_{\text{proximity}} = \max\left(0, 100 - \left(\frac{\text{Distance (km)}}{30\text{ km}}\right) \times 100\right)$$
3. **Demand Fit Score ($S_{\text{demand}}$)**:
   $$S_{\text{demand}} = \min\left(100, \text{round}\left(\frac{\text{Recipient Remaining Demand}}{\text{Donation Quantity}} \times 100\right)\right)$$
4. **Readiness Score ($S_{\text{readiness}}$)**:
   Evaluated from recipient transport capability (`self_pickup` = 80, `flexible` = 70, `delivery_only` = 50) and verification status.

### Normalized Composite Score:
$$\text{Score} = \frac{w_u \cdot S_{\text{urgency}} + w_p \cdot S_{\text{proximity}} + w_d \cdot S_{\text{demand}} + w_r \cdot S_{\text{readiness}}}{w_u + w_p + w_d + w_r}$$
*(Default Weights: $w_u = 40, w_p = 30, w_d = 20, w_r = 10$)*

---

## 5. Technology Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript with strict mode enabled
- **Styling & Design System**: Tailwind CSS, custom color palette (`#123B2B` forest green, `#15803D` emerald, `#DCFCE7` light mint, `#F7F8F2` cream)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (bar charts, status distributions)
- **Mapping**: Leaflet & OpenStreetMap (client-only dynamic loading with schematic fallback)
- **AI Integration**: Official `@google/genai` SDK (`gemini-2.5-flash`)
- **Schema Validation**: Zod
- **Persistence**: Typed versioned repository backed by LocalStorage with hydration protection
- **QR Code Generation**: `qrcode` library
- **Testing**: Vitest 3.0

---

## 6. Project Structure

```
├── app/
│   ├── layout.tsx             # Root layout with fonts, metadata, and Leaflet styles
│   ├── page.tsx               # High-converting landing page with visual workflow
│   ├── dashboard/page.tsx     # Operations dashboard, KPIs, urgent review queue
│   ├── donate/page.tsx        # AI Smart Intake (multilingual) & Manual form
│   ├── donations/page.tsx     # Donations listing & simulated safety review gate
│   ├── recipients/page.tsx    # Recipient network management & capacity filters
│   ├── matches/page.tsx       # RelayMatch center, weight tuning & score cards
│   ├── map/page.tsx           # Leaflet geographic map & schematic network view
│   ├── dispatch/page.tsx      # Dispatch Kanban board, transitions & QR receipt
│   ├── impact/page.tsx        # Impact analytics, Recharts graphs, CSV/JSON export
│   ├── about/page.tsx         # FSSAI 2019 compliance & Responsible AI disclosures
│   └── api/intake/route.ts    # Secure server-side Gemini intake route handler
├── components/
│   ├── layout/AppShell.tsx    # Reusable desktop sidebar & mobile drawer shell
│   ├── ui/Logo.tsx            # Custom lightweight FoodRelay SVG logo
│   └── maps/RescueMap.tsx     # Leaflet map with OpenStreetMap tiles & polylines
├── lib/
│   ├── ai/
│   │   ├── geminiExtractor.ts    # @google/genai structured extraction with timeout
│   │   └── fallbackExtractor.ts  # Deterministic multilingual rule-based parser
│   ├── analytics/metrics.ts      # Real-time metric ledger & double-counting guards
│   ├── demo/seedData.ts          # Fictional Noida/Greater Noida demo generator
│   ├── dispatch/transitions.ts   # State machine guards & transition validations
│   ├── matching/
│   │   ├── distance.ts           # Haversine geodesic distance calculation
│   │   └── relayMatch.ts         # Pure deterministic allocation engine
│   ├── safety/safetyGate.ts      # FSSAI 2019 compliance validator
│   ├── schemas/                  # Zod schemas for donations, recipients, and intake
│   └── storage/
│       ├── repository.ts         # Versioned local repository abstraction
│       └── useFoodRelay.ts       # Reactive client-safe React state hook
├── tests/
│   ├── analytics.test.ts         # Metric computation & zero double-counting tests
│   ├── dispatch.test.ts          # State transition & QR receipt generation tests
│   ├── intake.test.ts            # Multilingual intake & Zod parsing tests
│   ├── matching.test.ts          # RelayMatch allocation & split portion tests
│   └── safety.test.ts            # Food safety gate & expiration tests
├── types/index.ts                # Strict TypeScript domain interfaces
├── vitest.config.ts              # Vitest test runner configuration
├── package.json
└── README.md
```

---

## 7. Installation & Local Development

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/your-username/foodrelay-ai.git
cd foodrelay-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for AI intake)
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

## 8. Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (kept strictly server-side) | No (Fallback active) | `""` |
| `GEMINI_MODEL` | Google GenAI model identifier | No | `gemini-2.5-flash` |
| `FEATURE_AI_INTAKE` | Toggle AI intake service on or off | No | `true` |
| `AI_REQUEST_TIMEOUT_MS` | Server-side API request timeout in milliseconds | No | `12000` |

> [!NOTE]  
> If `GEMINI_API_KEY` is not provided or quota is exceeded, FoodRelay automatically engages its built-in multilingual rule-based extractor. The user experience remains seamless in all environments.

---

## 9. Test Results & Verification

All automated unit tests pass with zero errors:

```bash
$ npm test

 RUN  v3.2.7

 ✓ tests/analytics.test.ts (1 test)
 ✓ tests/safety.test.ts (6 tests)
 ✓ tests/dispatch.test.ts (4 tests)
 ✓ tests/matching.test.ts (8 tests)
 ✓ tests/intake.test.ts (3 tests)

 Test Files  5 passed (5)
      Tests  22 passed (22)
   Duration  219ms
```

### Verified Test Scenarios:
- **Valid allocation**: Correct portions assigned to eligible recipients.
- **Capacity constraints**: Never exceeds recipient available capacity or remaining donation quantity.
- **Split allocations**: High-volume batches divided across multiple nearby recipients.
- **Unit blocker**: Quantities in `kg` or boxes held until portion conversion is confirmed.
- **Safety Gate**: Enforces use-by expiration, loose packaging blocks, and coordinator approvals.
- **Dietary & Allergen constraints**: Strict mismatch filtering (e.g., non-veg to vegetarian shelters, dairy allergen restrictions).
- **Dispatch state machine**: Linear transitions enforced (`Reserved` $\rightarrow$ `Delivered`); invalid jumps blocked.
- **Ledger math**: `Delivered + Reserved + Unallocated = Total Donated Portions` (zero double-counting).
- **Multilingual extraction**: Accurately parses English, Hindi, and Hinglish donation messages into Zod drafts.

---

## 10. 10-Step Evaluator Demo Walkthrough

Judges can test the complete end-to-end workflow without creating an account:

1. **Load Example Message**: Go to `/donate`. Click any of the 3 one-click sample scenarios (e.g. *English (College Canteen)*).
2. **Extract Entities**: Click **Extract Entities & Populate Review**. If configured, Gemini executes structured extraction; if offline, local heuristics run instantly.
3. **Inspect Form & Evidence**: Review the extracted fields, source evidence citations, and packaging conditions. Check the declaration and click **Save Donation to Safety Queue**.
4. **Simulate Safety Review**: Open `/donations`. View held donations (such as *Spice Garden Bistro*). Click **Safety Review** $\rightarrow$ **Simulate Safety Approval (Mark Eligible)** citing FSSAI 2019 guidelines.
5. **Run RelayMatch**: Navigate to `/matches`. Select an eligible donation (e.g., *Haldiram Banquet & Catering*).
6. **Inspect Explainability**: Review the 0-100 composite match scores, Haversine distance, and 4-factor scoring bars (Urgency, Proximity, Demand, Readiness).
7. **Reserve Allocation Plan**: Click **Reserve Suggested Plan**. Portions are locked, donation remaining balances decrement, and duplicate commitments are prevented.
8. **Advance Dispatch Pipeline**: Open `/dispatch`. Move the allocation from `Reserved` $\rightarrow$ `Accepted` $\rightarrow$ `Ready for Pickup` $\rightarrow$ `Collected` $\rightarrow$ `Delivered`.
9. **View Digital Handover Receipt**: Click **View Handover Receipt** on the delivered card to view the verifiable handover voucher with digital signatures and non-sensitive audit QR code.
10. **Verify Impact Analytics**: Navigate to `/impact`. Check that delivered portions and trend charts have updated dynamically from actual stored records.

---

## 11. Current Limitations & Future Roadmap

### Prototype Scope
- **Storage**: Uses versioned browser LocalStorage with automatic schema recovery.
- **Data**: Fictional demonstration organizations localized to Noida and Greater Noida (UP).
- **Single-Tenant**: Designed for evaluation and single-browser presentation.

### Production Roadmap
- [ ] **Multi-Tenant Cloud DB**: PostgreSQL + Supabase with Row-Level Security for segregated donor/NGO logins.
- [ ] **IoT Cold-Chain Telemetry**: Bluetooth/Cellular temperature sensors logging transit cambro temperatures directly to the handover record.
- [ ] **FSSAI FoSCoS API**: Automated donor FSSAI license verification against the official portal.
- [ ] **SMS/WhatsApp Driver Routing**: Driver turn-by-turn navigation links pushed via Twilio/Gupshup.

---

## 12. PromptWars Presentation Pitch

> *"Every day, delicious, fresh food from banquets and canteens is discarded simply because coordinators lack the 15 minutes required to call five different shelters and verify food safety. FoodRelay AI solves this coordination breakdown: an event manager texts a 20-word Hindi or English message, Gemini structures the rescue batch, our FSSAI safety gate validates the time window, and our transparent RelayMatch algorithm assigns the meal to the closest shelter in need within seconds. No black box, no waste, 100% accountable."*

---

**Tagline**: *Rescue food. Redirect hope.*  
**License**: MIT  
**Authors**: PromptWars × Echo Engineers Hackathon Team
