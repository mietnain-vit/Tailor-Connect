import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'How do I place an order?',
    answer:
      'Simply browse our tailor directory, select a tailor that matches your needs, and click "Create Order". Fill out the order form with your measurements and requirements, then submit.',
  },
  {
    question: 'What is the typical delivery time?',
    answer:
      'Delivery time varies based on the complexity of your order. Standard orders typically take 7-14 days, while custom wedding attire may take 3-4 weeks.',
  },
  {
    question: 'Can I track my order?',
    answer:
      'Yes! Once your order is placed, you can track its progress in real-time through your dashboard. You\'ll receive updates at each stage of the tailoring process.',
  },
  {
    question: 'What if I need alterations?',
    answer:
      'We offer free alterations within 30 days of delivery. Simply contact your tailor through our messaging system to schedule alterations.',
  },
  {
    question: 'How are tailors verified?',
    answer:
      'All tailors on our platform undergo a thorough verification process including background checks, portfolio review, and customer feedback analysis.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit/debit cards, UPI, net banking, and digital wallets. Payments are securely processed and held in escrow until order completion.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-muted-foreground transition-transform',
                        openIndex === index && 'transform rotate-180'
                      )}
                    />
                  </button>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

