import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../services/api'

const TestPreview = ({ isOpen, onClose, testId }) => {
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    if (isOpen && testId) {
      fetchTestDetails()
    }
  }, [isOpen, testId])

  const fetchTestDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/tests/${testId}`)
      setTest(response.data)
      
      if (response.data.parsedQuestions) {
        setQuestions(response.data.parsedQuestions)
      }
    } catch (error) {
      toast.error('Error fetching test details')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async (type) => {
    try {
      const endpoint = type === 'questions' ? 'download-questions' : 'download-answerkey'
      const response = await api.get(`/admin/tests/${testId}/${endpoint}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${test.title}_${type}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success(`${type} PDF downloaded successfully!`)
    } catch (error) {
      toast.error(`Error downloading ${type} PDF`)
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Loading test preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{test?.title}</h2>
              <p className="text-blue-100 mt-1">{test?.description}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Test Info */}
          <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="font-semibold">Duration</div>
              <div>{test?.durationMins} mins</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="font-semibold">Questions</div>
              <div>{questions.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="font-semibold">Total Marks</div>
              <div>{test?.totalMarks}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="font-semibold">Price</div>
              <div>{test?.isPaid ? `₹${test.price}` : 'FREE'}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Question Navigation */}
          <div className="w-64 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium ${
                      currentQuestion === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Download Options */}
            <div className="p-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">Downloads</h4>
              <div className="space-y-2">
                <button
                  onClick={() => downloadPDF('questions')}
                  className="w-full bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200"
                >
                  📄 Question Paper
                </button>
                <button
                  onClick={() => downloadPDF('answerkey')}
                  className="w-full bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm hover:bg-green-200"
                >
                  🔑 Answer Key
                </button>
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="flex-1 overflow-y-auto">
            {questions.length > 0 ? (
              <div className="p-6">
                <div className="bg-white border rounded-lg p-6">
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Q{questions[currentQuestion]?.qno}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {questions[currentQuestion]?.subject}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        {questions[currentQuestion]?.difficulty || 'Medium'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      +{questions[currentQuestion]?.marks || 4} / {questions[currentQuestion]?.negativeMarks || -1}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="text-lg text-gray-900 leading-relaxed">
                      {questions[currentQuestion]?.text}
                    </p>
                  </div>

                  {/* Options */}
                  {questions[currentQuestion]?.options && (
                    <div className="space-y-3 mb-6">
                      {questions[currentQuestion].options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            questions[currentQuestion].correctOptionIndex === index
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-700">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="text-gray-900">{option}</span>
                            {questions[currentQuestion].correctOptionIndex === index && (
                              <span className="ml-auto text-green-600 font-semibold">✓ Correct</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explanation */}
                  {questions[currentQuestion]?.explanation && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                      <p className="text-blue-800">{questions[currentQuestion].explanation}</p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  
                  <span className="text-gray-600">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  
                  <button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h3>
                  <p className="text-gray-600">Upload a question PDF to preview questions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPreview