import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const AdvancedAnalytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({})
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30')

  useEffect(() => {
    fetchAnalytics()
    fetchTests()
  }, [selectedTimeframe])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/admin/analytics?timeframe=${selectedTimeframe}`)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words">📊 Advanced Analytics</h1>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg break-words">Comprehensive insights and performance metrics</p>
            </div>
            <div className="shrink-0">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="7" className="text-gray-900">Last 7 days</option>
                <option value="30" className="text-gray-900">Last 30 days</option>
                <option value="90" className="text-gray-900">Last 90 days</option>
                <option value="365" className="text-gray-900">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics - Mobile Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1 truncate">Total Users</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{analytics.totalUsers || 0}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">↗ +12% from last period</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1 truncate">Active Tests</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{analytics.totalTests || 0}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">↗ +8% from last period</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1 truncate">Test Attempts</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{analytics.totalEnrollments || 0}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">↗ +25% from last period</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1 truncate">Revenue</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">₹{analytics.totalRevenue || 0}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">↗ +18% from last period</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">📈 Performance Trends</h3>
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Last {selectedTimeframe} days</span>
            </div>
            <div className="h-48 sm:h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl mb-2">📊</div>
                <p className="text-sm sm:text-base text-gray-600">Interactive Chart</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Performance data visualization</p>
              </div>
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">👥 User Engagement</h3>
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Real-time</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0"></div>
                  <span className="text-sm sm:text-base font-medium text-gray-700 truncate">Daily Active Users</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-blue-600 shrink-0">1,234</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full shrink-0"></div>
                  <span className="text-sm sm:text-base font-medium text-gray-700 truncate">Test Completion Rate</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-green-600 shrink-0">87%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shrink-0"></div>
                  <span className="text-sm sm:text-base font-medium text-gray-700 truncate">Average Session Time</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-purple-600 shrink-0">45m</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shrink-0"></div>
                  <span className="text-sm sm:text-base font-medium text-gray-700 truncate">Return Users</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-yellow-600 shrink-0">68%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Performance - Mobile Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">🎯 Test Performance Analytics</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-500">Sort by:</span>
              <select className="text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Popularity</option>
                <option>Revenue</option>
                <option>Completion Rate</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Mobile Cards View */}
              <div className="block sm:hidden space-y-4">
                {tests.filter(t => t.status === 'published').slice(0, 5).map((test) => (
                  <div key={test._id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2">{test.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.examType === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {test.examType.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium ml-1">{test.durationMins}m</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Questions:</span>
                        <span className="font-medium ml-1">{test.totalQuestions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium ml-1">{test.isPaid ? `₹${test.price}` : 'FREE'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Attempts:</span>
                        <span className="font-medium ml-1">156</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">Completion Rate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                        <span className="text-xs font-medium text-green-600">78%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="hidden sm:table min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tests.filter(t => t.status === 'published').slice(0, 5).map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{test.title}</div>
                            <div className="text-xs text-gray-500">{test.totalQuestions} questions</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.examType === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {test.examType.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-900">{test.durationMins} mins</td>
                      <td className="py-4 px-2 text-sm text-gray-900">156</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                          </div>
                          <span className="text-sm text-green-600 font-medium">78%</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm font-medium text-gray-900">
                        {test.isPaid ? `₹${(test.price * 156).toLocaleString()}` : '₹0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm sm:text-base font-medium">Create Test</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-3 sm:p-4 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">Export Data</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white p-3 sm:p-4 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">Send Report</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white p-3 sm:p-4 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedAnalytics