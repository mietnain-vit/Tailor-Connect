import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export function SEO({
  title = 'TailorConnect - Premium Custom Tailoring Platform',
  description = 'Connect with skilled tailors for bespoke clothing. Custom measurements, real-time tracking, and premium quality garments.',
  keywords = 'tailoring, custom clothing, bespoke, tailor, fashion, custom fit',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
}: SEOProps) {
  const fullTitle = title.includes('TailorConnect') ? title : `${title} | TailorConnect`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#FFD700" />
      <link rel="canonical" href={url} />
    </Helmet>
  )
}

