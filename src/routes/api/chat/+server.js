import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '$lib/db.js';
import { conversations, messages } from '$lib/schema.js';
import { eq, and, asc, desc } from 'drizzle-orm';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST({ request, locals }) {
  try {
    const session = await locals.getSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { message, conversationId } = await request.json();
    
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

    const userId = session.user.id;
    let currentConversationId = conversationId;

    // If no conversation ID provided, create a new conversation
    if (!currentConversationId) {
      const [newConversation] = await db
        .insert(conversations)
        .values({
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        })
        .returning();
      
      currentConversationId = newConversation.id;
    } else {
      // Verify the conversation belongs to the user
      const conversation = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, currentConversationId),
            eq(conversations.userId, userId)
          )
        )
        .then(res => res[0]);

      if (!conversation) {
        return new Response(JSON.stringify({ error: 'Conversation not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Save user message to database
    await db
      .insert(messages)
      .values({
        conversationId: currentConversationId,
        content: message,
        role: 'user'
      });

    // Update conversation's updatedAt timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, currentConversationId));

    // Get conversation history (limit to last 20 messages to prevent token overflow)
    const conversationHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, currentConversationId))
      .orderBy(desc(messages.createdAt))
      .limit(20);

    // Reverse to get chronological order (oldest first)
    conversationHistory.reverse();

    // Format conversation history for Gemini
    const chatHistory = conversationHistory
      .filter(msg => msg.role !== 'assistant' || msg.content.trim()) // Filter out empty assistant messages
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a readable stream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Start a chat session with the conversation history
          const chat = model.startChat({
            history: chatHistory.slice(0, -1) // Exclude the current user message from history
          });

          // Generate content with streaming using the current message
          const result = await chat.sendMessageStream(message);
          
          let fullResponse = '';
          
          // Stream the response chunks
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullResponse += chunkText;
              
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
          
          // Save AI response to database
          if (fullResponse) {
            await db
              .insert(messages)
              .values({
                conversationId: currentConversationId,
                content: fullResponse,
                role: 'assistant'
              });
          }
          
          // Send completion signal
          const completionData = JSON.stringify({ 
            type: 'complete',
            conversationId: currentConversationId,
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
