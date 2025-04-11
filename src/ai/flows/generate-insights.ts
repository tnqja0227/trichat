'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating insights from a chat conversation.
 *
 * - generateInsights - A function that triggers the insight generation flow.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateInsightsInputSchema = z.object({
  chatHistory: z.string().describe('The complete chat history as a single string.'),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  themes: z.array(z.string()).describe('A list of key themes in the conversation.'),
  sentiment: z.string().describe('Overall sentiment of the conversation (positive, negative, neutral).'),
  summary: z.string().describe('A brief summary of the conversation.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {
    schema: z.object({
      chatHistory: z.string().describe('The complete chat history as a single string.'),
    }),
  },
  output: {
    schema: z.object({
      themes: z.array(z.string()).describe('A list of key themes in the conversation.'),
      sentiment: z.string().describe('Overall sentiment of the conversation (positive, negative, neutral).'),
      summary: z.string().describe('A brief summary of the conversation.'),
    }),
  },
  prompt: `다음 채팅 기록을 분석하고 대화에 대한 통찰력을 제공하십시오. 한국어로 답변해주세요.

채팅 기록:
{{chatHistory}}

논의된 주요 테마, 표현된 전반적인 감정을 파악하고 대화에 대한 간결한 요약을 제공하십시오.

테마는 문자열 목록으로, 감정은 "긍정적", "부정적" 또는 "중립적" 중 하나로, 요약은 짧은 단락으로 출력합니다.`,
});

const generateInsightsFlow = ai.defineFlow<
  typeof GenerateInsightsInputSchema,
  typeof GenerateInsightsOutputSchema
>(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);



    