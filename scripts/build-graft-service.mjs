import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const serviceEntry = resolve(rootDir, "services/foodrelay/FoodRelayMcpService.ts");
const serviceOut = resolve(rootDir, "services/foodrelay/dist/index.js");
const dtsOut = resolve(rootDir, "services/foodrelay/dist/index.d.ts");

async function buildService() {
  console.log("Building FoodRelay MCP Graftcode Service...");
  await esbuild.build({
    entryPoints: [serviceEntry],
    bundle: true,
    platform: "node",
    target: "es2022",
    format: "cjs",
    keepNames: true,
    outfile: serviceOut,
  });

  let code = readFileSync(serviceOut, "utf8");
  // Normalize module.exports for Graftcode GMA AST analyzer
  code = code.replace(/module\.exports\s*=\s*__toCommonJS\(.*?\);/g, "");
  code = code.replace(/var\s+FoodRelayMcpService\s*=\s*class\s+_?FoodRelayMcpService/g, "class FoodRelayMcpService");
  code = code.replace(/_FoodRelayMcpService/g, "FoodRelayMcpService");
  code += "\nmodule.exports = { FoodRelayMcpService };\n";
  writeFileSync(serviceOut, code, "utf8");

  // Generate strong declaration file for Graftcode Gateway AST parser
  const dtsContent = `export declare class FoodRelayMcpService {
  static getNetworkStatus(): string;
  static evaluateDonationSafety(donationInput?: string): string;
  static calculateSurplusMatches(donationInput?: string, weightsInput?: string): string;
  static triggerAutoRedistribution(offlineShelterId?: string, donationInput?: string, weightsInput?: string): string;
  static advanceDispatchStatus(allocationId?: string, currentStatus?: string, targetStatus?: string, actor?: string, note?: string): string;
  static generateDispatchVoucher(allocationId?: string, donationId?: string, recipientId?: string, portions?: number | string, donorName?: string, recipientName?: string): string;
  static parseIntakeText(rawText: string): string;
}
`;
  writeFileSync(dtsOut, dtsContent, "utf8");

  console.log("Successfully built FoodRelay MCP Service at", serviceOut);
}

buildService().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
