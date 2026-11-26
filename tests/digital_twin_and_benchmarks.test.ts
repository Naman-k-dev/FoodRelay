import { describe, it, expect } from "vitest";
import {
  getBenchmarkScenarios,
  generateBenchmarkAuditReport,
} from "../lib/matching/benchmarkScenarios";

describe("Phase 5: Benchmark Scenarios & Digital Twin Verification", () => {
  const scenarios = getBenchmarkScenarios(new Date());

  it("evaluates Scenario 1: Balanced Supply & Demand (180 portions, zero over-allocation)", () => {
    const s1 = scenarios.find((s) => s.id === "scenario-1-balanced");
    expect(s1).toBeDefined();
    if (!s1) return;

    expect(s1.donation.remainingQuantity).toBe(180);
    expect(s1.relayMatchResult.totalAllocated).toBe(180);
    expect(s1.relayMatchResult.unallocated).toBe(0);
    expect(s1.fcfsResult.totalAllocated).toBe(180);
    expect(s1.fcfsResult.unallocated).toBe(0);
  });

  it("evaluates Scenario 2: Insufficient Capacity (250 portions, 120 cap, 130 unallocated)", () => {
    const s2 = scenarios.find((s) => s.id === "scenario-2-insufficient-capacity");
    expect(s2).toBeDefined();
    if (!s2) return;

    expect(s2.donation.remainingQuantity).toBe(250);
    expect(s2.relayMatchResult.totalAllocated).toBe(120);
    expect(s2.relayMatchResult.unallocated).toBe(130);
    expect(s2.fcfsResult.totalAllocated).toBe(120);
    expect(s2.fcfsResult.unallocated).toBe(130);
  });

  it("evaluates Scenario 3: Recipient Disruption (Safely skips offline recipient)", () => {
    const s3 = scenarios.find((s) => s.id === "scenario-3-disruption");
    expect(s3).toBeDefined();
    if (!s3) return;

    const rmAllocations = s3.relayMatchResult.allocations;
    const allocatedToOffline = rmAllocations.some((a) => a.recipientId === "scen-3-rec-a");
    expect(allocatedToOffline).toBe(false);
    expect(s3.relayMatchResult.totalAllocated).toBe(180);
    expect(s3.relayMatchResult.unallocated).toBe(0);
  });

  it("evaluates Scenario 4: FSSAI 2019 Safety Gate Blocker (0 allocated, 100% held)", () => {
    const s4 = scenarios.find((s) => s.id === "scenario-4-safety-blocker");
    expect(s4).toBeDefined();
    if (!s4) return;

    expect(s4.relayMatchResult.totalAllocated).toBe(0);
    expect(s4.relayMatchResult.unallocated).toBe(180);
    expect(s4.fcfsResult.totalAllocated).toBe(0);
    expect(s4.fcfsResult.unallocated).toBe(180);
    expect(s4.metricsComparison.analysis).toContain("Safety Gate halts distribution");
  });

  it("generates valid downloadable audit reports in JSON and CSV formats", () => {
    const report = generateBenchmarkAuditReport(scenarios);
    expect(report.json).toBeDefined();
    expect(report.csv).toBeDefined();

    const parsedJson = JSON.parse(report.json);
    expect(parsedJson.reportTitle).toContain("FoodRelay AI");
    expect(parsedJson.scenarios).toHaveLength(4);

    expect(report.csv).toContain("Scenario ID,Scenario Name");
    expect(report.csv).toContain("scenario-1-balanced");
    expect(report.csv).toContain("scenario-2-insufficient-capacity");
  });
});
