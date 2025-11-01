import { useState, useRef, useEffect } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallback?: string
  className?: string
}

export function LazyImage({ src, alt, fallback, className, ...props }: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { ref, inView } = useIntersectionObserver({ threshold: 0.1 })

  useEffect(() => {
    if (inView && !imageSrc) {
      setImageSrc(src)
    }
  }, [inView, src, imageSrc])

  const handleError = () => {
    setHasError(true)
    if (fallback) {
      setImageSrc(fallback)
    }
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div ref={ref as unknown as (el: HTMLDivElement | null) => void} className={cn('relative overflow-hidden', className)}>
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
      {hasError && !fallback && (
        <div className="flex items-center justify-center w-full h-full bg-muted">
          <span className="text-sm text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

