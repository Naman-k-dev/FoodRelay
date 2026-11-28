export declare class FoodRelayMcpService {
  static getNetworkStatus(): string;
  static evaluateDonationSafety(donationInput?: string): string;
  static calculateSurplusMatches(donationInput?: string, weightsInput?: string): string;
  static triggerAutoRedistribution(offlineShelterId?: string, donationInput?: string, weightsInput?: string): string;
  static advanceDispatchStatus(allocationId?: string, currentStatus?: string, targetStatus?: string, actor?: string, note?: string): string;
  static generateDispatchVoucher(allocationId?: string, donationId?: string, recipientId?: string, portions?: number | string, donorName?: string, recipientName?: string): string;
  static parseIntakeText(rawText: string): string;
}
