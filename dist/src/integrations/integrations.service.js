"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let IntegrationsService = class IntegrationsService {
    client = new sdk_1.default({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    async invokeLLM(prompt, responseJsonSchema) {
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
            .map((b) => b.text)
            .join('');
        if (responseJsonSchema) {
            try {
                const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
                return JSON.parse(cleaned);
            }
            catch {
                return { raw: text };
            }
        }
        return { result: text };
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)()
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map