import { json } from '@sveltejs/kit';
import { generateAIResponse } from '$lib/ai.js';

export async function POST({ request, locals }) {
  try {
    const session = await locals.getSession();
    if (!session?.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const reply = await generateAIResponse(prompt);
    return json({ reply });
  } catch (e) {
    console.error('Chat API error:', e);
    return json({ error: 'Failed to generate response' }, { status: 500 });
  }
}


