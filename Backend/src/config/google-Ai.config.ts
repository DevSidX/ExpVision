
import { GoogleGenAI } from '@google/genai';
import { Env } from './env.config';

const genAi = new GoogleGenAI(
    {
        apiKey: Env.GEMINI_API_KEY,
    }
);

const genAiModel = 'gemini-2.5-flash';

export {
    genAi,
    genAiModel
}