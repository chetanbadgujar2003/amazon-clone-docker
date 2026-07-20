import axios from 'axios'

const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const instance = axios.create({ baseURL: base })

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default instance
