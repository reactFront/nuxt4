export default defineEventHandler((event) => {
    deleteCookie(event, 'auth_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    })
  
    return {
      success: true,
      message: 'Logged out successfully'
    }
  })