import { useEffect } from 'react'
import { toast } from 'react-toastify'

const PaymentModal = ({ isOpen, onClose, orderData, onSuccess }) => {
  useEffect(() => {
    if (isOpen && orderData) {
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          // Check if already loaded
          if (window.Razorpay) {
            resolve(true)
            return
          }
          
          // Remove any existing script
          const existingScript = document.querySelector('script[src*="razorpay"]')
          if (existingScript) {
            existingScript.remove()
          }
          
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => {
            console.log('Razorpay script loaded successfully')
            resolve(true)
          }
          script.onerror = () => {
            console.error('Failed to load Razorpay script')
            resolve(false)
          }
          document.body.appendChild(script)
        })
      }

      const initializePayment = async () => {
        const res = await loadRazorpay()
        if (!res) {
          toast.error('Razorpay SDK failed to load. Please check your internet connection.')
          onClose()
          return
        }

        // Check if Razorpay key is available
        const razorpayKey = orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID
        if (!razorpayKey) {
          toast.error('Payment configuration error. Please contact support.')
          console.error('Razorpay key not found')
          onClose()
          return
        }

        // Validate order data
        if (!orderData || !orderData.orderId || !orderData.amount) {
          toast.error('Invalid payment data. Please try again.')
          console.error('Missing order data:', orderData)
          onClose()
          return
        }



        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Experts15',
          description: orderData.testTitle || 'Premium Mock Test Subscription',
          image: '/logo.png',
          order_id: orderData.orderId,
          prefill: {
            name: orderData.userName || '',
            email: orderData.userEmail || ''
          },
          theme: {
            color: '#0A58FF'
          },
          handler: function(response) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
            onClose()
          },
          modal: {
            ondismiss: function() {
              onClose()
            }
          }
        }
        
        try {
          console.log('Initializing Razorpay with options:', options)
          
          if (!window.Razorpay) {
            throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.')
          }
          
          const rzp = new window.Razorpay(options)
          
          // Add error handler for Razorpay
          rzp.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error)
            window.location.href = `/payment-failed?reason=${encodeURIComponent(response.error.description)}`
          })
          
          rzp.open()
        } catch (error) {
          console.error('Payment initialization error:', error)
          toast.error(error.message || 'Failed to initiate payment. Please try again.')
          onClose()
        }
      }

      initializePayment()
    }
  }, [isOpen, orderData, onSuccess, onClose])

  return null
}

export default PaymentModal