interface User {
  id: number
  name: string
  email: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)

  const loading = useState<boolean>('auth-loading', () => false)

  const fetchUser = async () => {
    loading.value = true

    try {
      // Important: forwards cookies during SSR
      const requestFetch = useRequestFetch()

      const response = await requestFetch<{
        success: boolean
        user: User
      }>('/api/auth/me')

      user.value = response.user

      return user.value
    } catch (error) {
      user.value = null

      return null
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      user.value = null

      await navigateTo('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return {
    user,
    loading,
    fetchUser,
    logout
  }
}