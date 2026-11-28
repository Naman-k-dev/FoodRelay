# PROJECT AURORA — DESIGN SYSTEM & VISUAL ARCHITECTURE SPECIFICATION
**FoodRelay AI — Rescue food. Redirect hope.**  
**Team**: ImpactForge | **Track**: PS11 — AI Agents & MCP | **Platform**: Hack2Skill  

---

## 1. Executive Design Philosophy

Project Aurora elevates FoodRelay AI from a utilitarian tool to a high-assurance, precision-engineered digital operations center. 

Surplus food redistribution requires instant visual hierarchy:
- High contrast and crisp borders for noisy warehouse and field environments.
- Warm, hopeful accents that convey social impact and dignity rather than mere waste metrics.
- Mathematical clarity for constraint-aware multi-party allocations and real-time fallbacks.

---

## 2. Definitive Aurora Color Palette & Semantic Tokens

| Token | Hex | Role | Semantic Meaning |
|---|---|---|---|
| **Midnight Ink** | `#18243D` | Primary Shell / Dark Surfaces | Authority, deep stability, operational bedrock |
| **Apricot Glow** | `#FFB86B` | Brand Highlight / Vitality Accent | Warmth, nutrition, human hope, urgency |
| **Digital Violet** | `#6554C0` | Primary Interactive / AI Engine | Intelligent routing, Gemini Copilot, MCP agents |
| **Ocean Teal** | `#00897B` | Verified / Safety Passed | Food safety compliance, delivery confirmation |
| **Coral Signal** | `#E76F51` | Safety Hold / Critical Alert | Temperature breaches, expiring food, urgent review |
| **Cloud Ivory** | `#F5F5F0` | Light Mode Neutral Ground | Soft, non-glare daytime reading surface |
| **Soft Lavender** | `#EDE9FF` | Subtle Accent / Focus Fill | Quiet selection highlights, input backdrops |
| **Deep Space** | `#101827` | High-Contrast Dark Ground | Mobile OLED battery efficiency and dark theme base |

---

## 3. Typography & Numerical Precision

- **Headings**: Display serif / bold sans typography with tight tracking (`tracking-tight`) and strong character.
- **Body**: Clean modern sans-serif with high legibility at 11px and 12px for high-density logistics tables.
- **Numbers & Metrics**: Tabular lining figures (`font-mono`) ensuring portion counts, countdown timers, and kilograms align precisely across columns.

---

## 4. Key Components Engineered in Project Aurora

### 4.1. Original Geometric Logo (`components/ui/Logo.tsx`)
A custom SVG glyph representing:
1. **The Dynamic Cradle**: A precision-weighted food vessel in Digital Violet and Ocean Teal.
2. **The Infinity Redistribution Loop**: An intersecting sweep symbolizing continuous transition from surplus to shelter.
3. **The Vitality Core Spark**: Warm Apricot Glow radiating living nutrition and renewed hope.

### 4.2. Command Palette (`components/ui/CommandPalette.tsx`)
Activated with `Cmd + K` or `Ctrl + K`:
- Instant fuzzy navigation across Operations, Intelligence, Logistics, and System utilities.
- Keyboard accessibility (`↑`, `↓`, `Enter`, `Esc`).
- Instant shortcut triggers for Relay Copilot (`Cmd + J`) and Demo Reset (`Shift + R`).

### 4.3. Universal Theme Switcher (`components/ui/ThemeSwitcher.tsx`)
- Native support for **Dark Mode**, **Light Mode**, and **System Sync**.
- Persisted securely across sessions in `localStorage`.
- Zero flickering on hydration with CSS variable cascade.

### 4.4. Mobile Bottom Navigation
- Ergonomic thumb-zone navigation for Android field workers and volunteers.
- High-contrast touch targets (48px+ touch padding).
- Elevated center action for **Relay Copilot** interaction.

---

## 5. Mobile & Android Precision
- Complete Capacitor 8 integration compiled with JDK 21 and Android SDK 34/35.
- Zero cleartext traffic vulnerabilities, utilizing secure reverse proxies for live development and offline local fallbacks for disconnected field use.
