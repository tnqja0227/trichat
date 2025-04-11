// This file is machine-generated - do not edit!
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
  prompt: `Analyze the following chat history and provide insights into the conversation.

Chat History:
{{chatHistory}}

Identify the key themes discussed, the overall sentiment expressed, and provide a concise summary of the conversation.

Output the themes as a list of strings, the sentiment as one of "positive", "negative", or "neutral", and the summary as a short paragraph.`,
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

