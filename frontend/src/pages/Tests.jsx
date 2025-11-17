import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Tests = () => {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)
  const [filter, setFilter] = useState('all')
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fallback test data
  const fallbackTests = [
    {
      _id: 'test-1',
      title: 'JEE Mains Mock Test 1',
      description: 'Comprehensive test covering Physics, Chemistry, and Mathematics',
      examType: 'mains',
      durationMins: 180,
      totalMarks: 300,
      isPaid: false,
      price: 0,
      questionCount: 75,
      difficulty: 'Mixed'
    },
    {
      _id: 'test-2',
      title: 'JEE Advanced Practice Test',
      description: 'Advanced level questions for JEE Advanced preparation',
      examType: 'advanced',
      durationMins: 180,
      totalMarks: 300,
      isPaid: true,
      price: 299,
      questionCount: 54,
      difficulty: 'Hard'
    },
    {
      _id: 'test-3',
      title: 'Free Demo Test',
      description: 'Try our platform with this free sample test',
      examType: 'mains',
      durationMins: 60,
      totalMarks: 100,
      isPaid: false,
      price: 0,
      questionCount: 25,
      difficulty: 'Easy'
    }
  ]

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/tests')
        const testsData = Array.isArray(response.data) ? response.data : fallbackTests
        setTests(testsData)
      } catch (error) {
        console.error('Error fetching tests:', error)
        setTests(fallbackTests) // Use fallback data on error
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  const handleEnroll = async (test) => {
    if (!user) {
      toast.info('Please login to access tests')
      navigate('/login')
      return
    }

    // Handle demo test differently
    if (test.title.includes('Demo Test')) {
      try {
        const response = await api.get('/demo/test')
        toast.success('Demo test ready! Redirecting...')
        setTimeout(() => {
          navigate(`/test/${response.data.testId}/instructions`)
        }, 1000)
      } catch (error) {
        toast.error('Failed to start demo test')
      }
      return
    }

    setEnrolling(test._id)
    try {
      // Call the backend enrollment endpoint
      const response = await api.post(`/payments/tests/${test._id}/enroll`)
      
      // Check if it's a free test
      if (response.data.isFree) {
        toast.success('Enrolled successfully! Redirecting to test instructions...')
        setTimeout(() => {
          navigate(`/test/${test._id}/instructions`)
        }, 1500)
        return
      }
      
      // For paid tests, handle Razorpay payment
      if (test.isPaid && test.price > 0) {
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
          toast.error('Payment gateway failed to load. Please check your internet connection.')
          return
        }

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
        if (!razorpayKey) {
          toast.error('Payment configuration error. Please contact support.')
          return
        }

        const options = {
          key: razorpayKey,
          amount: response.data.amount,
          currency: response.data.currency || 'INR',
          name: 'Experts15',
          description: response.data.testTitle,
          order_id: response.data.orderId,
          prefill: {
            name: response.data.userName,
            email: response.data.userEmail
          },
          theme: {
            color: '#6366f1'
          },
          handler: async (paymentResponse) => {
            try {
              await api.post('/payments/verify', {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
              toast.success('🎉 Payment successful! Redirecting to test instructions...')
              setTimeout(() => {
                navigate(`/test/${test._id}/instructions`)
              }, 1500)
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.')
              console.error('Payment verification error:', error)
            }
          },
          modal: {
            ondismiss: function() {
              toast.info('Payment cancelled')
            }
          }
        }
        
        try {
          const rzp = new window.Razorpay(options)
          rzp.open()
        } catch (error) {
          toast.error('Failed to initiate payment. Please try again.')
          console.error('Payment initialization error:', error)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Enrollment failed')
    } finally {
      setEnrolling(null)
    }
  }

  const filteredTests = tests.filter(test => {
    if (filter === 'all') return true
    if (filter === 'free') return !test.isPaid
    if (filter === 'paid') return test.isPaid
    if (filter === 'mains') return test.examType === 'mains'
    if (filter === 'advanced') return test.examType === 'advanced'
    return true
  })

  return (
    <div className="min-h-screen">
      <div className="hero-bg text-white section-padding relative overflow-hidden pt-20">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-float">
            <span className="text-2xl">📝</span>
          </div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
            <span className="text-3xl">📈</span>
          </div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
            <span className="text-xl">⚙️</span>
          </div>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <div className="bg-black/30 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
            <h1 className="text-6xl md:text-7xl font-black mb-8 animate-fade-in text-shadow-strong">
              🎯 JEE Mock Tests
            </h1>
            <p className="text-2xl md:text-3xl max-w-4xl mx-auto animate-slide-up font-semibold text-shadow">
              Practice with our comprehensive collection of JEE Main & Advanced mock tests designed by IIT experts
            </p>
          </div>
        </div>
      </div>

      <div className="section-padding education-bg">
        <div className="container-custom">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {[
              { key: 'all', label: '📚 All Tests', icon: '📚' },
              { key: 'free', label: '🎆 Free Tests', icon: '🎆' },
              { key: 'paid', label: '💰 Premium Tests', icon: '💰' },
              { key: 'mains', label: '🎯 JEE Main', icon: '🎯' },
              { key: 'advanced', label: '🚀 JEE Advanced', icon: '🚀' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  filter === key
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl'
                    : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-indigo-600 shadow-xl hover:shadow-2xl'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tests...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTests.map((test) => {
                const isDemoTest = test.title.includes('Demo Test')
                return (
                <div key={test._id} className={`card p-6 hover:scale-105 transition-transform duration-300 ${
                  isDemoTest ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-emerald-50' : ''
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{test.title}</h3>
                      {isDemoTest && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          🎆 DEMO TEST - Try Now!
                        </span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.examType === 'mains' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {test.examType.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">{test.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{test.durationMins} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Marks:</span>
                      <span className="font-medium">{test.totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Questions:</span>
                      <span className="font-medium">{test.questionCount || test.totalQuestions || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Difficulty:</span>
                      <span className={`font-medium ${
                        test.difficulty === 'Easy' ? 'text-green-600' :
                        test.difficulty === 'Hard' ? 'text-red-600' : 'text-yellow-600'
                      }`}>{test.difficulty || 'Mixed'}</span>
                    </div>
                    {test.subjects && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subjects:</span>
                        <span className="font-medium text-xs">{test.subjects.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold gradient-text">
                      {test.isPaid ? `₹${test.price}` : 'FREE'}
                    </span>
                    <button
                      onClick={() => handleEnroll(test)}
                      disabled={enrolling === test._id}
                      className={`disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDemoTest 
                          ? 'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200'
                          : 'btn-primary'
                      }`}
                    >
                      {enrolling === test._id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enrolling...
                        </div>
                      ) : (
                        isDemoTest ? '🚀 Try Demo Test' : (test.isPaid ? 'Enroll Now' : 'Start Free')
                      )}
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}

          {filteredTests.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600">Try adjusting your filter or check back later for new tests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tests