import OpenAI from 'openai';
import { BaseAIProvider } from './base-provider';
import type { ParseInput } from '@/types';

export class OpenAIProvider extends BaseAIProvider {
    async callModel(prompt: string, input: ParseInput): Promise<string> {
        const client = new OpenAI({ apiKey: this.apiKey });

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

        if (input.type !== 'text' && input.content) {
            messages.push({
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${input.mimeType || 'image/jpeg'};base64,${input.content}`,
                        },
                    },
                    { type: 'text', text: prompt },
                ],
            });
        } else {
            messages.push({
                role: 'user',
                content: prompt,
            });
        }

        const response = await client.chat.completions.create({
            model: 'gpt-4o',
            messages,
            response_format: { type: 'json_object' },
        });

        return response.choices[0]?.message?.content || '';
    }
}
