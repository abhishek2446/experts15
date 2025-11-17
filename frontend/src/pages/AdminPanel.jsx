import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import QuestionEditor from '../components/admin/QuestionEditor'
import TestPreview from '../components/admin/TestPreview'
import BulkQuestionEditor from '../components/admin/BulkQuestionEditor'
import NotificationSystem from '../components/admin/NotificationSystem'
import TestCreationWorkflow from '../components/admin/TestCreationWorkflow'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [analytics, setAnalytics] = useState({})
  const [tests, setTests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    fetchTests()
    fetchUsers()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchTests = async () => {
    try {
      const response = await api.get('/admin/tests')
      setTests(response.data)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const EditTestModal = ({ isOpen, onClose, onSuccess, test }) => {
    const [formData, setFormData] = useState({
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

    useEffect(() => {
      if (test) {
        setFormData({
          title: test.title || '',
          description: test.description || '',
          examType: test.examType || 'main',
          subjects: test.subjects || ['Physics', 'Chemistry', 'Mathematics'],
          durationMins: test.durationMins || 180,
          totalMarks: test.totalMarks || 300,
          totalQuestions: test.totalQuestions || 75,
          difficulty: test.difficulty || 'Mixed',
          isPaid: test.isPaid || false,
          price: test.price || 0,
          visibility: test.visibility || 'public',
          settings: test.settings || {
            shuffleQuestions: false,
            shuffleOptions: false,
            calculatorAccess: true,
            fullscreenRequired: true,
            tabSwitchPunishment: 'warning',
            maxTabSwitches: 3,
            autoSaveInterval: 10
          }
        })
      }
    }, [test])

    const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        await api.put(`/admin/tests/${test._id}`, formData)
        toast.success('Test updated successfully!')
        onSuccess()
        onClose()
      } catch (error) {
        toast.error('Error updating test')
      }
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Edit Test</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., JEE main Mock Test 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="main">JEE main</option>
                  <option value="advanced">JEE Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.durationMins}
                  onChange={(e) => setFormData({...formData, durationMins: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                <input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({...formData, totalQuestions: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
              <div className="flex flex-wrap gap-3">
                {['Physics', 'Chemistry', 'Mathematics'].map(subject => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, subjects: [...formData.subjects, subject]})
                        } else {
                          setFormData({...formData, subjects: formData.subjects.filter(s => s !== subject)})
                        }
                      }}
                      className="mr-2"
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value), isPaid: e.target.value > 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Test
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const CreateTestModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
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
      visibility: 'public',
      settings: {
        shuffleQuestions: false,
        shuffleOptions: false,
        calculatorAccess: true,
        fullscreenRequired: true,
        tabSwitchPunishment: 'warning',
        maxTabSwitches: 3,
        autoSaveInterval: 10
      }
    })

    const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        await api.post('/admin/tests', formData)
        toast.success('Test created successfully!')
        onSuccess()
        onClose()
        setFormData({
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
          visibility: 'public',
          settings: {
            shuffleQuestions: false,
            shuffleOptions: false,
            calculatorAccess: true,
            fullscreenRequired: true,
            tabSwitchPunishment: 'warning',
            maxTabSwitches: 3,
            autoSaveInterval: 10
          }
        })
      } catch (error) {
        toast.error('Error creating test')
      }
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create New Test</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., JEE main Mock Test 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="main">JEE main</option>
                  <option value="advanced">JEE Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.durationMins}
                  onChange={(e) => setFormData({...formData, durationMins: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                <input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({...formData, totalQuestions: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
              <div className="flex flex-wrap gap-3">
                {['Physics', 'Chemistry', 'Mathematics'].map(subject => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, subjects: [...formData.subjects, subject]})
                        } else {
                          setFormData({...formData, subjects: formData.subjects.filter(s => s !== subject)})
                        }
                      }}
                      className="mr-2"
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value), isPaid: e.target.value > 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Test Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.shuffleQuestions || false}
                    onChange={(e) => setFormData({...formData, settings: {...(formData.settings || {}), shuffleQuestions: e.target.checked}})}
                    className="mr-2"
                  />
                  Shuffle Questions
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.shuffleOptions || false}
                    onChange={(e) => setFormData({...formData, settings: {...(formData.settings || {}), shuffleOptions: e.target.checked}})}
                    className="mr-2"
                  />
                  Shuffle Options
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.calculatorAccess !== false}
                    onChange={(e) => setFormData({...formData, settings: {...(formData.settings || {}), calculatorAccess: e.target.checked}})}
                    className="mr-2"
                  />
                  Calculator Access
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings?.fullscreenRequired !== false}
                    onChange={(e) => setFormData({...formData, settings: {...(formData.settings || {}), fullscreenRequired: e.target.checked}})}
                    className="mr-2"
                  />
                  Fullscreen Required
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tab Switch Punishment</label>
                  <select
                    value={formData.settings?.tabSwitchPunishment || 'warning'}
                    onChange={(e) => setFormData({...formData, settings: {...(formData.settings || {}), tabSwitchPunishment: e.target.value}})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="warning">Warning Only</option>
                    <option value="subtract_marks">Subtract Marks</option>
                    <option value="auto_submit">Auto Submit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Tab Switches</label>
                  <input
                    type="number"
                    value={formData.settings?.maxTabSwitches || 3}
                    onChange={(e) => setFormData({...formData, settings: {...(formData.settings || {}), maxTabSwitches: parseInt(e.target.value)}})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Test
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const TestCard = ({ test }) => {
    const [uploading, setUploading] = useState(false)
    const [showQuestionEditor, setShowQuestionEditor] = useState(false)
    const [showTestPreview, setShowTestPreview] = useState(false)
    const [showBulkEditor, setShowBulkEditor] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(null)

    const handleFileUpload = async (e, type) => {
      const file = e.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append(type === 'questions' ? 'questionPdf' : 'answerKeyPdf', file)

      setUploading(true)
      try {
        const endpoint = type === 'questions' ? 'upload-questions' : 'upload-answerkey'
        const response = await api.post(`/admin/tests/${test._id}/${endpoint}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success(response.data.message)
        fetchTests()
      } catch (error) {
        toast.error(`Error uploading ${type}`)
      } finally {
        setUploading(false)
      }
    }

    const handlePublish = async () => {
      try {
        await api.post(`/admin/tests/${test._id}/publish`)
        toast.success('Test published successfully!')
        fetchTests()
      } catch (error) {
        toast.error('Error publishing test')
      }
    }

    const handleUnpublish = async () => {
      if (!window.confirm('Are you sure you want to unpublish this test? This will delete all questions and enrollments.')) {
        return
      }
      try {
        await api.post(`/admin/tests/${test._id}/unpublish`)
        toast.success('Test unpublished successfully!')
        fetchTests()
      } catch (error) {
        toast.error('Error unpublishing test')
      }
    }

    const handleDelete = async () => {
      if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
        return
      }
      try {
        await api.delete(`/admin/tests/${test._id}`)
        toast.success('Test deleted successfully!')
        fetchTests()
      } catch (error) {
        toast.error('Error deleting test')
      }
    }

    const handleDuplicate = async () => {
      try {
        await api.post(`/admin/tests/${test._id}/duplicate`)
        toast.success('Test duplicated successfully!')
        fetchTests()
      } catch (error) {
        toast.error('Error duplicating test')
      }
    }

    const handleExport = async () => {
      try {
        const response = await api.get(`/admin/tests/${test._id}/export`, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${test.title}_results.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        toast.success('Results exported successfully!')
      } catch (error) {
        toast.error('Error exporting results')
      }
    }

    const handleSaveQuestion = async (questionData) => {
      try {
        const updatedQuestions = editingQuestion 
          ? test.parsedQuestions.map(q => q.qno === editingQuestion.qno ? questionData : q)
          : [...(test.parsedQuestions || []), questionData]
        
        await api.post(`/admin/tests/${test._id}/questions`, { questions: updatedQuestions })
        toast.success('Question saved successfully!')
        fetchTests()
        setEditingQuestion(null)
      } catch (error) {
        toast.error('Error saving question')
      }
    }

    const handleBulkSave = async (questions) => {
      try {
        await api.post(`/admin/tests/${test._id}/questions`, { questions })
        toast.success('Questions updated successfully!')
        fetchTests()
      } catch (error) {
        toast.error('Error updating questions')
      }
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{test.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{test.description}</p>
          </div>
          <div className="flex items-center flex-wrap gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                setEditingTest(test)
                setShowEditModal(true)
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit test"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {test.status === 'published' && (
              <button
                onClick={handleUnpublish}
                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Unpublish test"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            )}
            <button
              onClick={handleDuplicate}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Duplicate test"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            {test.status === 'published' && (
              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Export results"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowTestPreview(true)}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Preview test"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            {test.status === 'published' && (
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Send notifications"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
                </svg>
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete test"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              test.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {test.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
          <div className="break-words">Type: <span className="font-medium">{test.examType.toUpperCase()}</span></div>
          <div className="break-words">Duration: <span className="font-medium">{test.durationMins}m</span></div>
          <div className="break-words">Questions: <span className="font-medium">{test.totalQuestions}</span></div>
          <div className="break-words">Price: <span className="font-medium">{test.isPaid ? `₹${test.price}` : 'FREE'}</span></div>
        </div>

        {/* Action buttons for all tests */}
        {test.status === 'published' && (
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowNotifications(true)}
                className="flex-1 bg-yellow-100 text-yellow-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-yellow-200 font-medium text-xs sm:text-sm"
              >
                📢 Send Notifications
              </button>
              <button
                onClick={handleExport}
                className="flex-1 bg-green-100 text-green-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-green-200 font-medium text-xs sm:text-sm"
              >
                📄 Export Results
              </button>
            </div>
          </div>
        )}
        
        {test.status === 'draft' && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Step 1: Upload Questions PDF</h4>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, 'questions')}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {test.parsedQuestions?.length > 0 && (
                <p className="text-sm text-green-600 mt-1">✓ {test.parsedQuestions.length} questions parsed</p>
              )}
            </div>

            {test.parsedQuestions?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Step 2: Upload Answer Key PDF</h4>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'answerkey')}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {test.answerKeyFileUrl && (
                  <p className="text-sm text-green-600 mt-1">✓ Answer key uploaded</p>
                )}
              </div>
            )}

            {test.parsedQuestions?.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowBulkEditor(true)}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-200 font-medium text-xs sm:text-sm"
                  >
                    Edit Questions
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuestion(null)
                      setShowQuestionEditor(true)
                    }}
                    className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-purple-200 font-medium text-xs sm:text-sm"
                  >
                    Add Question
                  </button>
                </div>
                <button
                  onClick={handlePublish}
                  className="w-full bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-green-700 font-medium text-xs sm:text-sm"
                >
                  📤 Publish Test ({test.parsedQuestions?.length || 0} questions)
                </button>
              </div>
            )}
          </div>
        )}

        {uploading && (
          <div className="text-center py-2">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Processing...
            </div>
          </div>
        )}
        
        {/* Question Editor Modal */}
        <QuestionEditor
          isOpen={showQuestionEditor}
          onClose={() => {
            setShowQuestionEditor(false)
            setEditingQuestion(null)
          }}
          question={editingQuestion}
          onSave={handleSaveQuestion}
          testId={test._id}
        />
        
        {/* Test Preview Modal */}
        <TestPreview
          isOpen={showTestPreview}
          onClose={() => setShowTestPreview(false)}
          testId={test._id}
        />
        
        {/* Bulk Question Editor */}
        <BulkQuestionEditor
          isOpen={showBulkEditor}
          onClose={() => setShowBulkEditor(false)}
          questions={test.parsedQuestions || []}
          onSave={handleBulkSave}
        />
        
        {/* Notification System */}
        <NotificationSystem
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          testId={test._id}
          testTitle={test.title}
        />
      </div>
    )
  }

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [editingTest, setEditingTest] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words">Admin Dashboard</h1>
              <p className="text-blue-100 text-sm sm:text-lg break-words">Manage tests, users, and monitor platform performance</p>
            </div>
            <div className="hidden sm:block shrink-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="text-blue-100 text-sm">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4 sm:mb-6">
          <nav className="-mb-px flex overflow-x-auto space-x-4 sm:space-x-8 scrollbar-hide">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'tests', name: 'Tests', icon: '📝' },
              { id: 'users', name: 'Users', icon: '👥' },
              { id: 'reviews', name: 'Reviews', icon: '⭐' },
              { id: 'create', name: 'Create Test', icon: '➕' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden text-xs">{tab.name.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Tests</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalTests || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Enrollments</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalEnrollments || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">₹{analytics.totalRevenue || 0}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Tests</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowWorkflow(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>🚀</span>
                  <span>Quick Create</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>➕</span>
                  <span>Manual Create</span>
                </button>
              </div>
            </div>
            <div className="grid gap-6">
              {tests.map((test) => (
                <TestCard key={test._id} test={test} />
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab - Mobile Responsive */}
        {activeTab === 'analytics' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📊 Advanced Analytics</h2>
              <button
                onClick={() => window.open('/advanced-analytics', '_blank')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open Full Analytics</span>
              </button>
            </div>
            
            <div className="grid gap-4 sm:gap-6">
              {tests.filter(t => t.status === 'published').map((test) => (
                <div key={test._id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{test.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{test.examType.toUpperCase()} • {test.subjects?.join(', ')}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            const response = await api.get(`/admin/tests/${test._id}/attempts`)
                            console.log('Attempts:', response.data.attempts)
                            toast.info(`${response.data.attempts.length} attempts found`)
                          } catch (error) {
                            toast.error('Error fetching attempts')
                          }
                        }}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Attempts</span>
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await api.get(`/admin/tests/${test._id}/toppers`)
                            console.log('Toppers:', response.data.toppers)
                            toast.info(`Top ${response.data.toppers.length} performers loaded`)
                          } catch (error) {
                            toast.error('Error fetching toppers')
                          }
                        }}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm hover:bg-green-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>View Toppers</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-600">{test.durationMins}</div>
                      <div className="text-xs sm:text-sm text-blue-700">Minutes</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg sm:text-xl font-bold text-green-600">{test.totalQuestions}</div>
                      <div className="text-xs sm:text-sm text-green-700">Questions</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-lg sm:text-xl font-bold text-purple-600">{test.totalMarks}</div>
                      <div className="text-xs sm:text-sm text-purple-700">Max Marks</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <div className="text-lg sm:text-xl font-bold text-yellow-600">{test.isPaid ? `₹${test.price}` : 'FREE'}</div>
                      <div className="text-xs sm:text-sm text-yellow-700">Price</div>
                    </div>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs sm:text-sm text-gray-600">Attempts</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">156</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs sm:text-sm text-gray-600">Avg Score</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">78%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs sm:text-sm text-gray-600">Completion</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">92%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">⭐ Student Reviews</h2>
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">⭐</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Review Management</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">Manage student reviews and testimonials</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">24</div>
                  <div className="text-sm text-green-700">Approved Reviews</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">5</div>
                  <div className="text-sm text-yellow-700">Pending Reviews</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">4.8</div>
                  <div className="text-sm text-blue-700">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Test Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Create New Test</h2>
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">📝</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Ready to create a new test?</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">Click the button below to start creating your test</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => setShowWorkflow(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold text-sm sm:text-base"
                >
                  🚀 Quick Create Workflow
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base"
                >
                  📝 Manual Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateTestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchTests}
      />
      
      <EditTestModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTest(null)
        }}
        onSuccess={fetchTests}
        test={editingTest}
      />
      
      <TestCreationWorkflow
        isOpen={showWorkflow}
        onClose={() => setShowWorkflow(false)}
        onSuccess={fetchTests}
      />
    </div>
  )
}

export default AdminPanel
