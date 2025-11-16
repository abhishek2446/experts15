import { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'

const RazorpayCheckout = ({ plan, amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    try {
      setLoading(true)

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load')
        return
      }

      // Create order
      const orderResponse = await api.post('/payments/create-order', {
        plan,
        amount
      })

      const { success, key, amount: orderAmount, currency, order_id } = orderResponse.data

      if (!success) {
        throw new Error('Failed to create order')
      }

      // Razorpay checkout options
      const options = {
        key: key,
        amount: orderAmount,
        currency: currency,
        name: 'Experts15',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
        image: '/logo.png',
        order_id: order_id,
        prefill: {
          name: 'Student',
          email: 'student@example.com'
        },
        theme: {
          color: '#0A58FF'
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan: plan
            })

            if (verifyResponse.data.message) {
              toast.success('🎉 Payment successful!')
              onSuccess && onSuccess(verifyResponse.data)
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            toast.error('Payment verification failed')
            onError && onError(error)
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled')
            onError && onError(new Error('Payment cancelled'))
          }
        }
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.error || 'Payment failed')
      onError && onError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  )
}

export default RazorpayCheckout