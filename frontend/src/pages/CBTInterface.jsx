import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const CBTInterface = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Test data
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [attempt, setAttempt] = useState(null)
  
  // Current state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [currentSubject, setCurrentSubject] = useState('Physics')
  const [responses, setResponses] = useState({})
  const [markedForReview, setMarkedForReview] = useState(new Set())
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]))
  
  // Timer and time tracking
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [questionTimeLog, setQuestionTimeLog] = useState({})
  const timerRef = useRef(null)
  
  // Auto-save
  const autoSaveRef = useRef(null)
  const [lastSaved, setLastSaved] = useState(null)
  
  // Warnings
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize test
  useEffect(() => {
    const startTest = async () => {
      try {
        const response = await api.post(`/cbt/${testId}/start`)
        setTest(response.data.test)
        setQuestions(response.data.questions)
        setAttempt(response.data.attempt)
        
        // Calculate time left
        const startTime = new Date(response.data.attempt.startedAt)
        const duration = response.data.test.durationMins * 60 * 1000
        const elapsed = Date.now() - startTime.getTime()
        const remaining = Math.max(0, duration - elapsed)
        
        setTimeLeft(Math.floor(remaining / 1000))
        setIsActive(true)
        setQuestionStartTime(Date.now())
        
        // Force fullscreen immediately
        enterFullscreen()
        
        // Disable right-click and keyboard shortcuts
        document.addEventListener('contextmenu', e => e.preventDefault())
        document.addEventListener('keydown', handleKeyDown)
        
        // Disable text selection
        document.body.style.userSelect = 'none'
        document.body.style.webkitUserSelect = 'none'
        
        // Load saved responses if resuming
        if (response.data.attempt.responses) {
          const savedResponses = {}
          const savedMarked = new Set()
          const savedVisited = new Set()
          
          response.data.attempt.responses.forEach(resp => {
            const qIndex = response.data.questions.findIndex(q => q._id === resp.questionId)
            if (qIndex !== -1) {
              savedResponses[qIndex] = resp.selectedOption
              if (resp.isMarkedForReview) savedMarked.add(qIndex)
              savedVisited.add(qIndex)
            }
          })
          
          setResponses(savedResponses)
          setMarkedForReview(savedMarked)
          setVisitedQuestions(savedVisited)
        }
        
      } catch (error) {
        toast.error('Failed to start test')
        navigate('/dashboard')
      }
    }
    
    startTest()
  }, [testId, navigate])

  // Timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleAutoSubmit('Time expired')
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    
    return () => clearInterval(timerRef.current)
  }, [isActive, timeLeft])

  // Auto-save effect
  useEffect(() => {
    if (test?.settings?.autoSaveInterval && isActive) {
      autoSaveRef.current = setInterval(() => {
        saveCurrentResponse()
      }, test.settings.autoSaveInterval * 1000)
    }
    
    return () => clearInterval(autoSaveRef.current)
  }, [test, isActive, currentQuestion, responses])

  // Fullscreen and tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        logWarning('tab_switch')
        toast.error('⚠️ Tab switching detected! This is your warning.')
      }
    }
    
    const handleFullscreenChange = () => {
      const isInFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)
      setIsFullscreen(isInFullscreen)
      
      if (!isInFullscreen && isActive) {
        logWarning('fullscreen_exit')
        toast.error('⚠️ Please return to fullscreen mode immediately!')
        // Force back to fullscreen after 2 seconds
        setTimeout(() => {
          if (isActive) {
            enterFullscreen()
          }
        }, 2000)
      }
    }
    
    const handleBeforeUnload = (e) => {
      if (isActive) {
        e.preventDefault()
        e.returnValue = 'Your test will be auto-submitted if you leave. Are you sure?'
        return 'Your test will be auto-submitted if you leave. Are you sure?'
      }
    }
    
    const handleBlur = () => {
      if (isActive) {
        logWarning('window_blur')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('contextmenu', e => e.preventDefault())
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, test])

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen()
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen()
    }
  }

  const handleKeyDown = (e) => {
    // Disable F11, F12, Ctrl+Shift+I, Ctrl+U, etc.
    if (
      e.key === 'F11' ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.key === 'u') ||
      (e.ctrlKey && e.shiftKey && e.key === 'C') ||
      (e.ctrlKey && e.key === 'r') ||
      (e.key === 'F5')
    ) {
      e.preventDefault()
      toast.warning('This action is not allowed during the exam!')
    }
  }

  const logWarning = async (type) => {
    try {
      const response = await api.post(`/cbt/${testId}/warning`, { type })
      
      if (type === 'tab_switch') {
        const newCount = tabSwitchCount + 1
        setTabSwitchCount(newCount)
        
        if (response.data.autoSubmit) {
          handleAutoSubmit(response.data.reason)
          return
        }
        
        setWarningMessage(`Warning ${newCount}: Please stay in the exam window. ${test?.settings?.maxTabSwitches - newCount} warnings remaining.`)
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 5000)
      }
    } catch (error) {
      console.error('Failed to log warning:', error)
    }
  }

  const saveCurrentResponse = useCallback(async () => {
    if (!questions[currentQuestion] || !isActive || !questionStartTime) return
    
    const timeSpentOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000)
    
    try {
      await api.post(`/cbt/${testId}/save-response`, {
        questionId: questions[currentQuestion]._id,
        selectedOption: responses[currentQuestion],
        isMarkedForReview: markedForReview.has(currentQuestion),
        timeSpentOnQuestion,
        currentQuestionIndex: currentQuestion
      })
      
      setQuestionTimeLog(prev => ({
        ...prev,
        [currentQuestion]: (prev[currentQuestion] || 0) + timeSpentOnQuestion
      }))
      
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [testId, currentQuestion, questions, responses, markedForReview, isActive, questionStartTime])

  const handleOptionSelect = (optionIndex) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }))
    
    // Mark as visited
    setVisitedQuestions(prev => new Set([...prev, currentQuestion]))
  }

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion)
      } else {
        newSet.add(currentQuestion)
      }
      return newSet
    })
  }

  const handleClearResponse = () => {
    setResponses(prev => {
      const newResponses = { ...prev }
      delete newResponses[currentQuestion]
      return newResponses
    })
  }

  const navigateToQuestion = (questionIndex) => {
    if (questionStartTime && currentQuestion !== questionIndex) {
      const timeSpentOnCurrentQuestion = Math.floor((Date.now() - questionStartTime) / 1000)
      setQuestionTimeLog(prev => ({
        ...prev,
        [currentQuestion]: (prev[currentQuestion] || 0) + timeSpentOnCurrentQuestion
      }))
      saveCurrentResponse()
    }
    
    setCurrentQuestion(questionIndex)
    setVisitedQuestions(prev => new Set([...prev, questionIndex]))
    setQuestionStartTime(Date.now())
    
    const question = questions[questionIndex]
    if (question) {
      setCurrentSubject(question.subject)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      navigateToQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      navigateToQuestion(currentQuestion - 1)
    }
  }

  const handleSubjectSwitch = (subject) => {
    const firstQuestionOfSubject = questions.findIndex(q => q.subject === subject)
    if (firstQuestionOfSubject !== -1) {
      navigateToQuestion(firstQuestionOfSubject)
    }
  }

  const handleAutoSubmit = async (reason) => {
    setIsActive(false)
    toast.warning(`Test auto-submitted: ${reason}`)
    await submitTest(true)
  }

  const submitTest = async (isAutoSubmit = false) => {
    setIsSubmitting(true)
    
    try {
      if (questionStartTime) {
        const finalTimeOnCurrentQuestion = Math.floor((Date.now() - questionStartTime) / 1000)
        setQuestionTimeLog(prev => ({
          ...prev,
          [currentQuestion]: (prev[currentQuestion] || 0) + finalTimeOnCurrentQuestion
        }))
      }
      
      const finalResponses = questions.map((question, index) => ({
        questionId: question._id,
        selectedOption: responses[index],
        isMarkedForReview: markedForReview.has(index)
      }))
      
      const finalQuestionTimeLog = Object.entries(questionTimeLog).map(([questionIndex, timeSpent]) => ({
        questionIndex: parseInt(questionIndex),
        questionId: questions[parseInt(questionIndex)]?._id,
        timeSpent
      }))
      
      const response = await api.post(`/cbt/${testId}/submit`, {
        finalResponses,
        questionTimeLog: finalQuestionTimeLog
      })
      
      toast.success('Test submitted successfully!')
      navigate(`/test/${testId}/result`)
      
    } catch (error) {
      toast.error('Failed to submit test')
      setIsSubmitting(false)
      if (!isAutoSubmit) {
        setIsActive(true)
      }
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionStatus = (index) => {
    if (responses[index] !== undefined && markedForReview.has(index)) return 'answered-marked'
    if (responses[index] !== undefined) return 'answered'
    if (markedForReview.has(index)) return 'marked'
    if (visitedQuestions.has(index)) return 'visited'
    return 'not-visited'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-600 text-white border-green-700'
      case 'marked': return 'bg-purple-600 text-white border-purple-700'
      case 'answered-marked': return 'bg-purple-800 text-white border-purple-900'
      case 'visited': return 'bg-red-600 text-white border-red-700'
      default: return 'bg-gray-400 text-white border-gray-500'
    }
  }

  if (!test || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const subjectQuestions = questions.filter(q => q.subject === currentSubject)
  const currentSubjectIndex = subjectQuestions.findIndex(q => q._id === currentQ._id)

  return (
    <div className="fixed inset-0 bg-white overflow-hidden" style={{ userSelect: 'none' }}>
      {/* Fullscreen Warning */}
      {!isFullscreen && isActive && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50 font-bold animate-pulse">
          ⚠️ WARNING: Please return to fullscreen mode immediately! Press F11 or click the fullscreen button.
        </div>
      )}
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Warning</h3>
            </div>
            <p className="text-gray-600 mb-4">{warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Test</h3>
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-medium text-green-600">{Object.keys(responses).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Marked for Review:</span>
                <span className="font-medium text-purple-600">{markedForReview.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Answered:</span>
                <span className="font-medium text-red-600">{questions.length - Object.keys(responses).length}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">Once submitted, you cannot make any changes. Are you sure?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false)
                  submitTest()
                }}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Final Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NTA Style Header */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between border-b-2 border-blue-700">
        <div className="flex items-center space-x-8">
          <div className="text-sm">
            <div className="font-semibold">{test?.title || 'JEE MAINS 2024'}</div>
            <div className="text-blue-100">Computer Based Test</div>
          </div>
          <div className="text-sm">
            <div>Candidate Name: <span className="font-semibold">{user?.name?.toUpperCase() || 'STUDENT'}</span></div>
            <div>Application No: <span className="font-semibold">EX{user?._id?.slice(-6) || '000001'}</span></div>
          </div>
          <div className="text-sm">
            <div>Subject: <span className="font-semibold">{currentSubject}</span></div>
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
            onClick={() => setShowSubmitModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold border-2 border-red-700"
          >
            SUBMIT
          </button>
        </div>
      </div>

      {/* NTA Style Subject Tabs */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="flex">
          {(test?.subjects || ['Physics', 'Chemistry', 'Mathematics']).map(subject => {
            const subjectQs = questions.filter(q => q.subject === subject)
            const answered = subjectQs.filter((_, i) => responses[questions.indexOf(subjectQs[i])] !== undefined).length
            
            return (
              <button
                key={subject}
                onClick={() => handleSubjectSwitch(subject)}
                className={`flex-1 py-3 px-4 font-semibold text-sm border-r border-gray-300 ${
                  currentSubject === subject
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {subject}
                <div className="text-xs mt-1">({answered}/{subjectQs.length})</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <div className="max-w-none">
            {/* NTA Style Question Header */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <span className="font-semibold text-blue-800">Question No. {currentQuestion + 1}</span>
                  <span className="text-blue-600">Subject: {currentQ?.subject}</span>
                  <span className="text-blue-600">Marks: {currentQ?.marks}</span>
                  <span className="text-blue-600">Type: Multiple Choice Question</span>
                </div>
                <div className="text-xs text-green-600">
                  {lastSaved && `Auto-saved at ${lastSaved.toLocaleTimeString()}`}
                </div>
              </div>
            </div>

            {/* NTA Style Question Text */}
            <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
              <div className="text-base text-gray-900 leading-relaxed font-medium">
                <span className="font-semibold">Q.{currentQuestion + 1}</span> {currentQ?.text}
              </div>
              {currentQ?.images && currentQ.images.length > 0 && (
                <div className="mt-4">
                  {currentQ.images.map((image, index) => (
                    <img key={index} src={image} alt={`Question ${currentQuestion + 1} - Image ${index + 1}`} className="max-w-full h-auto border" />
                  ))}
                </div>
              )}
            </div>

            {/* NTA Style Options */}
            {(currentQ?.questionType === 'MCQ' || !currentQ?.questionType) && (
              <div className="space-y-2 mb-6">
                {(currentQ?.options || []).map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-3 border-2 cursor-pointer transition-all ${
                      responses[currentQuestion] === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={responses[currentQuestion] === index}
                      onChange={() => handleOptionSelect(index)}
                      className="mr-4 w-4 h-4"
                    />
                    <span className="font-bold mr-4 text-blue-800">({String.fromCharCode(65 + index)})</span>
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* NTA Style Action Buttons */}
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded border">
              <div className="flex space-x-3">
                <button
                  onClick={handleClearResponse}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded"
                >
                  Clear Response
                </button>
                <button
                  onClick={handleMarkForReview}
                  className={`px-6 py-2 font-semibold rounded ${
                    markedForReview.has(currentQuestion)
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {markedForReview.has(currentQuestion) ? 'Unmark for Review' : 'Mark for Review & Next'}
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  Save & Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NTA Style Question Palette */}
        <div className="w-72 bg-gray-100 border-l-2 border-gray-300 p-3 overflow-y-auto">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-3 text-center bg-blue-600 text-white py-2 rounded">Question Palette</h3>
            <div className="text-xs space-y-2 bg-white p-3 rounded border">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center mr-2 text-xs font-bold">1</div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center mr-2 text-xs font-bold">2</div>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-600 text-white rounded flex items-center justify-center mr-2 text-xs font-bold">3</div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-400 text-white rounded flex items-center justify-center mr-2 text-xs font-bold">4</div>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-800 text-white rounded flex items-center justify-center mr-2 text-xs font-bold">5</div>
                <span>Answered & Marked</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 mb-4">
            {questions.map((_, index) => {
              const timeSpent = questionTimeLog[index] || 0
              const currentTime = currentQuestion === index && questionStartTime ? 
                Math.floor((Date.now() - questionStartTime) / 1000) : 0
              const totalTime = timeSpent + currentTime
              
              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => navigateToQuestion(index)}
                    className={`w-10 h-10 text-xs font-bold rounded border-2 ${
                      getStatusColor(getQuestionStatus(index))
                    } ${
                      currentQuestion === index ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    title={`Question ${index + 1} - Time spent: ${totalTime}s`}
                  >
                    {index + 1}
                  </button>
                  {totalTime > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" 
                         style={{ fontSize: '8px' }}
                         title={`${totalTime}s`}>
                      {totalTime > 99 ? '99+' : totalTime}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-gray-900 mb-2 text-center">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-bold text-green-600">{Object.keys(responses).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Answered:</span>
                <span className="font-bold text-red-600">{visitedQuestions.size - Object.keys(responses).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Marked:</span>
                <span className="font-bold text-purple-600">{markedForReview.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Visited:</span>
                <span className="font-bold text-gray-600">{questions.length - visitedQuestions.size}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded border mt-3">
            <h4 className="font-semibold text-gray-900 mb-2 text-center">Time Tracking</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Current Question:</span>
                <span className="font-bold text-blue-600">
                  {questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Time Used:</span>
                <span className="font-bold text-gray-600">
                  {Math.floor((Object.values(questionTimeLog).reduce((a, b) => a + b, 0) + 
                    (questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0)) / 60)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg per Question:</span>
                <span className="font-bold text-gray-600">
                  {visitedQuestions.size > 0 ? 
                    Math.floor((Object.values(questionTimeLog).reduce((a, b) => a + b, 0) + 
                      (questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0)) / visitedQuestions.size) : 0}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CBTInterface