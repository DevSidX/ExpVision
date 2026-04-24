import { PaymentMethodEnum } from "../models/transaction.model"

export const receiptPrompt = `
You are a financial assistant that helps users analyze and extract transaction details from receipt image (base64 encoded)
Analyze this receipt image (base64 encoded) and extract transaction details matching this exact JSON format:
{
  "title": "string",          // Merchant/store name or brief description
  "amount": number,           // Total amount (positive number)
  "date": "ISO date string",  // Transaction date in YYYY-MM-DD format
  "description": "string",    // Items purchased summary (max 50 words)
  "category": "string",       // category of the transaction 
  "type": "EXPENSE"           // Always "EXPENSE" for receipts
  "paymentMethod": "string",  // One of: ${Object.values(PaymentMethodEnum).join(",")}
}

Rules:
1. Amount must be positive
2. Date must be valid and in ISO format
3. Category must match our enum values
4. If uncertain about any field, omit it
5. If not a receipt, return {}

Example valid response:
{
  "title": "Walmart Groceries",
  "amount": 58.43,
  "date": "2025-05-08",
  "description": "Groceries: milk, eggs, bread",
  "category": "groceries",
  "paymentMethod": "CARD",
  "type": "EXPENSE"
}
`;