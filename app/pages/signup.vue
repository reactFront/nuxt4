<template>
  <div class="signup-page">
    <div class="signup-box">
      <h1>Create Account</h1>

      <form @submit.prevent="signup">

        <!-- Name -->
        <div class="form-group">
          <label>Name</label>

          <input
            v-model="name"
            type="text"
            placeholder="Enter your name"
            required
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label>Email</label>

          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label>Password</label>

          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
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

      <p class="login-link">
        Already have an account?
        <NuxtLink to="/login">Login</NuxtLink>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">

const name = ref('')
const email = ref('')
const password = ref('')

const loading = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const signup = async () => {

  loading.value = true

  errorMessage.value = ''
  successMessage.value = ''

  try {

    const response = await $fetch('/api/signup', {
      method: 'POST',

      body: {
        name: name.value,
        email: email.value,
        password: password.value
      }
    })

    successMessage.value = response.message

    // Clear form
    name.value = ''
    email.value = ''
    password.value = ''

  } catch (error: any) {

    errorMessage.value =
      error?.data?.statusMessage ||
      'Signup failed'

  } finally {

    loading.value = false

  }
}

</script>

<style scoped>

.signup-page {
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background: #f5f5f5;
}

.signup-box {
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

.login-link {
  margin-top: 20px;

  text-align: center;
}

</style>