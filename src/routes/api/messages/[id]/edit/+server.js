import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { messages, conversations } from '$lib/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function PUT({ params, request, locals }) {
  try {
    const session = await locals.getSession();
    if (!session?.user?.id) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { newContent } = await request.json();
    const userId = parseInt(session.user.id);

    if (!newContent) {
      return json({ error: 'New content is required' }, { status: 400 });
    }

    // Get the message to edit
    const message = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .then(res => res[0]);

    if (!message) {
      return json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify the conversation belongs to the user
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, message.conversationId),
          eq(conversations.userId, userId)
        )
      )
      .then(res => res[0]);

    if (!conversation) {
      return json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Only allow editing user messages
    if (message.role !== 'user') {
      return json({ error: 'Only user messages can be edited' }, { status: 400 });
    }

    // Store original content if this is the first edit
    const originalContent = message.originalContent || message.content;

    // Update the message
    await db
      .update(messages)
      .set({
        content: newContent,
        originalContent: originalContent,
        editedContent: newContent,
        isEdited: true,
        editedAt: new Date(),
        versionNumber: message.versionNumber + 1,
        updatedAt: new Date()
      })
      .where(eq(messages.id, id));

    // Get the next message (AI response) to regenerate
    const nextMessage = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, message.conversationId),
          eq(messages.orderIndex, message.orderIndex + 1)
        )
      )
      .then(res => res[0]);

    if (nextMessage && nextMessage.role === 'assistant') {
      // Get conversation history up to the edited message
      const conversationHistory = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, message.conversationId),
            eq(messages.orderIndex, message.orderIndex)
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
      const result = await chat.sendMessage(newContent);
      const newResponse = await result.response.text();

      // Update the AI response
      await db
        .update(messages)
        .set({
          content: newResponse,
          originalContent: nextMessage.originalContent || nextMessage.content,
          editedContent: newResponse,
          isEdited: true,
          editedAt: new Date(),
          versionNumber: nextMessage.versionNumber + 1,
          updatedAt: new Date()
        })
        .where(eq(messages.id, nextMessage.id));
    }

    // Update conversation's updatedAt timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return json({ 
      success: true, 
      message: 'Message edited and response regenerated successfully' 
    });

  } catch (error) {
    console.error('Error editing message:', error);
    return json({ error: 'Failed to edit message' }, { status: 500 });
  }
}
