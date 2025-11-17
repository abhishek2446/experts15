import { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'

const PaymentTest = () => {
  const [loading, setLoading] = useState(false)

  const testPayment = async () => {
    setLoading(true)
    try {
      // Test payment configuration
      const configResponse = await api.get('/payments/config')
      console.log('Payment config:', configResponse.data)
      
      if (!configResponse.data.razorpayConfigured) {
        toast.error('Razorpay not configured properly')
        return
      }

      // Create test order
      const orderResponse = await api.post('/payments/create-order', {
        plan: 'premium',
        amount: 1 // ₹1 for testing
      })

      if (!orderResponse.data.success) {
        toast.error('Failed to create order')
        return
      }

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: orderResponse.data.key,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'Experts15',
          description: 'Test Payment',
          order_id: orderResponse.data.order_id,
          handler: async (response) => {
            try {
              await api.post('/payments/verify', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan: 'premium'
              })
              toast.success('Payment successful!')
            } catch (error) {
              toast.error('Payment verification failed')
            }
          },
          theme: { color: '#6366f1' }
        }
        
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
      
    } catch (error) {
      console.error('Payment test error:', error)
      toast.error(error.response?.data?.error || 'Payment test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">Test Razorpay Payment</h3>
      <button
        onClick={testPayment}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Payment (₹1)'}
      </button>
    </div>
  )
}

export default PaymentTest