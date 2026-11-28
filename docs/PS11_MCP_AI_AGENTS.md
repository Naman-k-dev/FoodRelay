# FoodRelay AI — Problem Statement 11: AI Agents & Model Context Protocol (MCP)

This document specifies the architectural implementation of **PS11 (AI Agents & MCP)** in FoodRelay AI, built with **Graftcode** in accordance with official integration guidelines.

---

## 1. Executive Summary & Architecture

FoodRelay AI exposes a unified, stateless domain service facade (`FoodRelayMcpService`) hosted through **Graftcode Gateway (`gg`)**. 

Rather than maintaining brittle REST route handlers or hand-written tool schemas:
1. **Public static methods are the contract:** Every public static method on `FoodRelayMcpService` automatically maps to a strongly-typed Model Context Protocol (MCP) tool.
2. **Multi-Protocol Discovery:** Graftcode Gateway natively serves WebSocket (`/ws`), Vision UI (`/GV`), and streaming MCP endpoints (`/mcp`) on a unified listener.
3. **Stateless Facade:** Requests pass full DTOs by value in a single round-trip without server-side session pinning.
4. **Header-Based Context:** Security tokens, actor IDs, and audit correlation IDs flow through `RequestContext` (`graftcode-context`) rather than parameter pollution.

---

## 2. Exposed MCP Tools Catalog

AI Agents (such as Claude Code, Cursor, Antigravity, or Gemini) discover and invoke the following 7 core tools over `http://localhost:8088/mcp`:

| MCP Tool Name | Description | Regulatory / Algorithm Standards |
| :--- | :--- | :--- |
| `getNetworkStatus()` | Queries real-time capacity, online/offline status, demand, and storage capabilities for all verified regional shelters. | Real-time capacity monitoring |
| `evaluateDonationSafety(donationInput)` | Validates surplus food donations against safety gates. | FSSAI 2019 Surplus Food Regulations 3(1), 4(1), 4(2), 5, 6 |
| `calculateSurplusMatches(donationInput, weightsInput?)` | Matches surplus food to shelters using multi-criteria scoring algorithm (urgency 40%, proximity 30%, demand 20%, readiness 10%). | Explainable multi-factor scoring |
| `triggerAutoRedistribution(donationInput, offlineShelterId, weightsInput?)` | Reactively recovers allocations when an assigned shelter goes offline, redistributing surplus across online shelters with zero food waste. | Mathematical portion conservation |
| `advanceDispatchStatus(allocationId, currentStatus, targetStatus, actor, note)` | Validates and advances dispatch lifecycle (`proposed` &rarr; `reserved` &rarr; `accepted` &rarr; `ready_for_pickup` &rarr; `collected` &rarr; `delivered`). | State Machine Transition Guard |
| `generateDispatchVoucher(allocationId, donationId, recipientId, portions, donorName, recipientName)` | Generates verifiable digital dispatch voucher with unique receipt ID and structured QR payload. | Cryptographic chain-of-custody |
| `parseIntakeText(rawText)` | Natural language intake extraction parsing meal portions, food category, dietary category, and shelf-life window. | AI-assisted surplus extraction |

---

## 3. How to Run and Test

### A. Generate Grafts & Verify Contracts (Default Build Mode)
```bash
npm run graft:gen
```
Analyzes `FoodRelayMcpService`, compiles TypeScript, generates the UGM IDL, and prints cross-technology package install commands without standing up servers.

### B. Run Automated MCP Test Suite
```bash
npx vitest run tests/mcp_agents_graftcode.test.ts
```
Executes all 16 automated tests verifying FSSAI safety gates, portion conservation, reactive redistribution, dispatch guards, and Graftcode architectural invariants.

### C. Host Live Graftcode Gateway & MCP Server
```bash
npm run graft:start
```
Starts Graftcode Gateway on port `8088`:
- **MCP Endpoint:** `http://localhost:8088/mcp`
- **Vision Portal:** `http://localhost:8088/GV`
- **HTTP/2 & Grafts:** `http://localhost:8089`

---

## 4. Connecting AI Tools via MCP

### Cursor Configuration (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "foodrelay-mcp": {
      "url": "http://localhost:8088/mcp"
    }
  }
}
```

### Claude Desktop Configuration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "foodrelay-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8088/mcp"]
    }
  }
}
```

---

## 5. Verification & Invariants

- **No REST controllers / route handlers as contract:** All service contracts are public static methods.
- **Strict Data Types:** Primitives, strings, plain DTOs, and plain arrays `T[]` only (zero `Set`, `Map`, or custom iterators).
- **ISO-8601 Timestamps:** Standardized cross-language compatibility (.NET, Python, Java, Node.js).
- **Repository Size Constraint:** Native binary `.graftcode` and `gg` cached assets are strictly excluded via `.gitignore`, preserving total repo size below ~1.5 MB (< 10 MB ceiling).
