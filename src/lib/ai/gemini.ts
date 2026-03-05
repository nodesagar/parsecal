import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider } from './base-provider';
import type { ParseInput } from '@/types';

export class GeminiProvider extends BaseAIProvider {
    async callModel(prompt: string, input: ParseInput): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: this.apiKey });

        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

        if (input.type !== 'text' && input.content) {
            parts.push({
                inlineData: {
                    mimeType: input.mimeType || 'image/jpeg',
                    data: input.content,
                },
            });
        }

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts }],
        });

        return response.text || '';
    }
}
