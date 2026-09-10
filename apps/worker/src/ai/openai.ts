// ============================================
// ArogyaX — OpenAI Service integration
// ============================================

import OpenAI from 'openai';
import { getSystemPrompt } from './systemPrompt.js';
import { StructuredCaseSchema } from '@arogyax/shared/schemas';

/**
 * Get an initialized OpenAI client using the worker's environment variables.
 */
export function getOpenAIClient(apiKey: string) {
  return new OpenAI({
    apiKey,
  });
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generate the next conversational response from the AI.
 */
export async function generateChatResponse(
  client: OpenAI,
  model: string,
  language: string,
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: getSystemPrompt(language) },
    ...history,
    { role: 'user', content: newMessage },
  ];

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.3, // Keep it focused and professional
    max_tokens: 150, // Keep responses short
  });

  return response.choices[0]?.message?.content || 'I apologize, but I am unable to process that right now.';
}

/**
 * Extract a structured case record from the entire conversation history.
 * This runs in the background or at the end of the intake to generate the JSON for the doctor.
 */
export async function extractStructuredCase(
  client: OpenAI,
  model: string,
  history: ChatMessage[]
) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are an expert Ayurvedic doctor and clinical summarizer.
Your task is to analyze the following patient-AI interview transcript and extract a highly structured clinical case record.
You must adhere EXACTLY to the provided JSON schema. If information is missing, leave arrays empty or omit the field if optional, but try to fill as much as possible based on the transcript. Include a concise, professional AI summary paragraph for the doctor.`,
    },
    ...history,
  ];

  const response = await client.beta.chat.completions.parse({
    model: model || 'gpt-4o-2024-08-06', // Use a model that supports structured outputs
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'StructuredCase',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            chiefComplaint: { type: 'array', items: { type: 'string' } },
            historyOfPresentIllness: {
              type: 'object',
              properties: {
                onset: { type: ['string', 'null'] },
                duration: { type: ['string', 'null'] },
                location: { type: ['string', 'null'] },
                character: { type: ['string', 'null'] },
                severity: { type: ['string', 'null'] },
                aggravatingFactors: { type: 'array', items: { type: 'string' } },
                relievingFactors: { type: 'array', items: { type: 'string' } },
                associatedSymptoms: { type: 'array', items: { type: 'string' } },
              },
              additionalProperties: false,
              required: ['onset', 'duration', 'location', 'character', 'severity', 'aggravatingFactors', 'relievingFactors', 'associatedSymptoms']
            },
            pastMedicalHistory: { type: 'array', items: { type: 'string' } },
            pastSurgicalHistory: { type: 'array', items: { type: 'string' } },
            allergies: { type: 'array', items: { type: 'string' } },
            familyHistory: { type: 'array', items: { type: 'string' } },
            ayurveda: {
              type: 'object',
              properties: {
                trividhaPariksha: {
                  type: 'object',
                  properties: {
                    darshana: { type: ['string', 'null'] },
                    sparshana: { type: ['string', 'null'] },
                    prashna: { type: ['string', 'null'] },
                  },
                  additionalProperties: false,
                  required: ['darshana', 'sparshana', 'prashna']
                },
                ashtavidhaPariksha: {
                  type: 'object',
                  properties: {
                    nadi: { type: ['string', 'null'] },
                    mutra: { type: ['string', 'null'] },
                    mala: { type: ['string', 'null'] },
                    jihva: { type: ['string', 'null'] },
                    shabda: { type: ['string', 'null'] },
                    sparsha: { type: ['string', 'null'] },
                    drik: { type: ['string', 'null'] },
                    akriti: { type: ['string', 'null'] },
                  },
                  additionalProperties: false,
                  required: ['nadi', 'mutra', 'mala', 'jihva', 'shabda', 'sparsha', 'drik', 'akriti']
                }
              },
              additionalProperties: false,
              required: ['trividhaPariksha', 'ashtavidhaPariksha']
            },
            possibleRedFlags: { type: 'array', items: { type: 'string' } },
            missingInformation: { type: 'array', items: { type: 'string' } },
            recommendedNextQuestion: { type: ['string', 'null'] },
            aiSummary: { type: 'string', description: "A concise professional summary paragraph for the doctor." }
          },
          additionalProperties: false,
          required: [
            'chiefComplaint', 
            'historyOfPresentIllness', 
            'pastMedicalHistory', 
            'pastSurgicalHistory', 
            'allergies', 
            'familyHistory', 
            'ayurveda', 
            'possibleRedFlags', 
            'missingInformation', 
            'recommendedNextQuestion',
            'aiSummary'
          ]
        }
      }
    }
  });

  if (response.choices[0]?.message?.parsed) {
    return response.choices[0].message.parsed;
  }
  
  throw new Error("Failed to parse structured output");
}
