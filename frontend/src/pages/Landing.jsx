import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Landing = () => {
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    students: 5000,
    successRate: 90.5,
    questions: 1500,
    selections: 50
  })

  // Fallback data in case API fails
  const fallbackTests = [
    {
      _id: 'demo-1',
      title: 'JEE Mains Mock Test 1',
      description: 'Comprehensive test covering Physics, Chemistry, and Mathematics',
      examType: 'main',
      durationMins: 180,
      totalMarks: 300,
      isPaid: false,
      price: 0
    },
    {
      _id: 'demo-2',
      title: 'JEE Advanced Practice Test', 
      description: 'Advanced level questions for JEE Advanced preparation',
      examType: 'advanced',
      durationMins: 180,
      totalMarks: 300,
      isPaid: true,
      price: 499
    },
    {
      _id: 'demo-3',
      title: 'Free Demo Test',
      description: 'Try our platform with this free sample test',
      examType: 'main',
      durationMins: 60,
      totalMarks: 100,
      isPaid: false,
      price: 0
    }
  ]

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/tests')
        const testsData = Array.isArray(response.data) ? response.data : fallbackTests
        setTests(testsData.slice(0, 3)) // Show only first 3 tests
      } catch (error) {
        console.error('Error fetching tests:', error)
        setTests(fallbackTests) // Use fallback data on error
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [fallbackTests])

  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile-First Professional Design */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden min-h-screen flex items-center pt-16 sm:pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+Cjx0ZXh0IHg9IjUwIiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMSI+SkVFIE1haW5zPC90ZXh0Pgo8dGV4dCB4PSI3MDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMSI+SkVFIEFkdmFuY2VkPC90ZXh0Pgo8dGV4dCB4PSIyMDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4wOCI+UGh5c2ljczwvdGV4dD4KPHRleHQgeD0iNTAwIiB5PSI0MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMDgiPkNoZW1pc3RyeTwvdGV4dD4KPHRleHQgeD0iODAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMDgiPk1hdGhlbWF0aWNzPC90ZXh0Pgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIyMDAiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjEiLz4KPGNpcmNsZSBjeD0iODUwIiBjeT0iMzUwIiByPSIyIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4xIi8+CjxjaXJjbGUgY3g9IjM1MCIgY3k9IjUwMCIgcj0iMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')`
          }}></div>
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/85 to-purple-900/90"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Main Content - Mobile Optimized */}
            <div className="text-center lg:text-left">
              <div className="mb-4 sm:mb-6">
                <span className="inline-block bg-blue-600/90 backdrop-blur-sm text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4">
                  India's #1 JEE Mock Test Platform
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Crack JEE with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-2">
                  Expert Guidance
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Join 50,000+ students who trust Experts15 for comprehensive JEE preparation with realistic mock tests and personalized analytics.
              </p>
              
              {/* CTA Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
                <Link 
                  to={user ? "/tests" : "/signup"} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center min-h-[48px] flex items-center justify-center"
                >
                  {user ? 'View All Tests' : 'Start Free Mock Test'}
                </Link>
                <Link 
                  to={user ? "/demo-test" : "/login"} 
                  className="border-2 border-white/80 hover:bg-white hover:text-blue-900 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 text-center min-h-[48px] flex items-center justify-center backdrop-blur-sm"
                >
                  {user ? 'Try Demo Test' : 'Login'}
                </Link>
              </div>
              
              {/* Stats - Mobile Responsive */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="whitespace-nowrap">5,000+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="whitespace-nowrap">90.5% Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="whitespace-nowrap">1500+ Questions</span>
                </div>
              </div>
            </div>
            
            {/* Stats Card - Hidden on Mobile, Visible on Desktop */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl lg:text-2xl font-bold mb-4">Platform Stats</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
                      <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-1">5K+</div>
                      <div className="text-xs lg:text-sm text-gray-300">Students</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
                      <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-1">90.5%</div>
                      <div className="text-xs lg:text-sm text-gray-300">Success</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
                      <div className="text-2xl lg:text-3xl font-bold text-purple-400 mb-1">1.5K+</div>
                      <div className="text-xs lg:text-sm text-gray-300">Questions</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
                      <div className="text-2xl lg:text-3xl font-bold text-yellow-400 mb-1">50+</div>
                      <div className="text-xs lg:text-sm text-gray-300">IIT Selections</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile-First Design */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose <span className="gradient-text">Experts15</span>?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to ace JEE in one comprehensive platform designed by experts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 lg:mb-16">
            {/* Feature 1 - Mobile Optimized */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border border-gray-100">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Realistic Mock Tests</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Experience the exact JEE exam pattern with our carefully crafted mock tests designed by IIT alumni
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border border-gray-100">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Instant Results</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Get detailed scorecards and performance analysis immediately after submission with rank predictions
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border border-gray-100">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Expert Content</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Questions by IIT alumni with detailed solutions and video explanations
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border border-gray-100">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Live Mentorship</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                One-on-one guidance from IIT mentors and doubt clearing sessions
              </p>
            </div>
          </div>

          {/* Advanced Features - Mobile Responsive */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Advanced Analytics & Insights</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-xl mr-4 mt-1 flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Performance Tracking</h4>
                    <p className="text-gray-600">Track your progress across subjects and identify weak areas with detailed analytics</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-xl mr-4 mt-1 flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Rank Prediction</h4>
                    <p className="text-gray-600">Get accurate JEE rank predictions based on your performance and historical data</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-xl mr-4 mt-1 flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Time Management</h4>
                    <p className="text-gray-600">Learn optimal time allocation strategies for each section with AI recommendations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-2xl">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 mb-2">{stats.students.toLocaleString()}+</div>
                    <div className="text-sm sm:text-base text-gray-600">Students Trust Us</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">{stats.successRate}%</div>
                    <div className="text-sm sm:text-base text-gray-600">Success Rate</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-2xl">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">{stats.questions.toLocaleString()}+</div>
                    <div className="text-sm sm:text-base text-gray-600">Questions Bank</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 sm:p-6 rounded-2xl">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-2">{stats.selections}+</div>
                    <div className="text-sm sm:text-base text-gray-600">IIT Selections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tests Section - Mobile Responsive */}
      <section id="tests" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Featured Mock Tests
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our most popular tests designed by IIT experts
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 sm:py-20">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading amazing tests...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {tests.map((test, index) => (
                <div key={test._id} className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex-1 mr-2">{test.title}</h3>
                    <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 ${
                      test.examType === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {test.examType.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">{test.description}</p>
                  
                  <div className="space-y-3 mb-6 sm:mb-8">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium text-sm sm:text-base">Duration:</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{test.durationMins} mins</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium text-sm sm:text-base">Total Marks:</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{test.totalMarks}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                      {test.isPaid ? `₹${test.price}` : 'FREE'}
                    </span>
                    {test.title.includes('Demo Test') ? (
                      <Link 
                        to={user ? "/demo-test" : "/login"} 
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center min-h-[44px] flex items-center justify-center"
                      >
                        {user ? 'Start Demo Test' : 'Login to Start'}
                      </Link>
                    ) : (
                      <Link 
                        to={user ? "/tests" : "/signup"} 
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center min-h-[44px] flex items-center justify-center"
                      >
                        {user ? (test.isPaid ? 'Enroll Now' : 'Start Test') : 'Sign Up to Start'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12">
            <Link 
              to="/tests" 
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View All Tests →
            </Link>
          </div>
        </div>
      </section>

      {/* Success Stories Section - Mobile Responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Success <span className="gradient-text">Stories</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Real students, real results. See how Experts15 helped them crack JEE
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-lg sm:text-2xl font-bold">
                RG
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Rohit Gupta</h3>
              <p className="text-indigo-600 font-semibold mb-4">NIT Delhi, 2024</p>
              <p className="text-sm sm:text-base text-gray-600 italic leading-relaxed">
                "Experts15's realistic mock tests and detailed analytics helped me identify my weak areas. The expert guidance from Ankit Sir and Abhishek Sir was invaluable!"
              </p>
              <div className="mt-4 text-yellow-500 text-lg">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-lg sm:text-2xl font-bold">
                AS
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Ananya Singh</h3>
              <p className="text-indigo-600 font-semibold mb-4">IIIT Prayagraj, 2024</p>
              <p className="text-sm sm:text-base text-gray-600 italic leading-relaxed">
                "The platform's user-friendly interface and comprehensive question bank made my preparation smooth. Special thanks to the founders for their personal attention!"
              </p>
              <div className="mt-4 text-yellow-500 text-lg">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-lg sm:text-2xl font-bold">
                VK
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Vikash Kumar</h3>
              <p className="text-indigo-600 font-semibold mb-4">IIIT Kashmir, 2024</p>
              <p className="text-sm sm:text-base text-gray-600 italic leading-relaxed">
                "Amazing platform with excellent mock tests. The instant results and performance analysis helped me track my progress effectively. Highly recommended!"
              </p>
              <div className="mt-4 text-yellow-500 text-lg">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Start Your JEE Journey?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who trust Experts15 for their JEE preparation and achieve your dream rank
          </p>
          <Link 
            to={user ? "/dashboard" : "/signup"} 
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-pulse"
          >
            {user ? 'Go to Dashboard' : 'Get Started Today'}
          </Link>
        </div>
      </section>

      {/* Footer - Mobile Responsive */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Experts15</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Your trusted partner for JEE main & Advanced preparation with expert guidance and cutting-edge technology.
              </p>
            </div>
            
            
          
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Info</h4>
              <div className="text-gray-400 space-y-2 text-sm sm:text-base">
                <p>📧 experts15.in@gmail.com</p>
                <p>📞 +91 85289 43187</p>
                <p>📍 Prayagraj, India</p>
                <div className="flex space-x-4 mt-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2024 Experts15. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing