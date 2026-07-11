import axios from 'axios'

/**
 * The single shared Axios instance for the HRFlow API.
 * Every service module imports this — never raw axios — so the base URL,
 * headers, and (from Feature 1 onward) the auth token interceptor apply
 * to every request in the app.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json', // makes Laravel return JSON errors, not HTML
  },
})

export default api
