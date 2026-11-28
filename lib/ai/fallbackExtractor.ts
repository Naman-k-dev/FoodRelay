import { ExtractedDraft } from "@/lib/schemas/intake";

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Deterministic multilingual fallback parser for English, Hindi, and Hinglish donation messages.
 * Used when Gemini API key is unset, quota exceeded, or network is unavailable.
 */
export function extractWithFallbackHeuristics(message: string): ExtractedDraft {
  const text = message.toLowerCase().trim();
  const evidence: Record<string, string> = {};
  const missingFields: string[] = [];
  const ambiguousFields: string[] = [];
  const followUpQuestions: string[] = [];

  // 0. Non-food message detection
  const foodKeywords = [
    "food", "khana", "meal", "meals", "lunch", "dinner", "breakfast", "nashta",
    "biryani", "thali", "thalis", "rice", "dal", "chawal", "roti", "sabzi",
    "curry", "paneer", "rajma", "poha", "sandwich", "sandwiches", "fruit",
    "vegetable", "bread", "canteen", "catering", "caterer", "restaurant",
    "portions", "plates", "boxes", "packets", "packets", "surplus", "extra",
    "bhojan", "khana", "shakahari", "mansahari", "wedding", "shaadi",
  ];

  const hasFoodKeyword = foodKeywords.some((kw) => text.includes(kw)) || /\b\d+\s*(plates?|portions?|thalis?|meals?|boxes|packets?)\b/i.test(message);
  const isPoemOrCode = /^(write|generate|explain|translate|solve|create)\s+(a\s+)?(poem|song|story|code|essay|code|python)/i.test(text);

  if (!hasFoodKeyword && isPoemOrCode) {
    return {
      donorOrganization: null,
      donorType: null,
      foodDescription: null,
      foodCategory: null,
      dietaryCategory: null,
      quantity: null,
      quantityUnit: null,
      preparationTime: null,
      pickupLocation: null,
      pickupWindowStart: null,
      pickupWindowEnd: null,
      useByTime: null,
      storageMethod: null,
      packagingCondition: null,
      allergens: [],
      handlingInformation: null,
      sourceRegistration: null,
      missingFields: ["foodDescription", "quantity", "pickupLocation"],
      ambiguousFields: [],
      followUpQuestions: [
        "Your message does not appear to describe surplus food for rescue. Could you specify the food items, portion count, and pickup location?",
      ],
      evidence: {},
      foodItems: [],
      isFoodRelated: false,
      unrelatedExplanation: "Input does not describe food donation or surplus rescue. Please provide details such as meal type, quantity, and pickup timing.",
    };
  }

  // 1. Multi-item parsing (e.g. "75 sandwiches and 50 fruit boxes", "100 packets of poha and 200 sealed water bottles")
  const parsedItems: ParsedItem[] = [];
  const multiItemRegex = /(\d+)\s*(?:packets?|plates?|boxes?|portions?|bottles?|sandwiches?|thalis?|packs?|kg|liters?)?\s*(?:of\s+)?([a-zA-Z\s]+?)(?:and|,|\.|$|&)/gi;
  let itemMatch: RegExpExecArray | null;

  // Specific check for dual-item patterns like "75 sandwiches and 50 fruit boxes"
  const dualMatch = message.match(/(\d+)\s*([a-zA-Z\s]+?)\s*(?:and|,|&)\s*(\d+)\s*([a-zA-Z\s]+?)(?:\.|$)/i);
  if (dualMatch) {
    const q1 = parseInt(dualMatch[1], 10);
    const item1 = dualMatch[2].trim();
    const q2 = parseInt(dualMatch[3], 10);
    const item2 = dualMatch[4].trim();

    parsedItems.push({
      name: item1,
      quantity: q1,
      unit: item1.includes("box") ? "boxes" : item1.includes("packet") ? "packets" : "portions",
    });
    parsedItems.push({
      name: item2,
      quantity: q2,
      unit: item2.includes("bottle") ? "bottles" : item2.includes("box") ? "boxes" : "portions",
    });
  }

  // 2. Primary Quantity and Unit extraction
  let quantity: number | null = null;
  let quantityUnit: string | null = null;

  const portionMatch = message.match(/(\d+)\s*(portions|meals|plates|thalis|boxes|packets|packs)/i);
  const kgMatch = message.match(/(\d+)\s*(kg|kgs|kilograms|kilo)/i);
  const hindiPortionMatch = message.match(/(\d+)\s*(logon ka|vyaktiyon ke liye|meals?|packet|plate|portions)/i);

  if (portionMatch) {
    quantity = parseInt(portionMatch[1], 10);
    quantityUnit = "portions";
    evidence["quantity"] = portionMatch[0];
  } else if (hindiPortionMatch) {
    quantity = parseInt(hindiPortionMatch[1], 10);
    quantityUnit = "portions";
    evidence["quantity"] = hindiPortionMatch[0];
  } else if (kgMatch) {
    quantity = parseInt(kgMatch[1], 10);
    quantityUnit = "kg";
    evidence["quantity"] = kgMatch[0];
    ambiguousFields.push("quantityUnit");
    followUpQuestions.push(
      "Quantity is specified in 'kg'. How many meal portions does this represent for redistribution?"
    );
  } else if (dualMatch) {
    // If dual items, use primary count or sum if units are compatible
    quantity = parseInt(dualMatch[1], 10) + parseInt(dualMatch[3], 10);
    quantityUnit = "portions";
    evidence["quantity"] = `${dualMatch[1]} + ${dualMatch[3]}`;
  } else {
    // Check for any 2-4 digit number
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

  // 3. Dietary Category
  let dietaryCategory: string | null = null;
  const isExplicitNonVeg =
    text.includes("chicken") ||
    text.includes("mutton") ||
    text.includes("meat") ||
    text.includes("fish") ||
    text.includes("egg") ||
    text.includes("non-veg") ||
    text.includes("nonveg") ||
    text.includes("mansahari");

  const isExplicitVeg =
    text.includes("veg") ||
    text.includes("vegetarian") ||
    text.includes("shakahari") ||
    text.includes("शाकाहारी") ||
    text.includes("paneer") ||
    text.includes("dal") ||
    text.includes("rajma") ||
    text.includes("poha") ||
    text.includes("sabzi");

  if (isExplicitNonVeg) {
    dietaryCategory = "non_vegetarian";
    evidence["dietaryCategory"] = "non-veg/poultry/meat mention";
  } else if (text.includes("jain")) {
    dietaryCategory = "jain";
    evidence["dietaryCategory"] = "jain mention";
  } else if (text.includes("vegan")) {
    dietaryCategory = "vegan";
    evidence["dietaryCategory"] = "vegan mention";
  } else if (isExplicitVeg) {
    dietaryCategory = "vegetarian";
    evidence["dietaryCategory"] = "vegetarian/veg ingredient mention";
  } else {
    dietaryCategory = "vegetarian"; // safe default
    ambiguousFields.push("dietaryCategory");
    followUpQuestions.push("Is the food vegetarian, vegan, Jain, or non-vegetarian?");
  }

  // 4. Food Category
  let foodCategory: string | null = "cooked_meals";
  if (text.includes("bread") || text.includes("pastry") || text.includes("muffin") || text.includes("bakery")) {
    foodCategory = "bakery";
  } else if (text.includes("ration") || text.includes("rice bag") || text.includes("atta") || text.includes("packaged")) {
    foodCategory = "packaged_groceries";
  } else if (text.includes("fruit") || text.includes("produce") || text.includes("vegetable basket")) {
    foodCategory = "fresh_produce";
  }

  // 5. Food Description
  let foodDescription: string | null = null;
  const descSentences = message.split(/[.,\n]/);
  if (descSentences.length > 0 && descSentences[0].trim().length > 3) {
    foodDescription = descSentences[0].trim();
    evidence["foodDescription"] = foodDescription;
  } else {
    foodDescription = "Prepared surplus meals";
  }

  // 6. Donor Organization Name
  let donorOrganization: string | null = null;
  const donorMatch = message.match(/(?:from|by|at|humara|hamare)\s+([A-Za-z0-9\s&]+?)(?:canteen|hotel|restaurant|mess|banquet|cafeteria|hostel|in|sector)/i);
  if (donorMatch) {
    donorOrganization = donorMatch[1].trim();
    evidence["donorOrganization"] = donorMatch[0];
  } else if (text.includes("canteen")) {
    donorOrganization = "Campus Canteen (Simulated)";
  } else if (text.includes("restaurant")) {
    donorOrganization = "Local Restaurant (Simulated)";
  } else if (text.includes("hostel")) {
    donorOrganization = "Student Hostel (Simulated)";
  } else if (text.includes("wedding")) {
    donorOrganization = "Wedding Banquet Hall";
  } else {
    donorOrganization = "Surplus Donor (Review Needed)";
    missingFields.push("donorOrganization");
    followUpQuestions.push("What is your restaurant, caterer, or donor organization name?");
  }

  // 7. Location
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

  // 8. Packaging & Storage
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

  // 9. Timestamps (Relative to current moment)
  const now = new Date();
  const preparedAt = new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString();
  const pickupWindowStart = now.toISOString();
  const pickupWindowEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();
  const useByTime = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

  // 10. Allergens
  const allergens: string[] = [];
  if (text.includes("paneer") || text.includes("milk") || text.includes("curd") || text.includes("dairy")) {
    allergens.push("dairy");
  }
  if (text.includes("peanut") || text.includes("kaju") || text.includes("nut")) {
    allergens.push("nuts");
  }
  if (text.includes("roti") || text.includes("wheat") || text.includes("bread") || text.includes("sandwich")) {
    allergens.push("gluten");
  }

  return {
    donorOrganization,
    donorType: text.includes("hostel") ? "hostel" : text.includes("restaurant") ? "restaurant" : "corporate_cafeteria",
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
    foodItems: parsedItems,
    isFoodRelated: true,
    unrelatedExplanation: null,
  };
}
