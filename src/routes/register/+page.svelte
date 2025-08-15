<script lang="ts">
  import { goto } from '$app/navigation';
  import AuthForm from '$lib/components/auth/AuthForm.svelte';

  let loading = false;
  let error = '';

  async function handleSubmit(data: any) {
    loading = true;
    error = '';

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        // Registration successful, redirect to OTP verification
        goto(`/verify-otp?userId=${result.userId}`);
      } else {
        error = result.error || 'Registration failed';
      }
    } catch (err) {
      error = 'An error occurred during registration';
    } finally {
      loading = false;
    }
  }
</script>

<AuthForm 
  mode="register" 
  {loading} 
  {error} 
  onSubmit={handleSubmit} 
/>