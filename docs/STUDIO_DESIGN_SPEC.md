# FOODRELAY STUDIO — PREMIUM PRODUCT DESIGN SPECIFICATION
**Design Codename**: FoodRelay Studio  
**Tagline**: Rescue food. Redirect hope.  
**Team**: ImpactForge | **Track**: PS11 — AI Agents & MCP | **Submission**: Hack2Skill  

---

## 1. Product Design Manifesto

FoodRelay Studio moves beyond decorative, AI-generated card grids and high-saturation neon palettes. It adopts the rigorous restraint of modern intelligence and developer tools (Linear, Stripe, Vercel) combined with the human dignity of world-class food redistribution.

### Architectural Tenets:
1. **Neutral Bedrock, Purposeful Accents**:
   - Canvas: **Warm Porcelain (`#FAF9F6`)** in light mode; **Obsidian (`#141417`)** in dark mode.
   - Accents are functional: **Tangerine (`#FF7849`)** represents living sustenance and human action; **Electric Indigo (`#635BFF`)** identifies AI reasoning and MCP tools; **Jade (`#16856B`)** confirms verified deliveries.
2. **Typography as Structure**:
   - Monospaced tabular metrics (`JetBrains Mono` / `font-mono`) ensure numbers, timestamps, and portions align perfectly.
   - High-contrast, restrained headings establish immediate clarity without visual noise.
3. **Information Density with Breathing Room**:
   - Replaced bulky nested rounded boxes with crisp borders (`#E8E5DF` / `#2E2E34`) and flat, high-density rows.
   - Eliminated decorative badges, oversized gradients, and superficial glassmorphism.

---

## 2. Definitive Token Architecture

```css
/* LIGHT THEME */
--bg-primary: #FAF9F6;              /* Warm Porcelain */
--bg-surface: #FFFFFF;              /* Crisp White Surface */
--studio-border: #E8E5DF;           /* Subtle Warm Border */
--studio-text-primary: #141417;     /* Obsidian Dark */
--studio-text-secondary: #52525B;   /* Zinc 600 */
--studio-text-muted: #71717A;       /* Zinc 500 */
--accent-brand: #FF7849;            /* Tangerine */
--accent-ai: #635BFF;               /* Electric Indigo */
--accent-success: #16856B;          /* Jade */

/* DARK THEME */
--bg-primary: #141417;              /* Obsidian Deep Ground */
--bg-surface: #1E1E22;              /* Layered Graphite */
--studio-border: #2E2E34;           /* Graphite Border */
--studio-text-primary: #FAF9F6;     /* Warm Porcelain */
--studio-text-secondary: #A1A1AA;   /* Silver Zinc 400 */
--studio-text-muted: #71717A;       /* Zinc 500 */
--accent-brand: #FF7849;            /* Tangerine */
--accent-ai: #7B75FF;               /* Electric Indigo Accessible Light */
--accent-success: #1EA484;          /* Jade Accessible Light */
```

---

## 3. Physical Device & Native Mobile Experience

- **Five-Destination Bottom Navigation**:
  - `Overview` (`/dashboard`)
  - `Rescue` (`/donate`)
  - `Copilot` (Native pulse drawer trigger)
  - `Matches` (`/matches`)
  - `Safety` (`/about`)
- **Native Android Theme Sync**:
  - Full support for Light, Dark, and Follow System modes.
  - Transparent status bars with high-contrast icons preventing navigation bar clipping.
  - Zero hydration flash on physical devices.
