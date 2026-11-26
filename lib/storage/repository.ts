import { Donation, Recipient, Allocation, MatchingWeights } from "@/types";
import { generateFictionalSeedData } from "@/lib/demo/seedData";

const STORAGE_KEY = "foodrelay_v1_store";

export interface FoodRelayStoreState {
  version: number;
  donations: Donation[];
  recipients: Recipient[];
  allocations: Allocation[];
  weights: MatchingWeights;
  lastUpdated: string;
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  urgency: 40,
  proximity: 30,
  demand: 20,
  readiness: 10,
};

export class FoodRelayRepository {
  private static isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  public static initializeStore(): FoodRelayStoreState {
    const seed = generateFictionalSeedData();
    const state: FoodRelayStoreState = {
      version: 1,
      donations: seed.donations,
      recipients: seed.recipients,
      allocations: seed.allocations,
      weights: DEFAULT_WEIGHTS,
      lastUpdated: new Date().toISOString(),
    };

    if (this.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Failed to initialize localStorage:", err);
      }
    }
    return state;
  }

  public static getStore(): FoodRelayStoreState {
    if (!this.isClient()) {
      return {
        version: 1,
        ...generateFictionalSeedData(),
        weights: DEFAULT_WEIGHTS,
        lastUpdated: new Date().toISOString(),
      };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.initializeStore();
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.donations)) {
        return this.initializeStore();
      }
      return parsed as FoodRelayStoreState;
    } catch {
      return this.initializeStore();
    }
  }

  public static saveStore(state: FoodRelayStoreState): void {
    if (!this.isClient()) return;
    try {
      state.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event("foodrelay-store-change"));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  }

  public static resetToDemo(): FoodRelayStoreState {
    const fresh = this.initializeStore();
    if (this.isClient()) {
      window.dispatchEvent(new Event("foodrelay-store-change"));
    }
    return fresh;
  }

  public static exportJSON(): string {
    const store = this.getStore();
    return JSON.stringify(store, null, 2);
  }

  public static importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.donations) && Array.isArray(parsed.recipients)) {
        parsed.version = 1;
        this.saveStore(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Donations CRUD ---
  public static getDonations(): Donation[] {
    return this.getStore().donations;
  }

  public static getDonationById(id: string): Donation | undefined {
    return this.getDonations().find((d) => d.id === id);
  }

  public static saveDonation(donation: Donation): void {
    const store = this.getStore();
    const index = store.donations.findIndex((d) => d.id === donation.id);
    if (index >= 0) {
      store.donations[index] = donation;
    } else {
      store.donations.unshift(donation);
    }
    this.saveStore(store);
  }

  // --- Recipients CRUD ---
  public static getRecipients(): Recipient[] {
    return this.getStore().recipients;
  }

  public static getRecipientById(id: string): Recipient | undefined {
    return this.getRecipients().find((r) => r.id === id);
  }

  public static saveRecipient(recipient: Recipient): void {
    const store = this.getStore();
    const index = store.recipients.findIndex((r) => r.id === recipient.id);
    if (index >= 0) {
      store.recipients[index] = recipient;
    } else {
      store.recipients.unshift(recipient);
    }
    this.saveStore(store);
  }

  // --- Allocations CRUD ---
  public static getAllocations(): Allocation[] {
    return this.getStore().allocations;
  }

  public static getAllocationById(id: string): Allocation | undefined {
    return this.getAllocations().find((a) => a.id === id);
  }

  public static saveAllocation(allocation: Allocation): void {
    const store = this.getStore();
    const index = store.allocations.findIndex((a) => a.id === allocation.id);
    if (index >= 0) {
      store.allocations[index] = allocation;
    } else {
      store.allocations.unshift(allocation);
    }
    this.saveStore(store);
  }

  public static getWeights(): MatchingWeights {
    return this.getStore().weights || DEFAULT_WEIGHTS;
  }

  public static saveWeights(weights: MatchingWeights): void {
    const store = this.getStore();
    store.weights = weights;
    this.saveStore(store);
  }
}
