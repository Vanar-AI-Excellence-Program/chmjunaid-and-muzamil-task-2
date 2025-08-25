<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  export let content: string = '';
  export let isVisible: boolean = false;

  let textarea: HTMLTextAreaElement;
  let editedContent: string = '';
  let isSaving: boolean = false;

  const dispatch = createEventDispatcher();

  onMount(() => {
    editedContent = content;
  });

  $: if (isVisible && textarea) {
    // Focus and select all text when editor becomes visible
    setTimeout(() => {
      textarea.focus();
      textarea.select();
    }, 10);
  }

  function handleSave() {
    if (editedContent.trim() === content.trim()) {
      dispatch('cancel');
      return;
    }
    
    isSaving = true;
    dispatch('save', { newContent: editedContent.trim() });
  }

  function handleCancel() {
    editedContent = content;
    dispatch('cancel');
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter' && event.metaKey) {
      handleSave();
    }
  }
</script>

{#if isVisible}
  <div class="message-editor">
    <textarea
      bind:this={textarea}
      bind:value={editedContent}
      on:keydown={handleKeyDown}
      placeholder="Edit your message..."
      class="editor-textarea"
      rows="3"
      disabled={isSaving}
    ></textarea>
    
    <div class="editor-actions">
      <div class="editor-hints">
        <span class="text-xs text-gray-400">
          Press Cmd+Enter to save, Esc to cancel
        </span>
      </div>
      
      <div class="editor-buttons">
        <button
          on:click={handleCancel}
          disabled={isSaving}
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          on:click={handleSave}
          disabled={isSaving || !editedContent.trim()}
          class="btn-primary"
        >
          {#if isSaving}
            <svg class="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Saving...
          {:else}
            Save
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .message-editor {
    @apply bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-3;
  }

  .editor-textarea {
    @apply w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent;
  }

  .editor-actions {
    @apply flex items-center justify-between;
  }

  .editor-hints {
    @apply flex-1;
  }

  .editor-buttons {
    @apply flex items-center space-x-2;
  }

  .btn-primary {
    @apply px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }
</style>
