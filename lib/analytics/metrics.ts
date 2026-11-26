import { Donation, Recipient, Allocation, ImpactMetrics } from "@/types";

export interface AnalyticsSummary {
  metrics: ImpactMetrics;
  statusDistribution: Array<{ name: string; count: number; portions: number; color: string }>;
  weeklyTrend: Array<{ day: string; deliveredPortions: number; date: string }>;
  donorLeaderboard: Array<{ name: string; portions: number; count: number }>;
  recipientDistribution: Array<{ type: string; demand: number; count: number }>;
}

export function computeAnalytics(
  donations: Donation[],
  recipients: Recipient[],
  allocations: Allocation[]
): AnalyticsSummary {
  let totalDonatedPortions = 0;
  let confirmedDeliveredPortions = 0;
  let currentlyAllocatedPortions = 0;
  let unallocatedPortions = 0;
  let pendingSafetyReviews = 0;

  // 1. Calculate from Donations
  for (const d of donations) {
    if (d.unit === "portions") {
      totalDonatedPortions += d.quantity;
      unallocatedPortions += d.remainingQuantity;
    }
    if (
      d.safetyReviewStatus === "awaiting_human_review" ||
      d.safetyReviewStatus === "incomplete_info"
    ) {
      pendingSafetyReviews++;
    }
  }

  // 2. Calculate from Allocations (Preventing Double Counting)
  let cancelledCount = 0;
  let deliveredCount = 0;

  for (const a of allocations) {
    if (a.status === "delivered") {
      confirmedDeliveredPortions += a.allocatedPortions;
      deliveredCount++;
    } else if (
      a.status === "reserved" ||
      a.status === "accepted" ||
      a.status === "ready_for_pickup" ||
      a.status === "collected"
    ) {
      currentlyAllocatedPortions += a.allocatedPortions;
    } else if (a.status === "cancelled") {
      cancelledCount++;
    }
  }

  // 3. Recipient Demand
  let outstandingRecipientDemand = 0;
  for (const r of recipients) {
    outstandingRecipientDemand += r.remainingDemand;
  }

  // 4. Cancellation Rate
  const totalAllocationsEvaluated = allocations.length;
  const cancellationRate =
    totalAllocationsEvaluated > 0
      ? Math.round((cancelledCount / totalAllocationsEvaluated) * 100)
      : 0;

  const metrics: ImpactMetrics = {
    totalDonatedPortions,
    confirmedDeliveredPortions,
    currentlyAllocatedPortions,
    unallocatedPortions,
    outstandingRecipientDemand,
    pendingDonationsCount: pendingSafetyReviews,
    cancellationRate,
    deliveredCount,
    totalDonationsCount: donations.length,
    activeRecipientsCount: recipients.length,
  };

  // Status Distribution
  const statusCounts: Record<string, { count: number; portions: number }> = {};
  for (const d of donations) {
    if (!statusCounts[d.status]) {
      statusCounts[d.status] = { count: 0, portions: 0 };
    }
    statusCounts[d.status].count++;
    if (d.unit === "portions") {
      statusCounts[d.status].portions += d.quantity;
    }
  }

  const colorMap: Record<string, string> = {
    available: "#15803D",
    delivered: "#123B2B",
    reserved: "#D97706",
    awaiting_review: "#EAB308",
    draft: "#94A3B8",
    expired: "#DC2626",
    cancelled: "#64748B",
    fully_allocated: "#0D9488",
  };

  const statusDistribution = Object.entries(statusCounts).map(([status, val]) => ({
    name: status.replace("_", " ").toUpperCase(),
    count: val.count,
    portions: val.portions,
    color: colorMap[status] || "#94A3B8",
  }));

  // Weekly Trend: aggregate delivered portions across the last 7 days
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const weeklyMap: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    weeklyMap[key] = 0;
  }

  for (const a of allocations) {
    if (a.status === "delivered" && a.handoverReceipt?.completedAt) {
      const dateKey = a.handoverReceipt.completedAt.split("T")[0];
      if (weeklyMap[dateKey] !== undefined) {
        weeklyMap[dateKey] += a.allocatedPortions;
      }
    }
  }

  // If few historical allocations in demo, make sure the curve has good representative points
  const weeklyTrend = Object.entries(weeklyMap).map(([dateStr, portions]) => {
    const d = new Date(dateStr);
    return {
      date: dateStr,
      day: dayNames[d.getDay()],
      deliveredPortions: portions,
    };
  });

  // Donor Leaderboard
  const donorMap: Record<string, { portions: number; count: number }> = {};
  for (const d of donations) {
    if (!donorMap[d.donorName]) {
      donorMap[d.donorName] = { portions: 0, count: 0 };
    }
    donorMap[d.donorName].count++;
    if (d.unit === "portions") {
      donorMap[d.donorName].portions += d.quantity;
    }
  }

  const donorLeaderboard = Object.entries(donorMap)
    .map(([name, stat]) => ({
      name,
      portions: stat.portions,
      count: stat.count,
    }))
    .sort((a, b) => b.portions - a.portions)
    .slice(0, 5);

  // Recipient Distribution by Type
  const recipientTypeMap: Record<string, { demand: number; count: number }> = {};
  for (const r of recipients) {
    const typeLabel = r.organizationType.replace("_", " ").toUpperCase();
    if (!recipientTypeMap[typeLabel]) {
      recipientTypeMap[typeLabel] = { demand: 0, count: 0 };
    }
    recipientTypeMap[typeLabel].count++;
    recipientTypeMap[typeLabel].demand += r.remainingDemand;
  }

  const recipientDistribution = Object.entries(recipientTypeMap).map(([type, stat]) => ({
    type,
    demand: stat.demand,
    count: stat.count,
  }));

  return {
    metrics,
    statusDistribution,
    weeklyTrend,
    donorLeaderboard,
    recipientDistribution,
  };
}
