import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from './base-provider';
import type { ParseInput } from '@/types';

export class ClaudeProvider extends BaseAIProvider {
    async callModel(prompt: string, input: ParseInput): Promise<string> {
        const client = new Anthropic({ apiKey: this.apiKey });

        const content: Anthropic.Messages.ContentBlockParam[] = [];

        if (input.type !== 'text' && input.content) {
            const mediaType = (input.mimeType || 'image/jpeg') as
                | 'image/jpeg'
                | 'image/png'
                | 'image/gif'
                | 'image/webp';

            content.push({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: input.content,
                },
            });
        }

        content.push({ type: 'text', text: prompt });

        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{ role: 'user', content }],
        });

        const textBlock = response.content.find((block) => block.type === 'text');
        return textBlock && 'text' in textBlock ? textBlock.text : '';
    }
}
