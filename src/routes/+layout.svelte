<script>
  import { signOut } from '@auth/sveltekit/client';
  import { invalidate } from '$app/navigation';
  import Chatbot from '$lib/components/Chatbot.svelte';
  
  /** @type {import('./$types').LayoutData} */
  export let data;
  
  $: user = data.user;
  
  // Debug: Log user data to console
  $: console.log('Layout user data:', user);
  $: console.log('Layout user role:', user?.role);
  $: console.log('Layout user email:', user?.email);

  async function handleLogout() {
    try {
      await signOut({ redirect: true, callbackUrl: '/login' });
      // Invalidate auth data after logout
      await invalidate('app:auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
</script>

<nav class="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
  <div class="font-bold text-lg">
    <a href="/">AuthApp</a>
  </div>
  <div class="flex gap-4 items-center">
    <a href="/" class="hover:underline">Home</a>
    
    <!-- Temporary debug display -->
    {#if user}
      <span class="text-xs bg-yellow-500 text-black px-2 py-1 rounded">Debug: {user.role || 'no role'}</span>
    {/if}
    
         {#if user}
       {#if user.role === 'admin'}
         <a href="/admin" class="hover:underline">Admin Panel</a>
       {/if}
       <a href="/chat" class="hover:underline">AI Chat</a>
       <a href="/profile" class="hover:underline">Profile</a>
      <button 
        on:click={handleLogout}
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
      >
        Logout
      </button>
    {:else}
      <a href="/login" class="hover:underline">Login</a>
      <a href="/register" class="hover:underline">Register</a>
      <a href="/register/admin" class="hover:underline">Admin Register</a>
    {/if}
  </div>
</nav>

<slot />

<!-- AI Chatbot - Available on all pages -->
{#if user}
  <Chatbot />
{/if}
