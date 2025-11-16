import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'

const PaymentTest = () => {
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState(null)
  
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await api.get('/payments/config')
        setConfig(response.data)
      } catch (error) {
        console.error('Config check failed:', error)
      }
    }
    checkConfig()
  }, [])

  const testPayment = async () => {
    setLoading(true)
    try {
      // Load Razorpay script
      const loadRazorpay = () => {
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

      const scriptLoaded = await loadRazorpay()
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load')
        return
      }

      // Create test order
      const orderResponse = await api.post('/payments/create-subscription-order', {
        plan: 'test',
        amount: 1
      })

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
      console.log('Razorpay Key:', razorpayKey)
      console.log('Order Response:', orderResponse.data)

      if (!razorpayKey) {
        toast.error('Razorpay key not configured')
        return
      }

      const options = {
        key: razorpayKey,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Experts15',
        description: 'Test Payment',
        order_id: orderResponse.data.orderId,
        prefill: {
          name: 'Test User',
          email: 'test@example.com'
        },
        theme: {
          color: '#6366f1'
        },
        handler: async function(response) {
          console.log('Payment Success:', response)
          try {
            // Verify the payment
            const verifyResponse = await api.post('/payments/verify-subscription', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: 'test'
            })
            toast.success('Payment successful and verified!')
            console.log('Verification response:', verifyResponse.data)
          } catch (error) {
            console.error('Verification failed:', error)
            toast.error('Payment successful but verification failed')
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment dismissed')
            toast.info('Payment cancelled')
          }
        }
      }

      console.log('Razorpay Options:', options)
      
      // Handle mock payments
      if (orderResponse.data.isMock) {
        console.log('Mock payment detected')
        toast.info('Mock payment mode - simulating payment success')
        setTimeout(async () => {
          try {
            const verifyResponse = await api.post('/payments/verify-subscription', {
              razorpay_order_id: orderResponse.data.orderId,
              razorpay_payment_id: 'mock_payment_id',
              razorpay_signature: 'mock_signature',
              plan: 'test'
            })
            toast.success('Mock payment successful!')
            console.log('Mock verification response:', verifyResponse.data)
          } catch (error) {
            console.error('Mock verification failed:', error)
            toast.error('Mock payment verification failed')
          }
        }, 1000)
        return
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment test error:', error)
      toast.error('Payment test failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Payment Gateway Test</h1>
        
        <div className="space-y-4 mb-6">
          <div className="text-sm">
            <strong>Frontend Razorpay Key:</strong> {import.meta.env.VITE_RAZORPAY_KEY_ID || 'Not configured'}
          </div>
          <div className="text-sm">
            <strong>Environment:</strong> {import.meta.env.MODE}
          </div>
          {config && (
            <>
              <div className="text-sm">
                <strong>Backend Razorpay:</strong> {config.razorpayConfigured ? '✅ Configured' : '❌ Not configured'}
              </div>
              <div className="text-sm">
                <strong>Backend Key ID:</strong> {config.keyId}
              </div>
              <div className="text-sm">
                <strong>Backend Key Secret:</strong> {config.keySecret}
              </div>
            </>
          )}
        </div>

        <button
          onClick={testPayment}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test Payment (₹1)'}
        </button>

        <div className="mt-4 text-xs text-gray-500 text-center">
          This will open Razorpay checkout with ₹1 test amount
        </div>
      </div>
    </div>
  )
}

export default PaymentTest