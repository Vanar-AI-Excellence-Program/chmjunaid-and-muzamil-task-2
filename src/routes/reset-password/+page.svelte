<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let email = '';
  let loading = false;
  let error = '';
  let success = false;

  async function handleSubmit() {
    if (!email.trim()) {
      error = 'Please enter your email address';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        success = true;
      } else {
        error = result.error || 'Failed to send reset email';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-6 py-16">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
      {#if success}
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a password reset link to <span class="font-medium">{email}</span>
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <div class="space-y-3">
            <Button
              variant="primary"
              fullWidth={true}
              on:click={() => goto('/login')}
            >
              Back to Login
            </Button>
            <button
              on:click={() => {
                success = false;
                email = '';
              }}
              class="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Send another email
            </button>
          </div>
        </div>
      {:else}
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {#if error}
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <Input
            label="Email Address"
            type="email"
            bind:value={email}
            placeholder="Enter your email address"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            disabled={loading}
          >
            {#if loading}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {/if}
            Send Reset Link
          </Button>
        </form>

        <div class="mt-6 text-center">
          <a href="/login" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            ← Back to Login
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>