<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let messageId: string;
  export let messageType: 'user' | 'bot';
  export let isEdited: boolean = false;
  export let hasPrevious: boolean = false;
  export let hasNext: boolean = false;
  export let isEditing: boolean = false;
  export let isRegenerating: boolean = false;

  const dispatch = createEventDispatcher();

  function handleEdit() {
    dispatch('edit', { messageId });
  }

  function handleRegenerate() {
    dispatch('regenerate', { messageId });
  }

  function handleNavigatePrevious() {
    dispatch('navigate', { direction: 'previous', messageId });
  }

  function handleNavigateNext() {
    dispatch('navigate', { direction: 'next', messageId });
  }
</script>

<div class="message-actions">
  <!-- Edit button for user messages -->
  {#if messageType === 'user'}
    <button
      on:click={handleEdit}
      disabled={isEditing}
      class="action-button edit-button"
      title="Edit message"
      aria-label="Edit message"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    </button>
  {/if}

  <!-- Regenerate button for user messages -->
  {#if messageType === 'user'}
    <button
      on:click={handleRegenerate}
      disabled={isRegenerating}
      class="action-button regenerate-button"
      title="Regenerate response"
      aria-label="Regenerate AI response"
    >
      {#if isRegenerating}
        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      {/if}
    </button>
  {/if}

  <!-- Navigation arrows -->
  <div class="navigation-arrows">
    <button
      on:click={handleNavigatePrevious}
      disabled={!hasPrevious}
      class="nav-button prev-button"
      title="Previous message"
      aria-label="Go to previous message"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    <button
      on:click={handleNavigateNext}
      disabled={!hasNext}
      class="nav-button next-button"
      title="Next message"
      aria-label="Go to next message"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  </div>

  <!-- Edit indicator -->
  {#if isEdited}
    <span class="edit-indicator" title="Message has been edited">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    </span>
  {/if}
</div>

<style>
  .message-actions {
    @apply flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200;
  }

  .action-button {
    @apply p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .edit-button:hover {
    @apply text-blue-400;
  }

  .regenerate-button:hover {
    @apply text-green-400;
  }

  .navigation-arrows {
    @apply flex items-center space-x-1;
  }

  .nav-button {
    @apply p-1.5 text-gray-400 hover:text-orange-400 hover:bg-gray-700 rounded transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed;
  }

  .nav-button:not(:disabled):hover {
    @apply text-orange-400;
  }

  .edit-indicator {
    @apply text-gray-500 text-xs;
  }
</style>
