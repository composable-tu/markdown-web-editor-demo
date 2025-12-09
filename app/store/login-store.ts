import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const username = ref('')

  function init() {
    const storedUsername = localStorage.getItem('username')
    const storedLoggedIn = localStorage.getItem('isLoggedIn')

    if (storedUsername && storedLoggedIn === 'true') {
      username.value = storedUsername
      isLoggedIn.value = true
    }
  }

  function login(userId: string, password: string): boolean {
    if (userId === '123456' && password === '123456') {
      isLoggedIn.value = true
      username.value = userId

      localStorage.setItem('username', userId)
      localStorage.setItem('isLoggedIn', 'true')

      return true
    }
    return false
  }

  function logout() {
    isLoggedIn.value = false
    username.value = ''

    localStorage.removeItem('username')
    localStorage.removeItem('isLoggedIn')
  }

  return {
    isLoggedIn,
    username,
    init,
    login,
    logout
  }
})
