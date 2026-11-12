import axios from 'axios'

// In development Vite forwards /api to the backend (see vite.config.ts).
export const api = axios.create({ baseURL: '/api' })
