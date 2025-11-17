import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'

const AdminPackages = () => {
  const [packages, setPackages] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    type: 'free',
    features: ['']
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesRes, testsRes] = await Promise.all([
        api.get('/admin/packages'),
        api.get('/admin/tests')
      ])
      setPackages(packagesRes.data)
      setTests(testsRes.data.filter(test => test.status === 'published'))
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/packages', {
        ...formData,
        features: formData.features.filter(f => f.trim())
      })
      toast.success('Package created successfully!')
      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        type: 'free',
        features: ['']
      })
      fetchData()
    } catch (error) {
      toast.error('Failed to create package')
    }
  }

  const handleAddTest = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      await api.post(`/admin/packages/${selectedPackage._id}/add-test`, {
        testId: formData.get('testId'),
        scheduledDate: formData.get('scheduledDate')
      })
      toast.success('Test added to package!')
      setShowTestModal(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to add test')
    }
  }

  const handleAddQuiz = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const questions = []
    
    // Parse questions from form
    for (let i = 0; i < 5; i++) {
      const question = formData.get(`question_${i}`)
      if (question) {
        questions.push({
          question,
          options: [
            formData.get(`option_${i}_0`),
            formData.get(`option_${i}_1`),
            formData.get(`option_${i}_2`),
            formData.get(`option_${i}_3`)
          ],
          correctAnswer: parseInt(formData.get(`correct_${i}`)),
          explanation: formData.get(`explanation_${i}`) || ''
        })
      }
    }

    try {
      await api.post(`/admin/packages/${selectedPackage._id}/add-quiz`, {
        title: formData.get('title'),
        questions,
        timeLimit: parseInt(formData.get('timeLimit'))
      })
      toast.success('Quiz added to package!')
      setShowQuizModal(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to add quiz')
    }
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
            <p className="text-gray-600 mt-2">Create and manage subscription packages</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            + Create Package
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  pkg.type === 'free' ? 'bg-green-100 text-green-800' :
                  pkg.type === 'premium' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {pkg.type.toUpperCase()}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">₹{pkg.price}</div>
                <div className="text-sm text-gray-600">{pkg.duration} days</div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Mock Tests:</span>
                  <span className="font-semibold">{pkg.mockTests?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quizzes:</span>
                  <span className="font-semibold">{pkg.quizzes?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Daily Tasks:</span>
                  <span className="font-semibold">{pkg.dailyTasks?.length || 0}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedPackage(pkg)
                    setShowTestModal(true)
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Mock Test
                </button>
                <button
                  onClick={() => {
                    setSelectedPackage(pkg)
                    setShowQuizModal(true)
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Add Quiz
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Package Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Package</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreatePackage} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="ultimate">Ultimate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Enter feature"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      + Add Feature
                    </button>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Create Package
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Test Modal */}
        {showTestModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Add Test to {selectedPackage.name}</h2>
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddTest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Test</label>
                    <select
                      name="testId"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a test...</option>
                      {tests.map(test => (
                        <option key={test._id} value={test._id}>
                          {test.title} ({test.examType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                    <input
                      type="datetime-local"
                      name="scheduledDate"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowTestModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add Test
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Quiz Modal */}
        {showQuizModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Add Quiz to {selectedPackage.name}</h2>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddQuiz} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                      <input
                        type="text"
                        name="title"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                      <input
                        type="number"
                        name="timeLimit"
                        min="1"
                        defaultValue="15"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Questions (Max 5)</h3>
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Question {i + 1}</h4>
                        
                        <div className="space-y-3">
                          <input
                            type="text"
                            name={`question_${i}`}
                            placeholder="Enter question"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[0, 1, 2, 3].map(j => (
                              <input
                                key={j}
                                type="text"
                                name={`option_${i}_${j}`}
                                placeholder={`Option ${j + 1}`}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                              <select
                                name={`correct_${i}`}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="0">Option 1</option>
                                <option value="1">Option 2</option>
                                <option value="2">Option 3</option>
                                <option value="3">Option 4</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                              <input
                                type="text"
                                name={`explanation_${i}`}
                                placeholder="Brief explanation"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowQuizModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add Quiz
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPackages