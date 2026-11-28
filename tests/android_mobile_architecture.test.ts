import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { runRelayMatch, DEFAULT_WEIGHTS } from "../lib/matching/relayMatch";
import { generateFictionalSeedData } from "../lib/demo/seedData";
import { Donation, Recipient } from "../types";

describe("FoodRelay AI — Android Application & Mobile Architecture", () => {
  const rootDir = resolve(__dirname, "..");

  it("Phase 6: validates Capacitor configuration conforms to specification", () => {
    const configPath = resolve(rootDir, "capacitor.config.ts");
    expect(existsSync(configPath)).toBe(true);
    const content = readFileSync(configPath, "utf8");
    expect(content).toContain("com.impactforge.foodrelay");
    expect(content).toContain("FoodRelay AI");
    expect(content).toContain("localhost:3000");
  });

  it("Phase 6 & 20: validates AndroidManifest.xml permissions and security guards", () => {
    const manifestPath = resolve(rootDir, "android/app/src/main/AndroidManifest.xml");
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = readFileSync(manifestPath, "utf8");
    expect(manifest).toContain("android.permission.INTERNET");
    expect(manifest).toContain("android.permission.CAMERA");
    expect(manifest).toContain("android.permission.READ_MEDIA_IMAGES");
    expect(manifest).toContain('android:usesCleartextTraffic="true"');
  });

  it("Phase 8: validates mobile bottom navigation destinations in AppShell", () => {
    const appShellPath = resolve(rootDir, "components/layout/AppShell.tsx");
    const appShell = readFileSync(appShellPath, "utf8");
    expect(appShell).toContain("Mobile Bottom Navigation");
    expect(appShell).toContain('href="/dashboard"');
    expect(appShell).toContain('href="/donate"');
    expect(appShell).toContain('href="/matches"');
    expect(appShell).toContain('href="/about"');
    expect(appShell).toContain("setShowCopilot(true)");
  });

  it("Phase 12 & 18: executes mandatory offline redistribution scenario", () => {
    const seed = generateFictionalSeedData();
    const now = new Date();
    const donation180: Donation = {
      ...seed.donations[0],
      id: "don-test-180",
      quantity: 180,
      remainingQuantity: 180,
    };

    // Baseline allocation
    const baseline = runRelayMatch(donation180, seed.recipients, DEFAULT_WEIGHTS, now);
    expect(baseline.totalDonationPortions).toBe(180);
    expect(baseline.allocatedPortions).toBe(180);
    expect(baseline.unallocatedPortions).toBe(0);

    // Pick allocated recipient and switch it offline
    const allocatedId = baseline.suggestedAllocations[0].recipientId;
    const initialAllocatedPortions = baseline.suggestedAllocations[0].allocatedPortions;
    expect(initialAllocatedPortions).toBeGreaterThan(0);

    const offlineRecipients: Recipient[] = seed.recipients.map((r) =>
      r.id === allocatedId
        ? { ...r, status: "offline", isOnline: false, receivingAvailability: false }
        : r
    );

    const redistributed = runRelayMatch(donation180, offlineRecipients, DEFAULT_WEIGHTS, now);
    const offlineAlloc = redistributed.suggestedAllocations.find((a) => a.recipientId === allocatedId);
    expect(offlineAlloc).toBeUndefined();

    // Verify portion conservation: allocated + unallocated == 180
    expect(redistributed.allocatedPortions + redistributed.unallocatedPortions).toBe(180);

    // When ALL recipients are offline
    const allOffline = seed.recipients.map((r) => ({
      ...r,
      status: "offline" as const,
      isOnline: false,
      receivingAvailability: false,
    }));
    const zeroAlloc = runRelayMatch(donation180, allOffline, DEFAULT_WEIGHTS, now);
    expect(zeroAlloc.allocatedPortions).toBe(0);
    expect(zeroAlloc.unallocatedPortions).toBe(180);
  });

  it("Phase 20 & 22: ensures no secrets or large binary files are tracked in git", () => {
    const gitignorePath = resolve(rootDir, ".gitignore");
    const gitignore = readFileSync(gitignorePath, "utf8");
    expect(gitignore).toContain(".env*.local");
    expect(gitignore).toContain("*.apk");
    expect(gitignore).toContain("*.aab");
    expect(gitignore).toContain(".gradle/");
    expect(gitignore).toContain("android/app/build/");
  });
});
