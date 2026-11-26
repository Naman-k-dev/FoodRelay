import { ExtractedDraft } from "@/lib/schemas/intake";

/**
 * Deterministic multilingual fallback parser for English, Hindi, and Hinglish donation messages.
 * Used when Gemini API key is unset, quota exceeded, or network is unavailable.
 */
export function extractWithFallbackHeuristics(message: string): ExtractedDraft {
  const text = message.toLowerCase();
  const evidence: Record<string, string> = {};
  const missingFields: string[] = [];
  const ambiguousFields: string[] = [];
  const followUpQuestions: string[] = [];

  // 1. Quantity and Unit extraction
  // Matches "120 portions", "120 meals", "50 kg", "20 packets", "80 plates", "100 logon ka khana", "120 pack"
  let quantity: number | null = null;
  let quantityUnit: string | null = null;

  const portionMatch = message.match(/(\d+)\s*(portions|meals|plates|thalis|boxes|packets|packs|portions)/i);
  const kgMatch = message.match(/(\d+)\s*(kg|kgs|kilograms|kilo)/i);
  const hindiPortionMatch = message.match(/(\d+)\s*(logon ka|vyaktiyon ke liye|meals|packet|plate)/i);

  if (portionMatch) {
    quantity = parseInt(portionMatch[1], 10);
    quantityUnit = "portions";
    evidence["quantity"] = portionMatch[0];
  } else if (kgMatch) {
    quantity = parseInt(kgMatch[1], 10);
    quantityUnit = "kg";
    evidence["quantity"] = kgMatch[0];
    ambiguousFields.push("quantityUnit");
    followUpQuestions.push(
      "Quantity is specified in 'kg'. How many meal portions does this represent for redistribution?"
    );
  } else if (hindiPortionMatch) {
    quantity = parseInt(hindiPortionMatch[1], 10);
    quantityUnit = "portions";
    evidence["quantity"] = hindiPortionMatch[0];
  } else {
    // Check for any number
    const numMatch = message.match(/\b(\d{2,4})\b/);
    if (numMatch) {
      quantity = parseInt(numMatch[1], 10);
      quantityUnit = "portions";
      evidence["quantity"] = numMatch[0];
    } else {
      missingFields.push("quantity");
      followUpQuestions.push("Could you specify the exact quantity and whether it is in portions or kg?");
    }
  }

  // 2. Dietary Category
  let dietaryCategory: string | null = null;
  if (
    text.includes("vegetarian") ||
    text.includes("shakahari") ||
    text.includes("शाकाहारी") ||
    text.includes("veg")
  ) {
    dietaryCategory = "vegetarian";
    evidence["dietaryCategory"] = "vegetarian/shakahari/veg mention";
  } else if (
    text.includes("chicken") ||
    text.includes("biryani") ||
    text.includes("non-veg") ||
    text.includes("nonveg") ||
    text.includes("mansahari")
  ) {
    dietaryCategory = "non_vegetarian";
    evidence["dietaryCategory"] = "non-veg/poultry mention";
  } else if (text.includes("jain")) {
    dietaryCategory = "jain";
    evidence["dietaryCategory"] = "jain mention";
  } else if (text.includes("vegan")) {
    dietaryCategory = "vegan";
    evidence["dietaryCategory"] = "vegan mention";
  } else {
    dietaryCategory = "vegetarian"; // default assumption, but flagged ambiguous
    ambiguousFields.push("dietaryCategory");
    followUpQuestions.push("Is the food vegetarian, vegan, Jain, or non-vegetarian?");
  }

  // 3. Food Category
  let foodCategory: string | null = "cooked_meals";
  if (text.includes("bread") || text.includes("pastry") || text.includes("muffin") || text.includes("bakery")) {
    foodCategory = "bakery";
  } else if (text.includes("ration") || text.includes("rice bag") || text.includes("atta") || text.includes("packaged")) {
    foodCategory = "packaged_groceries";
  } else if (text.includes("fruit") || text.includes("vegetable") || text.includes("tamatar") || text.includes("produce")) {
    foodCategory = "fresh_produce";
  }

  // 4. Food Description
  let foodDescription: string | null = null;
  const descSentences = message.split(/[.,\n]/);
  if (descSentences.length > 0) {
    foodDescription = descSentences[0].trim();
    evidence["foodDescription"] = foodDescription;
  }

  // 5. Donor Organization Name
  let donorOrganization: string | null = null;
  const donorMatch = message.match(/(?:from|by|at|humara)\s+([A-Za-z0-9\s&]+?)(?:canteen|hotel|restaurant|mess|banquet|cafeteria|in|sector)/i);
  if (donorMatch) {
    donorOrganization = donorMatch[1].trim();
    evidence["donorOrganization"] = donorMatch[0];
  } else {
    donorOrganization = "Surplus Donor (Review Needed)";
    missingFields.push("donorOrganization");
    followUpQuestions.push("What is your restaurant, caterer, or donor organization name?");
  }

  // 6. Location
  let pickupLocation: string | null = null;
  const locMatch = message.match(/(?:in|at|near|location:?)\s*(Sector\s*\d+[^,\n.]*|Knowledge Park[^,\n.]*|Noida[^,\n.]*|Greater Noida[^,\n.]*)/i);
  if (locMatch) {
    pickupLocation = locMatch[1].trim();
    evidence["pickupLocation"] = locMatch[0];
  } else {
    pickupLocation = "Sector 62, Noida (Fictional Area)";
    ambiguousFields.push("pickupLocation");
    followUpQuestions.push("What is the exact pickup address or landmark?");
  }

  // 7. Packaging & Storage
  let packagingCondition: string | null = "sealed_containers";
  if (text.includes("foil") || text.includes("tray")) {
    packagingCondition = "foil_trays";
    evidence["packagingCondition"] = "foil trays mention";
  } else if (text.includes("loose") || text.includes("open") || text.includes("khula")) {
    packagingCondition = "loose";
    ambiguousFields.push("packagingCondition");
    followUpQuestions.push("Food appears loosely stored. Can it be packed in sealed containers before dispatch?");
  } else if (text.includes("sealed") || text.includes("dabb") || text.includes("container") || text.includes("pack")) {
    packagingCondition = "sealed_containers";
    evidence["packagingCondition"] = "sealed containers mention";
  }

  let storageMethod: string | null = "heated";
  if (text.includes("hot") || text.includes("garam") || text.includes("cambro") || text.includes("heated")) {
    storageMethod = "heated";
  } else if (text.includes("fridge") || text.includes("thanda") || text.includes("refrigerated") || text.includes("chilled")) {
    storageMethod = "refrigerated";
  } else {
    storageMethod = "ambient";
  }

  // 8. Timestamps (Relative to now)
  const now = new Date();
  const preparedAt = new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString();
  const pickupWindowStart = now.toISOString();
  const pickupWindowEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();
  const useByTime = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

  // Allergens
  const allergens: string[] = [];
  if (text.includes("paneer") || text.includes("milk") || text.includes("curd") || text.includes("dairy")) {
    allergens.push("dairy");
  }
  if (text.includes("peanut") || text.includes("kaju") || text.includes("nut")) {
    allergens.push("nuts");
  }
  if (text.includes("roti") || text.includes("wheat") || text.includes("bread")) {
    allergens.push("gluten");
  }

  return {
    donorOrganization,
    donorType: "corporate_cafeteria",
    foodDescription: foodDescription || "Prepared meal surplus",
    foodCategory,
    dietaryCategory,
    quantity,
    quantityUnit,
    preparationTime: preparedAt,
    pickupLocation,
    pickupWindowStart,
    pickupWindowEnd,
    useByTime,
    storageMethod,
    packagingCondition,
    allergens,
    handlingInformation: "Store in clean thermal containers; dispatch while hot/chilled.",
    sourceRegistration: "FSSAI Registered Entity (Simulated)",
    missingFields,
    ambiguousFields,
    followUpQuestions,
    evidence,
  };
}
