<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let loading = false;
  let error = '';
  let formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecretKey: ''
  };

  async function handleSubmit() {
    if (formData.password !== formData.confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    loading = true;
    error = '';

    try {
      const res = await fetch('/register/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminSecretKey: formData.adminSecretKey
        })
      });

      const result = await res.json();

      if (res.ok) {
        // Registration successful, redirect to OTP verification
        goto(`/verify-otp?userId=${result.userId}`);
      } else {
        error = result.error || 'Admin registration failed';
      }
    } catch (err) {
      error = 'An error occurred during admin registration';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-6 py-16">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Registration
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Create an admin account with secret key verification
        </p>
      </div>

      {#if error}
        <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <Input
          label="Full Name"
          type="text"
          bind:value={formData.name}
          required
        />

        <Input
          label="Email"
          type="email"
          bind:value={formData.email}
          required
        />

        <Input
          label="Password"
          type="password"
          bind:value={formData.password}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          bind:value={formData.confirmPassword}
          required
        />

        <Input
          label="Admin Secret Key"
          type="password"
          bind:value={formData.adminSecretKey}
          placeholder="Enter the admin secret key"
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
          Create Admin Account
        </Button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <a 
            href="/login" 
            class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 ml-1"
          >
            Sign in
          </a>
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Want to register as a regular user?
          <a 
            href="/register" 
            class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 ml-1"
          >
            User Registration
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
