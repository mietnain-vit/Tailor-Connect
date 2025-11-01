import { useState, useEffect } from 'react'
import api from '@/utils/api'
import toast from 'react-hot-toast'

interface UseAxiosOptions {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete'
  data?: any
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  immediate?: boolean
}

export function useAxios<T = any>(options: UseAxiosOptions) {
  const { url, method = 'get', data, onSuccess, onError, immediate = true } = options
  const [response, setResponse] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<any>(null)

  const execute = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let result
      switch (method) {
        case 'post':
          result = await api.post(url, data)
          break
        case 'put':
          result = await api.put(url, data)
          break
        case 'delete':
          result = await api.delete(url)
          break
        default:
          result = await api.get(url)
      }
      
      setResponse(result.data)
      onSuccess?.(result.data)
      return result.data
    } catch (err: any) {
      setError(err)
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      toast.error(errorMessage)
      onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return { response, loading, error, execute, refetch: execute }
}

