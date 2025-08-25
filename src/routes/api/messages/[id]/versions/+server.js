import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { messages, conversations } from '$lib/schema.js';
import { eq, and, asc, desc } from 'drizzle-orm';

export async function GET({ params, locals }) {
  try {
    const session = await locals.getSession();
    if (!session?.user?.id) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = parseInt(session.user.id);

    // Get the current message
    const currentMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .then(res => res[0]);

    if (!currentMessage) {
      return json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify the conversation belongs to the user
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, currentMessage.conversationId),
          eq(conversations.userId, userId)
        )
      )
      .then(res => res[0]);

    if (!conversation) {
      return json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get previous message
    const previousMessage = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, currentMessage.conversationId),
          eq(messages.orderIndex, currentMessage.orderIndex - 1)
        )
      )
      .then(res => res[0]);

    // Get next message
    const nextMessage = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, currentMessage.conversationId),
          eq(messages.orderIndex, currentMessage.orderIndex + 1)
        )
      )
      .then(res => res[0]);

    // Get message versions (if edited)
    let versions = [];
    if (currentMessage.isEdited) {
      versions = [
        {
          version: 1,
          content: currentMessage.originalContent,
          timestamp: currentMessage.createdAt,
          isOriginal: true
        },
        {
          version: currentMessage.versionNumber,
          content: currentMessage.content,
          timestamp: currentMessage.editedAt,
          isCurrent: true
        }
      ];
    }

    return json({
      currentMessage: {
        id: currentMessage.id,
        content: currentMessage.content,
        originalContent: currentMessage.originalContent,
        role: currentMessage.role,
        orderIndex: currentMessage.orderIndex,
        isEdited: currentMessage.isEdited,
        versionNumber: currentMessage.versionNumber,
        createdAt: currentMessage.createdAt,
        editedAt: currentMessage.editedAt
      },
      navigation: {
        hasPrevious: !!previousMessage,
        hasNext: !!nextMessage,
        previousMessageId: previousMessage?.id,
        nextMessageId: nextMessage?.id
      },
      versions
    });

  } catch (error) {
    console.error('Error fetching message versions:', error);
    return json({ error: 'Failed to fetch message versions' }, { status: 500 });
  }
}
