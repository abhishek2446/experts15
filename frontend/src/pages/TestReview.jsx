import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'

const TestReview = () => {
  const { testId } = useParams()
  const [reviewData, setReviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await api.get(`/cbt/${testId}/review`)
        setReviewData(response.data)
      } catch (error) {
        toast.error('Failed to load test review')
      } finally {
        setLoading(false)
      }
    }

    fetchReview()
  }, [testId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review...</p>
        </div>
      </div>
    )
  }

  if (!reviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Not Available</h2>
          <p className="text-gray-600 mb-4">The test review is not available at this time.</p>
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { questions, attempt } = reviewData

  const getQuestionStatus = (question) => {
    const response = question?.userResponse
    if (!response) return 'not-attempted'
    
    let isCorrect = false
    if (question.questionType === 'MCQ') {
      isCorrect = response.chosen === question.correctOptionIndex
    }
    
    return isCorrect ? 'correct' : 'incorrect'
  }

  const filteredQuestions = questions.filter(question => {
    if (filter === 'all') return true
    return getQuestionStatus(question) === filter
  })

  const currentQ = filteredQuestions[currentQuestion]
  const questionStatus = getQuestionStatus(currentQ)

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return 'text-green-600 bg-green-50 border-green-200'
      case 'incorrect': return 'text-red-600 bg-red-50 border-red-200'
      case 'not-attempted': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'correct':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'incorrect':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getUserAnswer = (question) => {
    const response = question?.userResponse
    if (!response || response.chosen === undefined) return 'Not Attempted'
    
    return `(${String.fromCharCode(65 + response.chosen)}) ${question.options[response.chosen]}`
  }

  const getCorrectAnswer = (question) => {
    if (question.questionType === 'MCQ') {
      return `(${String.fromCharCode(65 + question.correctOptionIndex)}) ${question.options[question.correctOptionIndex]}`
    } else if (question.questionType === 'MSQ') {
      return question.correctOptions.map(idx => `(${String.fromCharCode(65 + idx)}) ${question.options[idx]}`).join(', ')
    } else if (question.questionType === 'Integer') {
      return question.correctAnswer?.toString()
    }
    return 'N/A'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Review & Solutions</h1>
              <p className="text-gray-600">Review your answers and learn from detailed solutions</p>
            </div>
            <Link
              to={`/test/${testId}/result`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Back to Results
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'all', label: 'All Questions', count: questions.length },
              { key: 'correct', label: 'Correct', count: questions.filter(q => getQuestionStatus(q) === 'correct').length },
              { key: 'incorrect', label: 'Incorrect', count: questions.filter(q => getQuestionStatus(q) === 'incorrect').length },
              { key: 'not-attempted', label: 'Not Attempted', count: questions.filter(q => getQuestionStatus(q) === 'not-attempted').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key)
                  setCurrentQuestion(0)
                }}
                className={`py-3 px-4 border-b-2 font-medium text-sm ${
                  filter === key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Question Header */}
            <div className={`p-4 rounded-lg border mb-6 ${getStatusColor(questionStatus)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(questionStatus)}
                  <div>
                    <h2 className="text-lg font-semibold">
                      Question {currentQ.qno} - {currentQ.subject}
                    </h2>
                    <p className="text-sm opacity-75">
                      {questionStatus === 'correct' ? 'Correct Answer' :
                       questionStatus === 'incorrect' ? 'Incorrect Answer' : 'Not Attempted'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-75">Marks</div>
                  <div className="font-semibold">+{currentQ.marks}</div>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="text-lg text-gray-900 leading-relaxed mb-4">
                {currentQ.text}
              </div>
              {currentQ.images && currentQ.images.length > 0 && (
                <div className="mb-4">
                  {currentQ.images.map((image, index) => (
                    <img key={index} src={image} alt={`Question ${currentQ.qno} - Image ${index + 1}`} className="max-w-full h-auto rounded" />
                  ))}
                </div>
              )}

              {/* Options for MCQ/MSQ */}
              {(currentQ.questionType === 'MCQ' || currentQ.questionType === 'MSQ') && (
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => {
                    const isUserSelected = currentQ.userResponse?.selectedOption === index || 
                                         currentQ.userResponse?.selectedOptions?.includes(index)
                    const isCorrect = currentQ.questionType === 'MCQ' ? 
                                    index === currentQ.correctOptionIndex :
                                    currentQ.correctOptions?.includes(index)
                    
                    let optionClass = 'p-3 border rounded-lg '
                    if (isCorrect) {
                      optionClass += 'border-green-500 bg-green-50 text-green-800'
                    } else if (isUserSelected) {
                      optionClass += 'border-red-500 bg-red-50 text-red-800'
                    } else {
                      optionClass += 'border-gray-300 bg-gray-50'
                    }

                    return (
                      <div key={index} className={optionClass}>
                        <div className="flex items-center">
                          <span className="font-medium mr-3">({String.fromCharCode(65 + index)})</span>
                          <span>{option}</span>
                          {isCorrect && (
                            <svg className="w-5 h-5 text-green-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isUserSelected && !isCorrect && (
                            <svg className="w-5 h-5 text-red-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Answer Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Answer Summary</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Your Answer</h4>
                  <div className={`p-3 rounded-lg ${
                    questionStatus === 'correct' ? 'bg-green-50 text-green-800' :
                    questionStatus === 'incorrect' ? 'bg-red-50 text-red-800' :
                    'bg-gray-50 text-gray-800'
                  }`}>
                    {getUserAnswer(currentQ)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Correct Answer</h4>
                  <div className="p-3 rounded-lg bg-green-50 text-green-800">
                    {getCorrectAnswer(currentQ)}
                  </div>
                </div>
              </div>
            </div>

            {/* Solution */}
            {currentQ.explanation && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Detailed Solution
                </h3>
                <div className="prose max-w-none text-gray-700">
                  {currentQ.explanation}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <span className="text-gray-600">
                {currentQuestion + 1} of {filteredQuestions.length}
              </span>
              
              <button
                onClick={() => setCurrentQuestion(Math.min(filteredQuestions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === filteredQuestions.length - 1}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="w-80 bg-white border-l p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {filteredQuestions.map((question, index) => {
              const status = getQuestionStatus(question)
              let buttonClass = 'w-10 h-10 text-sm font-medium rounded '
              
              if (status === 'correct') {
                buttonClass += 'bg-green-500 text-white'
              } else if (status === 'incorrect') {
                buttonClass += 'bg-red-500 text-white'
              } else {
                buttonClass += 'bg-gray-300 text-gray-700'
              }
              
              if (currentQuestion === index) {
                buttonClass += ' ring-2 ring-indigo-500'
              }

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={buttonClass}
                >
                  {question.qno}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Correct</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Incorrect</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <span>Not Attempted</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-medium">{attempt.score.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-medium">{attempt.analytics.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>Time Taken:</span>
                <span className="font-medium">{Math.floor(attempt.timeSpent / 60)}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestReview