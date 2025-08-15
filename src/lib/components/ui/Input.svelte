<script lang="ts">
  import { onMount } from 'svelte';
  
  export let type: string = 'text';
  export let value: string = '';
  export let placeholder: string = '';
  export let label: string = '';
  export let error: string = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let id: string = '';
  
  let inputId: string;
  
  onMount(() => {
    // Generate unique ID if none provided
    if (!id) {
      inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      inputId = id;
    }
  });
  
  const baseClasses = 'block w-full rounded-lg border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 px-3 py-2';
  const normalClasses = 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400';
  const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500';
  
  $: inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses}`;
</script>

<div class="space-y-1">
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <input
    id={inputId}
    {type}
    {placeholder}
    bind:value
    {required}
    {disabled}
    class={inputClasses}
    on:input
    on:blur
  />
  
  {#if error}
    <p class="text-sm text-red-600 dark:text-red-400" id={`${inputId}-error`} role="alert">
      {error}
    </p>
  {/if}
</div>
