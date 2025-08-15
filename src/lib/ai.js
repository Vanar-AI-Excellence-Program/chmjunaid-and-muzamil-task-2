import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { env } from '$env/dynamic/private';

export async function generateAIResponse(prompt) {
  const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key');
  }
  const google = createGoogleGenerativeAI({ apiKey });
  const { text } = await generateText({
    model: google('gemini-1.5-flash'),
    prompt
  });
  return text;
}

export async function* generateAIResponseStream(prompt) {
  const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key');
  }
  const google = createGoogleGenerativeAI({ apiKey });
  const stream = await streamText({
    model: google('gemini-1.5-flash'),
    prompt
  });
  
  for await (const chunk of stream.textStream) {
    yield chunk;
  }
}


