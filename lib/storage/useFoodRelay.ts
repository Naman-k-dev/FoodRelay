"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FoodRelayRepository,
  FoodRelayStoreState,
  DEFAULT_WEIGHTS,
} from "./repository";
import { Donation, Recipient, Allocation, MatchingWeights } from "@/types";

export function useFoodRelay() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState<FoodRelayStoreState>(() => FoodRelayRepository.getStore());

  const refresh = useCallback(() => {
    setState(FoodRelayRepository.getStore());
  }, []);

  useEffect(() => {
    setIsHydrated(true);
    refresh();

    const handleStorageChange = () => {
      refresh();
    };

    window.addEventListener("foodrelay-store-change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("foodrelay-store-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refresh]);

  const saveDonation = useCallback((donation: Donation) => {
    FoodRelayRepository.saveDonation(donation);
    refresh();
  }, [refresh]);

  const saveRecipient = useCallback((recipient: Recipient) => {
    FoodRelayRepository.saveRecipient(recipient);
    refresh();
  }, [refresh]);

  const saveAllocation = useCallback((allocation: Allocation) => {
    FoodRelayRepository.saveAllocation(allocation);
    refresh();
  }, [refresh]);

  const saveWeights = useCallback((weights: MatchingWeights) => {
    FoodRelayRepository.saveWeights(weights);
    refresh();
  }, [refresh]);

  const resetDemo = useCallback(() => {
    FoodRelayRepository.resetToDemo();
    refresh();
  }, [refresh]);

  return {
    isHydrated,
    donations: state.donations,
    recipients: state.recipients,
    allocations: state.allocations,
    weights: state.weights || DEFAULT_WEIGHTS,
    lastUpdated: state.lastUpdated,
    saveDonation,
    saveRecipient,
    saveAllocation,
    saveWeights,
    resetDemo,
    refresh,
  };
}
