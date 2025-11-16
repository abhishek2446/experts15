import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Landing = () => {
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    students: 50000,
    successRate: 98.5,
    questions: 15000,
    selections: 500
  })

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/tests')
        setTests(response.data.slice(0, 3)) // Show only first 3 tests
      } catch (error) {
        console.error('Error fetching tests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg text-white relative overflow-hidden min-h-screen flex items-center pt-16">
        {/* Floating JEE Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-float">
            <span className="text-2xl">📚</span>
          </div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
            <span className="text-3xl">🧪</span>
          </div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
            <span className="text-xl">⚙️</span>
          </div>
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '0.5s'}}>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="absolute top-1/2 left-5 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1.5s'}}>
            <span className="text-lg">✨</span>
          </div>
          <div className="absolute top-1/3 right-5 w-18 h-18 bg-white/10 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '2.5s'}}>
            <span className="text-2xl">📈</span>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight animate-fade-in text-shadow-strong">
                Master JEE with <span className="text-yellow-300 animate-pulse-slow">Experts15</span>
              </h1>
              <p className="text-xl md:text-3xl mb-12 max-w-5xl mx-auto leading-relaxed font-semibold animate-slide-up text-shadow">
                🚀 India's most trusted JEE preparation platform with realistic mock tests, 
                expert guidance, and AI-powered analytics to boost your rank.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16 animate-slide-up">
                <Link 
                  to={user ? "/tests" : "/signup"} 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black py-6 px-14 rounded-2xl text-xl transition-all duration-300 shadow-2xl transform hover:-translate-y-2 hover:scale-110 animate-bounce-slow border-2 border-yellow-300"
                >
                  🚀 {user ? 'View All Tests' : 'Start Free Mock Test'}
                </Link>
                {user ? (
                  <Link 
                    to="/demo-test" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-12 rounded-2xl text-xl transition-all duration-300 shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  >
                    🎯 Start Demo Test
                  </Link>
                ) : (
                  <Link 
                    to="/login" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-12 rounded-2xl text-xl transition-all duration-300 shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  >
                    🎯 Try Free Demo Test
                  </Link>
                )}
                <Link 
                  to={user ? "/dashboard" : "/tests"} 
                  className="border-3 border-white hover:bg-white hover:text-indigo-600 text-white font-bold py-5 px-12 rounded-2xl text-xl transition-all duration-300 shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                >
                  {user ? '📊 Go to Dashboard' : '📚 View All Tests'}
                </Link>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center transform hover:scale-110 transition-all duration-300 animate-float border-2 border-white/30">
                <div className="text-4xl md:text-5xl font-black text-yellow-300 mb-3 text-shadow-strong">{stats.students.toLocaleString()}+</div>
                <div className="text-white font-bold text-lg text-shadow">Students Trust Us</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center transform hover:scale-110 transition-all duration-300 animate-float border-2 border-white/30" style={{animationDelay: '0.5s'}}>
                <div className="text-4xl md:text-5xl font-black text-green-300 mb-3 text-shadow-strong">{stats.successRate}%</div>
                <div className="text-white font-bold text-lg text-shadow">Success Rate</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center transform hover:scale-110 transition-all duration-300 animate-float border-2 border-white/30" style={{animationDelay: '1s'}}>
                <div className="text-4xl md:text-5xl font-black text-blue-300 mb-3 text-shadow-strong">{stats.questions.toLocaleString()}+</div>
                <div className="text-white font-bold text-lg text-shadow">Questions Bank</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center transform hover:scale-110 transition-all duration-300 animate-float border-2 border-white/30" style={{animationDelay: '1.5s'}}>
                <div className="text-4xl md:text-5xl font-black text-pink-300 mb-3 text-shadow-strong">{stats.selections}+</div>
                <div className="text-white font-bold text-lg text-shadow">IIT Selections</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section id="features" className="py-20 education-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose <span className="gradient-text">Experts15</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to ace JEE in one comprehensive platform designed by experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="card p-8 text-center hover:scale-105 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">🎯 Realistic Mock Tests</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience the exact JEE exam pattern with our carefully crafted mock tests designed by IIT alumni
              </p>
            </div>

            <div className="card p-8 text-center hover:scale-105 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">⚡ Instant Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Get detailed scorecards and performance analysis immediately after submission with rank predictions
              </p>
            </div>

            <div className="card p-8 text-center hover:scale-105 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">📚 Expert Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Questions by IIT alumni with detailed solutions and video explanations
              </p>
            </div>

            <div className="card p-8 text-center hover:scale-105 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">👨‍🏫 Live Mentorship</h3>
              <p className="text-gray-600 leading-relaxed">
                One-on-one guidance from IIT mentors and doubt clearing sessions
              </p>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Advanced Analytics & Insights</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-xl mr-4 mt-1">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Performance Tracking</h4>
                    <p className="text-gray-600">Track your progress across subjects and identify weak areas with detailed analytics</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-xl mr-4 mt-1">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Rank Prediction</h4>
                    <p className="text-gray-600">Get accurate JEE rank predictions based on your performance and historical data</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-xl mr-4 mt-1">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 animate-fade-in">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-md">
                    <div className="text-4xl font-bold text-primary-600 mb-2">{stats.students.toLocaleString()}+</div>
                    <div className="text-gray-600">Students Trust Us</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-md">
                    <div className="text-4xl font-bold text-green-600 mb-2">{stats.successRate}%</div>
                    <div className="text-gray-600">Success Rate</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-md">
                    <div className="text-4xl font-bold text-purple-600 mb-2">{stats.questions.toLocaleString()}+</div>
                    <div className="text-gray-600">Questions Bank</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-md">
                    <div className="text-4xl font-bold text-accent-600 mb-2">{stats.selections}+</div>
                    <div className="text-gray-600">IIT Selections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section id="tests" className="section-padding professional-bg">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Mock Tests
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our most popular tests designed by IIT experts
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading amazing tests...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {tests.map((test, index) => (
                <div key={test._id} className="card p-8 hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{test.title}</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      test.examType === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {test.examType.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{test.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Duration:</span>
                      <span className="font-bold text-gray-900">{test.durationMins} mins</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Total Marks:</span>
                      <span className="font-bold text-gray-900">{test.totalMarks}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-4xl font-bold gradient-text">
                      {test.isPaid ? `₹${test.price}` : 'FREE'}
                    </span>
                    {test.title.includes('Demo Test') ? (
                      <Link 
                        to={user ? "/demo-test" : "/login"} 
                        className="btn-primary"
                      >
                        {user ? 'Start Demo Test' : 'Login to Start'}
                      </Link>
                    ) : (
                      <Link 
                        to={user ? "/tests" : "/signup"} 
                        className="btn-primary"
                      >
                        {user ? (test.isPaid ? 'Enroll Now' : 'Start Test') : 'Sign Up to Start'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/tests" 
              className="btn-primary text-lg px-8 py-4"
            >
              View All Tests →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding education-bg">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your <span className="gradient-text">Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible pricing options for every JEE aspirant's journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 border-2 border-gray-200 hover:border-primary-300 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Plan</h3>
                <div className="text-5xl font-bold text-primary-600 mb-2">₹0</div>
                <div className="text-gray-600 mb-8">Perfect to get started</div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    5 Free Mock Tests
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic Performance Analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Solutions & Explanations
                  </li>
                </ul>
                <Link to={user ? "/tests" : "/signup"} className="w-full btn-secondary">
                  {user ? 'View Free Tests' : 'Get Started Free'}
                </Link>
              </div>
            </div>

            <div className="card p-8 border-2 border-primary-500 relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Plan</h3>
                <div className="text-5xl font-bold gradient-text mb-2">₹499</div>
                <div className="text-gray-600 mb-8">Per month</div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited Mock Tests
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced Analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Rank Prediction
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Video Solutions
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority Support
                  </li>
                </ul>
                <Link to={user ? "/subscription" : "/signup"} className="w-full btn-primary">
                  {user ? 'Upgrade to Premium' : 'Start Premium'}
                </Link>
              </div>
            </div>

            <div className="card p-8 border-2 border-gray-200 hover:border-secondary-300 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ultimate Plan</h3>
                <div className="text-5xl font-bold text-purple-600 mb-2">₹999</div>
                <div className="text-gray-600 mb-8">Per month</div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Everything in Premium
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    1-on-1 Mentorship
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom Study Plans
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Live Doubt Sessions
                  </li>
                </ul>
                <Link to={user ? "/subscription" : "/signup"} className="w-full btn-secondary">
                  {user ? 'Upgrade to Ultimate' : 'Go Ultimate'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Success <span className="gradient-text">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real students, real results. See how Experts15 helped them crack JEE
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                AR
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Arjun Reddy</h3>
              <p className="text-indigo-600 font-semibold mb-4">AIR 47, JEE Advanced 2024</p>
              <p className="text-gray-600 italic">
                "Experts15's mock tests were exactly like the real JEE. The analytics helped me identify my weak areas and improve systematically."
              </p>
              <div className="mt-4 text-yellow-500">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                PS
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Priya Sharma</h3>
              <p className="text-indigo-600 font-semibold mb-4">AIR 156, JEE Advanced 2024</p>
              <p className="text-gray-600 italic">
                "The personalized study plan and one-on-one mentorship made all the difference. Highly recommend Experts15!"
              </p>
              <div className="mt-4 text-yellow-500">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                RK
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rahul Kumar</h3>
              <p className="text-indigo-600 font-semibold mb-4">AIR 89, JEE Advanced 2024</p>
              <p className="text-gray-600 italic">
                "From 60% to 95% in just 6 months! The AI-powered insights and expert guidance transformed my preparation."
              </p>
              <div className="mt-4 text-yellow-500">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding professional-bg">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About <span className="gradient-text">Experts15</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded by IIT alumni and JEE experts, Experts15 is dedicated to helping students achieve their dreams of getting into top engineering colleges in India.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform combines cutting-edge technology with proven teaching methodologies to provide the most effective JEE preparation experience.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">5+</div>
                  <div className="text-gray-600 font-medium">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">100+</div>
                  <div className="text-gray-600 font-medium">Expert Teachers</div>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/about" className="btn-primary">
                  Learn More About Us
                </Link>
              </div>
            </div>
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                To democratize quality JEE preparation and make it accessible to every student, regardless of their location or background.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary-600 w-4 h-4 rounded-full mr-4"></div>
                  <span className="text-gray-700 font-medium">Quality education for all</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary-600 w-4 h-4 rounded-full mr-4"></div>
                  <span className="text-gray-700 font-medium">Technology-driven learning</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary-600 w-4 h-4 rounded-full mr-4"></div>
                  <span className="text-gray-700 font-medium">Personalized guidance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding education-bg">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We're here to help you succeed in your JEE journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center p-8 hover:scale-105 transition-all duration-300">
              <div className="bg-primary-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Email Us</h3>
              <p className="text-gray-600 mb-2">support@experts15.com</p>
              <p className="text-sm text-gray-500">We reply within 2 hours</p>
            </div>

            <div className="card text-center p-8 hover:scale-105 transition-all duration-300">
              <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Call Us</h3>
              <p className="text-gray-600 mb-2">+91 98765 43210</p>
              <p className="text-sm text-gray-500">Mon-Sat, 9 AM - 8 PM</p>
            </div>

            <div className="card text-center p-8 hover:scale-105 transition-all duration-300">
              <div className="bg-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Live Chat</h3>
              <p className="text-gray-600 mb-2">Available 24/7</p>
              <p className="text-sm text-gray-500">Instant support</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/contact" className="btn-primary text-lg px-8 py-4">
              Contact Us →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding hero-bg text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your JEE Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Join thousands of students who trust Experts15 for their JEE preparation and achieve your dream rank
          </p>
          <Link 
            to={user ? "/dashboard" : "/signup"} 
            className="btn-accent text-lg px-8 py-4 animate-bounce-slow"
          >
            {user ? '📊 Go to Dashboard' : '🚀 Get Started Today'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-3xl font-bold mb-4 gradient-text bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Experts15</h3>
              <p className="text-gray-400 leading-relaxed">
                Your trusted partner for JEE main & Advanced preparation with expert guidance and cutting-edge technology.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/tests" className="hover:text-white transition-colors">Tests</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Info</h4>
              <div className="text-gray-400 space-y-2">
                <p>📧 support@experts15.com</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 New Delhi, India</p>
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
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Experts15. All rights reserved. Made with ❤️ for JEE aspirants.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
