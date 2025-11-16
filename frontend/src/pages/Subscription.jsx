import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import PaymentModal from '../components/PaymentModal'
import api from '../services/api'

const Subscription = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 499,
      features: [
        '10 Mock Tests',
        'Advanced Analytics',
        'Rank Prediction',
        'Video Solutions',
        'Priority Support'
      ]
    },
    {
      id: 'ultimate',
      name: 'Ultimate Plan',
      price: 999,
      features: [
        'Everything in Premium',
        '1-on-1 Mentorship',
        'Custom Study Plans',
        'Live Doubt Sessions'
      ]
    }
  ]

  const handleUpgrade = useCallback(async (plan) => {
    if (!user) {
      toast.error('Please login to upgrade your plan')
      return
    }
    
    try {
      setLoading(true)
      
      const response = await api.post('/payments/create-order', {
        plan: plan.id,
        amount: plan.price
      })
      
      const paymentData = {
        orderId: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        testTitle: `${plan.name} Subscription`,
        userName: user?.name,
        userEmail: user?.email,
        plan: plan.id,
        key: response.data.key
      }
      
      setSelectedPlan({ ...plan, paymentData })
      setShowPaymentModal(true)
    } catch (error) {
      let errorMessage = 'Failed to create payment order'
      
      if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'Payment service not configured. Please contact support.'
      } else {
        errorMessage = error.response?.data?.error || error.message || errorMessage
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handlePaymentSuccess = useCallback(async (paymentResponse) => {
    try {
      const response = await api.post('/payments/verify', {
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        plan: selectedPlan.id
      })
      
      updateUser({ ...user, subscription: response.data.subscription })
      setShowPaymentModal(false)
      navigate(`/payment-success?plan=${selectedPlan.id}&amount=${selectedPlan.price}`)
    } catch (error) {
      toast.error('Payment verification failed')
    }
  }, [selectedPlan, user, updateUser, navigate])

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Unlock your potential with our premium features</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">₹{plan.price}</div>
                <div className="text-gray-600 mb-6">Per month</div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {user?.subscription?.status === 'active' && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Current Subscription</h3>
              <p className="text-green-600">
                You are currently subscribed to the {user.subscription.plan} plan.
              </p>
              <p className="text-sm text-green-600 mt-1">
                Valid until: {new Date(user.subscription.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={selectedPlan?.paymentData}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default Subscription