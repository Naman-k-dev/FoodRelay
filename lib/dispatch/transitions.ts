import { Allocation, AllocationStatus } from "@/types";

/**
 * State Transition Guard for Dispatch Coordination.
 * Valid sequence:
 * Proposed -> Reserved -> Accepted -> Ready for pickup -> Collected -> Delivered
 * Any state can transition to Cancelled (except already Delivered).
 */
export const ALLOWED_TRANSITIONS: Record<AllocationStatus, AllocationStatus[]> = {
  proposed: ["reserved", "cancelled"],
  reserved: ["accepted", "cancelled"],
  accepted: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["collected", "cancelled"],
  collected: ["delivered", "cancelled"],
  delivered: [], // Terminal successful state
  cancelled: [], // Terminal cancelled state
};

export function canTransitionAllocation(
  currentStatus: AllocationStatus,
  targetStatus: AllocationStatus
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: false, reason: "Allocation is already in this status." };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Invalid transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${
        allowedNext.join(", ") || "None (terminal state)"
      }.`,
    };
  }

  return { allowed: true };
}

export function advanceAllocationStatus(
  allocation: Allocation,
  targetStatus: AllocationStatus,
  actor: string,
  note: string
): Allocation {
  const check = canTransitionAllocation(allocation.status, targetStatus);
  if (!check.allowed) {
    throw new Error(check.reason);
  }

  const now = new Date().toISOString();
  const updatedTimeline = [
    ...allocation.timeline,
    {
      status: targetStatus,
      timestamp: now,
      actor,
      note,
    },
  ];

  let handoverReceipt = allocation.handoverReceipt;
  if (targetStatus === "delivered" && !handoverReceipt) {
    handoverReceipt = {
      receiptNumber: `FR-REC-${Date.now().toString().slice(-6)}`,
      donorSignature: "Verified Kitchen Representative",
      recipientSignature: "Verified Recipient Coordinator",
      completedAt: now,
      qrData: `FOODRELAY:${allocation.id}:${allocation.donationId}:${allocation.recipientId}:${allocation.allocatedPortions}PORTIONS`,
    };
  }

  return {
    ...allocation,
    status: targetStatus,
    updatedAt: now,
    timeline: updatedTimeline,
    handoverReceipt,
  };
}
