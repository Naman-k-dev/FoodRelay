/**
 * FoodRelay AI — Centralized Graftcode & MCP Configuration
 * In compliance with CLAUDE.md and .claude/rules/graftcode-typescript-node-nextjs.md:
 * - Public methods are the contract (stateless facade).
 * - Exposes FoodRelayMcpService for both in-process consumption and remote Graft Gateway / MCP agents.
 */
import { FoodRelayMcpService } from "../../services/foodrelay/FoodRelayMcpService";

export const GRAFT_CONFIG = {
  host: process.env.GRAFT_HOST || "http://localhost:8088",
  mcpEndpoint: process.env.GRAFT_MCP_ENDPOINT || "http://localhost:8088/mcp",
  visionEndpoint: process.env.GRAFT_VISION_ENDPOINT || "http://localhost:8088/GV",
  stateless: true,
};

export { FoodRelayMcpService };
export * from "../../services/foodrelay/types";
