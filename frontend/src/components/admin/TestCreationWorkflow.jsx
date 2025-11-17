import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../services/api'

const TestCreationWorkflow = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    examType: 'main',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    durationMins: 180,
    totalMarks: 300,
    totalQuestions: 75,
    difficulty: 'Mixed',
    isPaid: false,
    price: 0,
    visibility: 'public'
  })
  const [createdTest, setCreatedTest] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [questions, setQuestions] = useState([])

  const steps = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Upload Questions', icon: '📄' },
    { id: 3, title: 'Upload Answer Key', icon: '🔑' },
    { id: 4, title: 'Review & Publish', icon: '✅' }
  ]

  const handleCreateTest = async () => {
    try {
      const response = await api.post('/admin/tests', testData)
      setCreatedTest(response.data.test)
      setCurrentStep(2)
      toast.success('Test created successfully!')
    } catch (error) {
      toast.error('Error creating test')
    }
  }

  const handleFileUpload = async (file, type) => {
    if (!file || !createdTest) return

    const formData = new FormData()
    formData.append(type === 'questions' ? 'questionPdf' : 'answerKeyPdf', file)

    setUploading(true)
    try {
      const endpoint = type === 'questions' ? 'upload-questions' : 'upload-answerkey'
      const response = await api.post(`/admin/tests/${createdTest._id}/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (type === 'questions') {
        setQuestions(response.data.questions || [])
        setCurrentStep(3)
      } else {
        setCurrentStep(4)
      }
      
      toast.success(response.data.message)
    } catch (error) {
      toast.error(`Error uploading ${type}`)
    } finally {
      setUploading(false)
    }
  }

  const handlePublish = async () => {
    try {
      await api.post(`/admin/tests/${createdTest._id}/publish`)
      toast.success('Test published successfully!')
      onSuccess()
      onClose()
      resetWorkflow()
    } catch (error) {
      toast.error('Error publishing test')
    }
  }

  const resetWorkflow = () => {
    setCurrentStep(1)
    setTestData({
      title: '',
      description: '',
      examType: 'main',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      durationMins: 180,
      totalMarks: 300,
      totalQuestions: 75,
      difficulty: 'Mixed',
      isPaid: false,
      price: 0,
      visibility: 'public'
    })
    setCreatedTest(null)
    setQuestions([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Test Creation Workflow</h2>
              <p className="text-blue-100 mt-1">Step-by-step test creation process</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Test Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                <input
                  type="text"
                  value={testData.title}
                  onChange={(e) => setTestData({...testData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JEE Main Mock Test 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={testData.description}
                  onChange={(e) => setTestData({...testData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of the test"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={testData.examType}
                    onChange={(e) => setTestData({...testData, examType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="main">JEE Main</option>
                    <option value="advanced">JEE Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={testData.durationMins}
                    onChange={(e) => setTestData({...testData, durationMins: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="30"
                    max="300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={testData.totalQuestions}
                    onChange={(e) => setTestData({...testData, totalQuestions: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={testData.price}
                    onChange={(e) => setTestData({...testData, price: parseInt(e.target.value), isPaid: e.target.value > 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload Questions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Upload Question Paper</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Question PDF</h4>
                <p className="text-gray-600 mb-4">Select a PDF file containing the questions</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'questions')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Processing PDF...</p>
                </div>
              )}
              
              {questions.length > 0 && (
                <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Extracted Questions ({questions.length})</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {questions.slice(0, 5).map((q, index) => (
                      <div key={index} className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium">Q{q.qno}: {q.text.substring(0, 100)}...</div>
                        <div className="text-gray-600 mt-1">
                          Subject: {q.subject} | Options: {q.options.length}
                        </div>
                      </div>
                    ))}
                    {questions.length > 5 && (
                      <div className="text-center text-gray-500 text-sm">
                        ... and {questions.length - 5} more questions
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Continue to Answer Key
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Upload Answer Key */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Upload Answer Key</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="text-green-600 mr-3">✅</div>
                  <div>
                    <h4 className="font-medium text-green-900">Questions Uploaded Successfully</h4>
                    <p className="text-green-700 text-sm">{questions.length} questions extracted from PDF</p>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🔑</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Answer Key PDF</h4>
                <p className="text-gray-600 mb-4">Select a PDF file containing the answer key</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'answerkey')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Processing answer key...</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  disabled={questions.length === 0}
                >
                  Review Questions
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Review Questions & Publish</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Test Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Title:</span> {testData.title}</div>
                  <div><span className="font-medium">Type:</span> JEE {testData.examType}</div>
                  <div><span className="font-medium">Duration:</span> {testData.durationMins} minutes</div>
                  <div><span className="font-medium">Questions:</span> {questions.length}</div>
                  <div><span className="font-medium">Price:</span> {testData.isPaid ? `₹${testData.price}` : 'FREE'}</div>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Questions Preview</h4>
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm">Q{q.qno} - {q.subject}</div>
                          <div className="text-xs text-gray-500">
                            {q.correctOptionIndex !== undefined ? '✅ Answer Set' : '❌ No Answer'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{q.text}</div>
                        {q.options.length > 0 && (
                          <div className="text-xs text-gray-600">
                            Options: {q.options.map((opt, i) => 
                              `${String.fromCharCode(65 + i)}) ${opt.substring(0, 30)}...`
                            ).join(' | ')}
                          </div>
                        )}
                        {q.correctOptionIndex !== undefined && (
                          <div className="text-xs text-green-600 mt-1">
                            Correct Answer: {q.options.length > 0 ? 
                              String.fromCharCode(65 + q.correctOptionIndex) : 
                              q.correctOptionIndex
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">⚠️</div>
                  <div>
                    <h4 className="font-medium text-yellow-900">Review Before Publishing</h4>
                    <p className="text-yellow-700 text-sm">Please verify all questions and answers are correct before publishing.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-4 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}
          </div>
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {currentStep === 1 && (
              <button
                onClick={handleCreateTest}
                className={`px-6 py-2 rounded-lg font-medium ${
                  !testData.title || !testData.description
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={!testData.title || !testData.description}
                title={!testData.title || !testData.description ? 'Please fill in title and description' : 'Create test'}
              >
                Create Test
              </button>
            )}
            {currentStep === 4 && (
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Publish Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestCreationWorkflow