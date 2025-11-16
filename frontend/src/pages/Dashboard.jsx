import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [availableTests, setAvailableTests] = useState([])
  const [studyStreak, setStudyStreak] = useState(0)
  const [todayStudyTime, setTodayStudyTime] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, testsResponse] = await Promise.all([
          api.get('/users/dashboard'),
          api.get('/tests')
        ])
        
        setDashboardData(dashboardResponse.data)
        setAvailableTests(testsResponse.data)
        
        // Calculate study streak and progress
        calculateStudyStreak(dashboardResponse.data)
        calculateWeeklyProgress(dashboardResponse.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(timeInterval)
  }, [])
  
  const calculateStudyStreak = useCallback((data) => {
    if (!data?.enrollments) return
    
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)
    
    // Check each day backwards from today
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString()
      const hasActivity = data.enrollments.some(enrollment => 
        enrollment.attempts > 0 && 
        new Date(enrollment.lastAttemptDate).toDateString() === dateStr
      )
      
      if (hasActivity) {
        streak++
      } else if (i > 0) {
        break // Stop counting if no activity (but allow today to be 0)
      }
      
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    setStudyStreak(streak)
  }, [])
  
  const calculateWeeklyProgress = useCallback((data) => {
    if (!data?.enrollments) return
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const weekProgress = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const dayActivity = data.enrollments.reduce((total, enrollment) => {
        const attempts = enrollment.attempts || 0
        const lastAttempt = new Date(enrollment.lastAttemptDate || 0)
        return lastAttempt.toDateString() === date.toDateString() ? total + attempts : total
      }, 0)
      
      weekProgress.push({
        day: weekDays[date.getDay()],
        activity: dayActivity,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    setWeeklyProgress(weekProgress)
  }, [])
  
  const handleDemoTest = useCallback(async () => {
    try {
      const response = await api.get('/demo/test')
      toast.success('Demo test ready! Redirecting...')
      setTimeout(() => {
        navigate(`/test/${response.data.testId}/instructions`)
      }, 1000)
    } catch (error) {
      toast.error('Failed to start demo test')
    }
  }, [navigate])

  const handleSubscription = useCallback(() => {
    navigate('/subscription')
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-8 professional-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="hero-bg rounded-3xl shadow-2xl p-10 mb-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse-slow"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 text-shadow animate-fade-in">
                  Welcome back, {user?.name}! 🚀
                </h1>
                <p className="text-white/90 text-xl md:text-2xl mb-6 font-medium text-shadow animate-slide-up">
                  Ready to continue your JEE preparation? Let's achieve your goals together.
                </p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🔥</span>
                    <div>
                      <div className="font-bold">{studyStreak} Day Streak</div>
                      <div className="text-purple-200">Keep it up!</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">⏰</span>
                    <div>
                      <div className="font-bold">{Math.floor(todayStudyTime / 60)}h {todayStudyTime % 60}m</div>
                      <div className="text-purple-200">Today's study</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                  <div className="text-purple-100">{currentTime.toLocaleDateString()}</div>
                  <div className="text-sm text-purple-200 mt-2">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Test CTA */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🚀 Try Our Free Demo Test!</h2>
              <p className="text-green-100 mb-4">Experience our realistic CBT interface with 10 sample questions</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center"><span className="mr-1">⏱️</span> 30 minutes</span>
                <span className="flex items-center"><span className="mr-1">📝</span> 10 questions</span>
                <span className="flex items-center"><span className="mr-1">🎯</span> Physics, Chemistry, Math</span>
              </div>
            </div>
            <button 
              onClick={handleDemoTest}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
            >
              Start Demo Test →
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Enrolled Tests</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData?.totalEnrollments || 0}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Active learning
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData?.totalAttempts || 0}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Keep practicing
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Best Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.enrollments?.length > 0 
                    ? Math.max(...dashboardData.enrollments.map(e => e.bestScore || 0)) 
                    : 0}%
                </p>
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <span className="mr-1">⭐</span>
                  Personal best
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Study Streak</p>
                <p className="text-3xl font-bold text-gray-900">{studyStreak}</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <span className="mr-1">🔥</span>
                  {studyStreak > 0 ? 'Days active' : 'Start today!'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Weekly Progress Chart */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📊</span>
            Weekly Activity
          </h3>
          <div className="flex items-end justify-between h-32 space-x-2">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    day.isToday ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                  style={{ height: `${Math.max(day.activity * 20, 8)}px` }}
                ></div>
                <div className={`text-xs mt-2 font-medium ${
                  day.isToday ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {day.day}
                </div>
                <div className="text-xs text-gray-400">{day.activity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-3">💎</span>
              Upgrade Your Plan
            </h2>
            <div className="text-sm text-gray-500">
              Current: <span className="font-semibold text-indigo-600">Free Plan</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 relative">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h3>
                <div className="text-3xl font-bold text-gray-600 mb-4">₹0<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6 text-sm">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    5 Free Mock Tests
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic Performance Analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Solutions & Explanations
                  </li>
                </ul>
                <div className="bg-gray-100 text-gray-500 py-2 px-4 rounded-lg font-medium">
                  Current Plan
                </div>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="border-2 border-indigo-500 rounded-2xl p-6 relative transform scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                <div className="text-3xl font-bold text-indigo-600 mb-4">₹499<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6 text-sm">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited Mock Tests
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced Analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Rank Prediction
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Video Solutions
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority Support
                  </li>
                </ul>
                <button 
                  onClick={handleSubscription}
                  className="w-full btn-primary"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
            
            {/* Ultimate Plan */}
            <div className="border-2 border-purple-500 rounded-2xl p-6 relative">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ultimate Plan</h3>
                <div className="text-3xl font-bold text-purple-600 mb-4">₹999<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6 text-sm">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Everything in Premium
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    1-on-1 Mentorship
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom Study Plans
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Live Doubt Sessions
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Personal Mentor
                  </li>
                </ul>
                <button 
                  onClick={handleSubscription}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Upgrade to Ultimate
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Achievements & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Achievements */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border-2 transition-all ${
                studyStreak >= 7 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-sm font-semibold text-gray-900">Week Warrior</div>
                  <div className="text-xs text-gray-600">7 day streak</div>
                  {studyStreak >= 7 && <div className="text-xs text-yellow-600 font-bold mt-1">UNLOCKED!</div>}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border-2 transition-all ${
                (dashboardData?.totalAttempts || 0) >= 10 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">💪</div>
                  <div className="text-sm font-semibold text-gray-900">Test Master</div>
                  <div className="text-xs text-gray-600">10 attempts</div>
                  {(dashboardData?.totalAttempts || 0) >= 10 && <div className="text-xs text-blue-600 font-bold mt-1">UNLOCKED!</div>}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border-2 transition-all ${
                (dashboardData?.enrollments?.length || 0) >= 5 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="text-sm font-semibold text-gray-900">Scholar</div>
                  <div className="text-xs text-gray-600">5 enrollments</div>
                  {(dashboardData?.enrollments?.length || 0) >= 5 && <div className="text-xs text-green-600 font-bold mt-1">UNLOCKED!</div>}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border-2 transition-all ${
                Math.max(...(dashboardData?.enrollments?.map(e => e.bestScore || 0) || [0])) >= 80 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-sm font-semibold text-gray-900">High Scorer</div>
                  <div className="text-xs text-gray-600">80%+ score</div>
                  {Math.max(...(dashboardData?.enrollments?.map(e => e.bestScore || 0) || [0])) >= 80 && <div className="text-xs text-purple-600 font-bold mt-1">UNLOCKED!</div>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚡</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/tests" className="flex items-center p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Browse Tests</div>
                  <div className="text-sm text-gray-600">Find new mock tests</div>
                </div>
              </Link>
              
              <button 
                onClick={handleSubscription}
                className="flex items-center p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors w-full text-left"
              >
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Upgrade Plan</div>
                  <div className="text-sm text-gray-600">Unlock premium features</div>
                </div>
              </button>
              
              <Link to="/contact" className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Get Help</div>
                  <div className="text-sm text-gray-600">Contact support</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Tests */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Tests
                </h2>
                <span className="text-sm text-gray-500">{dashboardData?.enrollments?.length || 0} enrolled</span>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.enrollments?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.enrollments.map((enrollment) => (
                    <div key={enrollment._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{enrollment.test.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">Duration: {enrollment.test.durationMins} mins • Marks: {enrollment.test.totalMarks}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          enrollment.test.examType === 'mains' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          JEE {enrollment.test.examType.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Attempts</div>
                          <div className="text-xl font-bold text-blue-600">{enrollment.attempts}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Best Score</div>
                          <div className="text-xl font-bold text-green-600">{enrollment.bestScore}</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link 
                          to={`/test/${enrollment.test._id}`}
                          className="flex-1 btn-primary text-center"
                        >
                          {enrollment.attempts > 0 ? '🔄 Retake Test' : '🚀 Start Test'}
                        </Link>
                        {enrollment.attempts > 0 && (
                          <Link 
                            to={`/test/${enrollment.test._id}/review`}
                            className="flex-1 btn-secondary text-center"
                          >
                            📈 View Results
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tests enrolled yet</h3>
                  <p className="text-gray-500 mb-4">Start your JEE preparation by enrolling in a mock test</p>
                  <Link to="#available-tests" className="btn-primary">
                    Browse Tests
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Available Tests */}
          <div id="available-tests" className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Available Tests
                </h2>
                <span className="text-sm text-gray-500">{availableTests.length} tests available</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableTests.map((test) => {
                  const isEnrolled = dashboardData?.enrollments?.some(e => e.test._id === test._id)
                  
                  return (
                    <div key={test._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">{test.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>⏱️ {test.durationMins} mins</span>
                            <span>🏆 {test.totalMarks} marks</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            test.examType === 'mains' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            JEE {test.examType.toUpperCase()}
                          </span>
                          <span className={`text-2xl font-bold ${
                            test.isPaid ? 'text-primary-600' : 'text-green-600'
                          }`}>
                            {test.isPaid ? `₹${test.price}` : 'FREE'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        {isEnrolled ? (
                          <div className="flex items-center text-green-600 font-medium">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Enrolled
                          </div>
                        ) : (
                          <Link 
                            to={`/test/${test._id}`}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                              test.isPaid 
                                ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {test.isPaid ? '💳 Enroll Now' : '🎆 Take Free Test'}
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard