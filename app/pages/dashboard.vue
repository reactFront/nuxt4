<script setup lang="ts">

definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()

</script>

<template>
  <div class="dashboard">

    <h1>Dashboard</h1>

    <div v-if="user">
      <h2>Welcome, {{ user.name }}</h2>

      <p>
        Email: {{ user.email }}
      </p>

      <p>
        User ID: {{ user.id }}
      </p>

      <button @click="logout">
        Logout
      </button>
    </div>

    <div v-else>
      Loading...
    </div>

  </div>
</template>