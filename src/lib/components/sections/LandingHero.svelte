<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
</script>

<section class="min-h-screen bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white flex flex-col justify-center items-center px-6 py-16">
  <div class="text-center max-w-4xl mx-auto">
    <h1 class="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      Secure Authentication Made Simple
    </h1>
    <p class="text-lg md:text-xl text-center mb-8 max-w-3xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
      Modern, secure authentication system with role-based access, email verification, and OAuth integration. Built with SvelteKit and Tailwind CSS.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
      <Button variant="primary" size="lg">
        Get Started
      </Button>
      <Button variant="secondary" size="lg">
        View Documentation
      </Button>
    </div>

    <!-- Feature badges -->
    <div class="flex flex-wrap justify-center gap-3 mb-8">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        🔐 Secure Authentication
      </span>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        📧 Email Verification
      </span>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
        👥 Role-Based Access
      </span>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
        🔗 OAuth Integration
      </span>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
      <div class="text-center">
        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">100%</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Secure</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">24/7</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Available</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">∞</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Scalable</div>
      </div>
    </div>
  </div>
</section>
