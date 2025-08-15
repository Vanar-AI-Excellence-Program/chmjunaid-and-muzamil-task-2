<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let otp = '';
  let email = '';
  let loading = false;
  let error = '';
  let success = '';
  let countdown = 600; // 10 minutes in seconds
  let timer: NodeJS.Timeout;
  let showEmailForm = true;
  
  // Get user ID from URL params
  let userId: string;
  
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    userId = urlParams.get('userId') || '';
    const emailFromUrl = urlParams.get('email') || '';
    
    if (userId) {
      showEmailForm = false;
      startCountdown();
    } else if (emailFromUrl) {
      email = emailFromUrl;
      // Auto-submit email to get OTP
      handleEmailSubmit();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  });
  
  function startCountdown() {
    // Start countdown timer
    timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        error = 'OTP has expired. Please request a new one.';
      }
    }, 1000);
  }
  
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  async function handleEmailSubmit() {
    if (!email) {
      error = 'Please enter your email address.';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        success = 'OTP sent to your email! Please check your inbox.';
        userId = result.userId;
        showEmailForm = false;
        countdown = 600;
        startCountdown();
      } else {
        error = result.error || 'Failed to send OTP. Please try again.';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
  
  async function handleSubmit() {
    if (!otp || otp.length !== 6) {
      error = 'Please enter a valid 6-digit OTP.';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp, userId })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        success = 'Email verified successfully! You can now log in.';
        setTimeout(() => {
          goto('/login');
        }, 2000);
      } else {
        error = result.error || 'Verification failed. Please try again.';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
  
  async function resendOTP() {
    if (!userId) return;
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        success = 'New OTP sent to your email!';
        countdown = 600; // Reset countdown
        // Restart timer
        if (timer) clearInterval(timer);
        startCountdown();
      } else {
        error = result.error || 'Failed to resend OTP. Please try again.';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Verify OTP - AuthApp</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      Verify Your Email
    </h2>
    <p class="mt-2 text-center text-sm text-gray-600">
      {showEmailForm ? 'Enter your email to receive a verification OTP' : 'Enter the 6-digit OTP sent to your email'}
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {#if error}
        <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      {/if}
      
      {#if success}
        <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      {/if}
      
      {#if showEmailForm}
        <!-- Email Form -->
        <form class="space-y-6" on:submit|preventDefault={handleEmailSubmit}>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                bind:value={email}
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        </form>
      {:else}
        <!-- OTP Form -->
        <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
          <div>
            <label for="otp" class="block text-sm font-medium text-gray-700">
              OTP Code
            </label>
            <div class="mt-1">
                             <input
                 id="otp"
                 name="otp"
                 type="text"
                 maxlength="6"
                 inputmode="numeric"
                 required
                 bind:value={otp}
                 class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                 placeholder="Enter 6-digit OTP"
                 disabled={loading}
                 on:input={(e) => {
                   // Only allow numbers
                   const target = e.target as HTMLInputElement;
                   otp = target.value.replace(/\D/g, '').slice(0, 6);
                 }}
               />
            </div>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Time remaining: <span class="font-mono font-bold {countdown <= 60 ? 'text-red-600' : 'text-gray-900'}">{formatTime(countdown)}</span>
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || countdown <= 0}
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <button
            type="button"
            on:click={resendOTP}
            disabled={loading || countdown > 0}
            class="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Didn't receive OTP? Resend
          </button>
        </div>
      {/if}

      <div class="mt-6 text-center">
        <a href="/login" class="text-sm text-gray-600 hover:text-gray-500">
          Back to Login
        </a>
      </div>
    </div>
  </div>
</div>
