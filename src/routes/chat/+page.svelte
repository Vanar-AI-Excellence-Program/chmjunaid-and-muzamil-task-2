<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import MessageRenderer from '$lib/components/MessageRenderer.svelte';
  
  let messages: Array<{type: 'user' | 'bot', content: string, timestamp: Date}> = [];
  let conversations: Array<{id: number, title: string, createdAt: Date, updatedAt: Date}> = [];
  let currentConversationId: number | null = null;
  let inputMessage = '';
  let isLoading = false;
  let isStreaming = false;
  let chatContainer: HTMLElement;
  let showSidebar = false;
  
  // Auto-scroll state management
  let shouldAutoScroll = true;
  let isUserScrolling = false;
  let scrollTimeout: NodeJS.Timeout;
  let previousMessageCount = 0;

  onMount(async () => {
    await loadConversations();
    // Add welcome message if no conversation is selected
    if (!currentConversationId) {
      messages = [
        {
          type: 'bot',
          content: `# Welcome! 🤖

I'm your **AI assistant** powered by Google Gemini. I can help you with various tasks and now support rich text rendering!

## What I can do:
- Answer questions with **formatted text**
- Create \`code snippets\`
- Generate **tables** like this:

| Feature | Status |
|---------|--------|
| Text formatting | ✅ Enabled |
| Tables | ✅ Enabled |
| Code highlighting | ✅ Enabled |
| Lists | ✅ Enabled |

> **Tip:** Try asking me to create a table or format some text!

How can I help you today?`,
          timestamp: new Date()
        }
      ];
    }
    
    // Initialize auto-scroll
    previousMessageCount = messages.length;
  });

  // Cleanup function for timeouts
  function cleanup() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  }

  onDestroy(() => {
    cleanup();
  });

  // Smart auto-scroll function
  function scrollToBottom(smooth = true) {
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }

  // Check if user is at the bottom of the chat
  function isAtBottom() {
    if (!chatContainer) return true;
    const threshold = 50; // pixels from bottom
    return chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - threshold;
  }

  // Handle scroll events
  function handleScroll() {
    if (!chatContainer) return;
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    // Set user scrolling flag
    isUserScrolling = true;
    
    // Check if user is at bottom
    const atBottom = isAtBottom();
    
    // Update auto-scroll state
    shouldAutoScroll = atBottom;
    
    // Clear user scrolling flag after a delay
    scrollTimeout = setTimeout(() => {
      isUserScrolling = false;
    }, 150);
  }

  // Auto-scroll reactive statement
  $: if (messages.length > 0 && chatContainer && shouldAutoScroll && !isUserScrolling) {
    // Only auto-scroll if new messages were added
    if (messages.length > previousMessageCount) {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom(true);
      }, 50);
    }
    previousMessageCount = messages.length;
  }

  async function loadConversations() {
    try {
      const response = await fetch('/chat/api');
      if (response.ok) {
        const data = await response.json();
        conversations = data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async function loadConversation(conversationId: number) {
    try {
      const response = await fetch(`/chat/api/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        messages = data.messages.map((msg: any) => ({
          type: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content,
          timestamp: new Date(msg.createdAt)
        }));
        currentConversationId = conversationId;
        
        // Reset auto-scroll state when loading a conversation
        shouldAutoScroll = true;
        previousMessageCount = messages.length;
        
        // Scroll to bottom after loading
        setTimeout(() => {
          scrollToBottom(false);
        }, 100);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }

  async function createNewConversation() {
    try {
      const response = await fetch('/chat/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      
      if (response.ok) {
        const data = await response.json();
        await loadConversations();
        currentConversationId = data.conversation.id;
        messages = [];
        showSidebar = false;
        
        // Reset auto-scroll state for new conversation
        shouldAutoScroll = true;
        previousMessageCount = 0;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }

  async function deleteConversation(conversationId: number) {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch('/chat/api', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
      
      if (response.ok) {
        await loadConversations();
        if (currentConversationId === conversationId) {
          currentConversationId = null;
          messages = [
            {
              type: 'bot',
              content: `# Welcome! 🤖

I'm your **AI assistant** powered by Google Gemini. I can help you with various tasks and now support rich text rendering!

## What I can do:
- Answer questions with **formatted text**
- Create \`code snippets\`
- Generate **tables** like this:

| Feature | Status |
|---------|--------|
| Text formatting | ✅ Enabled |
| Tables | ✅ Enabled |
| Code highlighting | ✅ Enabled |
| Lists | ✅ Enabled |

> **Tip:** Try asking me to create a table or format some text!

How can I help you today?`,
              timestamp: new Date()
            }
          ];
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  async function sendMessage() {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    inputMessage = '';
    
    // Add user message
    messages = [...messages, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }];
    
    // Force scroll to bottom when user sends a message
    shouldAutoScroll = true;
    setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    isLoading = true;
    isStreaming = false;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          conversationId: currentConversationId 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Add initial bot message for streaming
      const botMessageIndex = messages.length;
      messages = [...messages, {
        type: 'bot',
        content: '',
        timestamp: new Date()
      }];

      // Start streaming indicator
      isStreaming = true;

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      let accumulatedContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                
                if (data.type === 'chunk') {
                  accumulatedContent += data.content;
                  
                  // Update immediately for smooth streaming
                  messages[botMessageIndex] = {
                    ...messages[botMessageIndex],
                    content: accumulatedContent
                  };
                  messages = [...messages]; // Trigger reactivity
                  
                  // Auto-scroll during streaming if user is at bottom
                  if (shouldAutoScroll && !isUserScrolling) {
                    setTimeout(() => {
                      scrollToBottom(false); // Use instant scroll for streaming
                    }, 10);
                  }
                  
                  // Small delay to make streaming visible
                  await new Promise(resolve => setTimeout(resolve, 10));
                } else if (data.type === 'complete') {
                  // Update conversation ID if this is a new conversation
                  if (data.conversationId && !currentConversationId) {
                    currentConversationId = data.conversationId;
                    await loadConversations();
                  }
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Streaming error');
                }
              } catch (parseError) {
                console.error('Error parsing stream data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Ensure final content is set
      if (accumulatedContent) {
        messages[botMessageIndex] = {
          ...messages[botMessageIndex],
          content: accumulatedContent
        };
        messages = [...messages];
      }

    } catch (error) {
      console.error('Chat error:', error);
      messages = [...messages, {
        type: 'bot',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date()
      }];
    } finally {
      isLoading = false;
      isStreaming = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    currentConversationId = null;
    messages = [
      {
        type: 'bot',
        content: `# Welcome! 🤖

I'm your **AI assistant** powered by Google Gemini. I can help you with various tasks and now support rich text rendering!

## What I can do:
- Answer questions with **formatted text**
- Create \`code snippets\`
- Generate **tables** like this:

| Feature | Status |
|---------|--------|
| Text formatting | ✅ Enabled |
| Tables | ✅ Enabled |
| Code highlighting | ✅ Enabled |
| Lists | ✅ Enabled |

> **Tip:** Try asking me to create a table or format some text!

How can I help you today?`,
        timestamp: new Date()
      }
    ];
    
    // Reset auto-scroll state when clearing chat
    shouldAutoScroll = true;
    previousMessageCount = messages.length;
    
    // Scroll to bottom after clearing
    setTimeout(() => {
      scrollToBottom(false);
    }, 100);
  }
</script>

<!-- Professional Dark Chat Interface -->
<div class="h-screen bg-gray-900 flex">
  <!-- Sidebar -->
  <div class="w-80 sidebar flex flex-col">
    <!-- Sidebar Header -->
    <div class="p-6 border-b border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">Conversations</h2>
        <button
          on:click={createNewConversation}
          class="p-2 text-orange-400 hover:bg-gray-800 rounded-lg transition-colors"
          title="New Chat"
          aria-label="Create new conversation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto p-4">
      {#if conversations.length === 0}
        <div class="text-center py-8 text-gray-400">
          <p>No conversations yet</p>
          <p class="text-sm mt-2">Start a new chat to begin!</p>
        </div>
      {:else}
        {#each conversations as conversation}
          <div class="p-4 rounded-lg transition-all duration-200 mb-2 {currentConversationId === conversation.id ? 'bg-gray-800 border border-orange-500/30' : 'hover:bg-gray-800'}">
            <div class="flex items-center justify-between">
              <button
                class="flex-1 min-w-0 text-left"
                on:click={() => loadConversation(conversation.id)}
                aria-label="Load conversation: {conversation.title}"
              >
                <h3 class="text-sm font-medium text-white truncate">
                  {conversation.title}
                </h3>
                <p class="text-xs text-gray-400 mt-1">
                  {conversation.updatedAt.toLocaleDateString()}
                </p>
              </button>
              <button
                on:click={() => deleteConversation(conversation.id)}
                class="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors ml-2"
                title="Delete conversation"
                aria-label="Delete conversation: {conversation.title}"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Main Chat Area -->
  <div class="flex-1 flex flex-col bg-gray-900">
    <!-- Chat Header -->
    <div class="bg-gray-800 border-b border-gray-700 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">AI Assistant</h2>
            <p class="text-gray-400">Ask me anything - I'm here to help!</p>
          </div>
        </div>
        <button
          on:click={clearChat}
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          <span>Clear Chat</span>
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div 
      bind:this={chatContainer}
      on:scroll={handleScroll}
      class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900"
    >
      {#each messages as message}
        <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="max-w-3xl">
            <div class="rounded-2xl px-6 py-4 {message.type === 'user' ? 'message-user' : 'message-bot'}">
              {#if message.type === 'user'}
                <p class="text-base leading-relaxed">
                  {message.content}
                </p>
              {:else}
                <MessageRenderer 
                  content={message.content} 
                  isStreaming={isStreaming && message === messages[messages.length - 1]}
                />
              {/if}
              <p class="text-sm {message.type === 'user' ? 'text-orange-100' : 'text-gray-400'} mt-3">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      {/each}
      
      {#if isLoading && !isStreaming}
        <div class="flex justify-start">
          <div class="max-w-3xl">
            <div class="message-bot px-6 py-4">
              <div class="flex items-center space-x-3">
                <div class="loading-dots">
                  <div class="loading-dot"></div>
                  <div class="loading-dot"></div>
                  <div class="loading-dot"></div>
                </div>
                <span class="text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Fixed Input Box -->
    <div class="p-6 border-t border-gray-700 bg-gray-800">
      <div class="flex space-x-4">
        <input
          type="text"
          bind:value={inputMessage}
          on:keypress={handleKeyPress}
          placeholder="Type your message here..."
          class="input-field flex-1 text-lg"
          disabled={isLoading}
        />
        <button
          on:click={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          class="btn-primary px-8 py-3 text-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          <span>Send</span>
        </button>
      </div>
      <p class="text-sm text-gray-400 mt-3 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  </div>
</div>


