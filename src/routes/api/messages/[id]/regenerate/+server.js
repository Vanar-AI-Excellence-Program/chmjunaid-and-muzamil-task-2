import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { messages, conversations } from '$lib/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST({ params, locals }) {
  try {
    const session = await locals.getSession();
    if (!session?.user?.id) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = parseInt(session.user.id);

    // Get the user message to regenerate response for
    const userMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .then(res => res[0]);

    if (!userMessage) {
      return json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify the conversation belongs to the user
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, userMessage.conversationId),
          eq(conversations.userId, userId)
        )
      )
      .then(res => res[0]);

    if (!conversation) {
      return json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Only allow regenerating responses for user messages
    if (userMessage.role !== 'user') {
      return json({ error: 'Only user messages can trigger regeneration' }, { status: 400 });
    }

    // Get the next message (AI response) to regenerate
    const aiResponse = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, userMessage.conversationId),
          eq(messages.orderIndex, userMessage.orderIndex + 1)
        )
      )
      .then(res => res[0]);

    if (!aiResponse || aiResponse.role !== 'assistant') {
      return json({ error: 'No AI response found to regenerate' }, { status: 404 });
    }

    // Get conversation history up to the user message
    const conversationHistory = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, userMessage.conversationId),
          eq(messages.orderIndex, userMessage.orderIndex)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(20);

    // Reverse to get chronological order
    conversationHistory.reverse();

    // Format conversation history for Gemini
    const chatHistory = conversationHistory
      .filter(msg => msg.role !== 'assistant' || msg.content.trim())
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Start a chat session with the conversation history
    const chat = model.startChat({
      history: chatHistory.slice(0, -1) // Exclude the current user message from history
    });

    // Generate new response
    const result = await chat.sendMessage(userMessage.content);
    const newResponse = await result.response.text();

    // Update the AI response
    await db
      .update(messages)
      .set({
        content: newResponse,
        originalContent: aiResponse.originalContent || aiResponse.content,
        editedContent: newResponse,
        isEdited: true,
        editedAt: new Date(),
        versionNumber: aiResponse.versionNumber + 1,
        updatedAt: new Date()
      })
      .where(eq(messages.id, aiResponse.id));

    // Update conversation's updatedAt timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, userMessage.conversationId));

    return json({ 
      success: true, 
      message: 'Response regenerated successfully',
      newResponse
    });

  } catch (error) {
    console.error('Error regenerating response:', error);
    return json({ error: 'Failed to regenerate response' }, { status: 500 });
  }
}
