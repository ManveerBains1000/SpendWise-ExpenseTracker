import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const predictExpenseCategory = async (description) => {
    
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expense categorization assistant.

Return ONLY ONE of these categories:
General, Food, Travel, Shopping, Bills.

Expense: "${description}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const validCategories = ["General", "Food", "Travel", "Shopping", "Bills"];

    if (validCategories.includes(text)) {
      return text;
    }

    return "General";

  } catch (error) {
    console.error("Gemini error:", error.message);
    return "General";
  }
};
