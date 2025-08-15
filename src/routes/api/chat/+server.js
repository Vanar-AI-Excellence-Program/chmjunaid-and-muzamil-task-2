import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST({ request }) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a readable stream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate content with streaming
          const result = await model.generateContentStream(message);
          
          // Stream the response chunks
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              // Split into smaller chunks for smoother streaming
              const words = chunkText.split(/(\s+)/);
              
              for (const word of words) {
                if (word) {
                  // Send each word as a separate chunk for smoother streaming
                  const data = JSON.stringify({ 
                    type: 'chunk', 
                    content: word,
                    timestamp: new Date().toISOString()
                  }) + '\n';
                  
                  controller.enqueue(new TextEncoder().encode(data));
                  
                  // Small delay between chunks for smoother appearance
                  await new Promise(resolve => setTimeout(resolve, 5));
                }
              }
            }
          }
          
          // Send completion signal
          const completionData = JSON.stringify({ 
            type: 'complete',
            timestamp: new Date().toISOString()
          }) + '\n';
          
          controller.enqueue(new TextEncoder().encode(completionData));
          controller.close();
          
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({ 
            type: 'error', 
            error: 'Failed to generate response',
            details: error.message 
          }) + '\n';
          
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate response',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
