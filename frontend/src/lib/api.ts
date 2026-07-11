import axios from 'axios'

/**
 * The single shared Axios instance for the HRFlow API.
 * Every service module imports this — never raw axios — so the base URL,
 * headers, and the auth token interceptor apply to every request.
 */

const TOKEN_KEY = 'hrflow_token'

/** Token persistence — one place in the whole app touches localStorage. */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json', // makes Laravel return JSON errors, not HTML
  },
})

// Attach the Bearer token to every outgoing request (if logged in).
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global 401 handler: a dead/revoked token means the session is over —
// clear it and send the user to the login page. Failed *login attempts*
// are excluded so the login form can show its own error message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginAttempt = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginAttempt) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
