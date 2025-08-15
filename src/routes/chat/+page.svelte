<script lang="ts">
  import { onMount } from 'svelte';
  
  let messages: Array<{type: 'user' | 'bot', content: string, timestamp: Date}> = [];
  let inputMessage = '';
  let isLoading = false;
  let chatContainer: HTMLElement;

  onMount(() => {
    // Add welcome message
    messages = [
      {
        type: 'bot',
        content: 'Hello! I\'m your AI assistant powered by Google Gemini. How can I help you today?',
        timestamp: new Date()
      }
    ];
  });

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

    isLoading = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const result = await response.json();

      if (result.success) {
        // Add bot response
        messages = [...messages, {
          type: 'bot',
          content: result.response,
          timestamp: new Date()
        }];
      } else {
        // Add error message
        messages = [...messages, {
          type: 'bot',
          content: `Sorry, I encountered an error: ${result.error}`,
          timestamp: new Date()
        }];
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
      // Scroll to bottom
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    messages = [
      {
        type: 'bot',
        content: 'Hello! I\'m your AI assistant powered by Google Gemini. How can I help you today?',
        timestamp: new Date()
      }
    ];
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
  <div class="max-w-4xl mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">AI Chat Assistant</h1>
      <p class="text-gray-600">Powered by Google Gemini - Your intelligent conversation partner</p>
    </div>

    <!-- Chat Container -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold">AI Assistant</h2>
              <p class="text-blue-100">Ask me anything - I'm here to help!</p>
            </div>
          </div>
          <button
            on:click={clearChat}
            class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div 
        bind:this={chatContainer}
        class="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50"
      >
        {#each messages as message}
          <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-2xl">
              <div class="rounded-xl px-6 py-4 {message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}">
                <p class="text-base leading-relaxed">{message.content}</p>
                <p class="text-sm {message.type === 'user' ? 'text-blue-100' : 'text-gray-500'} mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        {/each}
        
        {#if isLoading}
          <div class="flex justify-start">
            <div class="max-w-2xl">
              <div class="bg-white text-gray-800 border border-gray-200 rounded-xl px-6 py-4 shadow-sm">
                <div class="flex items-center space-x-3">
                  <div class="flex space-x-1">
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                  <span class="text-base text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Input -->
      <div class="p-6 border-t border-gray-200 bg-white">
        <div class="flex space-x-4">
          <input
            type="text"
            bind:value={inputMessage}
            on:keypress={handleKeyPress}
            placeholder="Type your message here..."
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            disabled={isLoading}
          />
          <button
            on:click={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            class="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center space-x-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <span>Send</span>
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>

    <!-- Features -->
    <div class="mt-8 grid md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Fast & Responsive</h3>
        <p class="text-gray-600 text-sm">Get instant AI responses powered by Google's latest Gemini model</p>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Smart & Helpful</h3>
        <p class="text-gray-600 text-sm">Ask questions, get explanations, or just have a conversation</p>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Secure & Private</h3>
        <p class="text-gray-600 text-sm">Your conversations are private and secure</p>
      </div>
    </div>
  </div>
</div>


