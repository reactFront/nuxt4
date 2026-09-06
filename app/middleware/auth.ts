export default defineNuxtRouteMiddleware(async () => {
    const { user, fetchUser } = useAuth()
  
    // 1. User is not loaded yet
    if (!user.value) {
      // 2. Ask backend to verify JWT
      await fetchUser()
    }
  
    // 3. JWT invalid / expired / not present
    if (!user.value) {
      return navigateTo('/login')
    }
  
    // 4. User is authenticated
    // Do nothing, Nuxt allows the page to open
  })