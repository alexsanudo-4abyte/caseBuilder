import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class IntegrationsService {
  private readonly client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  async invokeLLM(prompt: string, responseJsonSchema?: object): Promise<unknown> {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

    const systemPrompt = responseJsonSchema
      ? `You must respond with valid JSON that matches this schema: ${JSON.stringify(responseJsonSchema)}. Respond only with the JSON object, no markdown or explanation.`
      : 'You are a helpful legal AI assistant.';

    const message = await this.client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    if (responseJsonSchema) {
      try {
        const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        return JSON.parse(cleaned);
      } catch {
        return { raw: text };
      }
    }

    return { result: text };
  }
}
