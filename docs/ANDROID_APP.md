# FoodRelay AI — Android Native Application & Physical Device Architecture

## 1. Overview & Architecture

**FoodRelay AI** is deployed on Android as a high-performance native application using **Capacitor 8** paired with the existing Next.js / React 19 application core. This architecture preserves all existing server-side intelligence, Indian FSSAI 2019 food safety gate logic, deterministic RelayMatch allocation algorithms, and Model Context Protocol (MCP) tool integration.

```
+-----------------------------------------------------------------------------------+
|                            PHYSICAL ANDROID DEVICE                                |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             FoodRelay Native App                            |  |
|  |     (Capacitor 8 / Android 15 / SDK 35 / com.impactforge.foodrelay)          |  |
|  +-----------------------------------------------------------------------------+  |
|                                       │                                           |
|                  USB Cable Connection (ADB Reverse Forwarding)                    |
|                        `adb reverse tcp:3000 tcp:3000`                            |
+───────────────────────────────────────┼───────────────────────────────────────────+
                                        │
+───────────────────────────────────────▼───────────────────────────────────────────+
|                           MACBOOK AIR (HOST SYSTEM)                               |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                      Next.js Application Core (:3000)                       |  |
|  |    - Server-Side Rendering (SSR) & Dynamic Routing                          |  |
|  |    - Gemini AI Multilingual Intake & Copilot (/api/intake, /api/copilot)    |  |
|  |    - Deterministic Food Safety Gate & RelayMatch Heuristics                 |  |
|  |    - Versioned LocalStorage Client State Replication                        |  |
|  +-----------------------------------------------------------------------------+  |
|                                       │                                           |
|                                       ▼                                           |
|  +-----------------------------------------------------------------------------+  |
|  |                  Graftcode Gateway 1.5.1 (Port 8088/mcp)                    |  |
|  |   PS11 — AI Agents & MCP: 7 Verified Tools (JSON-RPC Protocol)              |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Prerequisites & Environment Setup

- **macOS Host**: Apple Silicon ARM64
- **Node.js**: v24.21.0
- **Java**: OpenJDK 21 (`/opt/homebrew/opt/openjdk@21`)
- **Android SDK**: Android SDK 34 (`platforms/android-34`), Build-Tools 35 (`build-tools/35.0.0`)
- **ADB**: Android Debug Bridge 1.0.41 (`/opt/homebrew/bin/adb`)
- **Connected Device**: CPH2569 (OnePlus Nord CE 3 Lite 5G, Android 15, API Level 35, ARM64)

---

## 3. Physical Device Deployment & USB Forwarding

1. Connect the Android phone via USB cable and ensure **USB debugging** is enabled.
2. Verify device authorization:
   ```bash
   adb devices -l
   ```
3. Establish USB reverse port forwarding:
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```
4. Build the Android debug APK:
   ```bash
   npm run android:build
   ```
   **Output APK**: `android/app/build/outputs/apk/debug/app-debug.apk` (7.8 MB)
5. Install on physical phone:
   ```bash
   npm run android:install
   ```
6. Launch FoodRelay AI:
   ```bash
   npm run android:run
   ```

---

## 4. Automation Commands

Convenient npm scripts are integrated into `package.json`:

| Script | Purpose |
|---|---|
| `npm run android:doctor` | Audits Java, SDK, ADB, connected physical phone, and network services |
| `npm run android:dev` | Configures USB reverse proxy and launches the app on the phone |
| `npm run android:sync` | Synchronizes web assets and native Capacitor plugins with Android |
| `npm run android:build` | Compiles `app-debug.apk` via Gradle Daemon 8.14 |
| `npm run android:install` | Deploys `app-debug.apk` to connected phone over USB |
| `npm run android:run` | Launches `com.impactforge.foodrelay.MainActivity` |

---

## 5. Mobile Navigation & Touch UX

The mobile application features a persistent, touch-optimized bottom navigation bar adhering to **WCAG 2.2 AA accessibility standards**:
1. **Home** (`/dashboard`): Live rescue statistics, urgent operations, quick donation access.
2. **Donate** (`/donate`): Multilingual Gemini Smart Intake, camera/gallery scanner, safety reviews.
3. **Rescue** (`/matches`): Intelligent matching engine, weight tuning, live allocation sandbox.
4. **Agent**: One-touch Gemini Relay Copilot slide-out drawer grounded in live operational records.
5. **Profile** (`/about`): FSSAI 2019 regulatory compliance, data export/restore, demo controls.

---

## 6. Offline NGO Redistribution Guarantee

When any shelter is marked **offline** (via UI toggle or MCP `triggerAutoRedistribution`):
- Its proposed allocation is **immediately zeroed**.
- Portions are **automatically recalculated and redistributed** to remaining online shelters.
- Strict demand limits, dietary constraints, and temperature-controlled storage capabilities are respected.
- Verified on physical device: 180 vegetarian portions allocated to Jan Seva (150) and Prerna Orphanage (30). Selecting **Jain** dietary category immediately drops non-Jain shelters and flags 30 unallocated portions.

---

## 7. Security & Privacy

- **Zero Secret Leakage**: No Gemini API keys or Graftcode project keys are compiled into the APK or exposed to client storage. All AI and MCP calls execute server-side.
- **Least-Privilege Android Permissions**: Only `INTERNET`, `CAMERA`, and `READ_MEDIA_IMAGES` are declared.
- **Cleartext Restricted**: `android:usesCleartextTraffic="true"` is restricted to local development debugging (`localhost:3000`).
- **Binary Exclusion**: APKs, Gradle caches (`.gradle/`), and build outputs are strictly excluded from git via `.gitignore`, preserving the **< 10 MB repository limit**.

---

## 8. Development vs. Production & Future Roadmap

- **Development Mode**: Physical phone communicates over USB via `adb reverse tcp:3000 tcp:3000` to local Next.js and Graftcode instances.
- **Production Mode**: Configured via `CAPACITOR_LIVE_URL=https://foodrelay.vercel.app` over secure HTTPS.
- **Future Supabase Synchronization**: Cloud cross-device replication between desktop and mobile is architecturally staged for subsequent phases.
