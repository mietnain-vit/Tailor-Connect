import { motion } from 'framer-motion'
import { Award, Users, Heart, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  const features = [
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Premium Quality',
      description: 'We connect you with master tailors who excel in craftsmanship and attention to detail.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Verified Artisans',
      description: 'All tailors on our platform are verified professionals with proven track records.',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Passionate Craftsmanship',
      description: 'Every stitch reflects the passion and dedication of our skilled artisans.',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Perfect Fit',
      description: 'Custom measurements ensure your garments fit perfectly, every time.',
    },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient">About TailorConnect</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing the custom tailoring industry by connecting customers with skilled artisans
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl font-serif font-bold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            TailorConnect was born from a simple idea: everyone deserves access to perfectly fitted,
            custom-made clothing without the hassle of finding skilled tailors. We bridge the gap between
            talented home-grown tailors and customers seeking quality craftsmanship.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform empowers local artisans while providing customers with convenient access to expert
            tailoring services. With over 500 verified tailors and 50,000+ satisfied customers, we're
            revolutionizing the custom clothing industry one stitch at a time.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

