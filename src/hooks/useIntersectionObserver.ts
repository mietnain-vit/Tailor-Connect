import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const { ref, inView, entry } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    ...options,
  })

  return { ref, inView, entry }
}

export function useElementVisibility<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const elementRef = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(elementRef.current)

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [options])

  return { ref: elementRef, isVisible }
}

