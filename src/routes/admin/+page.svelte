<script lang="ts">
  import { onMount } from 'svelte';
  
  /** @type {import('./$types').PageData} */
  export let data;
  
  $: user = data.user;
  $: users = data.users || [];
  
  let loading = true;
  let error = '';
  let searchTerm = '';
  let selectedRole = 'all';
  
  // Filter users based on search and role
  $: filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });
  
  // Calculate statistics
  $: totalUsers = users.length;
  $: adminUsers = users.filter(u => u.role === 'admin').length;
  $: regularUsers = users.filter(u => u.role === 'user').length;
  $: verifiedUsers = users.filter(u => u.emailVerified).length;
  
  onMount(async () => {
    try {
      loading = false;
    } catch (err) {
      error = 'Failed to load admin data';
      loading = false;
    }
  });
  
  async function updateUserRole(userId: string, newRole: string) {
    try {
      const response = await fetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        error = 'Failed to update user role';
      }
    } catch (err) {
      error = 'Error updating user role';
    }
  }
  
  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        error = 'Failed to delete user';
      }
    } catch (err) {
      error = 'Error deleting user';
    }
  }
</script>

{#if user?.role === 'admin'}
  <div class="min-h-screen bg-gray-900 px-6 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Admin Panel</h1>
      <p class="text-gray-400">Manage users and monitor system activity</p>
    </div>



    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-500/20 rounded-lg">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Total Users</p>
            <p class="text-2xl font-semibold text-white">{totalUsers}</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-500/20 rounded-lg">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Admins</p>
            <p class="text-2xl font-semibold text-white">{adminUsers}</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-500/20 rounded-lg">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Regular Users</p>
            <p class="text-2xl font-semibold text-white">{regularUsers}</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-500/20 rounded-lg">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Verified</p>
            <p class="text-2xl font-semibold text-white">{verifiedUsers}</p>
          </div>
        </div>
      </div>

      
    </div>

    <!-- User Management Section -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-700">
        <h2 class="text-xl font-semibold text-white">User Management</h2>
      </div>

      <!-- Filters -->
      <div class="px-6 py-4 border-b border-gray-700">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              bind:value={searchTerm}
              class="input-field"
            />
          </div>
          <div class="sm:w-48">
            <select
              bind:value={selectedRole}
              class="input-field"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            {#each filteredUsers as user}
              <tr class="hover:bg-gray-750">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">{user.name || 'No Name'}</div>
                      <div class="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role || 'user'}
                    on:change={(e) => updateUserRole(user.id, (e.target as HTMLSelectElement).value)}
                    class="px-2 py-1 text-sm border border-gray-600 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {user.emailVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}">
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    on:click={() => deleteUser(user.id)}
                    class="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if filteredUsers.length === 0}
        <div class="px-6 py-8 text-center">
          <p class="text-gray-400">No users found matching your criteria.</p>
        </div>
      {/if}
    </div>

    {#if error}
      <div class="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p class="text-red-400 text-sm">{error}</p>
      </div>
    {/if}
  </div>
{:else}
  <div class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-white mb-4">Access Denied</h1>
      <p class="text-gray-400 mb-6">This page is only available to administrators.</p>
      <a href="/" class="btn-primary">
        Go Home
      </a>
    </div>
  </div>
{/if}