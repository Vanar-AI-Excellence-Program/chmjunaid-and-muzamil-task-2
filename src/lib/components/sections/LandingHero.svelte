<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  
  /** @type {import('$lib/types').User | null} */
  export let user: any = null;
</script>

<section class="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center px-6 py-16 relative overflow-hidden">
  <!-- Background Pattern -->
  <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900"></div>
  <div class="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30px_30px,rgba(255,255,255,0.1)_2px,transparent_2px)] bg-[length:60px_60px]"></div>
  
  <div class="relative z-10 text-center max-w-4xl mx-auto">
    <h1 class="text-4xl md:text-6xl font-bold text-center mb-6 text-gradient">
      Secure Authentication Made Simple
    </h1>
    <p class="text-lg md:text-xl text-center mb-8 max-w-3xl mx-auto text-gray-300 leading-relaxed">
      Modern, secure authentication system with role-based access, email verification, and OAuth integration. Built with SvelteKit and Tailwind CSS.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
      {#if user}
        <a href="/dashboard" class="btn-primary text-base px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transform hover:scale-105">
          Dashboard
        </a>
        <a href="/chat" class="btn-secondary text-base px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transform hover:scale-105">
          AI Chat
        </a>
      {:else}
        <a href="/login" class="btn-primary text-base px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transform hover:scale-105">
          Get Started
        </a>
        <Button variant="secondary" size="lg">
          View Documentation
        </Button>
      {/if}
    </div>

    <!-- Feature badges -->
    <div class="flex flex-wrap justify-center gap-3 mb-8">
      <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-800 border border-gray-700 text-green-400">
        🔐 Secure Authentication
      </span>
      <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-800 border border-gray-700 text-blue-400">
        📧 Email Verification
      </span>
      <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-800 border border-gray-700 text-purple-400">
        👥 Role-Based Access
      </span>
      <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-800 border border-gray-700 text-orange-400">
        🔗 OAuth Integration
      </span>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
      <div class="text-center card p-6">
        <div class="text-3xl font-bold text-gradient mb-2">100%</div>
        <div class="text-sm text-gray-400">Secure</div>
      </div>
      <div class="text-center card p-6">
        <div class="text-3xl font-bold text-gradient mb-2">24/7</div>
        <div class="text-sm text-gray-400">Available</div>
      </div>
      <div class="text-center card p-6">
        <div class="text-3xl font-bold text-gradient mb-2">∞</div>
        <div class="text-sm text-gray-400">Scalable</div>
      </div>
    </div>
  </div>
</section>
