import { generateAIResponseStream } from '$lib/ai.js';

export async function POST({ request, locals }) {
  try {
    const session = await locals.getSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a readable stream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Use streaming AI response
          const stream = generateAIResponseStream(prompt);
          
          // Stream each chunk
          for await (const chunk of stream) {
            if (chunk) {
              // Split into smaller chunks for smoother streaming
              const words = chunk.split(/(\s+)/);
              
              for (const word of words) {
                if (word) {
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

  } catch (e) {
    console.error('Chat API error:', e);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


