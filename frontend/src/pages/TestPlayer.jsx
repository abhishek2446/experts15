import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import PaymentModal from '../components/PaymentModal'

const TestPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [questionTimeLog, setQuestionTimeLog] = useState({})

  useEffect(() => {
    fetchTestDetails()
  }, [id])

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isStarted, timeLeft])

  const fetchTestDetails = async () => {
    try {
      const response = await api.get(`/tests/${id}`)
      setTest(response.data)
      
      if (!response.data.isEnrolled) {
        if (response.data.isPaid) {
          // Show payment modal for paid tests
          return
        } else {
          // Auto-enroll for free tests
          await enrollInTest()
        }
      }
    } catch (error) {
      toast.error('Error loading test')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const enrollInTest = async () => {
    try {
      const response = await api.post(`/tests/${id}/enroll`)
      if (response.data.isFree) {
        fetchTestDetails() // Refresh test data
      } else {
        // Add Razorpay key to payment data
        const paymentDataWithKey = {
          ...response.data,
          razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxx'
        }
        setPaymentData(paymentDataWithKey)
        setShowPayment(true)
      }
    } catch (error) {
      toast.error('Error enrolling in test')
      console.error('Enrollment error:', error)
    }
  }

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      await api.post('/payments/verify', paymentResponse)
      toast.success('Payment successful! You are now enrolled.')
      fetchTestDetails()
    } catch (error) {
      toast.error('Payment verification failed')
    }
  }

  const startTest = async () => {
    try {
      const response = await api.post(`/tests/${id}/start`)
      setQuestions(response.data.questions)
      setTimeLeft(test.durationMins * 60)
      setIsStarted(true)
      setQuestionStartTime(Date.now())
      toast.success('Test started! Good luck!')
    } catch (error) {
      toast.error('Error starting test')
    }
  }

  const handleAnswerSelect = (questionId, optionIndex) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const handleSubmit = async () => {
    try {
      // Calculate total time taken
      const totalTimeSpent = (test.durationMins * 60) - timeLeft
      
      const formattedResponses = Object.entries(responses).map(([questionId, chosen]) => ({
        questionId,
        chosen
      }))

      const response = await api.post(`/tests/${id}/submit`, {
        responses: formattedResponses,
        timeSpent: totalTimeSpent
      })

      toast.success(`Test submitted! Score: ${response.data.score}`)
      navigate(`/test/${id}/review`)
    } catch (error) {
      toast.error('Error submitting test')
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!test?.isEnrolled && test?.isPaid) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{test?.title}</h1>
            <p className="text-gray-600 mb-6">{test?.description}</p>
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">₹{test?.price}</div>
              <p className="text-gray-600">One-time payment for lifetime access</p>
            </div>

            <button
              onClick={enrollInTest}
              className="btn-primary text-lg px-8 py-3"
            >
              Enroll Now
            </button>
          </div>
        </div>
        
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          orderData={paymentData}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{test?.title}</h1>
            <p className="text-gray-600 mb-6">{test?.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Duration</h3>
                <p className="text-2xl font-bold text-primary-600">{test?.durationMins} mins</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Total Marks</h3>
                <p className="text-2xl font-bold text-primary-600">{test?.totalMarks}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Questions</h3>
                <p className="text-2xl font-bold text-primary-600">{test?.questions?.length || 0}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
              <ul className="text-left text-yellow-700 space-y-1">
                <li>• Once started, the timer cannot be paused</li>
                <li>• You can navigate between questions freely</li>
                <li>• Test will auto-submit when time expires</li>
                <li>• Make sure you have a stable internet connection</li>
              </ul>
            </div>

            <button
              onClick={startTest}
              className="btn-primary text-lg px-8 py-3"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer */}
      <div className="bg-blue-600 text-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-lg font-semibold">{test?.title}</h1>
                <div className="text-blue-100 text-sm">Computer Based Test</div>
              </div>
              <div className="text-sm">
                <div>Candidate: <span className="font-semibold">{user?.name?.toUpperCase() || 'STUDENT'}</span></div>
                <div>ID: <span className="font-semibold">EX{user?._id?.slice(-6) || '000001'}</span></div>
              </div>
              <div className="text-sm">
                <div>Email: <span className="font-semibold">{user?.email || 'student@example.com'}</span></div>
                <div>Language: <span className="font-semibold">English</span></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-xl font-mono font-bold px-4 py-2 rounded ${
                timeLeft < 300 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmit}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {currentQ?.text}
                </h2>
                
                {currentQ?.options && (
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          responses[currentQ._id] === index
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQ._id}`}
                          value={index}
                          checked={responses[currentQ._id] === index}
                          onChange={() => handleAnswerSelect(currentQ._id, index)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          responses[currentQ._id] === index
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {responses[currentQ._id] === index && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    if (questionStartTime) {
                      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
                      setQuestionTimeLog(prev => ({
                        ...prev,
                        [currentQuestion]: (prev[currentQuestion] || 0) + timeSpent
                      }))
                    }
                    const newQuestion = Math.max(0, currentQuestion - 1)
                    setCurrentQuestion(newQuestion)
                    setQuestionStartTime(Date.now())
                  }}
                  disabled={currentQuestion === 0}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (questionStartTime) {
                      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
                      setQuestionTimeLog(prev => ({
                        ...prev,
                        [currentQuestion]: (prev[currentQuestion] || 0) + timeSpent
                      }))
                    }
                    const newQuestion = Math.min(questions.length - 1, currentQuestion + 1)
                    setCurrentQuestion(newQuestion)
                    setQuestionStartTime(Date.now())
                  }}
                  disabled={currentQuestion === questions.length - 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Question Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => {
                  const timeSpent = questionTimeLog[index] || 0
                  const currentTime = currentQuestion === index && questionStartTime ? 
                    Math.floor((Date.now() - questionStartTime) / 1000) : 0
                  const totalTime = timeSpent + currentTime
                  
                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => {
                          if (questionStartTime && currentQuestion !== index) {
                            const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
                            setQuestionTimeLog(prev => ({
                              ...prev,
                              [currentQuestion]: (prev[currentQuestion] || 0) + timeSpent
                            }))
                          }
                          setCurrentQuestion(index)
                          setQuestionStartTime(Date.now())
                        }}
                        className={`w-8 h-8 text-sm font-medium rounded ${
                          index === currentQuestion
                            ? 'bg-primary-600 text-white'
                            : responses[questions[index]._id] !== undefined
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={`Question ${index + 1} - Time spent: ${totalTime}s`}
                      >
                        {index + 1}
                      </button>
                      {totalTime > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center" 
                             style={{ fontSize: '8px' }}
                             title={`${totalTime}s`}>
                          {totalTime > 60 ? '60+' : totalTime}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 text-xs space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-600 rounded mr-2"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  <span>Not Answered</span>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
                <h4 className="font-semibold mb-2">Time Tracking</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Current Q:</span>
                    <span className="font-bold text-blue-600">
                      {questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Used:</span>
                    <span className="font-bold">
                      {Math.floor((Object.values(questionTimeLog).reduce((a, b) => a + b, 0) + 
                        (questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0)) / 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg per Q:</span>
                    <span className="font-bold">
                      {Object.keys(questionTimeLog).length > 0 ? 
                        Math.floor(Object.values(questionTimeLog).reduce((a, b) => a + b, 0) / Object.keys(questionTimeLog).length) : 0}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPlayer