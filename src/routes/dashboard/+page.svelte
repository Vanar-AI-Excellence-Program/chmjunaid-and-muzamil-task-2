<script lang="ts">
  /** @type {import('./$types').PageData} */
  export let data;
  
  $: user = data.user;
</script>

{#if user && user.role === 'admin'}
  <div class="px-6 py-8 lg:px-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-1">Admin Dashboard</h1>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Welcome back, <span class="font-semibold text-red-600 dark:text-red-400">{user.name}</span>! You have admin privileges.
    </p>

    <!-- Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Account Status</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Email Verified:
          <span class="font-medium text-green-600 dark:text-green-400">{user.emailVerified ? 'Yes' : 'No'}</span>
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Role:
          <span class="font-medium">{user.role}</span>
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Profile</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Name: {user.name}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Email: {user.email}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Security</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Auth Method: Email/Password</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Last Sign In: {user.lastSignIn || 'Recently'}</p>
      </div>
    </div>

    <!-- Admin Quick Actions -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-10">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Admin Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/admin" class="block text-center py-3 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Admin Panel
        </a>
        <a href="/admin/users" class="block text-center py-3 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Manage Users
        </a>
        <a href="/profile/edit" class="block text-center py-3 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Edit Profile
        </a>
        <a href="/settings/security" class="block text-center py-3 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Security Settings
        </a>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h2>
      <ul class="space-y-3 text-sm">
        <li class="flex justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span>Account created</span>
          <span class="text-gray-500 dark:text-gray-400">Today at 10:30 AM</span>
        </li>
        <li class="flex justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span>Signed in successfully</span>
          <span class="text-gray-500 dark:text-gray-400">Today at 10:25 AM</span>
        </li>
        <li class="flex justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span>Email verified</span>
          <span class="text-gray-500 dark:text-gray-400">Today at 10:20 AM</span>
        </li>
      </ul>
    </div>
  </div>
{:else if user && user.role !== 'admin'}
  <div class="px-6 py-8 lg:px-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">Your Dashboard</h1>
    <p class="text-gray-600 dark:text-gray-400 mb-8">Welcome back, <span class="font-semibold">{user.name}</span>!</p>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <p class="text-gray-700 dark:text-gray-300">This is your user dashboard.</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Not Logged In</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6">Please sign in to access your dashboard.</p>
      <a href="/login" class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
        Sign In
      </a>
    </div>
  </div>
{/if}
