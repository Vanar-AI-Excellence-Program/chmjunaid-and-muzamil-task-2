<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';
  import { goto } from '$app/navigation';
  import { invalidate } from '$app/navigation';
  import AuthForm from '$lib/components/auth/AuthForm.svelte';

  let loading = false;
  let error = '';

  async function handleSubmit(data: any) {
    loading = true;
    error = '';

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        accountType: data.accountType,
        redirect: false,
        callbackUrl: '/'
      });

      if (result?.error) {
        if (result.error.includes('verify your email')) {
          // Redirect to OTP verification with email
          goto(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          return;
        }
        error = result.error;
      } else if (result?.ok) {
        // Successful login, redirect to home
        await invalidate('app:auth');
        goto('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      error = 'An error occurred during sign in';
    } finally {
      loading = false;
    }
  }
</script>

<AuthForm 
  mode="login" 
  {loading} 
  {error} 
  onSubmit={handleSubmit} 
/>