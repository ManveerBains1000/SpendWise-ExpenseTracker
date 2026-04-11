import { GoogleGenerativeAI } from "@google/generative-ai";

const VALID_CATEGORIES = ["General", "Food", "Travel", "Shopping", "Bills"];

const KEYWORD_RULES = [
  {
    category: "Bills",
    patterns: [
      /\bbill\b/i,
      /\belectricity\b/i,
      /\bwater\b/i,
      /\binternet\b/i,
      /\bwifi\b/i,
      /\bmobile\b/i,
      /\brecharge\b/i,
      /\brent\b/i,
      /\bsubscription\b/i,
      /\butility\b/i,
      /\bgas\b/i,
      /\bnetflix\b/i,
    ],
  },
  {
    category: "Travel",
    patterns: [
      /\btravel\b/i,
      /\bflight\b/i,
      /\bticket\b/i,
      /\btrain\b/i,
      /\bbus\b/i,
      /\bcab\b/i,
      /\btaxi\b/i,
      /\buber\b/i,
      /\bola\b/i,
      /\bpetrol\b/i,
      /\bdiesel\b/i,
      /\bfuel\b/i,
      /\btrip\b/i,
      /\bhotel\b/i,
    ],
  },
  {
    category: "Food",
    patterns: [
      /\bfood\b/i,
      /\blunch\b/i,
      /\bdinner\b/i,
      /\bbreakfast\b/i,
      /\brestaurant\b/i,
      /\bcafe\b/i,
      /\bcoffee\b/i,
      /\bpizza\b/i,
      /\bburger\b/i,
      /\bsandwich\b/i,
      /\bzomato\b/i,
      /\bswiggy\b/i,
      /\bdominos\b/i,
    ],
  },
  {
    category: "Shopping",
    patterns: [
      /\bshopping\b/i,
      /\bamazon\b/i,
      /\bflipkart\b/i,
      /\bmall\b/i,
      /\bstore\b/i,
      /\bclothes\b/i,
      /\bshirt\b/i,
      /\bshoes\b/i,
      /\bpurchase\b/i,
      /\border\b/i,
      /\bgrocer/i,
    ],
  },
];

const predictFromKeywords = (description) => {
  const text = String(description || "");

  for (const rule of KEYWORD_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.category;
    }
  }

  return "General";
};

const normalizeCategory = (rawText) => {
  if (!rawText) return null;

  const cleaned = String(rawText).trim().replace(/^['"\s]+|['"\s]+$/g, "");
  const exactMatch = VALID_CATEGORIES.find(
    (category) => category.toLowerCase() === cleaned.toLowerCase()
  );

  if (exactMatch) return exactMatch;

  const words = cleaned.toLowerCase().replace(/[^a-z]/g, " ").split(/\s+/);
  const wordMatch = VALID_CATEGORIES.find((category) =>
    words.includes(category.toLowerCase())
  );

  return wordMatch || null;
};

export const predictExpenseCategory = async (description) => {
  try {
    const safeDescription = String(description || "").trim();
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
You are an expense categorization assistant.

Return ONLY ONE of these categories:
General, Food, Travel, Shopping, Bills.
Reply with only the category name and no extra words.

Expense: "${safeDescription}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    return normalizeCategory(text) || predictFromKeywords(safeDescription);

  } catch (error) {
    const reason = String(error?.message || "Unknown error").split("\n")[0];
    console.warn(`Gemini unavailable (${reason}). Using keyword fallback.`);
    return predictFromKeywords(description);
  }
};
