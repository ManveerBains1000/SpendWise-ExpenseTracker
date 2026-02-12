# AI-Powered Expense Category Prediction

## Overview
This feature uses OpenAI's GPT-3.5 to automatically predict expense categories based on the description provided by the user.

## Implementation Flow

```
User enters description → Click "AI Predict Category" button
         ↓
Frontend (AddExpense.jsx) → POST /api/v1/expense/predict-category
         ↓
Backend (Expense.controller.js) → predictCategory()
         ↓
AI Service (aiService.js) → OpenAI API
         ↓
OpenAI returns predicted category
         ↓
Category auto-filled in form → User can confirm or change → Submit expense
```

## Files Modified/Created

### Backend
1. **`Backend/utils/aiService.js`** (NEW)
   - Contains `predictExpenseCategory()` function
   - Makes API call to OpenAI
   - Returns predicted category

2. **`Backend/controllers/Expense.controller.js`** (MODIFIED)
   - Added `predictCategory()` controller
   - Validates description and calls AI service

3. **`Backend/routes/Expense.routes.js`** (MODIFIED)
   - Added route: `POST /api/v1/expense/predict-category`

### Frontend
4. **`Frontend/src/pages/AddExpense.jsx`** (MODIFIED)
   - Added "AI Predict Category" button
   - Added `handlePredictCategory()` function
   - Shows loading state while predicting
   - Auto-fills category field with prediction

### Configuration
5. **`Backend/.env.example`** (NEW)
   - Added `OPENAI_API_KEY` configuration

## Setup Instructions

### 1. Get OpenAI API Key
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Copy the key

### 2. Configure Environment Variable
Add to your `Backend/.env` file:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Test the Feature
1. Start your backend server
2. Start your frontend
3. Navigate to Add Expense page
4. Enter a description (e.g., "Pizza delivery from Dominos")
5. Click "🤖 AI Predict Category" button
6. The category will be automatically predicted and filled in

## Supported Categories
- General
- Food
- Travel
- Shopping
- Bills

## Example Predictions
| Description | Predicted Category |
|-------------|-------------------|
| "Bought groceries at Walmart" | Shopping |
| "Subway sandwich for lunch" | Food |
| "Flight tickets to NYC" | Travel |
| "Netflix subscription" | Bills |
| "Office supplies" | General |

## Error Handling
- If API key is missing: Falls back to "General" category
- If OpenAI API fails: Falls back to "General" category
- If invalid description: Shows error toast
- Frontend shows loading state during prediction

## Cost Considerations
- Uses GPT-3.5-turbo (cheapest OpenAI model)
- Each request costs ~$0.0015
- Temperature: 0.3 (for consistent predictions)
- Max tokens: 10 (minimal token usage)

## Alternative AI Services
You can easily swap OpenAI with:
- **Hugging Face** (Free tier available)
- **Google Gemini** (Free tier available)
- **Anthropic Claude**
- **Local models** (Ollama, LM Studio)

Just modify the `Backend/utils/aiService.js` file accordingly.
