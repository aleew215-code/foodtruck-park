import Link from 'next/link'
import { Truck, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-orange-500"><Truck className="h-5 w-5" /> FoodTruck Park</Link>
          <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12 bg-white my-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: March 13, 2026</p>
        {[
          { title: '1. Information We Collect', content: 'We collect information you provide directly: name, email, phone number, food allergies, and payment information. We also collect usage data including orders placed, browsing history within the platform, and device information.' },
          { title: '2. How We Use Your Information', content: 'We use your information to process orders, send notifications, improve our service, prevent fraud, and comply with legal obligations. With your consent, we may send marketing communications.' },
          { title: '3. Information Sharing', content: 'We share your order information with food trucks to fulfill your orders. We do not sell your personal data. We may share data with service providers (Stripe for payments, Twilio for SMS, Cloudinary for images) who process data on our behalf.' },
          { title: '4. Food Allergy Data', content: 'Allergy information you provide is shared with food trucks when you place an order to help them accommodate your dietary needs. This data is stored securely and is only used for this purpose.' },
          { title: '5. Data Security', content: 'We implement industry-standard security measures including encryption, secure HTTPS connections, and hashed passwords. However, no method of transmission over the internet is 100% secure.' },
          { title: '6. Data Retention', content: 'We retain your account data for as long as your account is active. Order history is retained for 7 years for financial compliance. You may request deletion of your account at any time.' },
          { title: '7. Your Rights', content: 'You have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. Contact us at privacy@foodtruckpark.com to exercise these rights.' },
          { title: '8. Cookies', content: 'We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.' },
          { title: '9. Children\'s Privacy', content: 'Our platform is not directed at children under 13. We do not knowingly collect personal information from children under 13.' },
          { title: '10. Contact Us', content: 'For privacy inquiries: privacy@foodtruckpark.com | FoodTruck Park Inc., 123 Market Street, Suite 100.' },
        ].map(({ title, content }) => (
          <div key={title} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
