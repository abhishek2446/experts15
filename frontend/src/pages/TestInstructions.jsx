import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const TestInstructions = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${testId}`)
        setTest(response.data)
        
        if (!response.data.isEnrolled) {
          // Check if this is demo test and auto-enroll
          if (response.data.title && response.data.title.includes('Demo Test')) {
            try {
              await api.get('/demo/test')
              // Refetch test data after enrollment
              const updatedResponse = await api.get(`/tests/${testId}`)
              setTest(updatedResponse.data)
            } catch (error) {
              toast.error('Failed to enroll in demo test')
              navigate('/tests')
              return
            }
          } else {
            toast.error('You are not enrolled in this test')
            navigate('/tests')
            return
          }
        }
      } catch (error) {
        toast.error('Failed to load test details')
        navigate('/tests')
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId, navigate])

  const handleStartTest = () => {
    if (!agreed) {
      toast.warning('Please read and agree to the instructions')
      return
    }
    
    navigate(`/cbt/${testId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test instructions...</p>
        </div>
      </div>
    )
  }

  if (!test) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
            <p className="text-gray-600">{test.examType.toUpperCase()} Mock Test</p>
            <div className="flex justify-center items-center space-x-8 mt-4 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{test.durationMins} minutes</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-medium">{test.totalQuestions} questions</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="font-medium">{test.totalMarks} marks</span>
              </div>
            </div>
          </div>
        </div>

        {/* General Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            General Instructions
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>The test duration is <strong>{test.durationMins} minutes</strong>. The test will automatically submit when time expires.</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>This test contains <strong>{test.totalQuestions} questions</strong> for a total of <strong>{test.totalMarks} marks</strong>.</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>The test is divided into sections: <strong>{test.subjects?.join(', ')}</strong>.</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <span>You can navigate between questions using the question palette on the right side.</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">5.</span>
              <span>Your responses are automatically saved every {test.settings?.autoSaveInterval || 10} seconds.</span>
            </div>
            {test.settings?.fullscreenRequired && (
              <div className="flex items-start">
                <span className="font-semibold mr-2">6.</span>
                <span className="text-red-600">This test requires fullscreen mode. Exiting fullscreen will trigger warnings.</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="font-semibold mr-2">{test.settings?.fullscreenRequired ? '7' : '6'}.</span>
              <span>Switching tabs or windows is monitored. Excessive tab switching may result in automatic submission.</span>
            </div>
          </div>
        </div>

        {/* Marking Scheme */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Marking Scheme
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Multiple Choice Questions (MCQ)</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Correct Answer:</span>
                  <span className="font-medium text-green-600">+4 marks</span>
                </div>
                <div className="flex justify-between">
                  <span>Incorrect Answer:</span>
                  <span className="font-medium text-red-600">-1 mark</span>
                </div>
                <div className="flex justify-between">
                  <span>Not Attempted:</span>
                  <span className="font-medium text-gray-600">0 marks</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Subject Distribution</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {test.subjects?.map(subject => {
                  const questionsPerSubject = Math.floor(test.totalQuestions / test.subjects.length)
                  return (
                    <div key={subject} className="flex justify-between">
                      <span>{subject}:</span>
                      <span className="font-medium">{questionsPerSubject} questions</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Question Palette Guide */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Question Palette Guide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center text-sm font-medium mr-3">1</div>
              <div>
                <div className="font-medium text-sm">Answered</div>
                <div className="text-xs text-gray-600">Question attempted</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 text-white rounded flex items-center justify-center text-sm font-medium mr-3">2</div>
              <div>
                <div className="font-medium text-sm">Marked for Review</div>
                <div className="text-xs text-gray-600">To review later</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center text-sm font-medium mr-3">3</div>
              <div>
                <div className="font-medium text-sm">Not Answered</div>
                <div className="text-xs text-gray-600">Visited but not answered</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded flex items-center justify-center text-sm font-medium mr-3">4</div>
              <div>
                <div className="font-medium text-sm">Not Visited</div>
                <div className="text-xs text-gray-600">Not yet visited</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            System Requirements & Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">System Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Stable internet connection
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Updated web browser (Chrome, Firefox, Safari)
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Minimum screen resolution: 1024x768
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  JavaScript enabled
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Important Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Close all unnecessary applications
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ensure your device is fully charged
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Use a quiet, well-lit environment
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Keep water and necessary items nearby
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Agreement and Start */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start mb-6">
            <input
              type="checkbox"
              id="agreement"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 mr-3"
            />
            <label htmlFor="agreement" className="text-gray-700">
              I have read and understood all the instructions mentioned above. I agree to follow all the rules and regulations during the test. I understand that any violation may result in disqualification.
            </label>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleStartTest}
              disabled={!agreed}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1" />
              </svg>
              I Agree & Start Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestInstructions