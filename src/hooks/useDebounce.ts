import { useState, useEffect } from 'react'
import { useDebounce as useDebounceHook } from 'use-debounce'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue] = useDebounceHook(value, delay)
  return debouncedValue
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const [debouncedCallback] = useDebounceHook(callback, delay)
  return debouncedCallback as T
}

