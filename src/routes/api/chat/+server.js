import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST({ request }) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return json({ 
      success: true, 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return json({ 
      error: 'Failed to generate response',
      details: error.message 
    }, { status: 500 });
  }
}
