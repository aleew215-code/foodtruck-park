import Link from 'next/link'
import { Truck, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-orange-500"><Truck className="h-5 w-5" /> FoodTruck Park</Link>
          <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12 bg-white my-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-gray-500 mb-8">Last updated: March 13, 2026</p>
        {[
          { title: '1. Acceptance of Terms', content: 'By accessing and using FoodTruck Park, you accept and agree to be bound by these Terms. If you do not agree, please do not use our platform.' },
          { title: '2. Service Description', content: 'FoodTruck Park is a food ordering marketplace connecting customers with food trucks at shared physical locations. The platform facilitates orders only within food truck parks or markets — no home delivery is offered.' },
          { title: '3. User Accounts', content: 'You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activities under your account. You must notify us immediately of any unauthorized use.' },
          { title: '4. Orders and Payments', content: 'All orders are processed through our secure payment system powered by Stripe. By placing an order, you agree to pay the full amount shown at checkout. Orders are non-refundable once accepted by the food truck, except as required by law.' },
          { title: '5. Commission and Fees', content: 'The platform charges food trucks a 2.4% commission per transaction. Food trucks also agree to a $170 one-time installation fee and $60 monthly maintenance fee. These fees are agreed to separately and are not visible to customers.' },
          { title: '6. Food Safety and Allergies', content: 'Customers may specify food allergies in their profile. While we display this information to food trucks, we cannot guarantee allergen-free preparation. Customers with severe allergies should contact food trucks directly before ordering.' },
          { title: '7. Prohibited Activities', content: 'Users may not use the platform for fraudulent transactions, harassment, abuse, or any illegal activities. Violations may result in immediate account termination.' },
          { title: '8. Limitation of Liability', content: 'FoodTruck Park is not responsible for food quality, preparation, or any personal injury resulting from consuming food ordered through the platform. Our liability is limited to the amount paid for the relevant order.' },
          { title: '9. Privacy', content: 'Your use of the platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference.' },
          { title: '10. Changes to Terms', content: 'We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.' },
          { title: '11. Contact', content: 'For questions about these Terms, contact us at legal@foodtruckpark.com' },
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
