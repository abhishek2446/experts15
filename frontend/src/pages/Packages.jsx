import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Packages = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages')
      setPackages(response.data)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (packageId, price) => {
    if (!user) {
      toast.info('Please login to subscribe')
      navigate('/login')
      return
    }

    setSubscribing(packageId)
    try {
      if (price === 0) {
        // Free package
        await api.post(`/packages/${packageId}/subscribe`)
        toast.success('Successfully subscribed to free package!')
        navigate('/dashboard')
      } else {
        // Paid package - integrate with Razorpay
        const response = await api.post(`/packages/${packageId}/subscribe`)
        
        // Load Razorpay
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
          toast.error('Payment gateway failed to load')
          return
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: price * 100,
          currency: 'INR',
          name: 'Experts15',
          description: 'Package Subscription',
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#6366f1'
          },
          handler: async (paymentResponse) => {
            try {
              await api.post('/payments/verify-subscription', {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                packageId: packageId
              })
              toast.success('🎉 Subscription successful!')
              navigate('/dashboard')
            } catch (error) {
              toast.error('Payment verification failed')
            }
          }
        }
        
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Subscription failed')
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Success Plan</span> 🚀
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your JEE potential with our comprehensive study packages designed by IIT experts
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => (
            <div 
              key={pkg._id} 
              className={`relative bg-white rounded-3xl shadow-2xl border-2 transition-all duration-300 hover:scale-105 ${
                pkg.type === 'premium' 
                  ? 'border-indigo-500 transform scale-105' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {pkg.type === 'premium' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🌟 MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-black text-gray-900">₹{pkg.price}</span>
                    <span className="text-gray-600">/{pkg.duration} days</span>
                  </div>
                  
                  {pkg.price > 0 && (
                    <div className="text-sm text-gray-500 mb-4">
                      ≈ ₹{Math.round(pkg.price / (pkg.duration / 30))} per month
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Mock Tests Count */}
                {pkg.mockTests && pkg.mockTests.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-semibold">Mock Tests Included</span>
                      <span className="text-blue-900 font-bold text-xl">{pkg.mockTests.length}</span>
                    </div>
                  </div>
                )}

                {/* Daily Tasks Count */}
                {pkg.dailyTasks && pkg.dailyTasks.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-semibold">Daily Tasks</span>
                      <span className="text-green-900 font-bold text-xl">{pkg.dailyTasks.length}</span>
                    </div>
                  </div>
                )}

                {/* Quizzes Count */}
                {pkg.quizzes && pkg.quizzes.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 font-semibold">Practice Quizzes</span>
                      <span className="text-purple-900 font-bold text-xl">{pkg.quizzes.length}</span>
                    </div>
                  </div>
                )}

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(pkg._id, pkg.price)}
                  disabled={subscribing === pkg._id}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                    pkg.type === 'premium'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : pkg.price === 0
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 hover:bg-black text-white shadow-lg hover:shadow-xl'
                  } ${subscribing === pkg._id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {subscribing === pkg._id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      {pkg.price === 0 ? '🎆 Start Free' : '💎 Subscribe Now'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions 🤔
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I upgrade my plan later?</h3>
              <p className="text-gray-600">Yes! You can upgrade to a higher plan anytime. The remaining days from your current plan will be adjusted.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are the mock tests updated regularly?</h3>
              <p className="text-gray-600">Absolutely! Our expert team regularly updates tests based on the latest JEE patterns and trends.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens after my subscription expires?</h3>
              <p className="text-gray-600">You'll retain access to your progress data, but premium features will be locked until you renew.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600">We offer a 7-day money-back guarantee if you're not satisfied with our premium features.</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            What Our Students Say 💬
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">"The daily tasks kept me consistent. Improved my rank by 5000 positions!"</p>
              <div className="font-semibold text-gray-900">- Rahul S., JEE 2024</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">"Mock tests are exactly like the real JEE. Premium plan is totally worth it!"</p>
              <div className="font-semibold text-gray-900">- Priya M., JEE 2024</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">"Progress tracking helped me identify weak areas. Cracked JEE Advanced!"</p>
              <div className="font-semibold text-gray-900">- Arjun K., IIT Delhi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Packages