<template>
  <div class="login-page">
    <div class="login-box">

      <h1>Login</h1>

      <form @submit.prevent="login">

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Password</label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <!-- Login button -->
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <!-- Error -->
        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

        <!-- Success -->
        <p v-if="successMessage" class="success">
          {{ successMessage }}
        </p>

      </form>

      <p class="signup-link">
        Don't have an account?
        <NuxtLink to="/signup">Create Account</NuxtLink>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">

const email = ref('')
const password = ref('')

const loading = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const login = async () => {

  loading.value = true

  errorMessage.value = ''
  successMessage.value = ''

  try {

    const response = await $fetch('/api/login', {
      method: 'POST',

      body: {
        email: email.value,
        password: password.value
      }
    })

    console.log('Login response:', response)

    successMessage.value = response.message
    await navigateTo('/dashboard')

  } catch (error: any) {

    console.error('Login error:', error)

    errorMessage.value =
      error?.data?.statusMessage ||
      'Invalid email or password'

  } finally {

    loading.value = false

  }
}

</script>

<style scoped>

.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.login-box {
  width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 7px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.error {
  margin-top: 15px;
  text-align: center;
  color: red;
}

.success {
  margin-top: 15px;
  text-align: center;
  color: green;
}

.signup-link {
  margin-top: 20px;
  text-align: center;
}

</style>